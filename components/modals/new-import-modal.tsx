"use client";

import { Dialog } from "@/components/ui/dialog";
import ModalDialogContent from "@/components/modals/primitives/modal-dialog-content";
import ModalFormFooter from "@/components/modals/primitives/modal-form-footer";
import ModalGradientHeader from "@/components/modals/primitives/modal-gradient-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, ChevronRight, X, RotateCcw, AlertCircle, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNewImportModal } from "@/hooks/imports/use-new-import-modal";
import { memo } from "react";

const NewImportModal = memo(function NewImportModal() {
  const {
    open,
    loading,
    file,
    error,
    result,
    dragOver,
    inputRef,
    handleOpenChange,
    handleFileChange,
    handleDrop,
    handleSubmit,
    resetState,
    openModal,
    onDragOver,
    onDragLeave,
  } = useNewImportModal();

  return (
    <>
      <Button
        className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 py-2 h-auto text-sm font-semibold transition-all hover:scale-[1.02]"
        onClick={openModal}
      >
        <Upload className="mr-2 h-4 w-4" />
        Nova Importação
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <ModalDialogContent size="importWide">
          <ModalGradientHeader
            icon={FileSpreadsheet}
            title="Nova Importação"
            description="Faça o upload do arquivo Excel Lobbyze contendo o histórico de torneios do jogador."
            variant="import"
          />

          {result ? (
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

              <ModalFormFooter className="px-8 py-5 border-t border-border/50 bg-muted/30 dark:bg-muted/10 gap-3 sm:gap-0">
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
              </ModalFormFooter>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="px-8 py-6 space-y-6">
                <div className="flex items-start gap-4 p-5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent pointer-events-none" />
                  <AlertCircle className="w-6 h-6 text-orange-500 mt-0 shrink-0" />
                  <p className="text-[15px] font-medium leading-relaxed">
                    O nome da aba (Sheet) <strong className="text-orange-700 font-bold px-2 py-0.5 bg-orange-500/20 rounded-md mx-1">deve ser igual</strong> ao Nickname ou Nome do jogador cadastrado para que funcione corretamente.
                  </p>
                </div>

                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
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

                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 animate-fade-in shadow-inner">
                    <X className="h-4 w-4 text-destructive mt-0.5 shrink-0 drop-shadow-[0_0_5px_theme(colors.destructive.DEFAULT)]" />
                    <p className="text-[13px] text-destructive dark:text-red-200/90 font-medium leading-relaxed">{error}</p>
                  </div>
                )}
              </div>

              <ModalFormFooter className="px-8 py-5 border-t border-border/50 bg-muted/30 dark:bg-muted/10 gap-3 sm:gap-0">
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
              </ModalFormFooter>
            </form>
          )}
        </ModalDialogContent>
      </Dialog>
    </>
  );
});

NewImportModal.displayName = "NewImportModal";

export default NewImportModal;
