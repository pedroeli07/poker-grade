import { memo } from "react";

const NotificationsErrorState = memo(function NotificationsErrorState({ error }: { error: unknown }) {
  return (
    <div className="text-center py-16 text-destructive text-sm">
      {error instanceof Error ? error.message : "Erro ao carregar notificações."}
    </div>
  );
});

NotificationsErrorState.displayName = "NotificationsErrorState";

export default NotificationsErrorState;
