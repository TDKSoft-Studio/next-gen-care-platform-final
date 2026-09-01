import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppointmentSlotSelector } from "../src/components/appointment-slot-selector";
import { slotSelectorCopy } from "../src/components/appointment-slot-selector.copy";

describe("appointment slot selector", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates a hold before submitting a pending-review appointment request", async () => {
    const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/home-care/catalog") {
        return new Response(
          JSON.stringify({
            service: { id: "service-1", name: "Soins infirmiers" },
            location: { id: "location-1", name: "Liège" }
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      if (url.startsWith("/api/home-care/availability")) {
        return new Response(JSON.stringify({ slots: [{ start: "2026-09-01T08:00:00Z" }] }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (url === "/api/home-care/booking-holds" && init?.method === "POST") {
        return new Response(
          JSON.stringify({
            holdId: "8d6c5b4a-3210-4fed-8abc-1234567890ab",
            expiresAt: "2026-09-01T09:00:00Z"
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      if (url === "/api/home-care/appointment-requests" && init?.method === "POST") {
        expect(JSON.parse(String(init.body))).toMatchObject({
          holdId: "8d6c5b4a-3210-4fed-8abc-1234567890ab",
          client: {
            firstName: "Ada",
            lastName: "Lovelace",
            email: "ada@example.test"
          }
        });
        return new Response(
          JSON.stringify({
            requestId: "9f6c5b4a-3210-4fed-8abc-1234567890ab",
            status: "PENDING_REVIEW",
            reviewExpiresAt: "2026-09-02T09:00:00Z"
          }),
          { status: 202, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(null, { status: 404 });
    });
    vi.stubGlobal("fetch", fetch);
    vi.stubGlobal("crypto", { randomUUID: () => "idempotency-key" });

    render(<AppointmentSlotSelector locale="fr" copy={slotSelectorCopy("fr")} />);

    await screen.findByText(/province de Liège/);
    fireEvent.change(screen.getByLabelText("Date souhaitée"), {
      target: { value: "2026-09-01" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Rechercher les créneaux" }));

    const slot = await screen.findByLabelText(/01\/09\/2026/);
    fireEvent.click(slot);
    fireEvent.click(screen.getByRole("button", { name: "Réserver ce créneau pour examen" }));

    await screen.findByText(/Créneau réservé temporairement/);
    fireEvent.change(screen.getByLabelText("Prénom"), { target: { value: "Ada" } });
    fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Lovelace" } });
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "ada@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer la demande pour revue" }));

    await screen.findByText(/Demande reçue pour revue/);
    expect(screen.getByText(/Ce n’est pas une confirmation de rendez-vous/)).toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(4));
  });
});
