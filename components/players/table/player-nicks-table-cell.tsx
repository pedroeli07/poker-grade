"use client";

import { POKER_NETWORKS_UI } from "@/lib/constants";
import type { PlayerTableRow } from "@/lib/types";
import { memo, useState, useCallback } from "react";
import { AppTooltip } from "@/components/ui/app-tooltip";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

const PlayerNickItem = memo(({ nick, network }: { nick: string; network: string }) => {
  const [copied, setCopied] = useState(false);
  const net = POKER_NETWORKS_UI.find((x) => x.value === network);

  const onCopy = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(nick);
    setCopied(true);
    toast.success("Nick copiado com sucesso!", {
      description: nick,
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  }, [nick]);

  return (
    <AppTooltip
      content={
        <div
          className="flex flex-col gap-1.5 p-1 cursor-pointer"
          onClick={onCopy}
        >
          <div className="flex items-center gap-2 border-b border-background/20 pb-1">
            {net?.icon && (
              <img src={net.icon} alt={net.label} className="h-4 w-4 rounded-[2px]" />
            )}
            <span className="font-semibold text-[13px]">{net?.label || network}</span>
          </div>
          <div className="flex items-center justify-between gap-4 font-mono text-[14px]">
            <span className="text-blue-300">{nick}</span>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="cursor-pointer h-3.5 w-3.5 opacity-50" />
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-1 italic">
            Clique para copiar
          </p>
        </div>
      }
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onCopy}
        onKeyDown={(e) => e.key === "Enter" && onCopy(e)}
        className="bg-muted/60 hover:bg-muted group flex items-center gap-1.5 rounded px-2 py-0.5 transition-colors cursor-copy max-w-full"
      >
        {net?.icon && (
          <img
            src={net.icon}
            alt={net.label}
            className="h-3.5 w-3.5 shrink-0 rounded-[2px] object-contain"
          />
        )}
        <span className="font-mono text-[12px] leading-tight text-foreground/80 group-hover:text-foreground break-all">
          {nick}
        </span>
        <div className="ml-auto flex shrink-0 items-center">
          {copied ? (
            <Check className="h-3 w-3 text-emerald-500" />
          ) : (
            <Copy className="cursor-pointer h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
          )}
        </div>
      </div>
    </AppTooltip>
  );
});

PlayerNickItem.displayName = "PlayerNickItem";

const PlayerNicksTableCell = memo(function PlayerNicksTableCell({ nicks }: { nicks: PlayerTableRow["nicks"] }) {
  const visible = nicks?.filter((n) => n.network !== "PlayerGroup") ?? [];
  if (visible.length === 0) {
    return <span className="block text-center text-muted-foreground text-xs">—</span>;
  }

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-1 py-1">
      <div className="flex w-full flex-wrap justify-center gap-1">
        {visible.map((n) => (
          <PlayerNickItem key={n.network + n.nick} nick={n.nick} network={n.network} />
        ))}
      </div>
    </div>
  );
});

PlayerNicksTableCell.displayName = "PlayerNicksTableCell";

export default PlayerNicksTableCell;
