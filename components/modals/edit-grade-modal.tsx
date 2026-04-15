"use client";

import { memo } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ModalDialogContent from "@/components/modals/primitives/modal-dialog-content";
import ModalFormFooter from "@/components/modals/primitives/modal-form-footer";
import ModalGradientHeader from "@/components/modals/primitives/modal-gradient-header";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useEditGradeDialog } from "@/hooks/grades/use-edit-grade-dialog";

const EditGradeDialog = memo(function EditGradeDialog({
  gradeId,
  initialName,
  initialDescription,
  className,
}: {
  gradeId: string;
  initialName: string;
  initialDescription: string | null;
  className?: string;
}) {
  const {
    open,
    setOpen,
    name,
    setName,
    description,
    setDescription,
    pending,
    handleSave,
  } = useEditGradeDialog({ gradeId, initialName, initialDescription });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          title="Editar título e descrição"
          className={cn(
            "h-8 w-8 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity",
            className
          )}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <ModalDialogContent size="md">
        <ModalGradientHeader
          icon={Pencil}
          title="Editar grade"
          description="Atualize o título e a descrição deste perfil de grade."
          density="compact"
        />
        <Separator />
        <div className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor={`grade-name-${gradeId}`} className="text-[15px] font-medium">
              Título
            </Label>
            <Input
              id={`grade-name-${gradeId}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
              autoComplete="off"
              className="h-11 text-[15px] bg-muted/40 border-border/60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`grade-desc-${gradeId}`} className="text-[15px] font-medium">
              Descrição
            </Label>
            <Textarea
              id={`grade-desc-${gradeId}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={4}
              className="min-h-[100px] resize-y bg-muted/40 border-border/60 text-[15px]"
            />
          </div>
        </div>
        <ModalFormFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
            className="h-10 px-5 border-border/60"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 min-w-[120px]"
          >
            {pending ? "Salvando…" : "Salvar"}
          </Button>
        </ModalFormFooter>
      </ModalDialogContent>
    </Dialog>
  );
});

EditGradeDialog.displayName = "EditGradeDialog";

export default EditGradeDialog;
