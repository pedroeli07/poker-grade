"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/lib/toast";
import { getPokerstarsMainNickFromRows, POKER_NETWORKS, NETWORK_OPTS } from "@/lib/constants";
import { PokerNetworkKey, Nick, PlayerNicksSectionProps } from "@/lib/types";


export function PlayerNicksSection({ playerId, initialNicks, canManage }: PlayerNicksSectionProps) {
  const [nicks, setNicks] = useState<Nick[]>(initialNicks);
  const [showAdd, setShowAdd] = useState(false);
  const [newNick, setNewNick] = useState("");
  const [newNetwork, setNewNetwork] = useState<PokerNetworkKey>("gg");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNick, setEditNick] = useState("");
  const [editNetwork, setEditNetwork] = useState<PokerNetworkKey>("gg");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleAdd() {
    if (!newNick.trim()) return;
    startTransition(async () => {
      const res = await fetch(`/api/players/${playerId}/nicks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nick: newNick.trim(), network: newNetwork }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Erro", json.error ?? "Não foi possível adicionar o nick.");
        return;
      }
      setNicks((prev) => [...prev, json.nick as Nick]);
      setNewNick("");
      setNewNetwork("gg");
      setShowAdd(false);
      toast.success("Nick adicionado", `${json.nick.nick} (${POKER_NETWORKS[json.nick.network as PokerNetworkKey]?.label ?? json.nick.network}) cadastrado com sucesso.`);
    });
  }

  function startEdit(nick: Nick) {
    setEditingId(nick.id);
    setEditNick(nick.nick);
    setEditNetwork(nick.network as PokerNetworkKey);
  }

  async function handleUpdate(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/players/${playerId}/nicks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nick: editNick.trim(), network: editNetwork }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Erro", json.error ?? "Não foi possível atualizar.");
        return;
      }
      setNicks((prev) =>
        prev.map((n) => (n.id === id ? (json.nick as Nick) : n))
      );
      setEditingId(null);
      toast.success("Nick atualizado");
    });
  }

  async function handleToggleActive(nick: Nick) {
    startTransition(async () => {
      const res = await fetch(`/api/players/${playerId}/nicks/${nick.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !nick.isActive }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Erro", json.error ?? "Não foi possível atualizar.");
        return;
      }
      setNicks((prev) =>
        prev.map((n) => (n.id === nick.id ? (json.nick as Nick) : n))
      );
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/players/${playerId}/nicks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error("Erro", json.error ?? "Não foi possível remover.");
        return;
      }
      setNicks((prev) => prev.filter((n) => n.id !== id));
      setDeleteId(null);
      toast.success("Nick removido");
    });
  }

  return (
    <div className="space-y-3">
      {nicks.length === 0 && !showAdd && (
        <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-muted-foreground bg-blue-500/10">
          <p className="text-sm">Nenhum nick cadastrado.</p>
          {canManage && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => setShowAdd(true)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Adicionar nick
            </Button>
          )}
        </div>
      )}

      {nicks.length > 0 && (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-blue-500/20 hover:bg-blue-500/20 border-b border-border/60">
              <tr>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">Nick</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">Rede</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                {canManage && <th className="px-3 py-2.5 w-24" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {nicks.map((nick) =>
                editingId === nick.id ? (
                  <tr key={nick.id} className="bg-muted/20">
                    <td className="px-3 py-2">
                      <Input
                        value={editNick}
                        onChange={(e) => setEditNick(e.target.value)}
                        className="h-8 text-sm"
                        disabled={isPending}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Select
                        value={editNetwork}
                        onValueChange={(v) => {
                          const next = v as PokerNetworkKey;
                          setEditNetwork(next);
                          if (next === "pokerstars_fr" && !editNick.trim()) {
                            const main = getPokerstarsMainNickFromRows(nicks);
                            if (main) setEditNick(main);
                          }
                        }}
                        disabled={isPending}
                      >
                        <SelectTrigger className="h-8 text-sm w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {NETWORK_OPTS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td />
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          className="h-7 px-2 text-xs"
                          disabled={isPending}
                          onClick={() => handleUpdate(nick.id)}
                        >
                          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Salvar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          disabled={isPending}
                          onClick={() => setEditingId(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={nick.id} className="hover:bg-muted/20 transition-colors bg-white">
                    <td className="px-3 py-2.5 font-medium">{nick.nick}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {POKER_NETWORKS[nick.network as PokerNetworkKey]?.label ?? nick.network}
                    </td>
                    <td className="px-3 py-2.5">
                      {canManage ? (
                        <button
                          onClick={() => handleToggleActive(nick)}
                          disabled={isPending}
                          className="cursor-pointer"
                          title={nick.isActive ? "Clique para desativar" : "Clique para ativar"}
                        >
                          {nick.isActive ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Ativo</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Inativo</Badge>
                          )}
                        </button>
                      ) : nick.isActive ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Inativo</Badge>
                      )}
                    </td>
                    {canManage && (
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={isPending}
                            onClick={() => startEdit(nick)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            disabled={isPending}
                            onClick={() => setDeleteId(nick.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && canManage && (
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
          <p className="text-sm font-medium">Adicionar Nick</p>
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <div className="space-y-1.5">
              <Label className="text-xs">Nick</Label>
              <Input
                value={newNick}
                onChange={(e) => setNewNick(e.target.value)}
                placeholder="JohnDoe99"
                className="h-9 text-sm"
                disabled={isPending}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Rede</Label>
              <Select
                value={newNetwork}
                onValueChange={(v) => {
                  const next = v as PokerNetworkKey;
                  setNewNetwork(next);
                  if (next === "pokerstars_fr" && !newNick.trim()) {
                    const main = getPokerstarsMainNickFromRows(nicks);
                    if (main) setNewNick(main);
                  }
                }}
                disabled={isPending}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NETWORK_OPTS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={isPending || !newNick.trim()}
              onClick={handleAdd}
            >
              {isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="mr-1.5 h-3.5 w-3.5" />}
              Adicionar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => { setShowAdd(false); setNewNick(""); setNewNetwork("gg"); }}
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {canManage && nicks.length > 0 && !showAdd && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAdd(true)}
          disabled={isPending}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Adicionar nick
        </Button>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover nick?</AlertDialogTitle>
            <AlertDialogDescription>
              O cache SharkScope associado a este nick também será removido. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
