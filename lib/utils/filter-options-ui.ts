import { HOVER_PREVIEW_MIN_CHARS } from "@/lib/constants";

export function filterOptionPreviewText(opt: { value: string; label: string }): string {
  if (opt.label.endsWith("…") || opt.label.endsWith("...")) return opt.value;
  return opt.value.length > opt.label.length ? opt.value : opt.label;
}

export const filterOptionNeedsHoverPreview = (opt: { value: string; label: string }) =>
  filterOptionPreviewText(opt).length > HOVER_PREVIEW_MIN_CHARS;
