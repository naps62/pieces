import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useScrollLock } from "./use-scroll-lock";

export interface DrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const DrawerContext = createContext<DrawerContextValue | undefined>(undefined);

export interface DrawerProps {
  children: ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Drawer({
  children,
  defaultOpen = false,
  onOpenChange,
}: DrawerProps) {
  const [open, setOpenRaw] = useState(defaultOpen);

  useScrollLock(open);

  const setOpen = useCallback(
    (value: boolean) => {
      setOpenRaw(value);
      onOpenChange?.(value);
    },
    [onOpenChange],
  );

  const toggle = useCallback(() => {
    setOpenRaw((prev) => {
      const next = !prev;
      onOpenChange?.(next);
      return next;
    });
  }, [onOpenChange]);

  const ctx = useMemo<DrawerContextValue>(
    () => ({ open, setOpen, toggle }),
    [open, setOpen, toggle],
  );

  return (
    <DrawerContext.Provider value={ctx}>{children}</DrawerContext.Provider>
  );
}

export function useDrawer(): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error("useDrawer must be used within a Drawer");
  }
  return ctx;
}
