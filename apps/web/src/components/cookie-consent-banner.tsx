"use client";

import { useSyncExternalStore } from "react";

type Locale = "fr" | "nl";

export interface CookieConsentCopy {
  title: string;
  body: string;
  accept: string;
  refuse: string;
  privacy: string;
}

const STORAGE_KEY = "next-gen-care-cookie-consent";
const CONSENT_CHANGE_EVENT = "next-gen-care-cookie-consent-change";
const UNAVAILABLE_ON_SERVER = "unavailable";

interface CookieConsentBannerProps {
  locale: Locale;
  copy: CookieConsentCopy;
}

export function CookieConsentBanner({ locale, copy }: CookieConsentBannerProps) {
  const consent = useSyncExternalStore(
    (notify) => {
      window.addEventListener(CONSENT_CHANGE_EVENT, notify);
      return () => window.removeEventListener(CONSENT_CHANGE_EVENT, notify);
    },
    () => window.localStorage.getItem(STORAGE_KEY),
    () => UNAVAILABLE_ON_SERVER
  );
  const visible = consent === null;

  function choose(value: "accepted" | "refused") {
    window.localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  }

  if (!visible) return null;

  return (
    <section
      className="cookie-consent"
      role="region"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div>
        <h2 id="cookie-consent-title">{copy.title}</h2>
        <p id="cookie-consent-description">{copy.body}</p>
      </div>
      <div className="cookie-consent__actions">
        <a href={`/${locale}/legal#cookies`}>{copy.privacy}</a>
        <button type="button" onClick={() => choose("refused")}>
          {copy.refuse}
        </button>
        <button type="button" className="cookie-consent__accept" onClick={() => choose("accepted")}>
          {copy.accept}
        </button>
      </div>
    </section>
  );
}
