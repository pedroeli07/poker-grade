import { memo } from "react";
import { LobbyzeFilterItem } from "@/lib/types";

const Pills = memo(function Pills({ items }: { items: LobbyzeFilterItem[] }) {
    if (!items.length)
      return <span className="text-muted-foreground/50 text-sm">Todos</span>;
  
    const pillClass = "bg-blue-500/12 text-blue-600 border-blue-500/25";
  
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${pillClass}`}
          >
            {item.item_text}
          </span>
        ))}
      </div>
    );
  });

  Pills.displayName = "Pills";

  export default Pills;
  