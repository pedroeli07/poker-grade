"use client";

import { useState, useTransition } from "react";
import {
  Bell,
  Calendar as CalendarIcon,
  CheckSquare,
  Clock,
  Plus,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
import {
  DIAS_SEMANA,
  RITUAL_AREA_OPTIONS,
  RITUAL_EMPTY_FORM,
  RITUAL_RECURRENCE_OPTIONS,
  RITUAL_TEMPLATES,
  RITUAL_TYPE_OPTIONS,
  type RitualChecklistItem,
} from "@/lib/constants/team/rituals";
import { upsertTeamRitual } from "@/lib/queries/db/team/rituals/save-ritual";
import type { RitualDTO, RitualStaffOption } from "@/lib/data/team/rituals-page";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: RitualDTO | null;
  staff: RitualStaffOption[];
};

type FormState = typeof RITUAL_EMPTY_FORM;

function fromRitual(r: RitualDTO): FormState {
  const iso = new Date(r.startAt).toISOString();
  return {
    ...RITUAL_EMPTY_FORM,
    name: r.name,
    ritualType: r.ritualType,
    area: r.area,
    description: r.description,
    driId: r.driId ?? "",
    checklist: Array.isArray(r.agenda) ? (r.agenda as RitualChecklistItem[]) : [],
    startDate: iso.split("T")[0],
    startTime: iso.slice(11, 16),
    durationMin: String(r.durationMin),
    recurrence: r.recurrence || "Semanal",
  };
}

