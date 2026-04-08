"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateGradeProfile } from "@/app/dashboard/grades/actions";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useInvalidate } from "@/hooks/use-invalidate";

export function EditGradeDialog({
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
  const invalidateGrades = useInvalidate("grades");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(
    initialDescription?.trim() ?? ""
  );
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setDescription(initialDescription?.trim() ?? "");
  }, [open, initialName, initialDescription]);

  async function handleSave() {
    if (pending) return;
    setPending(true);
    try {
      const res = await updateGradeProfile(
        gradeId,
        name.trim(),
        description.trim() === "" ? null : description.trim()
      );
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Grade atualizada", initialName);
      setOpen(false);
      invalidateGrades();
    } catch {
      toast.error("Não foi possível salvar");
    } finally {
      setPending(false);
    }
  }

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar grade</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <Label htmlFor={`grade-name-${gradeId}`}>Título</Label>
            <Input
              id={`grade-name-${gradeId}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`grade-desc-${gradeId}`}>Descrição</Label>
            <Textarea
              id={`grade-desc-${gradeId}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={4}
              className="min-h-[100px] resize-y"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={pending}>
            {pending ? "Salvando…" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
