import { DialogContent } from "@/components/ui/dialog";
import { MODAL_DIALOG_CONTENT_BASE, MODAL_DIALOG_SIZES } from "@/lib/constants/modals/modal-dialog-ui";
import { ModalDialogContentProps } from "@/lib/types/primitives";
import { memo } from "react";
import { cn } from "@/lib/utils";

const ModalDialogContent = memo(function ModalDialogContent({
    size = "lg",
    className,
    ...props
  }: ModalDialogContentProps) {
    const preset = MODAL_DIALOG_SIZES[size];
    return (
      <DialogContent
        className={cn(MODAL_DIALOG_CONTENT_BASE, preset, className)}
        {...props}
      />
    );
  })

  ModalDialogContent.displayName = "ModalDialogContent";

export default ModalDialogContent;