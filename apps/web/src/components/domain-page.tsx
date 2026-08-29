interface DomainPageProps {
  eyebrow: string;
  heading: string;
  introduction: string;
  notice: string;
}

/**
 * Shared shell for a business-domain placeholder route. Renders only the
 * neutral, non-committal structure approved for this phase (see
 * docs/architecture/BOUNDED-CONTEXTS.md) — no services, prices, or clinical
 * claims. Real content lands only after CMS/content ADR decisions.
 */
export function DomainPage({ eyebrow, heading, introduction, notice }: DomainPageProps) {
  return (
    <main id="main-content" tabIndex={-1}>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{heading}</h1>
      <p className="lede">{introduction}</p>
      <p className="foundation-notice" role="note">
        {notice}
      </p>
    </main>
  );
}
