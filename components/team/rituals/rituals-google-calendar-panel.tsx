"use client";

import { memo, useEffect, useState } from "react";
import { AlertTriangle, Calendar, Check, ExternalLink, Settings2 } from "lucide-react";
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
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Siga os passos para associar uma agenda ao time. Os eventos dos rituais podem ser sincronizados quando a
              integração estiver ativa no servidor.
            </p>
          </div>
        </div>
      </header>

      {/* Timeline: linha vertical + passos */}
      <div className="relative pl-0 sm:pl-2">
        <div
          className="absolute left-[1.15rem] top-3 bottom-3 hidden w-px bg-gradient-to-b from-border via-border/80 to-border sm:left-[1.25rem] sm:block"
          aria-hidden
        />
        <ol className="relative space-y-4 sm:space-y-5">
          {STEPS.map((step, index) => (
            <li key={step.id} className="relative">
              <div className="flex gap-4 sm:gap-5">
                <div className="relative z-[1] flex shrink-0 flex-col items-center sm:w-10">
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10",
                      "text-sm font-bold tabular-nums text-primary shadow-sm",
                    )}
                  >
                    {step.id}
                  </span>
                  {index < STEPS.length - 1 && (
                    <div
                      className="mt-2 h-4 w-px grow bg-border sm:hidden"
                      style={{ minHeight: "0.5rem" }}
                      aria-hidden
                    />
                  )}
                </div>
                <StepCard
                  step={step}
                  calendarId={calendarId}
                  setCalendarId={setCalendarId}
                  onSave={handleSave}
                />
              </div>
            </li>
          ))}
        </ol>
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

function StepCard({
  step,
  calendarId,
  setCalendarId,
  onSave,
}: {
  step: (typeof STEPS)[number];
  calendarId: string;
  setCalendarId: (v: string) => void;
  onSave: () => void;
}) {
  return (
    <div
      className={cn(
        "min-w-0 flex-1 rounded-xl border border-border/60 bg-card p-4 shadow-sm",
        "ring-1 ring-foreground/[0.04] transition-shadow duration-200",
        "hover:shadow-md hover:ring-primary/12",
        "sm:py-5 sm:pl-5 sm:pr-5",
      )}
    >
      <div className="space-y-3 sm:pr-2">
        <h4 className="text-base font-semibold leading-snug text-foreground">{step.title}</h4>
        <div className="text-sm leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_em]:not-italic">
          {step.body}
        </div>
      </div>

      {step.action === "link" && (
        <div className="mt-4">
          <Button type="button" className="gap-2" asChild>
            <a href={OPEN_CALENDAR_URL} target="_blank" rel="noopener noreferrer">
              Abrir Google Calendar
              <ExternalLink className="h-3.5 w-3.5 opacity-90" />
            </a>
          </Button>
        </div>
      )}

      {step.action === "form" && (
        <div className="mt-4 space-y-3 border-t border-border/50 pt-4">
          <div className="space-y-2">
            <Label htmlFor="gcal-id" className="text-xs font-medium text-muted-foreground">
              ID da agenda
            </Label>
            <Input
              id="gcal-id"
              type="text"
              placeholder="xxxxx@group.calendar.google.com"
              value={calendarId}
              onChange={(e) => setCalendarId(e.target.value)}
              className="h-10 max-w-lg font-mono text-sm"
              autoComplete="off"
            />
          </div>
          <Button type="button" onClick={onSave} className="gap-2">
            <Check className="h-3.5 w-3.5" />
            Salvar
          </Button>
        </div>
      )}

      {step.id === 3 && (
        <div className="mt-4 flex items-start gap-2 text-[11px] text-muted-foreground sm:mt-3">
          <Settings2 className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
          <span>O ID aparece na secção de integração da agenda, em Definições.</span>
        </div>
      )}
    </div>
  );
}
