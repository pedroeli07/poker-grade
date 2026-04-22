export enum GradeChangeAction {
  UPGRADE = "UPGRADE",
  DOWNGRADE = "DOWNGRADE",
  MAINTAIN = "MAINTAIN",
}

export type GradeChangeActionType = (typeof GradeChangeAction)[keyof typeof GradeChangeAction];
