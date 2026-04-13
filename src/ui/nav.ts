import { useMemo } from "react";

export interface NavItem {
  href: string;
  label: string;
}

export interface NavSection {
  label: string;
  prefix: string;
  links: readonly NavItem[];
}

export interface BreadcrumbConfig {
  topLinks?: readonly NavItem[];
  sections: readonly NavSection[];
}

export interface BreadcrumbResult {
  section: string;
  page?: string;
}

function computeBreadcrumbs(
  pathname: string,
  config: BreadcrumbConfig,
): BreadcrumbResult | null {
  if (config.topLinks) {
    const topLink = config.topLinks.find(({ href }) =>
      pathname.startsWith(href),
    );
    if (topLink) return { section: topLink.label, page: undefined };
  }

  for (const section of config.sections) {
    if (!pathname.startsWith(section.prefix)) continue;
    const page = section.links.find(({ href }) =>
      href === section.prefix
        ? pathname === section.prefix || pathname === section.prefix + "/"
        : pathname.startsWith(href),
    );
    return { section: section.label, page: page?.label };
  }

  return null;
}

export function useBreadcrumbs(
  pathname: string,
  config: BreadcrumbConfig,
): BreadcrumbResult | null {
  return useMemo(() => computeBreadcrumbs(pathname, config), [pathname, config]);
}

export function isActiveNavItem(
  href: string,
  currentPath: string,
  sectionPrefix?: string,
): boolean {
  if (sectionPrefix && href === sectionPrefix) {
    return currentPath === href || currentPath === href + "/";
  }
  return currentPath.startsWith(href);
}
