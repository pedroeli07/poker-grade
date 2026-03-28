/** URL pública do app (links em e-mails / webhooks). */
export function getAppBaseUrl(): string {
  const pub = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (pub) return pub;
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "";
}
