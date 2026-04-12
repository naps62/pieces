import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useKeyboardShortcut } from "./use-keyboard-shortcut";

function fireKey(key: string, modifiers: Partial<KeyboardEvent> = {}) {
  window.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, ...modifiers }),
  );
}

describe("useKeyboardShortcut", () => {
  it("fires handler on matching key combo", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut("mod+k", handler));

    // jsdom is non-Mac, so mod = ctrlKey
    fireKey("k", { ctrlKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not fire on partial match", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut("mod+k", handler));

    fireKey("k"); // no modifier
    fireKey("k", { shiftKey: true }); // wrong modifier
    expect(handler).not.toHaveBeenCalled();
  });

  it("handles shift modifier", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut("shift+a", handler));

    fireKey("a", { shiftKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("handles alt modifier", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut("alt+p", handler));

    fireKey("p", { altKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("handles multi-modifier combos", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut("mod+shift+p", handler));

    fireKey("p", { ctrlKey: true, shiftKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("handles special keys like [", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut("mod+[", handler));

    fireKey("[", { ctrlKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not fire when enabled is false", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcut("mod+k", handler, { enabled: false }),
    );

    fireKey("k", { ctrlKey: true });
    expect(handler).not.toHaveBeenCalled();
  });

  it("cleans up listener on unmount", () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() =>
      useKeyboardShortcut("mod+k", handler),
    );

    unmount();
    fireKey("k", { ctrlKey: true });
    expect(handler).not.toHaveBeenCalled();
  });
});
