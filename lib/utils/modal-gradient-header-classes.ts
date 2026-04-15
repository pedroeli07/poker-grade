import { cn } from "@/lib/utils";
import type { ModalDensity, ModalHeaderVariant } from "@/lib/types/modalPrimitives";

function flags(density: ModalDensity, variant: ModalHeaderVariant) {
  return {
    isImport: variant === "import",
    isCompact: density === "compact",
  };
}

export function modalGradientHeaderShellClass(
  density: ModalDensity,
  variant: ModalHeaderVariant,
  className?: string
): string {
  const { isImport, isCompact } = flags(density, variant);
  return cn(
    "relative bg-gradient-to-b",
    isImport
      ? "px-8 pt-8 pb-6 from-primary/5 via-primary/[0.02] to-transparent"
      : isCompact
        ? "px-6 pt-6 pb-5 from-primary/5 to-transparent"
        : "px-7 pt-7 pb-5 from-primary/5 to-transparent",
    className
  );
}

export function modalGradientHeaderRowClass(
  density: ModalDensity,
  variant: ModalHeaderVariant
): string {
  const { isImport, isCompact } = flags(density, variant);
  return cn(
    "flex gap-4",
    isCompact ? "items-center gap-3" : isImport ? "items-start" : "items-center"
  );
}

export function modalGradientHeaderIconWrapClass(
  density: ModalDensity,
  variant: ModalHeaderVariant
): string {
  const { isImport, isCompact } = flags(density, variant);
  return cn(
    "flex items-center justify-center shrink-0 rounded-xl bg-primary/10 border border-primary/20",
    isImport &&
      "rounded-2xl shadow-[0_0_15px_rgba(255,50,50,0.1)] ring-1 ring-primary/5 transition-all",
    isCompact ? "h-9 w-9 rounded-lg" : "h-12 w-12"
  );
}

export function modalGradientHeaderIconClass(
  density: ModalDensity
): string {
  return cn("text-primary", density === "compact" ? "h-4 w-4" : "h-6 w-6");
}

export function modalGradientHeaderBlockClass(density: ModalDensity): string {
  return cn("text-left", density === "compact" ? "space-y-0.5" : "space-y-1");
}

export function modalGradientHeaderTitleClass(
  density: ModalDensity,
  variant: ModalHeaderVariant
): string {
  const { isImport, isCompact } = flags(density, variant);
  return cn(
    isImport && "text-2xl font-black tracking-tight",
    !isImport && !isCompact && "text-xl font-semibold",
    isCompact && "text-base font-semibold"
  );
}

export function modalGradientHeaderDescriptionClass(
  density: ModalDensity,
  variant: ModalHeaderVariant
): string {
  const { isImport, isCompact } = flags(density, variant);
  return cn(
    isImport && "text-base text-muted-foreground/90 leading-relaxed font-medium",
    !isImport && !isCompact && "text-[15px]",
    isCompact && "text-xs"
  );
}
