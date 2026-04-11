import { memo } from "react";
import { cn } from "@/lib/utils";

const TextInput = memo(function TextInput({
    id,
    value,
    onChange,
    placeholder,
    disabled,
    type = "text",
  }: {
    id: string;
    value?: string;
    onChange?: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
    type?: string;
  }) {
    return (
      <input
        id={id}
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full h-11 rounded-md border border-border bg-card/60 px-3 text-sm text-foreground placeholder:text-muted-foreground/50",
          "focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
    );
  });
  
  TextInput.displayName = "TextInput";
  
  export default TextInput;
  