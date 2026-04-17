"use client";

import { memo } from "react";

const GradeDetailHeroDescription = memo(function GradeDetailHeroDescription({
  text,
}: {
  text: string;
}) {
  const trimmed = text.trim();

  // Rich HTML content (from WYSIWYG editor) — same column layout as plain text
  if (trimmed.startsWith("<")) {
    return (
      <div
        className="grade-rich-content columns-1 gap-x-10 gap-y-0 sm:columns-2 xl:columns-3 [column-fill:_balance] text-[13px] leading-relaxed text-foreground/90"
        dangerouslySetInnerHTML={{ __html: trimmed }}
      />
    );
  }

  // Legacy plain text
  const blocks = trimmed.split(/\n\s*\n+/).filter(Boolean);

  if (blocks.length <= 1) {
    return (
      <div className="text-[13px] leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
        {trimmed}
      </div>
    );
  }

  return (
    <div className="columns-1 gap-x-10 gap-y-0 sm:columns-2 xl:columns-3 [column-fill:_balance]">
      {blocks.map((block, i) => (
        <p
          key={i}
          className="mb-4 break-inside-avoid text-[13px] leading-relaxed text-foreground/90 last:mb-0"
        >
          {block.trim().split("\n").map((line, j, arr) => (
            <span key={j}>
              {line}
              {j < arr.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
});

GradeDetailHeroDescription.displayName = "GradeDetailHeroDescription";

export default GradeDetailHeroDescription;
