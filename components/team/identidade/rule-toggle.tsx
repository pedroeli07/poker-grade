"use client";

import { memo, useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { toggleTeamOperationalRule } from "@/lib/queries/db/team/culture/toggle-rule";

const RuleToggle = memo(function RuleToggle({
  ruleId,
  initialActive,
}: {
  ruleId: string;
  initialActive: boolean;
}) {
  const [optimistic, setOptimistic] = useOptimistic(initialActive, (_s, n: boolean) => n);
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      checked={optimistic}
      disabled={pending}
      onCheckedChange={(checked) => {
        startTransition(async () => {
          setOptimistic(checked);
          const res = await toggleTeamOperationalRule(ruleId, checked);
          if (!res.ok) toast.error(res.error || "Erro ao atualizar regra.");
        });
      }}
    />
  );
});

export default RuleToggle;
