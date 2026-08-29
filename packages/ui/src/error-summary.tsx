export interface ErrorSummaryItem {
  fieldId: string;
  message: string;
}

export interface ErrorSummaryProps {
  errors: readonly ErrorSummaryItem[];
  title: string;
}

export function ErrorSummary({ errors, title }: ErrorSummaryProps) {
  if (errors.length === 0) return null;

  return (
    <section aria-labelledby="error-summary-title" className="ngc-error-summary" role="alert">
      <h2 id="error-summary-title">{title}</h2>
      <ul>
        {errors.map((error) => (
          <li key={error.fieldId}>
            <a href={`#${error.fieldId}`}>{error.message}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
