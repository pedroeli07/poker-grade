export const gradeProfileListInclude = {
  _count: { select: { rules: true, assignments: true } },
} as const;

export const gradeNameSelect = { id: true, name: true } as const;

export const gradeDetailInclude = { rules: true, _count: { select: { assignments: true } } } as const;
