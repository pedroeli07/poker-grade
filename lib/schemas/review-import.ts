import { z } from "zod";
import { ReviewStatus } from "@prisma/client";
import { schemaCuid as cuid } from "./primitives";

export const processReviewSchema = z.object({
  reviewId: cuid,
  status: z.nativeEnum(ReviewStatus),
  notes: z.string().max(5000).optional().nullable(),
});

export const uploadTournamentsMetaSchema = z.object({
  fileName: z.string().max(512).optional(),
});

export const deleteImportIdsSchema = z.array(cuid).min(1).max(80);

export const notificationsPageParamsSchema = z.object({
  page: z.coerce.number().int().min(1).max(500),
  filter: z.enum(["all", "unread", "read"]),
});

export const notificationIdsDeleteSchema = z.array(cuid).min(1).max(100);
