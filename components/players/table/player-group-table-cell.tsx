"use client";

import { AlertTriangle, Copy, Check } from "lucide-react";
import { memo, useState, useCallback } from "react";
import { AppTooltip } from "@/components/ui/app-tooltip";
import { toast } from "sonner";

const PlayerGroupTableCell = memo(function PlayerGroupTableCell({
  playerGroup,
  sharkGroupNotFound,
}: {
  playerGroup: string | null;
  sharkGroupNotFound?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback((e: React.MouseEvent) => {
    if (!playerGroup) return;
    e.stopPropagation();
    navigator.clipboard.writeText(playerGroup);
    setCopied(true);
    toast.success("Grupo copiado com sucesso!", {
      description: playerGroup,
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  }, [playerGroup]);

  if (!playerGroup) {
    return <span className="text-[12px] text-muted-foreground italic opacity-50">—</span>;
  }

  return (
    <div className="flex max-w-full flex-col items-center gap-1 text-center">
      <AppTooltip
        content={
          <div className="flex flex-col gap-1.5 p-1 cursor-pointer" onClick={onCopy}>
            <div className="flex items-center gap-2 border-b border-background/20 pb-1">
              <span className="font-semibold text-[13px]">Grupo SharkScope</span>
            </div>
            <div className="flex items-center justify-between gap-4 font-mono text-[14px]">
              <span className="text-blue-300">{playerGroup}</span>
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 opacity-50" />
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-1 italic">
              Clique para copiar
            </p>
          </div>
        }
      >
        <span
          role="button"
          tabIndex={0}
          onClick={onCopy}
          className="cursor-copy hover:text-foreground transition-colors line-clamp-2 break-words text-[12px] text-muted-foreground"
        >
          {playerGroup}
        </span>
      </AppTooltip>
      {sharkGroupNotFound && (
        <span className="inline-flex items-center gap-1 rounded-sm border border-amber-500/30 bg-amber-500/10 px-1 py-0.5 text-[10px] font-medium text-amber-600">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          Não encontrado
        </span>
      )}
    </div>
  );
});

PlayerGroupTableCell.displayName = "PlayerGroupTableCell";

export default PlayerGroupTableCell;
