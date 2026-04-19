import { z } from "zod";
import { ReviewStatus } from "@prisma/client";
import { schemaCuid as cuid } from "./primitives";
import { NotificationType } from "@prisma/client";

export const processReviewSchema = z.object({
  reviewId: cuid,
  status: z.nativeEnum(ReviewStatus),
  notes: z.string().max(5000).optional().nullable(),
});

export const uploadTournamentsMetaSchema = z.object({
  fileName: z.string().max(512).optional(),
});

export const deleteImportIdsSchema = z.array(cuid).min(1).max(80);

const isoDay = z
  .string()
  .max(12)
  .optional()
  .transform((s) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : undefined));

export const notificationsPageParamsSchema = z
  .object({
    page: z.coerce.number().int().min(1).max(500),
    filter: z.enum(["all", "unread", "read"]),
    /** 5–100 por página, ou 10000 (“Todos” na UI) para pedir todos os itens num único pedido. */
    pageSize: z.coerce.number().int().min(5).max(10_000).optional().default(10),
    types: z.array(z.nativeEnum(NotificationType)).optional(),
    search: z
      .string()
      .max(200)
      .optional()
      .transform((s) => (s && s.trim() ? s.trim() : undefined)),
    dateFrom: isoDay,
    dateTo: isoDay,
  })
  .refine((d) => !d.dateFrom || !d.dateTo || d.dateFrom <= d.dateTo, {
    message: "Intervalo de datas inválido.",
    path: ["dateTo"],
  });

export const notificationIdsDeleteSchema = z.array(cuid).min(1).max(100);
