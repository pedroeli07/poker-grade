import { z } from "zod";

const YT_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

/**
 * Aceita apenas URLs cujo host seja youtube.com ou youtu.be (e subdomínios conhecidos).
 */
export function isAllowedYouTubeUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const host = u.hostname.toLowerCase();
    return YT_HOSTS.has(host);
  } catch {
    return false;
  }
}

export const youtubeUrlSchema = z
  .string()
  .max(2048)
  .refine(isAllowedYouTubeUrl, "URL deve ser do YouTube (youtube.com ou youtu.be)");
