import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { FilterStore } from "@/lib/types/dashboard/index";
type SerializedSet = { __type: "Set"; items: string[] };

function isSerializedSet(value: unknown): value is SerializedSet {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { __type?: unknown }).__type === "Set" &&
    Array.isArray((value as SerializedSet).items)
  );
}

export function createFilterStore<
  T extends Record<string, Set<string> | null>
>(defaultFilters: T, name: string) {
  return create<FilterStore<T>>()(
    persist(
      (set) => ({
        filters: defaultFilters,
        hasAnyFilter: false,
        setColumnFilter: (key, next) =>
          set((state) => {
            const filters = { ...state.filters, [key as keyof T]: next };
            const hasAnyFilter = Object.values(filters).some(
              (v) => v !== null
            );
            return { filters, hasAnyFilter };
          }),
        clearFilters: () =>
          set({ filters: defaultFilters, hasAnyFilter: false }),
      }),
      {
        name,
        storage: createJSONStorage(
          () => {
            if (typeof window === "undefined") {
              return {
                getItem: () => null,
                setItem: () => {},
                removeItem: () => {},
              };
            }
            return window.localStorage;
          },
          {
            replacer: (_key, value) => {
              if (value instanceof Set) {
                return { __type: "Set", items: Array.from(value) };
              }
              return value;
            },
            reviver: (_key, value) => {
              if (isSerializedSet(value)) return new Set(value.items);
              return value;
            },
          }
        ),
        partialize: (state) => ({
          filters: state.filters,
          hasAnyFilter: state.hasAnyFilter,
        }),
      }
    )
  );
}
