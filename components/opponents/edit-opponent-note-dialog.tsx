"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { POKER_NETWORKS_UI } from "@/lib/constants/poker-networks";
import { getOpponentNoteByIdForEdit } from "@/lib/queries/db/opponent/reads";
import { updateOpponentNote } from "@/lib/queries/db/opponent/update-mutations";
import { deleteOpponentNote } from "@/lib/queries/db/opponent/delete-mutations";
import { OPPONENT_CLASSIFICATION_LABELS, OPPONENT_STYLE_LABELS } from "@/lib/types/opponent";
import { toast } from "@/lib/toast";
import NetworkBadge from "./network-badge";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CLASSIFICATIONS = Object.keys(OPPONENT_CLASSIFICATION_LABELS) as Array<
  keyof typeof OPPONENT_CLASSIFICATION_LABELS
>;
const STYLES = Object.keys(OPPONENT_STYLE_LABELS) as Array<keyof typeof OPPONENT_STYLE_LABELS>;

type Loaded = {
  id: string;
  network: string;
  nick: string;
  body: string;
  classification: string | null;
  style: string | null;
};

function EditOpponentNoteFormInner({
  noteId,
  onOpenChange,
}: {
  noteId: string;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Loaded | null>(null);
  const [network, setNetwork] = useState("");
  const [nick, setNick] = useState("");
  const [body, setBody] = useState("");
  const [classification, setClassification] = useState<string>("");
  const [style, setStyle] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const n = await getOpponentNoteByIdForEdit(noteId);
      if (cancelled) return;
      setLoading(false);
      if (!n) {
        toast.error("Não foi possível carregar a nota.");
        onOpenChange(false);
        return;
      }
      const loaded: Loaded = {
        id: n.id,
        network: n.network,
        nick: n.nick,
        body: n.body,
        classification: n.classification,
        style: n.style,
      };
      setData(loaded);
      setNetwork(n.network);
      setNick(n.nick);
      setBody(n.body);
      setClassification(n.classification ?? "");
      setStyle(n.style ?? "");
    })();
    return () => {
      cancelled = true;
    };
  }, [noteId, onOpenChange]);

  const save = () => {
    if (!data || !body.trim() || !nick.trim()) {
      toast.error("Preencha nick e observação.");
      return;
    }
    startTransition(async () => {
      const res = await updateOpponentNote({
        id: data.id,
        body: body.trim(),
        classification: (classification || null) as never,
        style: (style || null) as never,
        network: network as never,
        nick: nick.trim(),
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Nota atualizada");
      onOpenChange(false);
      router.refresh();
    });
  };

  const remove = () => {
    if (!data) return;
    startTransition(async () => {
      const res = await deleteOpponentNote(data.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Nota excluída");
      setConfirmDelete(false);
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar nota</DialogTitle>
        <DialogDescription>
          Ajuste rede, nick, tag, estilo ou texto. Alterar rede/nick move esta nota para o adversário correto.
        </DialogDescription>
      </DialogHeader>

      {loading || !data ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : (
        <div className="min-w-0 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 sm:items-start">
            <div className="space-y-2">
              <Label>Rede</Label>
              <Select value={network} onValueChange={setNetwork}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POKER_NETWORKS_UI.map((n) => (
                    <SelectItem key={n.value} value={n.value}>
                      <NetworkBadge network={n.value} size="sm" />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nick">Nick</Label>
              <Input
                id="edit-nick"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                maxLength={120}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observação</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              maxLength={5000}
            />
            <div className="text-right text-xs text-muted-foreground">{body.length}/5000</div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tag</Label>
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
            <div className="space-y-2">
              <Label>Estilo</Label>
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
        </div>
      )}

      <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={pending || loading || !data}
          onClick={() => setConfirmDelete(true)}
        >
          Excluir nota
        </Button>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancelar
          </Button>
          <Button type="button" onClick={save} disabled={pending || loading || !data}>
            {pending ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </DialogFooter>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta nota?</AlertDialogTitle>
            <AlertDialogDescription>
              A ação não pode ser desfeita. Se for a única nota deste adversário, a linha some da lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <Button type="button" variant="destructive" disabled={pending} onClick={() => remove()}>
              Excluir
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function EditOpponentNoteDialog({
  noteId,
  open,
  onOpenChange,
}: {
  noteId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,40rem)] overflow-y-auto sm:max-w-lg">
        {open && noteId ? (
          <EditOpponentNoteFormInner key={noteId} noteId={noteId} onOpenChange={onOpenChange} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
