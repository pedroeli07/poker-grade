export const reviewKeys = {
  all: ["review"] as const,
  pending: () => [...reviewKeys.all, "pending"] as const,
};
