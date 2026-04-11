"use client";

import { memo} from "react";

const FieldLabel = memo(function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-1.5">
      {children}
    </label>
  );
});

FieldLabel.displayName = "FieldLabel";

export default FieldLabel;

