import { expect, test } from "@playwright/test";

// Deterministic, network-mocked coverage of the public PAY_ON_SITE home-care
// request journey: catalog -> availability -> hold -> PENDING_REVIEW request.
// Recommended in docs/reports/PHASE-5-RELEASE-READINESS-REPORT.md (section 15)
// and docs/reports/PHASE-LANDING-V2-VISUAL-REDESIGN-REPORT.md (section 17):
// no test in this repository previously drove this journey through the
// browser. The internal /api/home-care/* routes are Next.js server routes
// that proxy to a separately owned Appointment API via APPOINTMENT_API_URL;
// mocking them at the browser network boundary (this file) exercises the
// same frontend code path without depending on that external service or on
// any real Appointment API deployment, consistent with the master contract's
// prohibition on inventing API behavior — the mocked payloads mirror the
// shapes the internal routes already validate and forward as-is.

const SERVICE_ID = "11111111-1111-4111-8111-111111111111";
const LOCATION_ID = "22222222-2222-4222-8222-222222222222";
const HOLD_ID = "33333333-3333-4333-8333-333333333333";
const REQUEST_ID = "44444444-4444-4444-8444-444444444444";

function tomorrowIsoDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function inFiveMinutesIso(): string {
  return new Date(Date.now() + 5 * 60_000).toISOString();
}

function inThirtyMinutesIso(): string {
  return new Date(Date.now() + 30 * 60_000).toISOString();
}

test.describe("Home-care PAY_ON_SITE appointment request journey", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/home-care/catalog", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          service: { id: SERVICE_ID, name: "Soins infirmiers à domicile" },
          location: { id: LOCATION_ID, name: "Liège" },
          serviceArea: "Province de Liège"
        })
      });
    });

    await page.route("**/api/home-care/availability**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          slots: [{ start: inFiveMinutesIso() }, { start: inThirtyMinutesIso() }]
        })
      });
    });

    await page.route("**/api/home-care/booking-holds", async (route) => {
      expect(route.request().method()).toBe("POST");
      expect(route.request().headers()["idempotency-key"]).toBeTruthy();
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ holdId: HOLD_ID, expiresAt: inThirtyMinutesIso() })
      });
    });

    await page.route("**/api/home-care/appointment-requests", async (route) => {
      expect(route.request().method()).toBe("POST");
      expect(route.request().headers()["idempotency-key"]).toBeTruthy();
      const payload = route.request().postDataJSON() as {
        holdId?: string;
        patient?: { firstName?: string; lastName?: string; email?: string };
      };
      expect(payload.holdId).toBe(HOLD_ID);
      expect(payload.patient?.firstName).toBeTruthy();
      expect(payload.patient?.lastName).toBeTruthy();
      expect(payload.patient?.email).toBeTruthy();
      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: JSON.stringify({
          requestId: REQUEST_ID,
          status: "PENDING_REVIEW",
          reviewExpiresAt: inThirtyMinutesIso()
        })
      });
    });

    await page.goto("/fr/home-care");
  });

  test("submits a PENDING_REVIEW request and never presents it as a confirmed appointment", async ({
    page
  }) => {
    const selector = page.getByRole("region", { name: "Choisir un créneau" });
    await expect(selector).toBeVisible();

    await selector.getByLabel("Date souhaitée").fill(tomorrowIsoDate());
    await selector.getByRole("button", { name: "Rechercher les créneaux" }).click();

    const slotOptions = selector.getByRole("radio");
    await expect(slotOptions.first()).toBeVisible();
    await slotOptions.first().check();

    await selector.getByRole("button", { name: "Réserver ce créneau pour examen" }).click();

    await expect(selector.getByText(/réservé temporairement jusqu.au/i)).toBeVisible();
    await expect(
      selector.getByText(
        "Votre demande sera examinée par l’équipe. Ce n’est pas une confirmation de rendez-vous."
      )
    ).toBeVisible();

    await selector.getByLabel("Prénom").fill("Camille");
    await selector.getByLabel("Nom", { exact: true }).fill("Dupont");
    await selector.getByLabel("E-mail").fill("camille.dupont@example.test");

    await selector.getByRole("button", { name: "Envoyer la demande pour revue" }).click();

    await expect(
      selector.getByText(`Demande reçue pour revue. Référence : ${REQUEST_ID}.`)
    ).toBeVisible();
    await expect(
      selector.getByText(
        "Votre demande sera examinée par l’équipe. Ce n’est pas une confirmation de rendez-vous."
      )
    ).toBeVisible();

    // Non-regression: the confirmed-appointment vocabulary must never appear
    // on an accepted PENDING_REVIEW response.
    await expect(page.getByText(/rendez-vous confirmé/i)).toHaveCount(0);
  });

  test("surfaces an unavailable message when the hold request fails", async ({ page }) => {
    await page.unroute("**/api/home-care/booking-holds");
    await page.route("**/api/home-care/booking-holds", async (route) => {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          status: 409,
          code: "HOLD_UNAVAILABLE",
          detail: "This slot is no longer available."
        })
      });
    });

    const selector = page.getByRole("region", { name: "Choisir un créneau" });
    await selector.getByLabel("Date souhaitée").fill(tomorrowIsoDate());
    await selector.getByRole("button", { name: "Rechercher les créneaux" }).click();
    await selector.getByRole("radio").first().check();
    await selector.getByRole("button", { name: "Réserver ce créneau pour examen" }).click();

    await expect(selector.getByRole("alert")).toContainText(
      "La disponibilité est temporairement indisponible."
    );
    await expect(selector.getByText(/réservé temporairement jusqu.au/i)).toHaveCount(0);
  });
});
