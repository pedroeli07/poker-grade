export interface FilterStore<T> {
  filters: T;
  setColumnFilter: (key: string, next: Set<string> | null) => void;
  clearFilters: () => void;
  hasAnyFilter: boolean;
}

export interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export interface TopbarState {
  titleOverride: string | null;
  setTitle: (title: string | null) => void;
}
