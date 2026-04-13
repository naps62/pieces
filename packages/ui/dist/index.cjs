"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Collapsible: () => Collapsible,
  CollapsibleContent: () => CollapsibleContent,
  CollapsibleTrigger: () => CollapsibleTrigger,
  ThemeProvider: () => ThemeProvider,
  useCollapsible: () => useCollapsible,
  useKeyboardShortcut: () => useKeyboardShortcut,
  usePersistentState: () => usePersistentState,
  useTheme: () => useTheme
});
module.exports = __toCommonJS(src_exports);

// src/use-persistent-state.ts
var import_react = require("react");
function usePersistentState(key, defaultValue, options) {
  const serialize = options?.serialize ?? JSON.stringify;
  const deserialize = options?.deserialize ?? JSON.parse;
  const storageRef = (0, import_react.useRef)(
    typeof window !== "undefined" ? options?.storage ?? localStorage : void 0
  );
  const [value, setValue] = (0, import_react.useState)(() => {
    const storage = storageRef.current;
    if (!storage) return defaultValue;
    try {
      const raw = storage.getItem(key);
      return raw !== null ? deserialize(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  const setPersistentValue = (0, import_react.useCallback)(
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
var import_react2 = require("react");
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
  const handlerRef = (0, import_react2.useRef)(handler);
  handlerRef.current = handler;
  const parsedRef = (0, import_react2.useRef)(parseCombo(combo));
  parsedRef.current = parseCombo(combo);
  (0, import_react2.useEffect)(() => {
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

// src/theme-provider.tsx
var import_react3 = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var ThemeContext = (0, import_react3.createContext)(void 0);
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
  const [systemTheme, setSystemTheme] = (0, import_react3.useState)(getSystemTheme);
  (0, import_react3.useEffect)(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemTheme(mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const resolvedTheme = theme === "system" ? systemTheme : theme;
  (0, import_react3.useEffect)(() => {
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
  const ctx = (0, import_react3.useMemo)(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, { value: ctx, children });
}
function useTheme() {
  const ctx = (0, import_react3.useContext)(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

// src/collapsible.tsx
var import_react4 = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
var CollapsibleContext = (0, import_react4.createContext)(
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
  const storageOptions = (0, import_react4.useMemo)(
    () => storageKey ? void 0 : { storage: noopStorage },
    [storageKey]
  );
  const [open, setOpenRaw] = usePersistentState(
    storageKey ?? "__collapsible__",
    defaultOpen,
    storageOptions
  );
  const toggle = (0, import_react4.useCallback)(() => {
    setOpenRaw((prev) => !prev);
  }, [setOpenRaw]);
  const setOpen = (0, import_react4.useCallback)(
    (value) => {
      setOpenRaw(value);
    },
    [setOpenRaw]
  );
  useKeyboardShortcut(shortcut ?? "", toggle, { enabled: !!shortcut });
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(CollapsibleContext.Provider, { value: { open, toggle, setOpen }, children });
}
function useCollapsible() {
  const ctx = (0, import_react4.useContext)(CollapsibleContext);
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
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { onClick: ctx.toggle, style: { display: "contents" }, children: content });
}
function CollapsibleContent({
  children
}) {
  const ctx = useCollapsible();
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_jsx_runtime2.Fragment, { children: typeof children === "function" ? children(ctx) : children });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ThemeProvider,
  useCollapsible,
  useKeyboardShortcut,
  usePersistentState,
  useTheme
});
