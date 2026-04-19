import { HOVER_PREVIEW_MIN_CHARS } from "@/lib/constants";
import { htmlToPlainText } from "./html-to-plain-text";

export function filterOptionPreviewText(opt: { value: string; label: string }): string {
  const raw =
    opt.label.endsWith("…") || opt.label.endsWith("...")
      ? opt.value
      : opt.value.length > opt.label.length
        ? opt.value
        : opt.label;
  return htmlToPlainText(raw);
}

export const filterOptionNeedsHoverPreview = (opt: { value: string; label: string }) =>
  filterOptionPreviewText(opt).length > HOVER_PREVIEW_MIN_CHARS;
