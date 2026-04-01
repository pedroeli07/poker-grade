export const gradeKeys = {
  all: ["grades"] as const,
  list: () => [...gradeKeys.all, "list"] as const,
  detail: (id: string) => [...gradeKeys.all, "detail", id] as const,
};
