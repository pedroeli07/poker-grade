"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = Omit<React.ComponentProps<"input">, "type"> & {
  containerClassName?: string;
};

export function PasswordInput({
  className,
  containerClassName,
  id: idProp,
  value,
  onChange,
  ...rest
}: Props) {
  const genId = useId();
  const id = idProp ?? genId;
  const [show, setShow] = useState(false);
  /** Só é controlado quando o pai passa `value` (inclui string vazia). */
  const isControlled = value !== undefined;

  const {
    defaultValue: _ignoredDefault,
    ...inputRest
  } = rest as React.ComponentProps<"input">;

  return (
    <div className={cn("relative isolate", containerClassName)}>
      <input
        {...inputRest}
        id={id}
        type={show ? "text" : "password"}
        {...(isControlled
          ? { value }
          : _ignoredDefault !== undefined
            ? { defaultValue: _ignoredDefault }
            : {})}
        onChange={onChange}
        data-slot="input"
        className={cn(
          "h-11 w-full min-w-0 rounded-xl border border-white/10 bg-white/[0.04] pr-11 pl-3.5 text-sm text-zinc-100 outline-none transition-[border-color,box-shadow] placeholder:text-zinc-600 focus-visible:border-rose-500/40 focus-visible:ring-2 focus-visible:ring-rose-500/20",
          className
        )}
      />
      <button
        type="button"
        tabIndex={-1}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setShow((s) => !s)}
        className="pointer-events-auto absolute right-0 top-0 z-20 flex h-11 w-11 cursor-pointer items-center justify-center text-zinc-500 transition-colors hover:text-zinc-300"
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
