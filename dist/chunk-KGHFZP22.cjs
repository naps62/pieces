"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// src/ui/use-persistent-state.ts
var _react = require('react');
function usePersistentState(key, defaultValue, options) {
  const serialize = _nullishCoalesce(_optionalChain([options, 'optionalAccess', _ => _.serialize]), () => ( JSON.stringify));
  const deserialize = _nullishCoalesce(_optionalChain([options, 'optionalAccess', _2 => _2.deserialize]), () => ( JSON.parse));
  const storageRef = _react.useRef.call(void 0, 
    typeof window !== "undefined" ? _nullishCoalesce(_optionalChain([options, 'optionalAccess', _3 => _3.storage]), () => ( localStorage)) : void 0
  );
  const [value, setValue] = _react.useState.call(void 0, () => {
    const storage = storageRef.current;
    if (!storage) return defaultValue;
    try {
      const raw = storage.getItem(key);
      return raw !== null ? deserialize(raw) : defaultValue;
    } catch (e2) {
      return defaultValue;
    }
  });
  const setPersistentValue = _react.useCallback.call(void 0, 
    (next) => {
      setValue((prev) => {
        const resolved = next instanceof Function ? next(prev) : next;
        _optionalChain([storageRef, 'access', _4 => _4.current, 'optionalAccess', _5 => _5.setItem, 'call', _6 => _6(key, serialize(resolved))]);
        return resolved;
      });
    },
    [key, serialize]
  );
  return [value, setPersistentValue];
}

// src/ui/use-keyboard-shortcut.ts

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
  const { enabled = true, event = "keydown" } = _nullishCoalesce(options, () => ( {}));
  const handlerRef = _react.useRef.call(void 0, handler);
  handlerRef.current = handler;
  const parsedRef = _react.useRef.call(void 0, parseCombo(combo));
  parsedRef.current = parseCombo(combo);
  _react.useEffect.call(void 0, () => {
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

// src/ui/use-scroll-lock.ts

function useScrollLock(locked) {
  _react.useEffect.call(void 0, () => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

// src/ui/theme-provider.tsx

var _jsxruntime = require('react/jsx-runtime');
var ThemeContext = _react.createContext.call(void 0, void 0);
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
  const [systemTheme, setSystemTheme] = _react.useState.call(void 0, getSystemTheme);
  _react.useEffect.call(void 0, () => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemTheme(mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const toggleTheme = _react.useCallback.call(void 0, () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);
  _react.useEffect.call(void 0, () => {
    const el = document.documentElement;
    const lightValue = _nullishCoalesce(value.light, () => ( "light"));
    const darkValue = _nullishCoalesce(value.dark, () => ( "dark"));
    if (attribute === "class") {
      el.classList.remove(lightValue, darkValue);
      el.classList.add(resolvedTheme === "dark" ? darkValue : lightValue);
    } else {
      el.setAttribute(attribute, resolvedTheme === "dark" ? darkValue : lightValue);
    }
  }, [resolvedTheme, attribute, value]);
  const ctx = _react.useMemo.call(void 0, 
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );
  return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, ThemeContext.Provider, { value: ctx, children });
}
function useTheme() {
  const ctx = _react.useContext.call(void 0, ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
function getThemeInitScript(options) {
  const key = _nullishCoalesce(_optionalChain([options, 'optionalAccess', _7 => _7.storageKey]), () => ( "theme"));
  return `try{var t=localStorage.getItem(${JSON.stringify(key)});if(t==="light")document.documentElement.classList.remove("dark");else if(t!=="dark"&&!t&&window.matchMedia("(prefers-color-scheme:light)").matches)document.documentElement.classList.remove("dark")}catch(e){}`;
}

// src/ui/collapsible.tsx







var CollapsibleContext = _react.createContext.call(void 0, 
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
  const storageOptions = _react.useMemo.call(void 0, 
    () => storageKey ? void 0 : { storage: noopStorage },
    [storageKey]
  );
  const [open, setOpenRaw] = usePersistentState(
    _nullishCoalesce(storageKey, () => ( "__collapsible__")),
    defaultOpen,
    storageOptions
  );
  const toggle = _react.useCallback.call(void 0, () => {
    setOpenRaw((prev) => !prev);
  }, [setOpenRaw]);
  const setOpen = _react.useCallback.call(void 0, 
    (value) => {
      setOpenRaw(value);
    },
    [setOpenRaw]
  );
  useKeyboardShortcut(_nullishCoalesce(shortcut, () => ( "")), toggle, { enabled: !!shortcut });
  return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, CollapsibleContext.Provider, { value: { open, toggle, setOpen }, children });
}
function useCollapsible() {
  const ctx = _react.useContext.call(void 0, CollapsibleContext);
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
  return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "div", { onClick: ctx.toggle, style: { display: "contents" }, children: content });
}
function CollapsibleContent({
  children
}) {
  const ctx = useCollapsible();
  return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _jsxruntime.Fragment, { children: typeof children === "function" ? children(ctx) : children });
}

// src/ui/drawer.tsx








var DrawerContext = _react.createContext.call(void 0, void 0);
function Drawer({
  children,
  defaultOpen = false,
  onOpenChange
}) {
  const [open, setOpenRaw] = _react.useState.call(void 0, defaultOpen);
  useScrollLock(open);
  const setOpen = _react.useCallback.call(void 0, 
    (value) => {
      setOpenRaw(value);
      _optionalChain([onOpenChange, 'optionalCall', _8 => _8(value)]);
    },
    [onOpenChange]
  );
  const toggle = _react.useCallback.call(void 0, () => {
    setOpenRaw((prev) => {
      const next = !prev;
      _optionalChain([onOpenChange, 'optionalCall', _9 => _9(next)]);
      return next;
    });
  }, [onOpenChange]);
  const ctx = _react.useMemo.call(void 0, 
    () => ({ open, setOpen, toggle }),
    [open, setOpen, toggle]
  );
  return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, DrawerContext.Provider, { value: ctx, children });
}
function useDrawer() {
  const ctx = _react.useContext.call(void 0, DrawerContext);
  if (!ctx) {
    throw new Error("useDrawer must be used within a Drawer");
  }
  return ctx;
}

// src/ui/nav.ts

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
    return { section: section.label, page: _optionalChain([page, 'optionalAccess', _10 => _10.label]) };
  }
  return null;
}
function useBreadcrumbs(pathname, config) {
  return _react.useMemo.call(void 0, () => computeBreadcrumbs(pathname, config), [pathname, config]);
}
function isActiveNavItem(href, currentPath, sectionPrefix) {
  if (sectionPrefix && href === sectionPrefix) {
    return currentPath === href || currentPath === href + "/";
  }
  return currentPath.startsWith(href);
}
















exports.usePersistentState = usePersistentState; exports.useKeyboardShortcut = useKeyboardShortcut; exports.useScrollLock = useScrollLock; exports.ThemeProvider = ThemeProvider; exports.useTheme = useTheme; exports.getThemeInitScript = getThemeInitScript; exports.Collapsible = Collapsible; exports.useCollapsible = useCollapsible; exports.CollapsibleTrigger = CollapsibleTrigger; exports.CollapsibleContent = CollapsibleContent; exports.Drawer = Drawer; exports.useDrawer = useDrawer; exports.useBreadcrumbs = useBreadcrumbs; exports.isActiveNavItem = isActiveNavItem;
