// src/use-persistent-state.ts
import { useState, useCallback, useRef } from "react";
function usePersistentState(key, defaultValue, options) {
  const serialize = options?.serialize ?? JSON.stringify;
  const deserialize = options?.deserialize ?? JSON.parse;
  const storageRef = useRef(
    typeof window !== "undefined" ? options?.storage ?? localStorage : void 0
  );
  const [value, setValue] = useState(() => {
    const storage = storageRef.current;
    if (!storage) return defaultValue;
    try {
      const raw = storage.getItem(key);
      return raw !== null ? deserialize(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  const setPersistentValue = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = next instanceof Function ? next(prev) : next;
        storageRef.current?.setItem(key, serialize(resolved));
        return resolved;
      });
    },
    [key, serialize]
  );
  return [value, setPersistentValue];
}

// src/use-keyboard-shortcut.ts
import { useEffect, useRef as useRef2 } from "react";
var isMac = typeof navigator !== "undefined" && /mac|ipod|iphone|ipad/i.test(navigator.userAgent);
function parseCombo(combo) {
  const parts = combo.toLowerCase().split("+");
  const key = parts.pop();
  const modifiers = new Set(parts);
  const usesMod = modifiers.delete("mod");
  return {
    key,
    ctrl: modifiers.has("ctrl") || usesMod && !isMac,
    meta: modifiers.has("meta") || usesMod && isMac,
    shift: modifiers.has("shift"),
    alt: modifiers.has("alt")
  };
}
function matchesCombo(e, combo) {
  return e.key.toLowerCase() === combo.key && e.ctrlKey === combo.ctrl && e.metaKey === combo.meta && e.shiftKey === combo.shift && e.altKey === combo.alt;
}
function useKeyboardShortcut(combo, handler, options) {
  const { enabled = true, event = "keydown" } = options ?? {};
  const handlerRef = useRef2(handler);
  handlerRef.current = handler;
  const parsedRef = useRef2(parseCombo(combo));
  parsedRef.current = parseCombo(combo);
  useEffect(() => {
    if (!enabled) return;
    function listener(e) {
      if (matchesCombo(e, parsedRef.current)) {
        e.preventDefault();
        handlerRef.current(e);
      }
    }
    window.addEventListener(event, listener);
    return () => window.removeEventListener(event, listener);
  }, [enabled, event]);
}

