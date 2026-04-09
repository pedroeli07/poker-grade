import { z } from "zod";
import { UserRole } from "@prisma/client";
import {
  PASSWORD_MAX_LENGTH,
  passwordMeetsPolicy,
  PASSWORD_POLICY_MESSAGE,
} from "@/lib/auth/password-policy";
import { schemaCuid as cuid, zodEmail, zodName } from "./primitives";

const passwordSchema = z.string().min(1).max(PASSWORD_MAX_LENGTH);

const passwordPolicyRefinement = (val: string, ctx: z.RefinementCtx) => {
  if (!passwordMeetsPolicy(val)) {
    ctx.addIssue({
      code: "custom",
      message: PASSWORD_POLICY_MESSAGE,
    });
  }
};

export const loginBodySchema = z.object({
  email: zodEmail,
  password: z.string().min(1).max(512),
});

export const registerBodySchema = z
  .object({
    email: zodEmail,
    password: passwordSchema,
    confirmPassword: passwordSchema,
    displayName: zodName.optional(),
    code: z.string().length(6, "Código deve ter exatos 6 dígitos"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  })
  .superRefine((d, ctx) => {
    passwordPolicyRefinement(d.password, ctx);
  });

export const resetPasswordSchema = z
  .object({
    email: zodEmail,
    code: z.string().length(6, "Código deve ter exatos 6 dígitos"),
    newPassword: passwordSchema,
  })
  .superRefine((d, ctx) => {
    passwordPolicyRefinement(d.newPassword, ctx);
  });

const inviteBaseSchema = z.object({
  email: zodEmail,
  role: z.enum(UserRole),
});

export const allowedInviteFormSchema = inviteBaseSchema;

export const updatePendingInviteFormSchema = inviteBaseSchema.extend({
  id: cuid,
});

export const updateAuthAccountFormSchema = inviteBaseSchema.extend({
  id: cuid,
});

export const idParamSchema = z.object({
  id: cuid,
});

export const sendCodeSchema = z.object({
  email: z.string().email(),
  type: z.enum(["REGISTER", "RESET"]),
});
