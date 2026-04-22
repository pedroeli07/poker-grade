import type { AppSession } from "@/lib/types/auth";

export type GradeMutationBody = (s: AppSession) => Promise<string[] | void>;
