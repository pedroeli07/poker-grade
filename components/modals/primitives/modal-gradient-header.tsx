import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MODAL_IMPORT_HEADER_RULE } from "@/lib/constants";
import { ModalGradientHeaderProps } from "@/lib/types/modalPrimitives";
import { 
    modalGradientHeaderBlockClass, 
    modalGradientHeaderTitleClass, 
    modalGradientHeaderIconClass, 
    modalGradientHeaderIconWrapClass, 
    modalGradientHeaderRowClass, 
    modalGradientHeaderShellClass,
    modalGradientHeaderDescriptionClass } from "@/lib/utils/modal-gradient-header-classes";
import { memo } from "react";

const ModalGradientHeader = memo(function ModalGradientHeader({
    icon: Icon,
    title,
    description,
    density = "comfortable",
    variant = "standard",
    className,
  }: ModalGradientHeaderProps) {
    const isImport = variant === "import";
  
    return (
      <div className={modalGradientHeaderShellClass(density, variant, className)}>
        <div className={modalGradientHeaderRowClass(density, variant)}>
          <div className={modalGradientHeaderIconWrapClass(density, variant)}>
            <Icon className={modalGradientHeaderIconClass(density)} />
          </div>
          <DialogHeader className={modalGradientHeaderBlockClass(density)}>
            <DialogTitle className={modalGradientHeaderTitleClass(density, variant)}>
              {title}
            </DialogTitle>
            {description != null ? (
              <DialogDescription
                className={modalGradientHeaderDescriptionClass(density, variant)}
              >
                {description}
              </DialogDescription>
            ) : null}
          </DialogHeader>
        </div>
        {isImport ? <div className={MODAL_IMPORT_HEADER_RULE} /> : null}
      </div>
    );
  })

ModalGradientHeader.displayName = "ModalGradientHeader";

export default ModalGradientHeader; 