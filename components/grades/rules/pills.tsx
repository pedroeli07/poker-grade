import { memo } from "react";
import { LobbyzeFilterItem } from "@/lib/types";
import { gradesRulesPillClass } from "@/lib/constants/classes";

const Pills = memo(function Pills({ items }: { items: LobbyzeFilterItem[] }) {
    if (!items.length)
      return <span className="text-muted-foreground/50 text-sm">Todos</span>;
  
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${gradesRulesPillClass}`}
          >
            {item.item_text}
          </span>
        ))}
      </div>
    );
  });

  Pills.displayName = "Pills";

  export default Pills;
  