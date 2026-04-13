import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePersistentState } from "./use-persistent-state";

export type Theme = "light" | "dark" | "system";

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: "class" | `data-${string}`;
  value?: Partial<Record<"light" | "dark", string>>;
}

export interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  attribute = "class",
  value = { dark: "dark", light: "light" },
}: ThemeProviderProps) {
  const [theme, setTheme] = usePersistentState<Theme>(storageKey, defaultTheme);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(getSystemTheme);

  // Listen for system preference changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemTheme(mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme = theme === "system" ? systemTheme : theme;

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  // Apply attribute to documentElement
  useEffect(() => {
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

  const ctx = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={ctx}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

export function getThemeInitScript(options?: { storageKey?: string }): string {
  const key = options?.storageKey ?? "theme";
  return `try{var t=localStorage.getItem(${JSON.stringify(key)});if(t==="light")document.documentElement.classList.remove("dark");else if(t!=="dark"&&!t&&window.matchMedia("(prefers-color-scheme:light)").matches)document.documentElement.classList.remove("dark")}catch(e){}`;
}
