"use client";

import { useEffect, useState } from "react";

interface AppointmentSlotSelectorProps {
  locale: "fr" | "nl";
}

const copy = {
  fr: {
    title: "Choisir un créneau",
    date: "Date souhaitée",
    mode: "Type de soins",
    home: "À domicile",
    clinic: "Sur site",
    search: "Rechercher les créneaux",
    choose: "Sélectionner",
    loading: "Recherche en cours…",
    empty: "Aucun créneau disponible pour cette recherche.",
    unavailable: "La disponibilité est temporairement indisponible.",
    hold: "Réserver ce créneau pour examen",
    holding: "Réservation temporaire…",
    held: "Créneau réservé temporairement jusqu’au {date}.",
    review:
      "Votre demande sera examinée par l’équipe. Ce n’est pas une confirmation de rendez-vous.",
    config:
      "La sélection de créneau sera disponible après configuration du service et du lieu approuvés.",
    area: "Zone : province de Liège",
    latitude: "Latitude (soins à domicile)",
    longitude: "Longitude (soins à domicile)"
  },
  nl: {
    title: "Een tijdslot kiezen",
    date: "Gewenste datum",
    mode: "Type zorg",
    home: "Thuis",
    clinic: "Op locatie",
    search: "Beschikbare tijdsloten zoeken",
    choose: "Selecteren",
    loading: "Zoeken…",
    empty: "Geen tijdslot beschikbaar voor deze zoekopdracht.",
    unavailable: "Beschikbaarheid is tijdelijk niet beschikbaar.",
    hold: "Dit tijdslot tijdelijk reserveren",
    holding: "Tijdelijke reservatie…",
    held: "Tijdslot tijdelijk gereserveerd tot {date}.",
    review: "Uw aanvraag wordt door het team beoordeeld. Dit is geen bevestiging van een afspraak.",
    config:
      "De tijdslotkeuze is beschikbaar zodra de goedgekeurde dienst en locatie zijn ingesteld.",
    area: "Werkingsgebied: provincie Luik",
    latitude: "Breedtegraad (thuiszorg)",
    longitude: "Lengtegraad (thuiszorg)"
  }
} as const;

interface Slot {
  start: string;
}
interface Hold {
  holdId: string;
  expiresAt: string;
}

export function AppointmentSlotSelector({ locale }: AppointmentSlotSelectorProps) {
  const t = copy[locale];
  const [date, setDate] = useState("");
  const [mode, setMode] = useState<"HOME" | "CLINIC">("HOME");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [hold, setHold] = useState<Hold | null>(null);
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
    setSelected(null);
    const query = new URLSearchParams({ serviceId, locationId, date, mode });
    if (mode === "HOME" && latitude && longitude) {
      query.set("patientLat", latitude);
      query.set("patientLng", longitude);
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
      {hold && (
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
    </section>
  );
}
