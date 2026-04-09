import { Button } from "@/components/ui/button";
import { Check, X, Edit2, Trash2, Loader2 } from "lucide-react";

export function UserActions({
  editing,
  disabled,
  onSave,
  onCancel,
  onEdit,
  onOpenDelete,
}: {
  editing: boolean;
  disabled: boolean;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onOpenDelete: () => void;
}) {
  return editing ? (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-primary"
        onClick={onSave}
        disabled={disabled}
      >
        {disabled ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-muted-foreground"
        onClick={onCancel}
        disabled={disabled}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  ) : (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
        onClick={onEdit}
        disabled={disabled}
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
        onClick={onOpenDelete}
        disabled={disabled}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}