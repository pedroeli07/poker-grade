"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  ChevronRight,
  X,
  RotateCcw,
} from "lucide-react";
import { uploadTournaments } from "@/app/dashboard/imports/actions";
import { toast } from "@/lib/toast";
import { createLogger } from "@/lib/logger";
import { cn } from "@/lib/utils";

const log = createLogger("imports.modal");

type UploadResult = { processed: number; summary: string[] };

export function NewImportModal() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function resetState() {
    setFile(null);
    setError(null);
    setResult(null);
    setDragOver(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleOpenChange(value: boolean) {
    if (loading) return;
    setOpen(value);
    if (!value) setTimeout(resetState, 150);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    log.info("Arquivo selecionado", { name: f.name, size: f.size });
    setFile(f);
    setError(null);
    setResult(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    const allowed = [".xlsx", ".xls", ".csv"];
    if (!allowed.some((ext) => f.name.toLowerCase().endsWith(ext))) {
      setError("Formato inválido. Use .xlsx, .xls ou .csv.");
      return;
    }
    log.info("Arquivo arrastado", { name: f.name, size: f.size });
    setFile(f);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      log.info("Enviando importação");
      const res = await uploadTournaments(formData);
      setResult({ processed: res.processed, summary: res.summary });
      setFile(null);
      toast.success("Importação concluída", `${res.processed} torneios processados`);
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro desconhecido ao processar arquivo";
      log.error("Falha no upload", err instanceof Error ? err : undefined);
      setError(msg);
      toast.error("Falha na importação", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={() => setOpen(true)}
      >
        <Upload className="mr-2 h-4 w-4" />
        Nova Importação
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="relative px-6 pt-6 pb-5 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
              </div>
              <DialogHeader className="space-y-0.5">
                <DialogTitle className="text-base font-semibold">Nova Importação</DialogTitle>
                <DialogDescription className="text-xs">
                  Upload do arquivo Excel Lobbyze com o histórico de torneios.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <Separator />

          {result ? (
            /* ── Tela de Resultado ─────────────────────────── */
            <>
              <div className="px-6 py-5 space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Importação Concluída
                  </div>
                  <p className="text-sm text-foreground mb-3">
                    <strong>{result.processed}</strong> torneios processados e comparados.
                  </p>
                  {result.summary.length > 0 && (
                    <div className="space-y-1 pt-3 border-t border-emerald-500/20">
                      {result.summary.map((line, i) => (
                        <div key={i} className="text-xs text-muted-foreground flex gap-1.5">
                          <span className="text-emerald-500/70 mt-px">•</span>
                          <span>{line}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <DialogFooter className="px-6 py-4 border-t-0 bg-muted/20">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border/60"
                  onClick={() => { resetState(); }}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Nova Importação
                </Button>
                <Button
                  size="sm"
                  className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => handleOpenChange(false)}
                >
                  Fechar
                  <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </DialogFooter>
            </>
          ) : (
            /* ── Tela de Upload ────────────────────────────── */
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-5 space-y-4">
                {/* Aviso de formato */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  O nome da aba (Sheet) <strong className="text-foreground">deve</strong> corresponder
                  ao Nickname ou Nome do jogador cadastrado.
                </p>

                {/* Dropzone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none",
                    "min-h-[160px] px-6 py-8",
                    dragOver
                      ? "border-primary bg-primary/10 scale-[1.01]"
                      : file
                      ? "border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10"
                      : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-primary/5"
                  )}
                >
                  <Input
                    ref={inputRef}
                    type="file"
                    name="file"
                    accept=".xlsx,.xls,.csv"
                    required
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />

                  {file ? (
                    <>
                      <div className="flex flex-col items-center text-emerald-500">
                        <FileSpreadsheet className="h-10 w-10 mb-2.5 drop-shadow-[0_0_8px_theme(colors.emerald.500/0.4)]" />
                        <span className="font-medium text-sm text-foreground">{file.name}</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); resetState(); }}
                        className="absolute top-2.5 right-2.5 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Upload
                        className={cn(
                          "h-10 w-10 mb-2.5 transition-colors",
                          dragOver ? "text-primary" : "group-hover:text-primary"
                        )}
                      />
                      <span className="font-medium text-sm text-foreground/80">
                        {dragOver ? "Solte para fazer upload" : "Clique ou arraste o arquivo"}
                      </span>
                      <span className="text-xs mt-1">Lobbyze export · .xlsx, .xls, .csv</span>
                    </div>
                  )}
                </div>

                {/* Erro */}
                {error && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </div>
                )}
              </div>

              <Separator />

              <DialogFooter className="px-6 py-4 border-t-0 bg-muted/20">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenChange(false)}
                  disabled={loading}
                  className="border-border/60"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!file || loading}
                  className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90 min-w-[170px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      Processar Grades
                      <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
