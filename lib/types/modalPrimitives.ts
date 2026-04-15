import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { MODAL_DIALOG_SIZES } from "@/lib/constants/modals/modal-dialog-ui";

export type ModalDialogSize = keyof typeof MODAL_DIALOG_SIZES;

export type ModalDensity = "comfortable" | "compact";

export type ModalHeaderVariant = "standard" | "import";

export type ModalGradientHeaderProps = {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  density?: ModalDensity;
  variant?: ModalHeaderVariant;
  className?: string;
};

export type ModalFormFooterProps = {
  children: ReactNode;
  className?: string;
};

/** Props extra de `ModalDialogContent` (combinar com `ComponentProps<typeof DialogContent>` na UI). */
export type ModalDialogContentOwnProps = {
  size?: ModalDialogSize;
};
