export const playerKeys = {
  all: ["players"] as const,
  list: () => [...playerKeys.all, "table"] as const,
};
