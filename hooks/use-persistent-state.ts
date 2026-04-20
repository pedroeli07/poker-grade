"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

type SerializedSet = { __type: "Set"; items: string[] };

function isSerializedSet(value: unknown): value is SerializedSet {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { __type?: unknown }).__type === "Set" &&
    Array.isArray((value as SerializedSet).items)
  );
}

function defaultReplacer(_key: string, value: unknown) {
  if (value instanceof Set) return { __type: "Set", items: Array.from(value) };
  return value;
}

function defaultReviver(_key: string, value: unknown) {
  if (isSerializedSet(value)) return new Set(value.items);
  return value;
}

export interface UsePersistentStateOptions<T> {
  serialize?: (value: T) => string;
  deserialize?: (raw: string) => T;
}

/**
 * Stateful value persisted to localStorage under `key`.
 * Returns the value, setter, and a `hydrated` flag — callers should gate any
 * render whose layout depends on the persisted value until `hydrated` is true,
 * to avoid showing the SSR default before the stored value is read.
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  options?: UsePersistentStateOptions<T>
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const serialize = options?.serialize;
  const deserialize = options?.deserialize;
  const [value, setValue] = useState<T>(defaultValue);
  const [hydrated, setHydrated] = useState(false);
  const latestKey = useRef(key);
  latestKey.current = key;

  useLayoutEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed = deserialize
          ? deserialize(raw)
          : (JSON.parse(raw, defaultReviver) as T);
        setValue(parsed);
      }
    } catch {
      /* ignore corrupted payload */
    } finally {
      setHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const raw = serialize
        ? serialize(value)
        : JSON.stringify(value, defaultReplacer);
      window.localStorage.setItem(key, raw);
    } catch {
      /* ignore quota/serialization issues */
    }
  }, [key, value, serialize, hydrated]);

  const setter = useCallback<Dispatch<SetStateAction<T>>>((next) => {
    setValue(next);
  }, []);

  return [value, setter, hydrated];
}
