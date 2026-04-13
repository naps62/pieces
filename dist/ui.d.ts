import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

interface PersistentStateOptions<T> {
    storage?: Storage;
    serialize?: (value: T) => string;
    deserialize?: (raw: string) => T;
}
declare function usePersistentState<T>(key: string, defaultValue: T, options?: PersistentStateOptions<T>): [T, (value: T | ((prev: T) => T)) => void];

interface KeyboardShortcutOptions {
    enabled?: boolean;
    event?: "keydown" | "keyup";
}
declare function useKeyboardShortcut(combo: string, handler: (e: KeyboardEvent) => void, options?: KeyboardShortcutOptions): void;

declare function useScrollLock(locked: boolean): void;

type Theme = "light" | "dark" | "system";
interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
    attribute?: "class" | `data-${string}`;
    value?: Partial<Record<"light" | "dark", string>>;
}
interface ThemeContextValue {
    theme: Theme;
    resolvedTheme: "light" | "dark";
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}
declare function ThemeProvider({ children, defaultTheme, storageKey, attribute, value, }: ThemeProviderProps): react_jsx_runtime.JSX.Element;
declare function useTheme(): ThemeContextValue;
declare function getThemeInitScript(options?: {
    storageKey?: string;
}): string;

interface CollapsibleContextValue {
    open: boolean;
    toggle: () => void;
    setOpen: (open: boolean) => void;
}
interface CollapsibleProps {
    children: ReactNode;
    defaultOpen?: boolean;
    storageKey?: string;
    shortcut?: string;
}
declare function Collapsible({ children, defaultOpen, storageKey, shortcut, }: CollapsibleProps): react_jsx_runtime.JSX.Element;
declare function useCollapsible(): CollapsibleContextValue;
type RenderProp = (ctx: CollapsibleContextValue) => ReactNode;
declare function CollapsibleTrigger({ children, }: {
    children: ReactNode | RenderProp;
}): react_jsx_runtime.JSX.Element;
declare function CollapsibleContent({ children, }: {
    children: ReactNode | RenderProp;
}): react_jsx_runtime.JSX.Element;

interface DrawerContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
    toggle: () => void;
}
interface DrawerProps {
    children: ReactNode;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}
declare function Drawer({ children, defaultOpen, onOpenChange, }: DrawerProps): react_jsx_runtime.JSX.Element;
declare function useDrawer(): DrawerContextValue;

interface NavItem {
    href: string;
    label: string;
}
interface NavSection {
    label: string;
    prefix: string;
    links: readonly NavItem[];
}
interface BreadcrumbConfig {
    topLinks?: readonly NavItem[];
    sections: readonly NavSection[];
}
interface BreadcrumbResult {
    section: string;
    page?: string;
}
declare function useBreadcrumbs(pathname: string, config: BreadcrumbConfig): BreadcrumbResult | null;
declare function isActiveNavItem(href: string, currentPath: string, sectionPrefix?: string): boolean;

export { type BreadcrumbConfig, type BreadcrumbResult, Collapsible, CollapsibleContent, type CollapsibleContextValue, type CollapsibleProps, CollapsibleTrigger, Drawer, type DrawerContextValue, type DrawerProps, type KeyboardShortcutOptions, type NavItem, type NavSection, type PersistentStateOptions, type Theme, type ThemeContextValue, ThemeProvider, type ThemeProviderProps, getThemeInitScript, isActiveNavItem, useBreadcrumbs, useCollapsible, useDrawer, useKeyboardShortcut, usePersistentState, useScrollLock, useTheme };
