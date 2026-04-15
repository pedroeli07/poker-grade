"use client";

import { memo } from "react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"; 
import { ALERT_TYPE_LABEL } from "@/lib/constants/sharkscope/alerts/alerts-messages";

const AlertsFiltersRow = memo(function AlertsFiltersRow({ 
  filterSeverity,
  onFilterSeverity,
  filterType,
  onFilterType,
  filterAck,
  onFilterAck,
}: {
  filterSeverity: string;
  onFilterSeverity: (v: string) => void;
  filterType: string;
  onFilterType: (v: string) => void;
  filterAck: string;
  onFilterAck: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select value={filterSeverity} onValueChange={onFilterSeverity}>
        <SelectTrigger className="h-9 w-36">
          <SelectValue placeholder="Severidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="red">🔴 Vermelho</SelectItem>
          <SelectItem value="yellow">🟡 Amarelo</SelectItem>
          <SelectItem value="green">🟢 Verde</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterType} onValueChange={onFilterType}>
        <SelectTrigger className="h-9 w-44">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {Object.entries(ALERT_TYPE_LABEL).map(([k, v]) => (
            <SelectItem key={k} value={k}>
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filterAck} onValueChange={onFilterAck}>
        <SelectTrigger className="h-9 w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="unacknowledged">Não reconhecidos</SelectItem>
          <SelectItem value="acknowledged">Reconhecidos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
});

AlertsFiltersRow.displayName = "AlertsFiltersRow";

export default AlertsFiltersRow;
