"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Table2 } from "lucide-react";

const TargetsViewToggle = memo(function TargetsViewToggle({
  view,
  setView,
}: {
  view: "cards" | "table";
  setView: (v: "cards" | "table") => void;
}) {
  return (
    <div
      className="inline-flex shrink-0 rounded-lg border border-border bg-muted/30 p-0.5"
      role="group"
      aria-label="Modo de visualização"
    >
      {(["cards", "table"] as const).map((v) => (
        <Button
          key={v}
          type="button"
          variant={view === v ? "secondary" : "ghost"}
          size="sm"
          className={`h-8 gap-2 text-xs ${view === v ? "bg-primary/12 text-primary shadow-none" : ""}`}
          onClick={() => setView(v)}
        >
          {v === "cards" ? <LayoutGrid className="h-3.5 w-3.5" /> : <Table2 className="h-3.5 w-3.5" />}
          {v === "cards" ? "Cards" : "Tabela"}
        </Button>
      ))}
    </div>
  );
});

TargetsViewToggle.displayName = "TargetsViewToggle";

export default TargetsViewToggle;
