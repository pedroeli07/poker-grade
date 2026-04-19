"use client";

import { Dialog } from "@/components/ui/dialog";
import ModalDialogContent from "@/components/modals/primitives/modal-dialog-content";
import ModalFormFooter from "@/components/modals/primitives/modal-form-footer";
import ModalGradientHeader from "./primitives/modal-gradient-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FileJson, ChevronRight, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useImportGradeModal } from "@/hooks/grades/use-import-grade-modal";
import { memo } from "react";

const ImportGradeModal = memo(function ImportGradeModal() {
  const {
    open,
    isPending,
    file,
    dragOver,
    error,
    inputRef,
    formRef,
    handleOpenChange,
    handleFileChange,
    handleDrop,
    handleSubmit,
    resetState,
    openModal,
    onDragOver,
    onDragLeave,
  } = useImportGradeModal();

  return (
    <>
      <Button
        variant="outline"
        className="border-border hover:bg-sidebar-accent h-11 px-5 text-[15px] bg-blue-500/10"
        onClick={openModal}
      >
        <FileJson className="mr-2 h-5 w-5" />
        Importar JSON
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <ModalDialogContent
          style={{ maxHeight: '100vh', display: 'flex', flexDirection: 'column' }}
        >
          <ModalGradientHeader
            icon={FileJson}
            title="Importar Grade (Lobbyze)"
            description="Faça upload do arquivo JSON exportado da Lobbyze."
          />

          <Separator />

          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="px-7 py-6 space-y-6 flex-1 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="import-grade-name" className="text-[15px] font-medium">
                  Nome da Grade <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="import-grade-name"
                  name="name"
                  required
                  placeholder="Ex: Grade $11–$30 Regular"
                  className="h-12 text-[15px] bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 transition-colors"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="import-grade-desc" className="text-[15px] font-medium">
                  Descrição
                </Label>
                <Textarea
                  id="import-grade-desc"
                  name="description"
                  placeholder="Cole regras gerais, limites de reentrada, formatos permitidos, etc."
                  rows={6}
                  maxLength={2000}
                  className="min-h-[120px] max-h-[40vh] bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 transition-colors resize-y text-[15px] leading-relaxed"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[15px] font-medium">
                  Arquivo JSON <span className="text-destructive">*</span>
                </Label>

                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none min-h-[160px] px-6 py-7",
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
                      <FileJson className="h-12 w-12 mb-3 text-emerald-500 drop-shadow-[0_0_8px_theme(colors.emerald.500/0.4)]" />
                      <span className="font-medium text-base text-foreground">{file.name}</span>
                      <span className="text-[14px] text-muted-foreground mt-1.5">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); resetState(); }}
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className={cn("h-10 w-10 mb-3 transition-colors", dragOver ? "text-primary" : "text-muted-foreground")} />
                      <span className="font-medium text-base text-foreground/80">
                        {dragOver ? "Solte o arquivo aqui" : "Clique ou arraste o JSON"}
                      </span>
                      <span className="text-[14px] text-muted-foreground mt-1.5">Apenas arquivos .json suportados</span>
                    </>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <X className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                  <p className="text-[15px] text-destructive font-medium">{error}</p>
                </div>
              )}
            </div>

            <Separator />

            <ModalFormFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="border-border/60 h-11 px-5 text-[15px]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!file || isPending}
                className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 min-w-[160px] text-[15px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    Importar Grade
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </ModalFormFooter>
          </form>
        </ModalDialogContent>
      </Dialog>
    </>
  );
});

ImportGradeModal.displayName = "ImportGradeModal";

export default ImportGradeModal;

