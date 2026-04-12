import { useEffect, useRef } from "react";

export interface KeyboardShortcutOptions {
  enabled?: boolean;
  event?: "keydown" | "keyup";
}

interface ParsedCombo {
  key: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  alt: boolean;
}

const isMac =
  typeof navigator !== "undefined" &&
  /mac|ipod|iphone|ipad/i.test(navigator.userAgent);

function parseCombo(combo: string): ParsedCombo {
  const parts = combo.toLowerCase().split("+");
  const key = parts.pop()!;
  const modifiers = new Set(parts);

  const usesMod = modifiers.delete("mod");

  return {
    key,
    ctrl: modifiers.has("ctrl") || (usesMod && !isMac),
    meta: modifiers.has("meta") || (usesMod && isMac),
    shift: modifiers.has("shift"),
    alt: modifiers.has("alt"),
  };
}

function matchesCombo(e: KeyboardEvent, combo: ParsedCombo): boolean {
  return (
    e.key.toLowerCase() === combo.key &&
    e.ctrlKey === combo.ctrl &&
    e.metaKey === combo.meta &&
    e.shiftKey === combo.shift &&
    e.altKey === combo.alt
  );
}

export function useKeyboardShortcut(
  combo: string,
  handler: (e: KeyboardEvent) => void,
  options?: KeyboardShortcutOptions,
): void {
  const { enabled = true, event = "keydown" } = options ?? {};
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const parsedRef = useRef<ParsedCombo>(parseCombo(combo));
  parsedRef.current = parseCombo(combo);

  useEffect(() => {
    if (!enabled) return;

    function listener(e: KeyboardEvent) {
      if (matchesCombo(e, parsedRef.current)) {
        e.preventDefault();
        handlerRef.current(e);
      }
    }

    window.addEventListener(event, listener);
    return () => window.removeEventListener(event, listener);
  }, [enabled, event]);
}
