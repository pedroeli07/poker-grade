import type { ComponentProps, ReactNode } from "react";

export type RoleVisual = { label: string; text: string; bg: string; icon: ReactNode };

export type PasswordStrengthProps = { password: string; className?: string; compact?: boolean };
export type PasswordInputProps = Omit<ComponentProps<"input">, "type"> & { containerClassName?: string };


