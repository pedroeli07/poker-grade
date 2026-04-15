import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import MultiToggleRow from "./multi-toggle-row";
import type { GradeRuleCardRule, LobbyzeFilterItem } from "@/lib/types";
import { memo } from "react";
import LabeledTextRow from "./labeled-text-row";

const RuleEditor = memo(function RuleEditor<T extends GradeRuleCardRule>({
  form,
  set,
  speedOptions,
  ttOptions,
  vOptions,
  gameOptions,
  pcOptions,
  wdOptions,
}: {
  form: T;
  /** Valores de inputs HTML são `string`; o estado de edição usa `unknown` até o save (parse em `useEditableRule`). */
  set: (key: keyof T, val: unknown) => void;
  speedOptions: LobbyzeFilterItem[];
  ttOptions: LobbyzeFilterItem[];
  vOptions: LobbyzeFilterItem[];
  gameOptions: LobbyzeFilterItem[];
  pcOptions: LobbyzeFilterItem[];
  wdOptions: LobbyzeFilterItem[];
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Coluna 1: Main Config */}
      <div className="space-y-6">
        <div className="space-y-4 rounded-xl border border-border bg-muted/10 p-4">
          <LabeledTextRow
            label={
              <Label className="text-xs text-muted-foreground font-semibold">
                Sites
              </Label>
            }
          >
            <MultiToggleRow
              options={[]}
              selected={form.sites}
              onChange={(v) => set("sites", v as T["sites"])}
            />
          </LabeledTextRow>

          <div className="grid grid-cols-2 gap-4">
            <LabeledTextRow
              label={
                <Label className="text-xs text-muted-foreground font-semibold">
                  Velocidade
                </Label>
              }
            >
              <MultiToggleRow
                options={speedOptions}
                selected={form.speed}
                onChange={(v) => set("speed", v as T["speed"])}
              />
            </LabeledTextRow>
            <LabeledTextRow
              label={
                <Label className="text-xs text-muted-foreground font-semibold">
                  Formato (T. Type)
                </Label>
              }
            >
              <MultiToggleRow
                options={ttOptions}
                selected={form.tournamentType}
                onChange={(v) => set("tournamentType", v as T["tournamentType"])}
              />
            </LabeledTextRow>
            <LabeledTextRow
              label={
                <Label className="text-xs text-muted-foreground font-semibold">
                  Variante (Bounty, etc)
                </Label>
              }
            >
              <MultiToggleRow
                options={vOptions}
                selected={form.variant}
                onChange={(v) => set("variant", v as T["variant"])}
              />
            </LabeledTextRow>
            <LabeledTextRow
              label={
                <Label className="text-xs text-muted-foreground font-semibold">
                  Game
                </Label>
              }
            >
              <MultiToggleRow
                options={gameOptions}
                selected={form.gameType}
                onChange={(v) => set("gameType", v as T["gameType"])}
              />
            </LabeledTextRow>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-muted/10 p-4">
          <LabeledTextRow
            label={
              <Label className="text-xs text-muted-foreground font-semibold">
                Buy-In Mínimo ($)
              </Label>
            }
          >
            <Input
              value={form.buyInMin ?? ""}
              onChange={(e) => set("buyInMin", e.target.value)}
              placeholder="Ex: 10.50"
              className="bg-background h-8 font-mono text-sm"
            />
          </LabeledTextRow>
          <LabeledTextRow
            label={
              <Label className="text-xs text-muted-foreground font-semibold">
                Buy-In Máximo ($)
              </Label>
            }
          >
            <Input
              value={form.buyInMax ?? ""}
              onChange={(e) => set("buyInMax", e.target.value)}
              placeholder="Ex: 55.00"
              className="bg-background h-8 font-mono text-sm"
            />
          </LabeledTextRow>

          <LabeledTextRow
            label={
              <Label className="text-xs text-muted-foreground font-semibold text-blue-500">
                GTD Mín ($)
              </Label>
            }
          >
            <Input
              value={form.prizePoolMin ?? ""}
              onChange={(e) => set("prizePoolMin", e.target.value)}
              placeholder="Ex: 1000"
              className="bg-background h-8 font-mono text-sm border-blue-500/30 focus-visible:ring-blue-500/20"
            />
          </LabeledTextRow>
          <LabeledTextRow
            label={
              <Label className="text-xs text-muted-foreground font-semibold text-blue-500">
                GTD Máx ($)
              </Label>
            }
          >
            <Input
              value={form.prizePoolMax ?? ""}
              onChange={(e) => set("prizePoolMax", e.target.value)}
              placeholder="Ex: 50000"
              className="bg-background h-8 font-mono text-sm border-blue-500/30 focus-visible:ring-blue-500/20"
            />
          </LabeledTextRow>
        </div>
      </div>

      {/* Coluna 2: Extras */}
      <div className="space-y-6">
        <div className="space-y-4 rounded-xl border border-border bg-muted/10 p-4">
          <LabeledTextRow
            label={
              <Label className="text-xs text-muted-foreground font-semibold">
                Tamanho da Mesa (Max)
              </Label>
            }
          >
            <MultiToggleRow
              options={pcOptions}
              selected={form.playerCount}
              onChange={(v) => set("playerCount", v)}
            />
          </LabeledTextRow>

          <LabeledTextRow
            label={
              <Label className="text-xs text-muted-foreground font-semibold">
                Dias de Jogo
              </Label>
            }
          >
            <MultiToggleRow
              options={wdOptions}
              selected={form.weekDay}
              onChange={(v) => set("weekDay", v)}
            />
          </LabeledTextRow>

          <LabeledTextRow
            label={
              <Label className="text-xs text-muted-foreground font-semibold">
                Não registrar se conter as palavras (ex: Sat, Phase)
              </Label>
            }
          >
            <Textarea
              value={form.excludePattern ?? ""}
              onChange={(e) => set("excludePattern", e.target.value)}
              placeholder="separadas por vírgula..."
              className="min-h-[60px] bg-background resize-none text-sm leading-relaxed"
            />
          </LabeledTextRow>
        </div>

        <div className="space-y-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
           <div className="grid grid-cols-2 gap-4">
               <LabeledTextRow
                label={
                  <Label className="text-xs text-muted-foreground font-semibold text-blue-500">
                    Mín. Participantes
                  </Label>
                }
              >
                <Input
                  value={form.minParticipants ?? ""}
                  onChange={(e) => set("minParticipants", e.target.value)}
                  placeholder="Ex: 100"
                  className="bg-background h-8 font-mono text-sm border-blue-500/30"
                />
              </LabeledTextRow>
              <LabeledTextRow
                  label={
                    <Label className="text-xs text-muted-foreground font-semibold text-blue-500">
                      Timezone (UTC, ex: -3)
                    </Label>
                  }
                >
                  <Input
                    value={form.timezone ?? ""}
                    onChange={(e) => set("timezone", e.target.value)}
                    placeholder="-3"
                    className="bg-background h-8 font-mono text-sm border-blue-500/30"
                  />
               </LabeledTextRow>
           </div>
           <div className="grid grid-cols-2 gap-4">
               <LabeledTextRow
                label={
                  <Label className="text-xs text-muted-foreground font-semibold text-blue-500">
                    Hora Início (HH:MM)
                  </Label>
                }
              >
                <Input
                  value={form.fromTime ?? ""}
                  onChange={(e) => set("fromTime", e.target.value)}
                  placeholder="08:00"
                  maxLength={5}
                  className="bg-background h-8 font-mono text-sm border-blue-500/30"
                />
              </LabeledTextRow>
              <LabeledTextRow
                  label={
                    <Label className="text-xs text-muted-foreground font-semibold text-blue-500">
                      Hora Fim (HH:MM)
                    </Label>
                  }
                >
                  <Input
                    value={form.toTime ?? ""}
                    onChange={(e) => set("toTime", e.target.value)}
                    placeholder="23:00"
                    maxLength={5}
                    className="bg-background h-8 font-mono text-sm border-blue-500/30"
                  />
               </LabeledTextRow>
           </div>
        </div>

        <div className="flex gap-6 rounded-xl border border-border bg-muted/10 p-4">
          <div className="flex items-center gap-2">
            <Switch
              id={`auto-${form?.id}`}
              checked={form?.autoOnly}
              onCheckedChange={(v) => {
                set("autoOnly", v);
                if (v) set("manualOnly", false);
              }}
            />
            <Label htmlFor={`auto-${form?.id}`} className="text-sm font-medium">
              Somente Auto
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id={`manual-${form?.id}`}
              checked={form?.manualOnly}
              onCheckedChange={(v) => {
                set("manualOnly", v);
                if (v) set("autoOnly", false);
              }}
            />
            <Label htmlFor={`manual-${form?.id}`} className="text-sm font-medium">
              Somente Manual
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
});

RuleEditor.displayName = "RuleEditor";

export default RuleEditor;
