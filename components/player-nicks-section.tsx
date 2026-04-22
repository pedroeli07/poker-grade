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
import {
  DestructiveAlertDivider,
  DestructiveAlertIconHeader,
  DestructiveAlertWarningNote,
} from "@/components/modals/primitives/destructive-alert-dialog";
import { Plus, Pencil, Trash2, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/lib/toast";
import { getPokerstarsMainNickFromRows, NETWORK_OPTS, POKER_NETWORKS, shouldPrefillPokerstarsMainNick } from "@/lib/constants/poker-networks";
import { destructiveAlertDialogContentClassName, destructiveAlertHeaderClassName, destructiveAlertTitleClassName, destructiveAlertDescriptionWrapClassName, destructiveAlertFooterClassName, destructiveAlertCancelButtonClassName, destructiveAlertConfirmButtonClassName } from "@/lib/constants/classes";
import {
  PLAYER_NICKS_DELETE_CACHE_WARNING,
  PLAYER_NICKS_DELETE_CONFIRM,
  PLAYER_NICKS_DELETE_TITLE,
  PLAYER_NICKS_EDIT_CANCEL,
  PLAYER_NICKS_EDIT_SAVE,
  PLAYER_NICKS_EMPTY_MESSAGE,
  PLAYER_NICKS_FORM_CANCEL,
  PLAYER_NICKS_FORM_LABEL_NETWORK,
  PLAYER_NICKS_FORM_LABEL_NICK,
  PLAYER_NICKS_FORM_PLACEHOLDER_NICK,
  PLAYER_NICKS_FORM_SUBMIT,
  PLAYER_NICKS_FORM_TITLE,
  PLAYER_NICKS_STATUS_ACTIVE,
  PLAYER_NICKS_STATUS_INACTIVE,
  PLAYER_NICKS_STATUS_TITLE_ACTIVE,
  PLAYER_NICKS_STATUS_TITLE_INACTIVE,
  PLAYER_NICKS_TABLE_COL_NETWORK,
  PLAYER_NICKS_TABLE_COL_NICK,
  PLAYER_NICKS_TABLE_COL_STATUS,
  PLAYER_NICKS_TOAST_ADD_FAIL,
  PLAYER_NICKS_TOAST_ADD_SUCCESS_TITLE,
  PLAYER_NICKS_TOAST_ERROR_TITLE,
  PLAYER_NICKS_TOAST_REMOVE_FAIL,
  PLAYER_NICKS_TOAST_REMOVE_SUCCESS,
  PLAYER_NICKS_TOAST_UPDATE_FAIL,
  PLAYER_NICKS_TOAST_UPDATE_SUCCESS,
  PLAYER_NICKS_BTN_ADD,
} from "@/lib/constants/player-nicks-ui";
import { cn } from "@/lib/utils/cn";
import { formatPlayerNickAddedToastDescription } from "@/lib/utils/player-nicks";
import { playerNickItemPath, playerNicksCollectionPath } from "@/lib/utils/player-nicks-api";
import { PokerNetworkKey } from "@/lib/types/primitives";
import { Nick, PlayerNicksSectionProps } from "@/lib/types/player/index";
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
      const res = await fetch(playerNicksCollectionPath(playerId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nick: newNick.trim(), network: newNetwork }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(PLAYER_NICKS_TOAST_ERROR_TITLE, json.error ?? PLAYER_NICKS_TOAST_ADD_FAIL);
        return;
      }
      setNicks((prev) => [...prev, json.nick as Nick]);
      setNewNick("");
      setNewNetwork("gg");
      setShowAdd(false);
      toast.success(
        PLAYER_NICKS_TOAST_ADD_SUCCESS_TITLE,
        formatPlayerNickAddedToastDescription(json.nick.nick, json.nick.network as string)
      );
    });
  }

  function startEdit(nick: Nick) {
    setEditingId(nick.id);
    setEditNick(nick.nick);
    setEditNetwork(nick.network as PokerNetworkKey);
  }

  async function handleUpdate(id: string) {
    startTransition(async () => {
      const res = await fetch(playerNickItemPath(playerId, id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nick: editNick.trim(), network: editNetwork }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(PLAYER_NICKS_TOAST_ERROR_TITLE, json.error ?? PLAYER_NICKS_TOAST_UPDATE_FAIL);
        return;
      }
      setNicks((prev) =>
        prev.map((n) => (n.id === id ? (json.nick as Nick) : n))
      );
      setEditingId(null);
      toast.success(PLAYER_NICKS_TOAST_UPDATE_SUCCESS);
    });
  }

  async function handleToggleActive(nick: Nick) {
    startTransition(async () => {
      const res = await fetch(playerNickItemPath(playerId, nick.id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !nick.isActive }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(PLAYER_NICKS_TOAST_ERROR_TITLE, json.error ?? PLAYER_NICKS_TOAST_UPDATE_FAIL);
        return;
      }
      setNicks((prev) =>
        prev.map((n) => (n.id === nick.id ? (json.nick as Nick) : n))
      );
    });
  }

  const nickPendingDelete = deleteId ? nicks.find((n) => n.id === deleteId) : null;

  async function handleDelete(id: string) {
    startTransition(async () => {
      const res = await fetch(playerNickItemPath(playerId, id), {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(PLAYER_NICKS_TOAST_ERROR_TITLE, json.error ?? PLAYER_NICKS_TOAST_REMOVE_FAIL);
        return;
      }
      setNicks((prev) => prev.filter((n) => n.id !== id));
      setDeleteId(null);
      toast.success(PLAYER_NICKS_TOAST_REMOVE_SUCCESS);
    });
  }

  return (
    <div className="space-y-3">
      {nicks.length === 0 && !showAdd && (
        <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-muted-foreground bg-blue-500/10">
          <p className="text-sm">{PLAYER_NICKS_EMPTY_MESSAGE}</p>
          {canManage && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => setShowAdd(true)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {PLAYER_NICKS_BTN_ADD}
            </Button>
          )}
        </div>
      )}

      {nicks.length > 0 && (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-blue-500/20 hover:bg-blue-500/20 border-b border-border/60">
              <tr>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">{PLAYER_NICKS_TABLE_COL_NICK}</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">{PLAYER_NICKS_TABLE_COL_NETWORK}</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">{PLAYER_NICKS_TABLE_COL_STATUS}</th>
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
                          if (shouldPrefillPokerstarsMainNick(next) && !editNick.trim()) {
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
                          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : PLAYER_NICKS_EDIT_SAVE}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          disabled={isPending}
                          onClick={() => setEditingId(null)}
                        >
                          {PLAYER_NICKS_EDIT_CANCEL}
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
                          title={nick.isActive ? PLAYER_NICKS_STATUS_TITLE_ACTIVE : PLAYER_NICKS_STATUS_TITLE_INACTIVE}
                        >
                          {nick.isActive ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">{PLAYER_NICKS_STATUS_ACTIVE}</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">{PLAYER_NICKS_STATUS_INACTIVE}</Badge>
                          )}
                        </button>
                      ) : nick.isActive ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">{PLAYER_NICKS_STATUS_ACTIVE}</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">{PLAYER_NICKS_STATUS_INACTIVE}</Badge>
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
          <p className="text-sm font-medium">{PLAYER_NICKS_FORM_TITLE}</p>
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <div className="space-y-1.5">
              <Label className="text-xs">{PLAYER_NICKS_FORM_LABEL_NICK}</Label>
              <Input
                value={newNick}
                onChange={(e) => setNewNick(e.target.value)}
                placeholder={PLAYER_NICKS_FORM_PLACEHOLDER_NICK}
                className="h-9 text-sm"
                disabled={isPending}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{PLAYER_NICKS_FORM_LABEL_NETWORK}</Label>
              <Select
                value={newNetwork}
                onValueChange={(v) => {
                  const next = v as PokerNetworkKey;
                  setNewNetwork(next);
                  if (shouldPrefillPokerstarsMainNick(next) && !newNick.trim()) {
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
              {PLAYER_NICKS_FORM_SUBMIT}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => { setShowAdd(false); setNewNick(""); setNewNetwork("gg"); }}
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" />
              {PLAYER_NICKS_FORM_CANCEL}
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
          {PLAYER_NICKS_BTN_ADD}
        </Button>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className={destructiveAlertDialogContentClassName}>
          <DestructiveAlertIconHeader />
          <AlertDialogHeader className={destructiveAlertHeaderClassName}>
            <AlertDialogTitle className={destructiveAlertTitleClassName}>{PLAYER_NICKS_DELETE_TITLE}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className={destructiveAlertDescriptionWrapClassName}>
                {nickPendingDelete ? (
                  <p>
                    <span className="font-mono text-sm text-foreground">{nickPendingDelete.nick}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      ·{" "}
                      {POKER_NETWORKS[nickPendingDelete.network as PokerNetworkKey]?.label ??
                        nickPendingDelete.network}
                    </span>
                  </p>
                ) : null}
                <p>{PLAYER_NICKS_DELETE_CACHE_WARNING}</p>
                <DestructiveAlertWarningNote>Esta ação não pode ser desfeita.</DestructiveAlertWarningNote>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <DestructiveAlertDivider />
          <AlertDialogFooter className={destructiveAlertFooterClassName}>
            <AlertDialogCancel disabled={isPending} className={destructiveAlertCancelButtonClassName}>
              {PLAYER_NICKS_EDIT_CANCEL}
            </AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                destructiveAlertConfirmButtonClassName,
                "inline-flex items-center justify-center gap-2"
              )}
              disabled={isPending}
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              {isPending ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : PLAYER_NICKS_DELETE_CONFIRM}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
