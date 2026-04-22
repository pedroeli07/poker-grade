import { memo } from "react";
import { LobbyzeFilterItem } from "@/lib/types/lobbyzeTypes";
import { gradesRulesPillClass } from "@/lib/constants/classes";

const Pills = memo(function Pills({ items }: { items: LobbyzeFilterItem[] }) {
    if (!items.length)
      return <span className="text-muted-foreground/50 text-sm">Todos</span>;
  
    return (
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span
            key={i}
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight ${gradesRulesPillClass}`}
          >
            {item.item_text}
          </span>
        ))}
      </div>
    );
  });

  Pills.displayName = "Pills";

  export default Pills;
  