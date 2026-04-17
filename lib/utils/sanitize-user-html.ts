import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  ...sanitizeHtml.defaults.allowedTags,
  "h1", "h2", "h3", "h4", "h5", "h6",
  "mark", "u", "s", "del", "ins", "span", "div",
];

const ALLOWED_STYLES: sanitizeHtml.IOptions["allowedStyles"] = {
  "*": {
    color: [/.*/],
    "background-color": [/.*/],
    "font-size": [/^\d+(?:\.\d+)?(?:px|em|rem|%)$/],
    "text-align": [/^(?:left|right|center|justify)$/],
    "font-weight": [/^(?:bold|normal|\d+)$/],
    "font-style": [/^(?:italic|normal)$/],
    "text-decoration": [/.*/],
  },
};

export function sanitizeUserHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["style", "class"],
    },
    allowedStyles: ALLOWED_STYLES,
    allowedSchemes: sanitizeHtml.defaults.allowedSchemes,
  });
}