export default function RitualFormModal({
  open,
  onOpenChange,
  editing,
  staff,
}: Props) {
  const [form, setForm] = useState<FormState>(() =>
    editing ? fromRitual(editing) : { ...RITUAL_EMPTY_FORM },
  );
  const [activeTpl, setActiveTpl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isEditing = !!editing;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setForm(editing ? fromRitual(editing) : { ...RITUAL_EMPTY_FORM });
      setActiveTpl(null);
    }
    onOpenChange(next);
  };

  const applyTemplate = (name: string) => {
    const tpl = RITUAL_TEMPLATES[name];
    if (!tpl) return;
    setForm((p) => ({ ...p, ...tpl } as FormState));
    setActiveTpl(name);
  };

  const addChecklistItem = () =>
    set("checklist", [...form.checklist, { text: "", required: true }]);
  const removeChecklistItem = (i: number) =>
    set(
      "checklist",
      form.checklist.filter((_, idx) => idx !== i),
    );
  const updateChecklistText = (i: number, text: string) => {
    const next = [...form.checklist];
    next[i] = { ...next[i], text };
    set("checklist", next);
  };
  const toggleChecklistRequired = (i: number) => {
    const next = [...form.checklist];
    next[i] = { ...next[i], required: !next[i].required };
    set("checklist", next);
  };

  const toggleDay = (d: number) =>
    set(
      "daysOfWeek",
      form.daysOfWeek.includes(d)
        ? form.daysOfWeek.filter((x) => x !== d)
        : [...form.daysOfWeek, d],
    );

  const handleSave = () => {
    if (!form.name.trim() || !form.startDate) {
      toast.error("Informe nome e data inicial.");
      return;
    }
    const [y, m, day] = form.startDate.split("-").map(Number);
    const [hh, mm] = form.startTime.split(":").map(Number);
    const dt = new Date(y, m - 1, day, hh, mm, 0);
    const driSelected = form.driId && form.driId !== "none" ? form.driId : null;
    startTransition(async () => {
      const res = await upsertTeamRitual({
        id: editing?.id,
        name: form.name.trim(),
        ritualType: form.ritualType,
        area: form.area,
        description: form.description.trim(),
        driId: driSelected,
        responsibleName: null,
        agenda: form.checklist as unknown as Prisma.JsonValue,
        startAt: dt,
        durationMin: Number(form.durationMin) || 60,
        recurrence: form.recurrence,
      });
      if (res.ok) {
        toast.success(isEditing ? "Ritual atualizado." : "Ritual criado.");
        onOpenChange(false);
      } else {
        toast.error(res.error || "Erro ao salvar.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar ritual" : "Novo ritual"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!isEditing && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Templates rápidos
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(RITUAL_TEMPLATES).map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => applyTemplate(name)}
                    className={cn(
                      "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors",
                      activeTpl === name
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card hover:bg-muted",
                    )}
                  >
                    <Sparkles className="w-3 h-3" />
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Section icon={CalendarIcon} label="IDENTIDADE">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Nome do ritual *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Ex: WBR Semanal"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Select
                    value={form.ritualType}
                    onValueChange={(v) => set("ritualType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {RITUAL_TYPE_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Área</Label>
                  <Select value={form.area} onValueChange={(v) => set("area", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {RITUAL_AREA_OPTIONS.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Descrição</Label>
                <Textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Objetivo principal deste ritual..."
                />
              </div>
            </div>
          </Section>

          <Section icon={Users} label="RESPONSÁVEL">
            <div className="space-y-1.5">
              <Label>DRI</Label>
              <Select
                value={form.driId || "none"}
                onValueChange={(v) => set("driId", v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-muted-foreground">
                    — Sem DRI —
                  </SelectItem>
                  {staff.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Section>

          <Section
            icon={CheckSquare}
            label="CHECKLIST"
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addChecklistItem}
                className="h-7 gap-1 text-xs"
              >
                <Plus className="w-3 h-3" /> Adicionar item
              </Button>
            }
          >
            {form.checklist.length > 0 ? (
              <div className="space-y-2">
                {form.checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleChecklistRequired(i)}
                      className={cn(
                        "w-5 h-5 rounded shrink-0 flex items-center justify-center transition-colors",
                        item.required
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted",
                      )}
                      title={item.required ? "Obrigatório" : "Opcional"}
                    >
                      {item.required && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                    <Input
                      value={item.text}
                      onChange={(e) => updateChecklistText(i, e.target.value)}
                      placeholder={`Item ${i + 1}...`}
                      className="h-9 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(i)}
                      className="text-muted-foreground hover:text-rose-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Itens marcados são obrigatórios para concluir o ritual.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum item na checklist.
              </p>
            )}
          </Section>

          <Section icon={Clock} label="AGENDA">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Data inicial *</Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Horário</Label>
                  <Input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => set("startTime", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Duração (min)</Label>
                  <Input
                    type="number"
                    value={form.durationMin}
                    onChange={(e) => set("durationMin", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Recorrência</Label>
                <Select
                  value={form.recurrence}
                  onValueChange={(v) => set("recurrence", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RITUAL_RECURRENCE_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.recurrence !== "Não recorrente" &&
                form.recurrence !== "Mensal" && (
                  <div className="space-y-1.5">
                    <Label>Dias da semana</Label>
                    <div className="flex gap-1.5">
                      {DIAS_SEMANA.map((d) => {
                        const active = form.daysOfWeek.includes(d.value);
                        return (
                          <button
                            key={d.value}
                            type="button"
                            onClick={() => toggleDay(d.value)}
                            className={cn(
                              "w-9 h-9 rounded-full text-xs font-bold transition-colors",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80",
                            )}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>
          </Section>

          <Section icon={Bell} label="NOTIFICAÇÕES">
            <div className="space-y-2">
              <ToggleRow
                title="Enviar lembrete"
                subtitle="Notificar participantes antes do ritual."
                checked={form.sendReminder}
                onCheckedChange={(v) => set("sendReminder", v)}
              />
              <ToggleRow
                title="Notificar DRI se atrasado"
                subtitle="Alertar o responsável quando passar do horário."
                checked={form.notifyDriIfLate}
                onCheckedChange={(v) => set("notifyDriIfLate", v)}
              />
            </div>
          </Section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={pending || !form.name.trim() || !form.startDate}
          >
            {pending
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Criar ritual"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  icon: Icon,
  label,
  action,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({
  title,
  subtitle,
  checked,
  onCheckedChange,
}: {
  title: string;
  subtitle: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
