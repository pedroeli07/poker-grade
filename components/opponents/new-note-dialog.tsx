"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { POKER_NETWORKS_UI } from "@/lib/constants/poker-networks";
import { createOpponentNote } from "@/lib/queries/db/opponent/create-mutations";
import { OPPONENT_CLASSIFICATION_LABELS, OPPONENT_STYLE_LABELS } from "@/lib/types/opponent";
import { toast } from "@/lib/toast";
import { ChevronsUpDown, NotebookPen } from "lucide-react";
import NetworkBadge from "./network-badge";
import { useRouter } from "next/navigation";

type Props = {
  defaultNetwork?: string;
  defaultNick?: string;
  lockIdentity?: boolean;
  trigger?: React.ReactNode;
  /** Adversários que já têm pelo menos uma nota (lista da tabela). */
  existingOpponents?: { network: string; nick: string }[];
};

const CLASSIFICATIONS = Object.keys(OPPONENT_CLASSIFICATION_LABELS) as Array<
  keyof typeof OPPONENT_CLASSIFICATION_LABELS
>;
const STYLES = Object.keys(OPPONENT_STYLE_LABELS) as Array<keyof typeof OPPONENT_STYLE_LABELS>;

function networkLabel(network: string) {
  return POKER_NETWORKS_UI.find((n) => n.value === network)?.label ?? network;
}

export default function NewNoteDialog({
  defaultNetwork,
  defaultNick,
  lockIdentity,
  trigger,
  existingOpponents = [],
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [network, setNetwork] = useState<string>(defaultNetwork ?? POKER_NETWORKS_UI[0].value);
  const [nick, setNick] = useState(defaultNick ?? "");
  const [body, setBody] = useState("");
  const [classification, setClassification] = useState<string>("");
  const [style, setStyle] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const [pickerOpen, setPickerOpen] = useState(false);

  /** Todos os adversários com nota (qualquer rede), para o combobox preencher rede + nick. */
  const sortedExisting = useMemo(() => {
    const seen = new Set<string>();
    const out: { network: string; nick: string }[] = [];
    for (const o of existingOpponents) {
      const key = `${o.network}\t${o.nick}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(o);
    }
    out.sort((a, b) => {
      const ca = `${networkLabel(a.network)} ${a.nick}`;
      const cb = `${networkLabel(b.network)} ${b.nick}`;
      return ca.localeCompare(cb, "pt-BR", { sensitivity: "base" });
    });
    return out;
  }, [existingOpponents]);

  const showExistingPicker = !lockIdentity && sortedExisting.length > 0;

  const submit = () => {
    if (!nick.trim() || !body.trim()) {
      toast.error("Preencha nick e observação.");
      return;
    }
    startTransition(async () => {
      const res = await createOpponentNote({
        network: network as never,
        nick: nick.trim(),
        body: body.trim(),
        classification: (classification || null) as never,
        style: (style || null) as never,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Nota publicada");
      setOpen(false);
      setBody("");
      if (!lockIdentity) {
        setClassification("");
        setStyle("");
      }
      router.refresh();
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setPickerOpen(false);
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <NotebookPen className="size-4" />
            Nova nota
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="overflow-x-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova nota de adversário</DialogTitle>
        </DialogHeader>

        <div className="min-w-0 space-y-4">
          <div className="space-y-2">
            <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
              <div className="min-w-0 space-y-2">
                <Label>Rede</Label>
                {lockIdentity ? (
                  <div className="flex h-9 items-center rounded-md border px-3">
                    <NetworkBadge network={network} />
                  </div>
                ) : (
                  <Select
                    value={network}
                    onValueChange={(v) => {
                      setNetwork(v);
                      setPickerOpen(false);
                    }}
                  >
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
                )}
              </div>
              <div className="min-w-0 space-y-2">
                <Label htmlFor="opponent-nick-input">Nick</Label>
                <div className="flex gap-2">
                  <Input
                    id="opponent-nick-input"
                    value={nick}
                    onChange={(e) => setNick(e.target.value)}
                    disabled={lockIdentity}
                    maxLength={120}
                    placeholder="ex.: FishyPlayer42"
                    className="min-w-0 flex-1"
                  />
                  {showExistingPicker ? (
                    <Popover modal={false} open={pickerOpen} onOpenChange={setPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          aria-label="Buscar adversário que já tem nota"
                          title="Buscar adversário que já tem nota"
                        >
                          <ChevronsUpDown className="size-4 opacity-70" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[min(100vw-2rem,22rem)] p-0"
                        align="end"
                        sideOffset={4}
                      >
                        <Command>
                          <CommandInput placeholder="Filtrar por nick ou site…" className="h-9" />
                          <CommandList>
                            <CommandEmpty>Nenhum adversário encontrado.</CommandEmpty>
                            <CommandGroup heading="Adversários com nota (todas as redes)">
                              {sortedExisting.map((o) => (
                                <CommandItem
                                  key={`${o.network}:${o.nick}`}
                                  value={`${o.nick} ${networkLabel(o.network)}`}
                                  onSelect={() => {
                                    setNetwork(o.network);
                                    setNick(o.nick);
                                    setPickerOpen(false);
                                  }}
                                >
                                  <span className="flex min-w-0 flex-1 items-center gap-2">
                                    <NetworkBadge network={o.network} showLabel={false} size="sm" />
                                    <span className="truncate font-medium">{o.nick}</span>
                                    <span className="truncate text-xs text-muted-foreground">
                                      {networkLabel(o.network)}
                                    </span>
                                  </span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : null}
                </div>
              </div>
            </div>
            {!lockIdentity ? (
              <p className="text-xs text-muted-foreground">
                Digite um nick novo ou use o botão para buscar um adversário que já tem nota (qualquer rede
                — ao escolher, a rede é preenchida automaticamente).
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Observação</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              maxLength={5000}
              placeholder="O que você observou sobre esse adversário?"
            />
            <div className="text-right text-xs text-muted-foreground">{body.length}/5000</div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tag</Label>
              <Select value={classification} onValueChange={setClassification}>
                <SelectTrigger>
                  <SelectValue placeholder="(opcional)" />
                </SelectTrigger>
                <SelectContent>
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
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="(opcional)" />
                </SelectTrigger>
                <SelectContent>
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

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? "Publicando…" : "Publicar nota"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
