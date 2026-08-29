export interface LanguageOption {
  href: string;
  label: string;
  locale: string;
}

export interface LanguageSwitcherProps {
  currentLocale: string;
  label: string;
  options: readonly LanguageOption[];
}

export function LanguageSwitcher({ currentLocale, label, options }: LanguageSwitcherProps) {
  return (
    <nav aria-label={label} className="ngc-language-switcher">
      <ul>
        {options.map((option) => {
          const isCurrent = option.locale === currentLocale;
          return (
            <li key={option.locale}>
              <a
                aria-current={isCurrent ? "page" : undefined}
                href={option.href}
                hrefLang={option.locale}
                lang={option.locale}
              >
                {option.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
