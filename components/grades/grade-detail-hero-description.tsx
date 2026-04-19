"use client";

import { memo } from "react";

const GradeDetailHeroDescription = memo(function GradeDetailHeroDescription({
  text,
}: {
  text: string;
}) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Rich HTML content (from WYSIWYG editor) — same column layout as plain text
  if (trimmed.startsWith("<")) {
    return (
      <div
        className="grade-rich-content columns-1 gap-x-10 gap-y-0 sm:columns-2 xl:columns-3 [column-fill:_balance] text-[13px] leading-relaxed text-foreground/90"
        dangerouslySetInnerHTML={{ __html: trimmed }}
      />
    );
  }

  // Legacy plain text — split on every newline so each line becomes a separate
  // block-level element. CSS multi-column can only distribute block elements
  // across columns, so keeping lines as individual <p> tags matches the layout
  // you get after editing and saving (which converts to HTML).
  const lines = trimmed.split(/\n/).map(l => l.trim()).filter(Boolean);

  return (
    <div className="columns-1 gap-x-10 gap-y-0 sm:columns-2 xl:columns-3 [column-fill:_balance]">
      {lines.map((line, i) => (
        <p
          key={i}
          className="break-inside-avoid text-[13px] leading-relaxed text-foreground/90"
        >
          {line}
        </p>
      ))}
    </div>
  );
});

GradeDetailHeroDescription.displayName = "GradeDetailHeroDescription";

export default GradeDetailHeroDescription;
