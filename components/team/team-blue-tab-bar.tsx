import { type LucideIcon } from "lucide-react";
import { memo } from "react";

export type TeamBlueTabRow = { value: string; label: string; icon: LucideIcon | null };

/**
 * Mesmo padrão visual da página Identidade: fundo azul, sombra, borda inferior na aba ativa
 * (ver `components/team/identidade/identity-tab-bar.tsx` histórico — estilos unificados aqui).
 */
const TeamBlueTabBar = memo(function TeamBlueTabBar({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: readonly TeamBlueTabRow[];
  activeTab: string;
  onTabChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-1 border-b border-border/60">
      {tabs.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => onTabChange(value)}
          className={`flex cursor-pointer items-center gap-2 rounded-lg border-b-2 px-4
              py-2.5 text-sm font-medium shadow-md shadow-blue-500/30 transition-colors hover:shadow-lg
              ${
                activeTab === value
                  ? "border-b-blue-600 bg-blue-500/25 text-blue-900 shadow-blue-600/25 hover:bg-blue-600/30 dark:border-b-blue-400 dark:bg-blue-500/30 dark:text-blue-100"
                  : "border-transparent bg-blue-500/10 text-muted-foreground hover:bg-blue-500/20 hover:text-foreground"
              }`}
        >
          {Icon && <Icon className="h-4 w-4" />}
          {label}
        </button>
      ))}
    </div>
  );
});

TeamBlueTabBar.displayName = "TeamBlueTabBar";

export default TeamBlueTabBar;
