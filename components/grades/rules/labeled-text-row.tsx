import { memo, type ReactNode } from "react";
import InputEndPencil from "./input-end-pencil";

const LabeledTextRow = memo(function LabeledTextRow({
    label,
    children,
  }: {
    label: ReactNode;
    children: ReactNode;
  }) {
    return (
      <div className="space-y-1">
        <div>{label}</div>
        <div className="flex items-center gap-2"> 
          <div className="min-w-0 flex-1">{children}</div>
          <InputEndPencil className="self-center" />
        </div>
      </div>
    );
  });

  LabeledTextRow.displayName = "LabeledTextRow";

  export default LabeledTextRow;
  