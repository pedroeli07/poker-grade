import { superAdminEmail } from "@/lib/constants";

export const normalizeAuthEmail = (raw: string) => raw.toLowerCase().trim();
export const isSuperAdminEmail = (email: string) => normalizeAuthEmail(email) === superAdminEmail;
export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export function isNextRedirectError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const digest = (err as { digest?: string }).digest;
  return (
    err.message === "NEXT_REDIRECT" ||
    (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT"))
  );
}
