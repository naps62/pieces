import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useBreadcrumbs, isActiveNavItem } from "./nav";
import type { NavItem, NavSection, BreadcrumbConfig } from "./nav";

const topLinks: NavItem[] = [
  { href: "/accounts", label: "Accounts" },
];

const sections: NavSection[] = [
  {
    label: "Banking",
    prefix: "/banking",
    links: [
      { href: "/banking", label: "Overview" },
      { href: "/banking/transactions", label: "Transactions" },
    ],
  },
  {
    label: "Investments",
    prefix: "/investments",
    links: [
      { href: "/investments", label: "Dashboard" },
      { href: "/investments/positions", label: "Positions" },
    ],
  },
];

const config: BreadcrumbConfig = { topLinks, sections };

describe("useBreadcrumbs", () => {
  it("returns null for unknown path", () => {
    const { result } = renderHook(() => useBreadcrumbs("/unknown", config));
    expect(result.current).toBeNull();
  });

  it("returns section only for top-level link", () => {
    const { result } = renderHook(() => useBreadcrumbs("/accounts", config));
    expect(result.current).toEqual({ section: "Accounts", page: undefined });
  });

  it("returns section + page for section index", () => {
    const { result } = renderHook(() => useBreadcrumbs("/banking", config));
    expect(result.current).toEqual({ section: "Banking", page: "Overview" });
  });

  it("returns section + page for nested route", () => {
    const { result } = renderHook(() =>
      useBreadcrumbs("/investments/positions", config),
    );
    expect(result.current).toEqual({
      section: "Investments",
      page: "Positions",
    });
  });

  it("matches section index with trailing slash", () => {
    const { result } = renderHook(() => useBreadcrumbs("/banking/", config));
    expect(result.current).toEqual({ section: "Banking", page: "Overview" });
  });

  it("returns section without page for unknown sub-route", () => {
    const { result } = renderHook(() =>
      useBreadcrumbs("/banking/unknown", config),
    );
    expect(result.current).toEqual({ section: "Banking", page: undefined });
  });

  it("works with no topLinks", () => {
    const { result } = renderHook(() =>
      useBreadcrumbs("/banking", { sections }),
    );
    expect(result.current).toEqual({ section: "Banking", page: "Overview" });
  });
});

describe("isActiveNavItem", () => {
  it("returns true for exact match", () => {
    expect(isActiveNavItem("/banking", "/banking")).toBe(true);
  });

  it("returns true for prefix match on sub-route", () => {
    expect(isActiveNavItem("/banking/transactions", "/banking/transactions/123")).toBe(true);
  });

  it("returns false for non-matching path", () => {
    expect(isActiveNavItem("/banking", "/investments")).toBe(false);
  });

  it("uses exact match for section index route", () => {
    expect(isActiveNavItem("/banking", "/banking", "/banking")).toBe(true);
    expect(isActiveNavItem("/banking", "/banking/", "/banking")).toBe(true);
    expect(
      isActiveNavItem("/banking", "/banking/transactions", "/banking"),
    ).toBe(false);
  });

  it("uses prefix match for non-index routes within a section", () => {
    expect(
      isActiveNavItem("/banking/transactions", "/banking/transactions/123", "/banking"),
    ).toBe(true);
  });
});
