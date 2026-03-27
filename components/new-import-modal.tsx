"use client";

import { useState, useRef, useTransition } from "react";
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
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  ChevronRight,
  X,
  RotateCcw,
  AlertCircle,
  UploadCloud,
} from "lucide-react";
import { uploadTournaments } from "@/app/dashboard/imports/actions";
import { toast } from "@/lib/toast";
import { createLogger } from "@/lib/logger";
import { cn, isNextRedirectError } from "@/lib/utils";

const log = createLogger("imports.modal");

type UploadResult = { processed: number; summary: string[] };

export function NewImportModal() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const loading = isPending;

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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;

    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        log.info("Enviando importação");
        const res = await uploadTournaments(formData);

        if (!res.success) {
          const msg = res.error ?? "Erro desconhecido";
          log.warn("Importação retornou erro", { msg });
          setError(msg);
          toast.error("Falha na importação", msg);
          return;
        }

        setResult({ processed: res.processed, summary: res.summary });
        setFile(null);
        toast.success("Importação concluída", `${res.processed} torneios processados`);
        router.refresh();
      } catch (err) {
        // Re-throw NEXT_REDIRECT so Next.js can navigate (e.g. session expired → /login)
        if (isNextRedirectError(err)) throw err;

        const msg =
          err instanceof Error ? err.message : "Erro de comunicação com o servidor";
        log.error("Falha no upload", err instanceof Error ? err : undefined);
        setError(msg);
        toast.error("Falha na importação", msg);
      }
    });
  }

  return (
    <>
      <Button
        className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 py-2 h-auto text-sm font-semibold transition-all hover:scale-[1.02]"
        onClick={() => setOpen(true)}
      >
        <Upload className="mr-2 h-4 w-4" />
        Nova Importação
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden font-sans border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl rounded-2xl">
          {/* Header */}
          <div className="relative px-8 pt-8 pb-6 bg-gradient-to-b from-primary/5 via-primary/[0.02] to-transparent">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 shrink-0 shadow-[0_0_15px_rgba(255,50,50,0.1)] ring-1 ring-primary/5 transition-all">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
              </div>
              <DialogHeader className="space-y-2 text-left">
                <DialogTitle className="text-2xl font-black tracking-tight text-foreground">
                  Nova Importação
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground/90 leading-relaxed font-medium">
                  Faça o upload do arquivo Excel Lobbyze contendo o histórico de torneios do jogador.
                </DialogDescription>
              </DialogHeader>
            </div>
            {/* Linha de separação sutil */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
          </div>

          {result ? (
            /* ── Tela de Resultado ─────────────────────────── */
            <>
              <div className="px-8 py-6 space-y-4">
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                  <div className="flex items-center gap-3 text-emerald-600 font-bold mb-4 text-xl">
                    <CheckCircle2 className="h-6 w-6 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                    Processamento Concluído!
                  </div>
                  <p className="text-[16px] text-foreground/90 mb-5 leading-relaxed tracking-wide">
                    Um total de <strong className="text-emerald-700 font-bold bg-emerald-500/20 px-2 py-1 rounded-md text-lg">{result.processed}</strong> torneios foram processados e cruzados com a grade.
                  </p>
                  {result.summary.length > 0 && (
                    <div className="space-y-2 pt-5 border-t border-emerald-500/20">
                      {result.summary.map((line, i) => (
                        <div key={i} className="text-[15px] text-muted-foreground flex gap-2 font-medium">
                          <span className="text-emerald-600 mt-0.5">•</span>
                          <span>{line}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="px-8 py-5 border-t border-border/50 bg-muted/30 dark:bg-muted/10 gap-3 sm:gap-0">
                <Button
                  variant="outline"
                  className="rounded-xl border-border/60 hover:bg-accent text-muted-foreground hover:text-foreground h-11"
                  onClick={() => { resetState(); }}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Nova Importação
                </Button>
                <Button
                  className="rounded-xl glow-primary bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold"
                  onClick={() => handleOpenChange(false)}
                >
                  Concluir
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </>
          ) : (
            /* ── Tela de Upload ────────────────────────────── */
            <form onSubmit={handleSubmit}>
              <div className="px-8 py-6 space-y-6">
                {/* Aviso Destacado */}
                <div className="flex items-start gap-4 p-5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent pointer-events-none" />
                  <AlertCircle className="w-6 h-6 text-orange-500 mt-0 shrink-0" />
                  <p className="text-[15px] font-medium leading-relaxed">
                    O nome da aba (Sheet) <strong className="text-orange-700 font-bold px-2 py-0.5 bg-orange-500/20 rounded-md mx-1">deve ser igual</strong> ao Nickname ou Nome do jogador cadastrado para que funcione corretamente.
                  </p>
                </div>

                {/* Dropzone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer select-none",
                    "min-h-[220px] px-6 py-8 group",
                    dragOver
                      ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(255,50,50,0.1)] scale-[1.02]"
                      : file
                      ? "border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/60"
                      : "border-border/60 bg-muted/40 hover:border-primary/40 hover:bg-muted/60"
                  )}
                >
                  <Input
                    ref={inputRef}
                    type="file"
                    name="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />

                  {file ? (
                    <>
                      <div className="flex flex-col items-center text-emerald-500 animate-scale-in">
                        <FileSpreadsheet className="h-16 w-16 mb-4 drop-shadow-[0_0_12px_theme(colors.emerald.500/0.4)]" />
                        <span className="font-semibold text-lg text-foreground text-center line-clamp-1 break-all px-6">{file.name}</span>
                        <span className="text-[15px] text-muted-foreground font-medium mt-2">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); resetState(); }}
                        className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <div className="p-4 rounded-full bg-background border border-border/50 shadow-sm mb-4 group-hover:scale-110 group-hover:border-primary/30 transition-all duration-300">
                        <UploadCloud
                          className={cn(
                            "h-8 w-8 transition-colors",
                            dragOver ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                          )}
                        />
                      </div>
                      <span className="font-semibold text-[15px] text-foreground/90 tracking-wide">
                        {dragOver ? "Solte o arquivo aqui" : "Clique ou arraste o arquivo"}
                      </span>
                      <span className="text-[13px] text-muted-foreground font-medium mt-1.5">
                        Arquivos suportados: .xlsx, .xls, .csv
                      </span>
                    </div>
                  )}
                </div>

                {/* Erro */}
                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 animate-fade-in shadow-inner">
                    <X className="h-4 w-4 text-destructive mt-0.5 shrink-0 drop-shadow-[0_0_5px_theme(colors.destructive.DEFAULT)]" />
                    <p className="text-[13px] text-destructive dark:text-red-200/90 font-medium leading-relaxed">{error}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="px-8 py-5 border-t border-border/50 bg-muted/30 dark:bg-muted/10 gap-3 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={loading}
                  className="rounded-xl border-border/60 hover:bg-accent text-muted-foreground hover:text-foreground font-medium h-11"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!file || loading}
                  className="rounded-xl glow-primary bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold min-w-[180px] shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      Processar Grades
                      <ChevronRight className="ml-2 h-4 w-4" />
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

