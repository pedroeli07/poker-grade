"use client";

import { useState, useTransition, useRef } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  FileJson,
  Grid3X3,
  ChevronRight,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { createGradeProfile, importGradeFromJson } from "@/app/dashboard/grades/actions";
import { toast } from "@/lib/toast";
import { createLogger } from "@/lib/logger";
import { cn } from "@/lib/utils";

const log = createLogger("grade-modals");

/* ─────────────────────────────────────────────────────────
   MODAL: Nova Grade (só nome + descrição)
───────────────────────────────────────────────────────── */
export function NewGradeModal() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function handleOpenChange(value: boolean) {
    if (isPending) return;
    setOpen(value);
    if (!value) setTimeout(() => formRef.current?.reset(), 150);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const result = await createGradeProfile(formData);
        toast.success("Grade criada!", "Importe um JSON Lobbyze para adicionar regras.");
        handleOpenChange(false);
        router.push(`/dashboard/grades/${result.id}`);
      } catch (err) {
        toast.error("Erro ao criar grade", err instanceof Error ? err.message : "Tente novamente.");
      }
    });
  }

  return (
    <>
      <Button
        className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={() => setOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Nova Grade
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="px-7 pt-7 pb-5 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                <Grid3X3 className="h-5 w-5 text-primary" />
              </div>
              <DialogHeader className="space-y-0.5">
                <DialogTitle className="text-lg font-semibold">Nova Grade</DialogTitle>
                <DialogDescription className="text-sm">
                  Crie um perfil de grade. Regras podem ser importadas via JSON.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <Separator />

          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="px-7 py-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="new-grade-name" className="text-sm font-medium">
                  Nome da Grade <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="new-grade-name"
                  name="name"
                  required
                  minLength={2}
                  maxLength={200}
                  placeholder="Ex: PKO $11–$30 Low Stakes"
                  className="h-10 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 transition-colors"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-grade-desc" className="text-sm font-medium">
                  Descrição
                </Label>
                <Textarea
                  id="new-grade-desc"
                  name="description"
                  placeholder="Descreva os torneios desta grade, limites de buy-in, formatos..."
                  rows={3}
                  maxLength={2000}
                  className="bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 resize-none"
                  disabled={isPending}
                />
              </div>
            </div>

            <Separator />

            <DialogFooter className="px-7 py-5 border-t-0 bg-muted/20 rounded-none">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="border-border/60 h-10 px-5"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 min-w-[140px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    Criar Grade
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   MODAL: Importar Grade JSON (Lobbyze)
───────────────────────────────────────────────────────── */
export function ImportGradeModal() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function resetState() {
    setFile(null);
    setError(null);
    setDragOver(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleOpenChange(value: boolean) {
    if (isPending) return;
    setOpen(value);
    if (!value) setTimeout(() => { formRef.current?.reset(); resetState(); }, 150);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".json")) {
      setError("Apenas arquivos .json são suportados.");
      return;
    }
    setFile(f);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        log.info("Iniciando import JSON da grade", { fileName: file.name });
        const text = await file.text();
        formData.append("jsonContent", text);
        await importGradeFromJson(formData);
        toast.success("Grade importada!", "Filtros Lobbyze convertidos em regras.");
        handleOpenChange(false);
        router.refresh();
        router.push("/dashboard/grades");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido ao importar JSON";
        log.error("Erro na importação JSON", err instanceof Error ? err : undefined);
        setError(msg);
        toast.error("Não foi possível importar", msg);
      }
    });
  }

  return (
    <>
      <Button
        variant="outline"
        className="border-border hover:bg-sidebar-accent"
        onClick={() => setOpen(true)}
      >
        <FileJson className="mr-2 h-4 w-4" />
        Importar JSON
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="px-7 pt-7 pb-5 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                <FileJson className="h-5 w-5 text-primary" />
              </div>
              <DialogHeader className="space-y-0.5">
                <DialogTitle className="text-lg font-semibold">Importar Grade (Lobbyze)</DialogTitle>
                <DialogDescription className="text-sm">
                  Faça upload do arquivo JSON exportado da Lobbyze.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <Separator />

          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="px-7 py-6 space-y-5">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="import-grade-name" className="text-sm font-medium">
                  Nome da Grade <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="import-grade-name"
                  name="name"
                  required
                  placeholder="Ex: Grade $11–$30 Regular"
                  className="h-10 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 transition-colors"
                  disabled={isPending}
                />
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="import-grade-desc" className="text-sm font-medium">
                  Descrição
                </Label>
                <Input
                  id="import-grade-desc"
                  name="description"
                  placeholder="Ex: Grade principal para alunos do ABI 20"
                  className="h-10 bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 transition-colors"
                  disabled={isPending}
                />
              </div>

              {/* Dropzone */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Arquivo JSON <span className="text-destructive">*</span>
                </Label>

                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none min-h-[140px] px-6 py-7",
                    dragOver
                      ? "border-primary bg-primary/10 scale-[1.01]"
                      : file
                      ? "border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10"
                      : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-primary/5"
                  )}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isPending}
                  />

                  {file ? (
                    <>
                      <FileJson className="h-10 w-10 mb-2.5 text-emerald-500 drop-shadow-[0_0_8px_theme(colors.emerald.500/0.4)]" />
                      <span className="font-medium text-sm text-foreground">{file.name}</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); resetState(); }}
                        className="absolute top-2.5 right-2.5 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className={cn("h-9 w-9 mb-2.5 transition-colors", dragOver ? "text-primary" : "text-muted-foreground")} />
                      <span className="font-medium text-sm text-foreground/80">
                        {dragOver ? "Solte o arquivo aqui" : "Clique ou arraste o JSON"}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">Apenas arquivos .json suportados</span>
                    </>
                  )}
                </div>
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

            <DialogFooter className="px-7 py-5 border-t-0 bg-muted/20 rounded-none">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="border-border/60 h-10 px-5"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!file || isPending}
                className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 min-w-[150px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    Importar Grade
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
