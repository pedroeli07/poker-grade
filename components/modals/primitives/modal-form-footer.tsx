import { DialogFooter } from "@/components/ui/dialog";
import { MODAL_FORM_FOOTER_BASE } from "@/lib/constants/modals";
import { ModalFormFooterProps } from "@/lib/types/primitives";
import { cn } from "@/lib/utils/cn";
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
  