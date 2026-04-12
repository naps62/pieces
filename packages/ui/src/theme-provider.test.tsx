import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { ThemeProvider, useTheme } from "./theme-provider";
import type { ReactNode } from "react";
import type { ThemeProviderProps } from "./theme-provider";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-theme");
});

function wrapper(props?: Partial<ThemeProviderProps>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <ThemeProvider {...props}>{children}</ThemeProvider>;
  };
}

describe("ThemeProvider", () => {
  it("defaults to system theme", () => {
    const { result } = renderHook(() => useTheme(), { wrapper: wrapper() });
    expect(result.current.theme).toBe("system");
    // jsdom has no prefers-color-scheme, so resolvedTheme defaults to "light"
    expect(result.current.resolvedTheme).toBe("light");
  });

  it("respects defaultTheme prop", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: wrapper({ defaultTheme: "dark" }),
    });
    expect(result.current.theme).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("applies class to document.documentElement by default", () => {
    renderHook(() => useTheme(), {
      wrapper: wrapper({ defaultTheme: "dark" }),
    });
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes class when switching to light", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: wrapper({ defaultTheme: "dark" }),
    });
    act(() => {
      result.current.setTheme("light");
    });
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("supports data attribute mode", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: wrapper({ defaultTheme: "dark", attribute: "data-theme" }),
    });
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    act(() => {
      result.current.setTheme("light");
    });
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("supports custom value mapping", () => {
    renderHook(() => useTheme(), {
      wrapper: wrapper({
        defaultTheme: "dark",
        value: { dark: "my-dark-class", light: "my-light-class" },
      }),
    });
    expect(document.documentElement.classList.contains("my-dark-class")).toBe(
      true,
    );
  });

  it("persists theme to localStorage", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: wrapper({ storageKey: "my-theme" }),
    });
    act(() => {
      result.current.setTheme("dark");
    });
    expect(localStorage.getItem("my-theme")).toBe(JSON.stringify("dark"));
  });

  it("reads persisted theme on mount", () => {
    localStorage.setItem("theme", JSON.stringify("dark"));
    const { result } = renderHook(() => useTheme(), { wrapper: wrapper() });
    expect(result.current.theme).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
  });
});
