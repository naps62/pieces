import { useState, useCallback, useRef } from "react";

export interface PersistentStateOptions<T> {
  storage?: Storage;
  serialize?: (value: T) => string;
  deserialize?: (raw: string) => T;
}

export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  options?: PersistentStateOptions<T>,
): [T, (value: T | ((prev: T) => T)) => void] {
  const serialize = options?.serialize ?? JSON.stringify;
  const deserialize = options?.deserialize ?? JSON.parse;
  const storageRef = useRef(
    typeof window !== "undefined"
      ? (options?.storage ?? localStorage)
      : undefined,
  );

  const [value, setValue] = useState<T>(() => {
    const storage = storageRef.current;
    if (!storage) return defaultValue;
    try {
      const raw = storage.getItem(key);
      return raw !== null ? (deserialize(raw) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setPersistentValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = next instanceof Function ? next(prev) : next;
        storageRef.current?.setItem(key, serialize(resolved));
        return resolved;
      });
    },
    [key, serialize],
  );

  return [value, setPersistentValue];
}
