import { translate, type Locale } from "@next-gen-care/localization";

/**
 * Resolved strings for {@link AppointmentSlotSelector}. Built on the server from
 * the versioned localization catalogs and passed in as a prop, so the client
 * bundle never ships the catalogs and every string stays under catalog review.
 */
export interface SlotSelectorCopy {
  title: string;
  date: string;
  mode: string;
  home: string;
  clinic: string;
  search: string;
  choose: string;
  loading: string;
  empty: string;
  unavailable: string;
  hold: string;
  holding: string;
  held: string;
  patientTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode: string;
  country: string;
  submit: string;
  submitting: string;
  submitted: string;
  review: string;
  invalid: string;
  config: string;
  area: string;
  latitude: string;
  longitude: string;
  errorsTitle: string;
  errorFirstName: string;
  errorLastName: string;
  errorEmail: string;
}

export function slotSelectorCopy(locale: Locale): SlotSelectorCopy {
  return {
    title: translate(locale, "home_care_slot.title"),
    date: translate(locale, "home_care_slot.date"),
    mode: translate(locale, "home_care_slot.mode"),
    home: translate(locale, "home_care_slot.home"),
    clinic: translate(locale, "home_care_slot.clinic"),
    search: translate(locale, "home_care_slot.search"),
    choose: translate(locale, "home_care_slot.choose"),
    loading: translate(locale, "home_care_slot.loading"),
    empty: translate(locale, "home_care_slot.empty"),
    unavailable: translate(locale, "home_care_slot.unavailable"),
    hold: translate(locale, "home_care_slot.hold"),
    holding: translate(locale, "home_care_slot.holding"),
    held: translate(locale, "home_care_slot.held"),
    patientTitle: translate(locale, "home_care_slot.patient_title"),
    firstName: translate(locale, "home_care_slot.first_name"),
    lastName: translate(locale, "home_care_slot.last_name"),
    email: translate(locale, "home_care_slot.email"),
    phone: translate(locale, "home_care_slot.phone"),
    addressLine: translate(locale, "home_care_slot.address_line"),
    city: translate(locale, "home_care_slot.city"),
    postalCode: translate(locale, "home_care_slot.postal_code"),
    country: translate(locale, "home_care_slot.country"),
    submit: translate(locale, "home_care_slot.submit"),
    submitting: translate(locale, "home_care_slot.submitting"),
    submitted: translate(locale, "home_care_slot.submitted"),
    review: translate(locale, "home_care_slot.review"),
    invalid: translate(locale, "home_care_slot.invalid"),
    config: translate(locale, "home_care_slot.config"),
    area: translate(locale, "home_care_slot.area"),
    latitude: translate(locale, "home_care_slot.latitude"),
    longitude: translate(locale, "home_care_slot.longitude"),
    errorsTitle: translate(locale, "home_care_slot.errors_title"),
    errorFirstName: translate(locale, "home_care_slot.error_first_name"),
    errorLastName: translate(locale, "home_care_slot.error_last_name"),
    errorEmail: translate(locale, "home_care_slot.error_email")
  };
}
