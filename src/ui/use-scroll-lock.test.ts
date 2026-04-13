import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useScrollLock } from "./use-scroll-lock";

beforeEach(() => {
  document.body.style.overflow = "";
});

describe("useScrollLock", () => {
  it("sets overflow hidden when locked is true", () => {
    renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("does not set overflow when locked is false", () => {
    renderHook(() => useScrollLock(false));
    expect(document.body.style.overflow).toBe("");
  });

  it("restores overflow on unmount", () => {
    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("responds to locked changing from true to false", () => {
    const { rerender } = renderHook(({ locked }) => useScrollLock(locked), {
      initialProps: { locked: true },
    });
    expect(document.body.style.overflow).toBe("hidden");
    rerender({ locked: false });
    expect(document.body.style.overflow).toBe("");
  });
});
