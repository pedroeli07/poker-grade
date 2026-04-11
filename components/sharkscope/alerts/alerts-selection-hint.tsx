"use client";

import { memo } from "react";

const AlertsSelectionHint = memo(function AlertsSelectionHint() {
  return (
    <p className="-mt-2 text-xs text-muted-foreground">
      O checkbox do cabeçalho marca só as linhas <span className="font-medium text-foreground">desta página</span>.
      Para marcar todos os alertas do filtro de uma vez, aumente &quot;Linhas por página&quot; até caber a lista
      inteira; a barra acima da tabela serve para excluir o que estiver selecionado.
    </p>
  );
});

AlertsSelectionHint.displayName = "AlertsSelectionHint";

export default AlertsSelectionHint;
