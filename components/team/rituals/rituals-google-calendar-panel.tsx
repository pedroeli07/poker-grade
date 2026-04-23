"use client";

import { Fragment, memo, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  ExternalLink,
  Settings2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

const LS_KEY = "gestao-grades:rituals:googleCalendarId";
const OPEN_CALENDAR_URL = "https://calendar.google.com";

const STEPS = [
  {
    id: 1,
    title: "Abra o Google Calendar",
    body: "Acesse o calendário na web para criar ou gerir a agenda do time.",
    action: "link" as const,
  },
  {
    id: 2,
    title: "Crie uma agenda dedicada",
    body: (
      <>
        Em <strong className="text-foreground">Outras agendas</strong>, crie uma nova e dê um nome claro, por
        exemplo <span className="whitespace-nowrap font-medium text-foreground">Rituais CL Team</span>.
      </>
    ),
    action: "text" as const,
  },
  {
    id: 3,
    title: "Copie o ID da agenda",
    body: (
      <>
        Abra <strong className="text-foreground">Definições da agenda</strong> e, em <em>Integrar agenda</em>,
        copie o identificador no formato{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">xxxxx@group.calendar.google.com</code>.
      </>
    ),
    action: "text" as const,
  },
  {
    id: 4,
    title: "Adicione ao sistema",
    body: "Cole o ID abaixo e guarde. A sincronização automática dependerá da configuração OAuth no servidor.",
    action: "form" as const,
  },
] as const;

const RitualsGoogleCalendarPanel = memo(function RitualsGoogleCalendarPanel() {
  const [calendarId, setCalendarId] = useState("");

  useEffect(() => {
    try {
      const v = localStorage.getItem(LS_KEY);
      if (v) {
        // Sincronização one-shot a partir de localStorage após mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCalendarId(v);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleSave = () => {
    const trimmed = calendarId.trim();
    if (!trimmed) {
      toast.error("Cole o ID da agenda (formato …@group.calendar.google.com).");
      return;
    }
    try {
      localStorage.setItem(LS_KEY, trimmed);
      toast.success("ID da agenda guardado neste navegador.");
    } catch {
      toast.error("Não foi possível guardar localmente.");
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary shadow-sm ring-1 ring-primary/15">
            <Calendar className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1.5">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Como conectar o Google Calendar
            </h3>
            <p className="max-w-none text-sm leading-relaxed text-muted-foreground max-sm:whitespace-normal sm:whitespace-nowrap">
              Siga os passos para associar uma agenda ao time. Os eventos dos rituais podem ser sincronizados quando a
              integração{"\u00a0"}estiver ativa no servidor.
            </p>
          </div>
        </div>
      </header>

      {/* Mobile: passos empilhados; números dentro de cada card */}
      <ol className="list-none space-y-4 p-0 sm:space-y-5 lg:hidden">
        {STEPS.map((step) => (
          <li key={step.id}>
            <StepRow
              step={step}
              calendarId={calendarId}
              setCalendarId={setCalendarId}
              onSave={handleSave}
            />
          </li>
        ))}
      </ol>

      {/* Desktop (lg+): uma linha 1→2→3→4 para poupar altura; DOM na ordem dos passos para leitores de ecrã */}
      <div
        className="hidden lg:flex lg:flex-row lg:items-stretch lg:gap-x-1.5 lg:gap-y-0 xl:gap-x-2"
        role="list"
      >
        {STEPS.map((step, index) => (
          <Fragment key={step.id}>
            <div className="min-h-0 min-w-0 flex-1" role="listitem">
              <StepRow
                step={step}
                calendarId={calendarId}
                setCalendarId={setCalendarId}
                onSave={handleSave}
                fillHeight
              />
            </div>
            {index < STEPS.length - 1 && (
              <div
                className="flex shrink-0 items-center justify-center self-center px-0.5"
                aria-hidden
              >
                <FlowArrowIcon
                  icon={ArrowRight}
                  label={`Seguinte: passo ${index + 2}`}
                />
              </div>
            )}
          </Fragment>
        ))}
      </div>

      <div
        className={cn(
          "flex gap-3 rounded-xl border border-amber-500/35 bg-amber-50/80 p-4 text-sm",
          "dark:border-amber-500/30 dark:bg-amber-950/25",
        )}
        role="note"
      >
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
        <div className="min-w-0 space-y-2 leading-relaxed text-amber-950/90 dark:text-amber-100/85">
          <p className="font-semibold text-amber-950 dark:text-amber-50">Integração via API (equipa técnica)</p>
          <p>
            Para criar ou atualizar eventos automaticamente, é necessário configurar OAuth 2.0 na Google Cloud Console e
            definir no ambiente do servidor as variáveis{" "}
            <code className="rounded bg-amber-100/90 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900/50">
              GOOGLE_CLIENT_ID
            </code>
            ,{" "}
            <code className="rounded bg-amber-100/90 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900/50">
              GOOGLE_CLIENT_SECRET
            </code>{" "}
            e{" "}
            <code className="rounded bg-amber-100/90 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900/50">
              GOOGLE_CALENDAR_ID
            </code>{" "}
            (ou equivalente à agenda usada pelo sistema).
          </p>
        </div>
      </div>
    </div>
  );
});

RitualsGoogleCalendarPanel.displayName = "RitualsGoogleCalendarPanel";

export default RitualsGoogleCalendarPanel;

function FlowArrowIcon({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full",
        "border border-primary/25 bg-gradient-to-br from-primary/12 to-primary/5 text-primary",
        "shadow-md shadow-black/[0.06] shadow-primary/10 ring-1 ring-primary/10",
        "transition-all duration-200 ease-out",
        "hover:scale-110 hover:border-primary/35 hover:shadow-lg hover:shadow-primary/20",
        "active:scale-95",
      )}
      title={label}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

function StepRow({
  step,
  calendarId,
  setCalendarId,
  onSave,
  fillHeight,
}: {
  step: (typeof STEPS)[number];
  calendarId: string;
  setCalendarId: (v: string) => void;
  onSave: () => void;
  fillHeight?: boolean;
}) {
  return (
    <div className={cn("min-w-0", fillHeight && "flex h-full min-h-0 flex-col")}>
      <StepCard
        step={step}
        calendarId={calendarId}
        setCalendarId={setCalendarId}
        onSave={onSave}
        fillHeight={fillHeight}
      />
    </div>
  );
}

function StepCard({
  step,
  calendarId,
  setCalendarId,
  onSave,
  fillHeight,
}: {
  step: (typeof STEPS)[number];
  calendarId: string;
  setCalendarId: (v: string) => void;
  onSave: () => void;
  fillHeight?: boolean;
}) {
  return (
    <div
      className={cn(
        "group/card relative min-w-0 flex-1 overflow-hidden rounded-xl border border-border/65",
        "bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 dark:border-border/55 dark:via-blue-950 dark:to-blue-900/20",
        "shadow-[0_2px_8px_-2px_rgb(0_0_0_/0.05),0_6px_22px_-6px_rgb(37_99_235_/0.16),0_0_0_1px_rgb(37_99_235_/0.06)]",
        "ring-1 ring-black/[0.04] dark:ring-white/[0.06]",
        "transition-[box-shadow,transform,border-color,ring-width] duration-300 ease-out",
        "hover:-translate-y-1 hover:border-primary/35",
        "hover:shadow-[0_8px_28px_-6px_rgb(37_99_235_/0.28),0_16px_44px_-12px_rgb(37_99_235_/0.2),0_2px_8px_-2px_rgb(0_0_0_/0.06)]",
        "hover:ring-2 hover:ring-primary/20",
        "active:translate-y-0 active:shadow-[0_4px_16px_-4px_rgb(37_99_235_/0.18),0_2px_6px_-2px_rgb(0_0_0_/0.05)] active:duration-150",
        "dark:shadow-[0_2px_12px_-2px_rgb(0_0_0_/0.45),0_8px_28px_-8px_rgb(59_130_246_/0.22)]",
        "dark:hover:shadow-[0_12px_40px_-10px_rgb(59_130_246_/0.38),0_20px_50px_-16px_rgb(59_130_246_/0.22),0_2px_8px_-2px_rgb(0_0_0_/0.4)]",
        "p-3.5 sm:p-4",
        fillHeight && "flex h-full min-h-0 flex-col",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300",
          "bg-gradient-to-br from-primary/[0.04] via-transparent to-transparent group-hover/card:opacity-100",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100",
        )}
        aria-hidden
      />
      <span
        className={cn(
          "absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-md",
          "border border-primary/25 bg-gradient-to-br from-primary/18 to-primary/8",
          "text-xs font-bold tabular-nums text-primary",
          "shadow-[0_2px_6px_-1px_rgb(0_0_0_/0.08)] ring-1 ring-primary/12",
          "transition-all duration-300 group-hover/card:scale-110 group-hover/card:border-primary/40 group-hover/card:shadow-md",
        )}
        aria-hidden
      >
        {step.id}
      </span>

      <div
        className={cn(
          "relative min-w-0 pr-10",
          fillHeight && "flex min-h-0 flex-1 flex-col",
        )}
      >
        <div className={cn("space-y-1.5", fillHeight && "min-h-0 flex-1")}>
          <h4 className="text-sm font-semibold leading-snug tracking-tight text-foreground sm:text-[0.9375rem]">
            <span className="sr-only">Passo {step.id}. </span>
            {step.title}
          </h4>
          <div className="text-[12px] leading-relaxed text-muted-foreground sm:text-[13px] [&_strong]:font-semibold [&_em]:not-italic">
            {step.body}
          </div>
        </div>

        {step.action === "link" && (
          <div className={cn("mt-3", fillHeight && "mt-auto pt-3")}>
            <Button
              type="button"
              className="gap-2 shadow-[0_2px_6px_-1px_rgb(0_0_0_/0.12)] transition-all hover:-translate-y-px hover:shadow-md"
              asChild
            >
              <a href={OPEN_CALENDAR_URL} target="_blank" rel="noopener noreferrer">
                Abrir Google Calendar
                <ExternalLink className="h-3.5 w-3.5 opacity-90" />
              </a>
            </Button>
          </div>
        )}

        {step.action === "form" && (
          <div
            className={cn(
              "mt-3 space-y-2 border-t border-border/55 pt-3 dark:border-border/45",
              fillHeight && "mt-auto",
            )}
          >
            <div className="space-y-1.5">
              <Label htmlFor="gcal-id" className="text-xs font-medium text-muted-foreground">
                ID da agenda
              </Label>
              <Input
                id="gcal-id"
                type="text"
                placeholder="xxxxx@group.calendar.google.com"
                value={calendarId}
                onChange={(e) => setCalendarId(e.target.value)}
                className="h-8 w-full max-w-none font-mono text-[12px] shadow-sm transition-all focus-visible:border-ring/60 focus-visible:ring-2 focus-visible:ring-ring/30 sm:h-9 sm:text-[13px]"
                autoComplete="off"
              />
            </div>
            <Button
              type="button"
              onClick={onSave}
              className="gap-2 shadow-[0_2px_6px_-1px_rgb(0_0_0_/0.12)] transition-all hover:-translate-y-px hover:shadow-md"
            >
              <Check className="h-3.5 w-3.5" />
              Salvar
            </Button>
          </div>
        )}

        {step.id === 3 && (
          <div
            className={cn(
              "flex items-start gap-2 rounded-md border border-border/50 bg-muted/35 px-2.5 py-2 text-[10px] text-muted-foreground shadow-inner dark:bg-muted/15 sm:text-[11px]",
              fillHeight ? "mt-auto pt-2" : "mt-3",
            )}
          >
            <Settings2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden />
            <span>O ID aparece na secção de integração da agenda, em Definições.</span>
          </div>
        )}
      </div>
    </div>
  );
}
