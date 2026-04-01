export const targetKeys = {
  all: ["targets"] as const,
  list: () => [...targetKeys.all, "list"] as const,
};
