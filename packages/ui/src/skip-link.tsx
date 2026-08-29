import type { ReactNode } from "react";

export interface SkipLinkProps {
  children: ReactNode;
  href?: `#${string}`;
}

export function SkipLink({ children, href = "#main-content" }: SkipLinkProps) {
  return (
    <a className="ngc-skip-link" href={href}>
      {children}
    </a>
  );
}
