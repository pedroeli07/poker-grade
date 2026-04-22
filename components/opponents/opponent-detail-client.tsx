"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { POKER_NETWORKS_UI } from "@/lib/constants/poker-networks";
import NetworkBadge from "./network-badge";
import ConsolidatedCard from "./consolidated-card";
import NoteCard from "./note-card";
import NewNoteDialog from "./new-note-dialog";
import type { OpponentDetailProps } from "@/lib/types/opponent";
import { OPPONENT_CLASSIFICATION_LABELS } from "@/lib/types/opponent";
import { ChevronLeft, NotebookPen, Clock, Users2, Sparkles } from "lucide-react";

const dtf = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

function relative(d: Date): string {
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  const days = Math.floor(diff / 86400);
  if (days < 30) return `há ${days} d`;
  return dtf.format(d);
}

const CONFIDENCE_COPY = { low: "Baixa", medium: "Média", high: "Alta" } as const;

export default function OpponentDetailClient({
  network,
  nick,
  notes,
  consolidated,
  canCreate,
  basePath,
}: OpponentDetailProps & { basePath: string }) {
  const label = POKER_NETWORKS_UI.find((n) => n.value === network)?.label ?? network;
  const lastNote = notes[0]?.createdAt ? new Date(notes[0].createdAt) : null;
  const contributors = new Set(notes.map((n) => n.authorId)).size;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={basePath}
          className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
          Adversários
        </Link>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/[0.07] via-background to-background shadow-sm ring-1 ring-border/40">
        {/* decorative glow blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-sky-500/10 blur-3xl"
        />
        {/* grid pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,theme(colors.foreground)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.foreground)_1px,transparent_1px)] [background-size:32px_32px]"
        />

        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="flex min-w-0 items-center gap-5">
            <div className="relative shrink-0">
              <div
                aria-hidden
                className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/40 via-primary/10 to-transparent blur-md"
              />
              <div className="relative flex size-16 items-center justify-center rounded-2xl border border-border/60 bg-background shadow-sm ring-1 ring-border/50 sm:size-20">
                <NetworkBadge network={network} showLabel={false} size="xl" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <span>{label}</span>
                {consolidated.classification ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {OPPONENT_CLASSIFICATION_LABELS[consolidated.classification]}
                    </span>
                  </>
                ) : null}
              </div>
              <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight sm:text-4xl">
                {nick}
              </h1>
              <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                Base coletiva de leituras do time sobre este adversário.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-stretch lg:gap-2.5">
            {canCreate ? (
              <NewNoteDialog
                defaultNetwork={network}
                defaultNick={nick}
                lockIdentity
                trigger={
                  <Button
                    size="default"
                    className="h-11 gap-2 px-5 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
                  >
                    <NotebookPen className="size-4" />
                    Nova nota
                  </Button>
                }
              />
            ) : null}
          </div>
        </div>

        {/* stats strip */}
        <div className="relative grid grid-cols-3 border-t border-border/50 bg-background/40 backdrop-blur-sm">
          <StatCell
            icon={<NotebookPen className="size-3.5" />}
            label="Notas"
            value={String(notes.length)}
          />
          <StatCell
            icon={<Users2 className="size-3.5" />}
            label="Colaboradores"
            value={String(contributors || 0)}
            bordered
          />
          <StatCell
            icon={<Clock className="size-3.5" />}
            label="Última"
            value={lastNote ? relative(lastNote) : "—"}
          />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(280px,320px)] lg:items-start lg:gap-10">
        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/60 pb-4">
            <div>
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" />
                Timeline de notas
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {notes.length === 0
                  ? "Registre observações para consulta rápida da equipe."
                  : `${notes.length} ${notes.length === 1 ? "nota" : "notas"} · confiança ${CONFIDENCE_COPY[consolidated.confidence].toLowerCase()}`}
              </p>
            </div>
          </div>

          {notes.length === 0 ? (
            <Card className="relative overflow-hidden border-dashed shadow-none ring-1 ring-border/80">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"
              />
              <CardContent className="relative flex flex-col items-center gap-3 py-16 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/5">
                  <NotebookPen className="size-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-medium text-foreground">Nenhuma nota ainda</p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Use &quot;Nova nota&quot; para registrar leituras, tendências e histórico contra este jogador.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {notes.map((n) => (
                <NoteCard key={n.id} note={n} />
              ))}
            </div>
          )}
        </div>

        <aside className="min-w-0 lg:sticky lg:top-6">
          <ConsolidatedCard consolidated={consolidated} />
        </aside>
      </div>
    </div>
  );
}

function StatCell({
  icon,
  label,
  value,
  bordered,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={
        "flex flex-col gap-1 px-5 py-4" +
        (bordered ? " border-x border-border/50" : "")
      }
    >
      <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-xl font-semibold tracking-tight">{value}</span>
    </div>
  );
}
