import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { usePersistentState } from "./use-persistent-state";
import { useKeyboardShortcut } from "./use-keyboard-shortcut";

export interface CollapsibleContextValue {
  open: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

const CollapsibleContext = createContext<CollapsibleContextValue | undefined>(
  undefined,
);

export interface CollapsibleProps {
  children: ReactNode;
  defaultOpen?: boolean;
  storageKey?: string;
  shortcut?: string;
}

// A storage implementation that does nothing — used when no storageKey is provided
const noopStorage: Storage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
  length: 0,
};

export function Collapsible({
  children,
  defaultOpen = true,
  storageKey,
  shortcut,
}: CollapsibleProps) {
  const storageOptions = useMemo(
    () => (storageKey ? undefined : { storage: noopStorage }),
    [storageKey],
  );

  const [open, setOpenRaw] = usePersistentState(
    storageKey ?? "__collapsible__",
    defaultOpen,
    storageOptions,
  );

  const toggle = useCallback(() => {
    setOpenRaw((prev: boolean) => !prev);
  }, [setOpenRaw]);

  const setOpen = useCallback(
    (value: boolean) => {
      setOpenRaw(value);
    },
    [setOpenRaw],
  );

  useKeyboardShortcut(shortcut ?? "", toggle, { enabled: !!shortcut });

  return (
    <CollapsibleContext.Provider value={{ open, toggle, setOpen }}>
      {children}
    </CollapsibleContext.Provider>
  );
}

export function useCollapsible(): CollapsibleContextValue {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) {
    throw new Error("useCollapsible must be used within a Collapsible");
  }
  return ctx;
}

type RenderProp = (ctx: CollapsibleContextValue) => ReactNode;

export function CollapsibleTrigger({
  children,
}: {
  children: ReactNode | RenderProp;
}) {
  const ctx = useCollapsible();

  const content = typeof children === "function" ? children(ctx) : children;

  return (
    <div onClick={ctx.toggle} style={{ display: "contents" }}>
      {content}
    </div>
  );
}

export function CollapsibleContent({
  children,
}: {
  children: ReactNode | RenderProp;
}) {
  const ctx = useCollapsible();

  return <>{typeof children === "function" ? children(ctx) : children}</>;
}
