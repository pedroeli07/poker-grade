import { Eye, EyeOff } from "lucide-react";
import { memo, useState } from "react";

const PasswordInput = memo(function PasswordInput({ id, placeholder }: { id: string; placeholder?: string }) {
    const [show, setShow] = useState(false);
    return (
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder ?? "••••••••"}
          className="w-full h-11 rounded-md border border-border bg-card/60 px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  });
  
  PasswordInput.displayName = "PasswordInput";
  
  export default PasswordInput;
