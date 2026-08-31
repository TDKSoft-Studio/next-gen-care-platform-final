"use client";

import { useSyncExternalStore } from "react";

type Locale = "fr" | "nl";

const STORAGE_KEY = "next-gen-care-cookie-consent";
const CONSENT_CHANGE_EVENT = "next-gen-care-cookie-consent-change";
const UNAVAILABLE_ON_SERVER = "unavailable";

const copy = {
  fr: {
    title: "Votre vie privée compte",
    body: "Nous utilisons uniquement les cookies nécessaires au fonctionnement du site. Aucun cookie non essentiel n’est activé sans votre accord.",
    accept: "J’accepte",
    refuse: "Refuser",
    privacy: "En savoir plus"
  },
  nl: {
    title: "Uw privacy telt",
    body: "We gebruiken alleen cookies die nodig zijn voor de werking van de website. Niet-essentiële cookies worden niet geactiveerd zonder uw toestemming.",
    accept: "Ik accepteer",
    refuse: "Weigeren",
    privacy: "Meer informatie"
  }
} as const;

export function CookieConsentBanner({ locale }: { locale: Locale }) {
  const consent = useSyncExternalStore(
    (notify) => {
      window.addEventListener(CONSENT_CHANGE_EVENT, notify);
      return () => window.removeEventListener(CONSENT_CHANGE_EVENT, notify);
    },
    () => window.localStorage.getItem(STORAGE_KEY),
    () => UNAVAILABLE_ON_SERVER
  );
  const visible = consent === null;
  const text = copy[locale];

  function choose(value: "accepted" | "refused") {
    window.localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  }

  if (!visible) return null;

  return (
    <section
      className="cookie-consent"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div>
        <h2 id="cookie-consent-title">{text.title}</h2>
        <p id="cookie-consent-description">{text.body}</p>
      </div>
      <div className="cookie-consent__actions">
        <a href={`/${locale}/legal#cookies`}>{text.privacy}</a>
        <button type="button" onClick={() => choose("refused")}>
          {text.refuse}
        </button>
        <button type="button" className="cookie-consent__accept" onClick={() => choose("accepted")}>
          {text.accept}
        </button>
      </div>
    </section>
  );
}
