import { DialogFooter } from "@/components/ui/dialog";
import { MODAL_FORM_FOOTER_BASE } from "@/lib/constants/modals/modal-dialog-ui";
import { ModalFormFooterProps } from "@/lib/types/modalPrimitives";
import { cn } from "@/lib/utils";
import { memo } from "react";

const ModalFormFooter = memo(function ModalFormFooter({ children, className }: ModalFormFooterProps) {
    return (
      <DialogFooter className={cn(MODAL_FORM_FOOTER_BASE, className)}>
        {children}
      </DialogFooter>
    );
  })

ModalFormFooter.displayName = "ModalFormFooter";

export default ModalFormFooter;
  