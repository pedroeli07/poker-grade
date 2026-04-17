export type PasswordChecks = {
  minLength: boolean;
  maxLength: boolean;
  lower: boolean;
  upper: boolean;
  digit: boolean;
  special: boolean;
};

export type StrengthLevel = "empty" | "weak" | "fair" | "good" | "strong";
