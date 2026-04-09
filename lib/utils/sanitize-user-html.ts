import sanitizeHtml from "sanitize-html";

export function sanitizeUserHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: sanitizeHtml.defaults.allowedTags,
    allowedAttributes: sanitizeHtml.defaults.allowedAttributes,
    allowedSchemes: sanitizeHtml.defaults.allowedSchemes,
  });
}
