"use client";

import { useEffect, useState, type FormEvent } from "react";

import { ErrorSummary, type ErrorSummaryItem } from "@next-gen-care/ui";

import type { SlotSelectorCopy } from "./appointment-slot-selector.copy";

interface AppointmentSlotSelectorProps {
  locale: "fr" | "nl";
  copy: SlotSelectorCopy;
}

interface Slot {
  start: string;
}
interface Hold {
  holdId: string;
  expiresAt: string;
}
interface PatientForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode: string;
  country: string;
}
interface AppointmentRequestAccepted {
  requestId: string;
  status: "PENDING_REVIEW";
  reviewExpiresAt: string;
}

const emptyPatientForm: PatientForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  addressLine: "",
  city: "",
  postalCode: "",
  country: "BE"
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AppointmentSlotSelector({ locale, copy }: AppointmentSlotSelectorProps) {
  const t = copy;
  const [date, setDate] = useState("");
  const [mode, setMode] = useState<"HOME" | "CLINIC">("HOME");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [hold, setHold] = useState<Hold | null>(null);
  const [patient, setPatient] = useState<PatientForm>(emptyPatientForm);
  const [errors, setErrors] = useState<ErrorSummaryItem[]>([]);
  const [accepted, setAccepted] = useState<AppointmentRequestAccepted | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [catalog, setCatalog] = useState<{
    serviceId: string;
    serviceName: string;
    locationId: string;
    locationName: string;
  } | null>(null);
  const serviceId = catalog?.serviceId ?? null;
  const locationId = catalog?.locationId ?? null;

  useEffect(() => {
    fetch("/api/home-care/catalog", { cache: "no-store" })
      .then(async (response) =>
        response.ok
          ? ((await response.json()) as {
              service?: { id?: string; name?: string };
              location?: { id?: string; name?: string };
            })
          : null
      )
      .then((data) => {
        if (data?.service?.id && data.location?.id) {
          setCatalog({
            serviceId: data.service.id,
            serviceName: data.service.name ?? "",
            locationId: data.location.id,
            locationName: data.location.name ?? ""
          });
        }
      })
      .catch(() => undefined);
  }, []);

  async function search() {
    if (!serviceId || !locationId || !date) return;
    setBusy(true);
    setMessage("");
    setHold(null);
    setAccepted(null);
    setSelected(null);
    const query = new URLSearchParams({ serviceId, locationId, date, mode });
    if (mode === "HOME" && latitude && longitude) {
      query.set("clientLat", latitude);
      query.set("clientLng", longitude);
    }
    try {
      const response = await fetch(`/api/home-care/availability?${query}`, { cache: "no-store" });
      const data = (await response.json()) as { slots?: Slot[] };
      setSlots(response.ok && Array.isArray(data.slots) ? data.slots : []);
      if (!response.ok) setMessage(t.unavailable);
    } catch {
      setSlots([]);
      setMessage(t.unavailable);
    } finally {
      setBusy(false);
    }
  }

  async function reserve() {
    if (!selected || !serviceId || !locationId) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/home-care/booking-holds", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ serviceId, locationId, mode, start: selected })
      });
      const data = (await response.json()) as Hold;
      if (!response.ok) {
        setMessage(t.unavailable);
        return;
      }
      setHold(data);
      setAccepted(null);
    } catch {
      setMessage(t.unavailable);
    } finally {
      setBusy(false);
    }
  }

  function updatePatient(field: keyof PatientForm, value: string) {
    setPatient((current) => ({ ...current, [field]: value }));
  }

  function validatePatient(): ErrorSummaryItem[] {
    const found: ErrorSummaryItem[] = [];
    if (!patient.firstName.trim())
      found.push({ fieldId: "slot-first-name", message: t.errorFirstName });
    if (!patient.lastName.trim())
      found.push({ fieldId: "slot-last-name", message: t.errorLastName });
    if (!emailPattern.test(patient.email.trim()))
      found.push({ fieldId: "slot-email", message: t.errorEmail });
    return found;
  }

  function handlePatientSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validatePatient();
    setErrors(found);
    if (found.length > 0) {
      setMessage(t.invalid);
      return;
    }
    void submitRequest();
  }

  async function submitRequest() {
    if (!hold) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/home-care/appointment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({
          holdId: hold.holdId,
          client: {
            firstName: patient.firstName.trim(),
            lastName: patient.lastName.trim(),
            email: patient.email.trim(),
            phone: patient.phone.trim() || undefined,
            address: {
              addressLine: patient.addressLine.trim() || undefined,
              city: patient.city.trim() || undefined,
              postalCode: patient.postalCode.trim() || undefined,
              country: patient.country.trim() || undefined
            }
          }
        })
      });
      const data = (await response.json()) as AppointmentRequestAccepted;
      if (!response.ok || data.status !== "PENDING_REVIEW") {
        setMessage(t.unavailable);
        return;
      }
      setAccepted(data);
      setErrors([]);
    } catch {
      setMessage(t.unavailable);
    } finally {
      setBusy(false);
    }
  }

  if (!serviceId || !locationId)
    return (
      <aside className="slot-selector" role="note">
        <p>{t.config}</p>
        <p>{t.area}</p>
      </aside>
    );

  return (
    <section className="slot-selector" aria-labelledby="slot-selector-title">
      <h2 id="slot-selector-title">{t.title}</h2>
      <p className="slot-selector__context">
        {t.area}
        {catalog?.locationName ? ` · ${catalog.locationName}` : ""}
        {catalog?.serviceName ? ` · ${catalog.serviceName}` : ""}
      </p>
      <div className="slot-selector__fields">
        <label>
          {t.date}
          <input
            type="date"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <label>
          {t.mode}
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as "HOME" | "CLINIC")}
          >
            <option value="HOME">{t.home}</option>
            <option value="CLINIC">{t.clinic}</option>
          </select>
        </label>
        {mode === "HOME" && (
          <>
            <label>
              {t.latitude}
              <input
                inputMode="decimal"
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
              />
            </label>
            <label>
              {t.longitude}
              <input
                inputMode="decimal"
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
              />
            </label>
          </>
        )}
      </div>
      <button type="button" onClick={search} disabled={busy || !date}>
        {busy ? t.loading : t.search}
      </button>
      {message && <p role="alert">{message}</p>}
      {slots.length > 0 && (
        <fieldset>
          <legend>{t.title}</legend>
          {slots.map((slot) => (
            <label className="slot-option" key={slot.start}>
              <input
                type="radio"
                name="appointment-slot"
                checked={selected === slot.start}
                onChange={() => setSelected(slot.start)}
              />
              {new Date(slot.start).toLocaleString(locale === "fr" ? "fr-BE" : "nl-BE")}
            </label>
          ))}
        </fieldset>
      )}
      {date && !busy && slots.length === 0 && !message && <p>{t.empty}</p>}
      <button type="button" onClick={reserve} disabled={busy || !selected}>
        {busy ? t.holding : t.hold}
      </button>
      {hold && !accepted && (
        <div className="slot-selector__success" role="status">
          <p>
            {t.held.replace(
              "{date}",
              new Date(hold.expiresAt).toLocaleString(locale === "fr" ? "fr-BE" : "nl-BE")
            )}
          </p>
          <p>{t.review}</p>
        </div>
      )}
      {hold && !accepted && (
        <form onSubmit={handlePatientSubmit} noValidate>
          <ErrorSummary title={t.errorsTitle} errors={errors} />
          <fieldset>
            <legend>{t.patientTitle}</legend>
            <div className="slot-selector__fields slot-selector__fields--patient">
              <label htmlFor="slot-first-name">
                {t.firstName}
                <input
                  id="slot-first-name"
                  autoComplete="given-name"
                  value={patient.firstName}
                  onChange={(event) => updatePatient("firstName", event.target.value)}
                  required
                />
              </label>
              <label htmlFor="slot-last-name">
                {t.lastName}
                <input
                  id="slot-last-name"
                  autoComplete="family-name"
                  value={patient.lastName}
                  onChange={(event) => updatePatient("lastName", event.target.value)}
                  required
                />
              </label>
              <label htmlFor="slot-email">
                {t.email}
                <input
                  id="slot-email"
                  autoComplete="email"
                  inputMode="email"
                  type="email"
                  value={patient.email}
                  onChange={(event) => updatePatient("email", event.target.value)}
                  required
                />
              </label>
              <label>
                {t.phone}
                <input
                  autoComplete="tel"
                  inputMode="tel"
                  value={patient.phone}
                  onChange={(event) => updatePatient("phone", event.target.value)}
                />
              </label>
              <label>
                {t.addressLine}
                <input
                  autoComplete="address-line1"
                  value={patient.addressLine}
                  onChange={(event) => updatePatient("addressLine", event.target.value)}
                />
              </label>
              <label>
                {t.city}
                <input
                  autoComplete="address-level2"
                  value={patient.city}
                  onChange={(event) => updatePatient("city", event.target.value)}
                />
              </label>
              <label>
                {t.postalCode}
                <input
                  autoComplete="postal-code"
                  value={patient.postalCode}
                  onChange={(event) => updatePatient("postalCode", event.target.value)}
                />
              </label>
              <label>
                {t.country}
                <input
                  autoComplete="country"
                  value={patient.country}
                  onChange={(event) => updatePatient("country", event.target.value)}
                />
              </label>
            </div>
            <button type="submit" disabled={busy}>
              {busy ? t.submitting : t.submit}
            </button>
          </fieldset>
        </form>
      )}
      {accepted && (
        <div className="slot-selector__success" role="status">
          <p>{t.submitted.replace("{requestId}", accepted.requestId)}</p>
          <p>
            {t.held.replace(
              "{date}",
              new Date(accepted.reviewExpiresAt).toLocaleString(locale === "fr" ? "fr-BE" : "nl-BE")
            )}
          </p>
          <p>{t.review}</p>
        </div>
      )}
    </section>
  );
}
