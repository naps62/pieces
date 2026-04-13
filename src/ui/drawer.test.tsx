import { renderHook, render, act, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Drawer, useDrawer } from "./drawer";
import type { ReactNode } from "react";

beforeEach(() => {
  document.body.style.overflow = "";
});

function wrapper({ children }: { children: ReactNode }) {
  return <Drawer>{children}</Drawer>;
}

describe("Drawer", () => {
  it("defaults to closed", () => {
    const { result } = renderHook(() => useDrawer(), { wrapper });
    expect(result.current.open).toBe(false);
  });

  it("respects defaultOpen=true", () => {
    function Wrapper({ children }: { children: ReactNode }) {
      return <Drawer defaultOpen>{children}</Drawer>;
    }
    const { result } = renderHook(() => useDrawer(), {
      wrapper: Wrapper,
    });
    expect(result.current.open).toBe(true);
  });

  it("toggles state", () => {
    const { result } = renderHook(() => useDrawer(), { wrapper });
    expect(result.current.open).toBe(false);
    act(() => result.current.toggle());
    expect(result.current.open).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.open).toBe(false);
  });

  it("setOpen changes state", () => {
    const { result } = renderHook(() => useDrawer(), { wrapper });
    act(() => result.current.setOpen(true));
    expect(result.current.open).toBe(true);
    act(() => result.current.setOpen(false));
    expect(result.current.open).toBe(false);
  });

  it("locks scroll when open", () => {
    const { result } = renderHook(() => useDrawer(), { wrapper });
    expect(document.body.style.overflow).toBe("");
    act(() => result.current.setOpen(true));
    expect(document.body.style.overflow).toBe("hidden");
    act(() => result.current.setOpen(false));
    expect(document.body.style.overflow).toBe("");
  });

  it("calls onOpenChange callback", () => {
    const onOpenChange = vi.fn();
    function Wrapper({ children }: { children: ReactNode }) {
      return <Drawer onOpenChange={onOpenChange}>{children}</Drawer>;
    }
    const { result } = renderHook(() => useDrawer(), {
      wrapper: Wrapper,
    });
    act(() => result.current.setOpen(true));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    act(() => result.current.toggle());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("restores scroll on unmount while open", () => {
    function Wrapper({ children }: { children: ReactNode }) {
      return <Drawer defaultOpen>{children}</Drawer>;
    }
    const { unmount } = renderHook(() => useDrawer(), {
      wrapper: Wrapper,
    });
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("throws when useDrawer is used outside Drawer", () => {
    expect(() => {
      renderHook(() => useDrawer());
    }).toThrow("useDrawer must be used within a Drawer");
  });
});
