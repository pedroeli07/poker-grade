import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import ModalDialogContent from "@/components/modals/primitives/modal-dialog-content";
import ModalGradientHeader from "@/components/modals/primitives/modal-gradient-header";
import { Separator } from "@/components/ui/separator";
import { Plus, Grid3X3, ChevronRight, Loader2 } from "lucide-react";
import { useNewGradeModal } from "@/hooks/grades/use-new-grade-modal";
import ModalFormFooter from "./primitives/modal-form-footer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const NewGradeModal = memo(function NewGradeModal() {
    const { open, isPending, formRef, handleOpenChange, handleSubmit, openModal } =
      useNewGradeModal();

    return (
      <>
        <Button
          className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-5 text-[15px]"
          onClick={openModal}
        >
          <Plus className="mr-2 h-5 w-5" />
          Nova Grade
        </Button>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <ModalDialogContent
            style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
          >
            <ModalGradientHeader
              icon={Grid3X3}
              title="Nova Grade"
              description="Crie um perfil de grade. Depois atribua a jogadores pela página Jogadores."
            />

            <Separator />

            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="px-7 py-6 space-y-6 flex-1 overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="new-grade-name" className="text-[15px] font-medium">
                    Nome da Grade <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="new-grade-name"
                    name="name"
                    required
                    minLength={2}
                    maxLength={200}
                    placeholder="Ex: PKO $11–$30 Low Stakes"
                    className="h-12 text-[15px] bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 transition-colors"
                    disabled={isPending}
                  />
                </div>
  
                <div className="space-y-2">
                  <Label htmlFor="new-grade-desc" className="text-[15px] font-medium">
                    Descrição
                  </Label>
                  <Textarea
                    id="new-grade-desc"
                    name="description"
                    placeholder="Descreva os torneios desta grade, limites de buy-in, formatos..."
                    rows={6}
                    maxLength={2000}
                    className="min-h-[120px] max-h-[40vh] bg-muted/40 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/20 resize-y text-[15px] leading-relaxed"
                    disabled={isPending}
                  />
                </div>
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
                  disabled={isPending}
                  className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 min-w-[140px] text-[15px]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      Criar Grade
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
  })
  
  NewGradeModal.displayName = "NewGradeModal";
  
  export default NewGradeModal;