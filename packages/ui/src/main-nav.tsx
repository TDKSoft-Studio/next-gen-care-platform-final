export interface MainNavItem {
  current?: boolean;
  href: string;
  label: string;
}

export interface MainNavProps {
  items: readonly MainNavItem[];
  label: string;
}

export function MainNav({ items, label }: MainNavProps) {
  return (
    <nav aria-label={label} className="ngc-main-nav">
      <ul>
        {items.map((item) => (
          <li key={item.href}>
            <a aria-current={item.current ? "page" : undefined} href={item.href}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
