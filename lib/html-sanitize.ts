import DOMPurify from "isomorphic-dompurify";

/**
 * HTML vindo de fontes não confiáveis (ex.: IA) antes de dangerouslySetInnerHTML.
 */
export function sanitizeUserHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
  });
}
