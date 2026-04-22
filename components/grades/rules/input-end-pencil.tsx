import { cn } from "@/lib/utils/cn";
import { Pencil } from "lucide-react";
import { memo } from "react";

const InputEndPencil = memo(function InputEndPencil({ className }: { className?: string }) {
    return (
      <Pencil
        className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground/55", className)}
        aria-hidden
      />
    );
  }
);

InputEndPencil.displayName = "InputEndPencil";

export default InputEndPencil;