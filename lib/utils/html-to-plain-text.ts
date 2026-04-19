import sanitizeHtml from "sanitize-html";

/** True if the string likely contains HTML markup (vs. plain text). */
function looksLikeHtml(s: string): boolean {
  return /<[a-z][\s\S]*>/i.test(s.trim());
}

/**
 * Turns stored rich-text HTML (grade descriptions, etc.) into readable plain text
 * for tables, cards, and tooltips. Preserves line breaks from &lt;br&gt;, &lt;/p&gt;, etc.
 */
export function htmlToPlainText(html: string): string {
  const s = html.trim();
  if (!s) return "";
  if (!looksLikeHtml(s)) return s;

  const withBreaks = s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/blockquote>/gi, "\n")
    .replace(/<\/li>/gi, "\n");

  const stripped = sanitizeHtml(withBreaks, {
    allowedTags: [],
    allowedAttributes: {},
  });

  return stripped
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
