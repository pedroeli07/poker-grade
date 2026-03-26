import { z } from "zod";
import { ReviewStatus, UserRole } from "@prisma/client";
import {
  PASSWORD_MAX_LENGTH,
  passwordMeetsPolicy,
  PASSWORD_POLICY_MESSAGE,
} from "@/lib/auth/password-policy";

const cuid = z.cuid();

export const loginBodySchema = z.object({
  email: z.email().max(320).transform((s) => s.toLowerCase().trim()),
  password: z.string().min(1).max(512),
});

export const registerBodySchema = z
  .object({
    email: z.email().max(320).transform((s) => s.toLowerCase().trim()),
    password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
    confirmPassword: z.string().min(1).max(PASSWORD_MAX_LENGTH),
    displayName: z.string().max(200).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  })
  .superRefine((d, ctx) => {
    if (!passwordMeetsPolicy(d.password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: PASSWORD_POLICY_MESSAGE,
        path: ["password"],
      });
    }
  });

const inviteRoleSchema = z.enum(UserRole);

export const allowedInviteFormSchema = z.object({
  email: z.email().max(320).transform((s) => s.toLowerCase().trim()),
  role: inviteRoleSchema,
});

export const updatePendingInviteFormSchema = z.object({
  id: z.cuid(),
  email: z.email().max(320).transform((s) => s.toLowerCase().trim()),
  role: inviteRoleSchema,
});

export const updateAuthAccountFormSchema = z.object({
  id: z.cuid(),
  email: z.email().max(320).transform((s) => s.toLowerCase().trim()),
  role: inviteRoleSchema,
});

export const idParamSchema = z.object({
  id: z.cuid(),
});

export const createPlayerFormSchema = z.object({
  name: z.string().min(1).max(200),
  nickname: z.string().max(120).optional().nullable(),
  email: z.union([z.email().max(320), z.literal("")]).optional(),
  coachId: z.union([cuid, z.literal("none"), z.literal("")]),
});

export const importGradeFormSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  jsonContent: z.string().min(2).max(5_000_000),
});

export const deleteGradeSchema = z.object({
  id: cuid,
});

export const processReviewSchema = z.object({
  reviewId: cuid,
  status: z.enum(ReviewStatus),
  notes: z.string().max(5000).optional().nullable(),
});

export const gradeIdParamSchema = z.object({
  id: cuid,
});

/** Arquivo de importação Excel — validação de metadados (bytes checados no handler) */
export const uploadTournamentsMetaSchema = z.object({
  fileName: z.string().max(512).optional(),
});
