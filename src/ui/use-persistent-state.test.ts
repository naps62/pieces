import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { usePersistentState } from "./use-persistent-state";

beforeEach(() => {
  localStorage.clear();
});

describe("usePersistentState", () => {
  it("returns default value when storage is empty", () => {
    const { result } = renderHook(() => usePersistentState("key", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("reads initial value from storage", () => {
    localStorage.setItem("key", JSON.stringify("stored"));
    const { result } = renderHook(() => usePersistentState("key", "default"));
    expect(result.current[0]).toBe("stored");
  });

  it("writes to storage on state change", () => {
    const { result } = renderHook(() => usePersistentState("key", "initial"));
    act(() => {
      result.current[1]("updated");
    });
    expect(result.current[0]).toBe("updated");
    expect(localStorage.getItem("key")).toBe(JSON.stringify("updated"));
  });

  it("supports updater function", () => {
    const { result } = renderHook(() => usePersistentState("count", 0));
    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    expect(result.current[0]).toBe(1);
    expect(localStorage.getItem("count")).toBe("1");
  });

  it("handles non-primitive values", () => {
    const obj = { a: 1, b: [2, 3] };
    const { result } = renderHook(() => usePersistentState("obj", obj));
    expect(result.current[0]).toEqual(obj);
  });

  it("uses custom serialize/deserialize", () => {
    const { result } = renderHook(() =>
      usePersistentState("date", new Date("2026-01-01"), {
        serialize: (d) => d.toISOString(),
        deserialize: (s) => new Date(s),
      }),
    );
    expect(result.current[0]).toEqual(new Date("2026-01-01"));

    act(() => {
      result.current[1](new Date("2026-06-15"));
    });
    expect(localStorage.getItem("date")).toBe("2026-06-15T00:00:00.000Z");
  });

  it("uses custom storage", () => {
    const { result } = renderHook(() =>
      usePersistentState("key", "default", { storage: sessionStorage }),
    );
    act(() => {
      result.current[1]("session-value");
    });
    expect(sessionStorage.getItem("key")).toBe(JSON.stringify("session-value"));
    expect(localStorage.getItem("key")).toBeNull();
  });

  it("returns default when stored value is corrupted JSON", () => {
    localStorage.setItem("key", "not-json{{{");
    const { result } = renderHook(() => usePersistentState("key", "fallback"));
    expect(result.current[0]).toBe("fallback");
  });
});
