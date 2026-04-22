"use client";

import { useState, useTransition } from "react";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle2,
  ClipboardList,
  Clock,
  Loader2,
  MessageSquare,
  User,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";
import type { RitualChecklistItem } from "@/lib/constants/team/rituals";
import { createTeamRitualExecution } from "@/lib/queries/db/team/rituals/create-execution";
import type { RitualDTO } from "@/lib/data/team/rituals-page";

type Props = {
  ritual: RitualDTO | null;
  onOpenChange: (open: boolean) => void;
};

export default function ExecuteRitualModal({ ritual, onOpenChange }: Props) {
  if (!ritual) return null;
  return <Inner ritual={ritual} onOpenChange={onOpenChange} />;
}

function Inner({
  ritual,
  onOpenChange,
}: {
  ritual: RitualDTO;
  onOpenChange: (open: boolean) => void;
}) {
  const [checklist, setChecklist] = useState<RitualChecklistItem[]>(() =>
    Array.isArray(ritual.agenda)
      ? (ritual.agenda as RitualChecklistItem[]).map((i) => ({
          ...i,
          completed: false,
        }))
      : [],
  );
  const [executionNotes, setExecutionNotes] = useState("");
  const [pending, startTransition] = useTransition();

  const toggleItem = (i: number) => {
    const next = [...checklist];
    next[i] = { ...next[i], completed: !next[i].completed };
    setChecklist(next);
  };

  const allMandatoryDone = checklist
    .filter((i) => i.required)
    .every((i) => i.completed);

  const driName = ritual.dri?.displayName || ritual.responsibleName || "—";

  const handleSave = () => {
    startTransition(async () => {
      const res = await createTeamRitualExecution({
        ritualId: ritual.id,
        checklist: checklist as unknown as Prisma.JsonValue,
        notes: executionNotes.trim(),
        attendance: {} as Prisma.JsonValue,
      });
      if (res.ok) {
        toast.success("Ritual executado.");
        onOpenChange(false);
      } else {
        toast.error(res.error || "Erro ao salvar execução.");
      }
    });
  };

  return (
    <Dialog open={!!ritual} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            {ritual.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 rounded-lg border bg-muted/30 p-3">
          <InfoItem icon={User} label="DRI" value={driName} />
          <InfoItem
            icon={Clock}
            label="Duração"
            value={`${ritual.durationMin} min`}
          />
          <InfoItem
            icon={CalendarIcon}
            label="Data"
            value={format(new Date(), "dd MMM yyyy", { locale: ptBR })}
          />
        </div>

        <div className="space-y-3">
          <SectionHeader icon={ClipboardList} label="CHECKLIST DA PAUTA" />
          {checklist.length > 0 ? (
            <div className="space-y-2">
              {checklist.map((item, i) => (
                <label
                  key={i}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    item.completed
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-card hover:bg-muted/50",
                  )}
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleItem(i)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div
                      className={cn(
                        "text-sm font-medium",
                        item.completed &&
                          "line-through text-emerald-700/70",
                      )}
                    >
                      {item.text}
                    </div>
                    {item.required && !item.completed && (
                      <div className="text-[10px] font-bold text-rose-500 mt-0.5 flex items-center gap-1 uppercase tracking-wider">
                        <AlertCircle className="w-2.5 h-2.5" /> Obrigatório
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Este ritual não possui itens de pauta.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <SectionHeader icon={MessageSquare} label="OBSERVAÇÕES" />
          <Textarea
            rows={4}
            value={executionNotes}
            onChange={(e) => setExecutionNotes(e.target.value)}
            placeholder="Notas sobre a execução, decisões tomadas, impedimentos..."
          />
        </div>

        <DialogFooter className="gap-2">
          {!allMandatoryDone && checklist.some((i) => i.required) && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200 mr-auto">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700">
                Checklist obrigatória pendente
              </span>
            </div>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              pending ||
              (!allMandatoryDone && checklist.some((i) => i.required))
            }
          >
            {pending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
              </>
            ) : (
              "Finalizar ritual"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-card border flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-0.5">
          {label}
        </div>
        <div className="text-xs font-semibold truncate">{value}</div>
      </div>
    </div>
  );
}
