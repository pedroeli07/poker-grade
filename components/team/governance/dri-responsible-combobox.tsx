"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  groupDriStaffByRole,
  DRI_STAFF_GROUP_LABEL,
} from "@/lib/constants/team/governance-ui";
import type { GovernanceStaffOption } from "@/lib/data/team/governance-page";
import { cn } from "@/lib/utils/cn";

export type DriResponsibleValue = {
  /** Vinculado a `AuthUser` da lista de staff, ou `null` se for nome escrito à mão. */
  authUserId: string | null;
  /** Texto no campo: nome do membro escolhido ou nome a exibir na matriz. */
  text: string;
};

type Props = {
  staff: readonly GovernanceStaffOption[];
  value: DriResponsibleValue;
  onChange: (v: DriResponsibleValue) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
};

export function resolveStaffFromExactName(
  text: string,
  list: readonly GovernanceStaffOption[],
): GovernanceStaffOption | null {
  const t = text.trim();
  if (!t) return null;
  return list.find((s) => s.name.toLowerCase() === t.toLowerCase()) ?? null;
}

export const DriResponsibleCombobox = function DriResponsibleCombobox({
  staff,
  value,
  onChange,
  id,
  disabled,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const query = value.text;
  const grouped = useMemo(() => {
    const g = groupDriStaffByRole(staff);
    if (!query.trim()) return g;
    const q = query.toLowerCase();
    return g
      .map((block) => ({
        ...block,
        members: block.members.filter((m) => m.name.toLowerCase().includes(q)),
      }))
      .filter((b) => b.members.length > 0);
  }, [staff, query]);

  const totalVisible = useMemo(
    () => grouped.reduce((n, b) => n + b.members.length, 0),
    [grouped],
  );

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onDocDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open, close]);

  const selectMember = (m: GovernanceStaffOption) => {
    onChange({ authUserId: m.id, text: m.name });
    setOpen(false);
  };

  const onInputChange = (text: string) => {
    onChange({ authUserId: null, text });
  };

  const onInputBlur = () => {
    const match = resolveStaffFromExactName(value.text, staff);
    if (match) {
      onChange({ authUserId: match.id, text: match.name });
    }
  };

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "flex h-10 w-full min-w-0 items-stretch overflow-hidden rounded-lg border border-input bg-background",
          "transition-[color,box-shadow] has-[[data-slot=combobox-dri]:focus]:border-ring has-[[data-slot=combobox-dri]:focus]:ring-2 has-[[data-slot=combobox-dri]:focus]:ring-ring/20",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <Input
          id={id}
          ref={inputRef}
          data-slot="combobox-dri"
          className="h-full min-w-0 flex-1 cursor-text border-0 bg-transparent pl-3 shadow-none focus-visible:ring-0"
          value={value.text}
          onChange={(e) => onInputChange(e.target.value)}
          onFocus={() => {
            if (!disabled) setOpen(true);
          }}
          onBlur={onInputBlur}
          placeholder="Pesquisar membro de staff ou digite um nome (ex. Camila Ribeiro)…"
          autoComplete="off"
        />
        <button
          type="button"
          className="flex shrink-0 cursor-pointer items-center border-l border-border/60 bg-muted/20 px-2.5"
          onMouseDown={(e) => {
            e.preventDefault();
            if (disabled) return;
            if (open) {
              close();
            } else {
              setOpen(true);
              inputRef.current?.focus();
            }
          }}
          tabIndex={-1}
        >
          <ChevronDown
            className={cn(
              "size-4 cursor-pointer text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
      </div>
      {open && !disabled && (
        <div
          role="listbox"
          className="absolute top-full z-50 mt-1 max-h-[min(16rem,40vh)] w-full overflow-y-auto overflow-x-hidden rounded-lg border border-border/80 bg-popover p-1 shadow-md"
        >
          {totalVisible > 0 ? (
            <div className="space-y-0.5">
              {grouped.map(({ role, members }) => (
                <div key={role}>
                  <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {DRI_STAFF_GROUP_LABEL[role] ?? role}
                  </p>
                  <ul className="space-y-0.5">
                    {members.map((m) => (
                      <li key={m.id}>
                        <button
                          type="button"
                          role="option"
                          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-accent"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectMember(m)}
                        >
                          <User className="size-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate">{m.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-2 py-2 text-sm text-muted-foreground">
              {query.trim() ? "Nenhum membro com esse nome. O texto fica guardado para exibição na matriz." : "Não há resultados. Escreva o nome a exibir (ex. sem conta ainda)."}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
