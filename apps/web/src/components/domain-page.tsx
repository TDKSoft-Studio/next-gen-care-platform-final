interface DomainPageProps {
  eyebrow: string;
  heading: string;
  introduction: string;
  notice: string;
}

/**
 * Shared shell for a domain presentation. It intentionally contains no
 * forms, prices, contact details, care availability, or clinical claims;
 * those facts remain CMS-governed and require their own human review.
 */
export function DomainPage({ eyebrow, heading, introduction, notice }: DomainPageProps) {
  return (
    <main id="main-content" tabIndex={-1}>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{heading}</h1>
      <p className="lede">{introduction}</p>
      <aside className="foundation-notice" role="note">
        {notice}
      </aside>
    </main>
  );
}
