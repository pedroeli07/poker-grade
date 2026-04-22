"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Check, X } from "lucide-react";
import type { OpponentNoteRow } from "@/lib/types/opponent";
import { OPPONENT_CLASSIFICATION_LABELS, OPPONENT_STYLE_LABELS } from "@/lib/types/opponent";
import { updateOpponentNote } from "@/lib/queries/db/opponent/update-mutations";
import { deleteOpponentNote } from "@/lib/queries/db/opponent/delete-mutations";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import type { OpponentClassification } from "@prisma/client";
import { cn } from "@/lib/utils/cn";

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

/** Faixa de cor por classificação (neutro quando indefinido). */
const ACCENT_BY_CLASS: Record<OpponentClassification, string> = {
  FISH: "from-emerald-500/70 to-emerald-400/40",
  REG: "from-sky-500/70 to-sky-400/40",
  WHALE: "from-violet-500/70 to-violet-400/40",
  NIT: "from-amber-500/70 to-amber-400/40",
  SHARK: "from-rose-500/70 to-rose-400/40",
  UNKNOWN: "from-muted-foreground/40 to-muted-foreground/10",
};

const CLASSIFICATIONS = Object.keys(OPPONENT_CLASSIFICATION_LABELS) as Array<
  keyof typeof OPPONENT_CLASSIFICATION_LABELS
>;
const STYLES = Object.keys(OPPONENT_STYLE_LABELS) as Array<keyof typeof OPPONENT_STYLE_LABELS>;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export default function NoteCard({ note }: { note: OpponentNoteRow }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(note.body);
  const [classification, setClassification] = useState<string>(note.classification ?? "");
  const [style, setStyle] = useState<string>(note.style ?? "");
  const [pending, startTransition] = useTransition();

  const save = () => {
    if (!body.trim()) return;
    startTransition(async () => {
      const res = await updateOpponentNote({
        id: note.id,
        body: body.trim(),
        classification: (classification || null) as never,
        style: (style || null) as never,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Nota atualizada");
      setEditing(false);
      router.refresh();
    });
  };

  const remove = () => {
    if (!confirm("Excluir esta nota?")) return;
    startTransition(async () => {
      const res = await deleteOpponentNote(note.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Nota excluída");
      router.refresh();
    });
  };

  const created = new Date(note.createdAt);
  const accent = note.classification ? ACCENT_BY_CLASS[note.classification] : ACCENT_BY_CLASS.UNKNOWN;
  const author = note.authorName || note.authorEmail || "Autor";

  return (
    <Card
      size="sm"
      className={cn(
        "group relative h-full gap-0 overflow-hidden py-0",
        "border-border/60 shadow-sm ring-1 ring-black/[0.02]",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:ring-primary/20",
      )}
    >
      {/* accent stripe */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r opacity-80 transition-opacity group-hover:opacity-100",
          accent,
        )}
      />
      {/* soft glow on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-1 -z-10 rounded-xl bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
      />

      <CardContent className="flex h-full min-h-0 flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-xs font-semibold text-primary ring-1 ring-primary/15"
            >
              {initials(author)}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium leading-snug text-foreground">
                {author}
              </div>
              <div
                className="mt-0.5 text-xs leading-relaxed text-muted-foreground [overflow-wrap:anywhere]"
                title={dtf.format(created)}
              >
                <span className="text-foreground/80">{relative(created)}</span>
                <span className="mx-1.5 text-border">·</span>
                <span>{dtf.format(created)}</span>
              </div>
            </div>
          </div>
          {note.canEdit && !editing ? (
            <div className="flex shrink-0 gap-0.5 opacity-60 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setBody(note.body);
                  setClassification(note.classification ?? "");
                  setStyle(note.style ?? "");
                  setEditing(true);
                }}
                aria-label="Editar nota"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={remove}
                aria-label="Excluir nota"
                disabled={pending}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ) : null}
        </div>

        {editing ? (
          <div className="space-y-3">
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} maxLength={5000} />
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Tag</span>
                <Select
                  value={classification || "__none__"}
                  onValueChange={(v) => setClassification(v === "__none__" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="(opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">(nenhum)</SelectItem>
                    {CLASSIFICATIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {OPPONENT_CLASSIFICATION_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Estilo</span>
                <Select value={style || "__none__"} onValueChange={(v) => setStyle(v === "__none__" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="(opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">(nenhum)</SelectItem>
                    {STYLES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {OPPONENT_STYLE_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  setBody(note.body);
                  setClassification(note.classification ?? "");
                  setStyle(note.style ?? "");
                }}
                disabled={pending}
              >
                <X className="size-4" /> Cancelar
              </Button>
              <Button size="sm" onClick={save} disabled={pending}>
                <Check className="size-4" /> Salvar
              </Button>
            </div>
          </div>
        ) : (
          <p className="flex-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">
            {note.body}
          </p>
        )}

        {(note.classification || note.style) && !editing ? (
          <div className="mt-auto flex flex-wrap gap-2 border-t border-border/50 pt-3">
            {note.classification ? (
              <Badge
                variant="secondary"
                className="border border-primary/15 bg-primary/10 text-xs font-medium text-primary"
              >
                {OPPONENT_CLASSIFICATION_LABELS[note.classification]}
              </Badge>
            ) : null}
            {note.style ? (
              <Badge variant="outline" className="text-xs font-medium text-muted-foreground">
                {OPPONENT_STYLE_LABELS[note.style]}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
