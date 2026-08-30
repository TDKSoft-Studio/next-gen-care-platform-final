import { translate, type Locale } from "@next-gen-care/localization";

export function PreviewBanner({ locale }: { locale: Locale }) {
  return (
    <p className="preview-banner" role="status">
      {translate(locale, "portal.preview")}
    </p>
  );
}