// src/use-scroll-lock.ts
import { useEffect as useEffect2 } from "react";
function useScrollLock(locked) {
  useEffect2(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

// src/theme-provider.tsx
import { createContext, useCallback as useCallback2, useContext, useEffect as useEffect3, useMemo, useState as useState2 } from "react";
import { jsx } from "react/jsx-runtime";
var ThemeContext = createContext(void 0);
function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  attribute = "class",
  value = { dark: "dark", light: "light" }
}) {
  const [theme, setTheme] = usePersistentState(storageKey, defaultTheme);
  const [systemTheme, setSystemTheme] = useState2(getSystemTheme);
  useEffect3(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemTheme(mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const toggleTheme = useCallback2(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);
  useEffect3(() => {
    const el = document.documentElement;
    const lightValue = value.light ?? "light";
    const darkValue = value.dark ?? "dark";
    if (attribute === "class") {
      el.classList.remove(lightValue, darkValue);
      el.classList.add(resolvedTheme === "dark" ? darkValue : lightValue);
    } else {
      el.setAttribute(attribute, resolvedTheme === "dark" ? darkValue : lightValue);
    }
  }, [resolvedTheme, attribute, value]);
  const ctx = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );
  return /* @__PURE__ */ jsx(ThemeContext.Provider, { value: ctx, children });
}
function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
function getThemeInitScript(options) {
  const key = options?.storageKey ?? "theme";
  return `try{var t=localStorage.getItem(${JSON.stringify(key)});if(t==="light")document.documentElement.classList.remove("dark");else if(t!=="dark"&&!t&&window.matchMedia("(prefers-color-scheme:light)").matches)document.documentElement.classList.remove("dark")}catch(e){}`;
}

// src/collapsible.tsx
import {
  createContext as createContext2,
  useContext as useContext2,
  useCallback as useCallback3,
  useMemo as useMemo2
} from "react";
import { Fragment, jsx as jsx2 } from "react/jsx-runtime";
var CollapsibleContext = createContext2(
  void 0
);
var noopStorage = {
  getItem: () => null,
  setItem: () => {
  },
  removeItem: () => {
  },
  clear: () => {
  },
  key: () => null,
  length: 0
};
function Collapsible({
  children,
  defaultOpen = true,
  storageKey,
  shortcut
}) {
  const storageOptions = useMemo2(
    () => storageKey ? void 0 : { storage: noopStorage },
    [storageKey]
  );
  const [open, setOpenRaw] = usePersistentState(
    storageKey ?? "__collapsible__",
    defaultOpen,
    storageOptions
  );
  const toggle = useCallback3(() => {
    setOpenRaw((prev) => !prev);
  }, [setOpenRaw]);
  const setOpen = useCallback3(
    (value) => {
      setOpenRaw(value);
    },
    [setOpenRaw]
  );
  useKeyboardShortcut(shortcut ?? "", toggle, { enabled: !!shortcut });
  return /* @__PURE__ */ jsx2(CollapsibleContext.Provider, { value: { open, toggle, setOpen }, children });
}
function useCollapsible() {
  const ctx = useContext2(CollapsibleContext);
  if (!ctx) {
    throw new Error("useCollapsible must be used within a Collapsible");
  }
  return ctx;
}
function CollapsibleTrigger({
  children
}) {
  const ctx = useCollapsible();
  const content = typeof children === "function" ? children(ctx) : children;
  return /* @__PURE__ */ jsx2("div", { onClick: ctx.toggle, style: { display: "contents" }, children: content });
}
function CollapsibleContent({
  children
}) {
  const ctx = useCollapsible();
  return /* @__PURE__ */ jsx2(Fragment, { children: typeof children === "function" ? children(ctx) : children });
}

// src/drawer.tsx
import {
  createContext as createContext3,
  useContext as useContext3,
  useState as useState3,
  useCallback as useCallback4,
  useMemo as useMemo3
} from "react";
import { jsx as jsx3 } from "react/jsx-runtime";
var DrawerContext = createContext3(void 0);
function Drawer({
  children,
  defaultOpen = false,
  onOpenChange
}) {
  const [open, setOpenRaw] = useState3(defaultOpen);
  useScrollLock(open);
  const setOpen = useCallback4(
    (value) => {
      setOpenRaw(value);
      onOpenChange?.(value);
    },
    [onOpenChange]
  );
  const toggle = useCallback4(() => {
    setOpenRaw((prev) => {
      const next = !prev;
      onOpenChange?.(next);
      return next;
    });
  }, [onOpenChange]);
  const ctx = useMemo3(
    () => ({ open, setOpen, toggle }),
    [open, setOpen, toggle]
  );
  return /* @__PURE__ */ jsx3(DrawerContext.Provider, { value: ctx, children });
}
function useDrawer() {
  const ctx = useContext3(DrawerContext);
  if (!ctx) {
    throw new Error("useDrawer must be used within a Drawer");
  }
  return ctx;
}

// src/nav.ts
import { useMemo as useMemo4 } from "react";
function computeBreadcrumbs(pathname, config) {
  if (config.topLinks) {
    const topLink = config.topLinks.find(
      ({ href }) => pathname.startsWith(href)
    );
    if (topLink) return { section: topLink.label, page: void 0 };
  }
  for (const section of config.sections) {
    if (!pathname.startsWith(section.prefix)) continue;
    const page = section.links.find(
      ({ href }) => href === section.prefix ? pathname === section.prefix || pathname === section.prefix + "/" : pathname.startsWith(href)
    );
    return { section: section.label, page: page?.label };
  }
  return null;
}
function useBreadcrumbs(pathname, config) {
  return useMemo4(() => computeBreadcrumbs(pathname, config), [pathname, config]);
}
function isActiveNavItem(href, currentPath, sectionPrefix) {
  if (sectionPrefix && href === sectionPrefix) {
    return currentPath === href || currentPath === href + "/";
  }
  return currentPath.startsWith(href);
}
export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Drawer,
  ThemeProvider,
  getThemeInitScript,
  isActiveNavItem,
  useBreadcrumbs,
  useCollapsible,
  useDrawer,
  useKeyboardShortcut,
  usePersistentState,
  useScrollLock,
  useTheme
};
