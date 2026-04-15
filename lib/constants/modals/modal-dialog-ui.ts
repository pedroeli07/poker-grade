/** Shell do `DialogContent` em modais de formulário — secções aplicam padding próprio. */
export const MODAL_DIALOG_CONTENT_BASE = "p-0 gap-0 overflow-hidden";

export const MODAL_DIALOG_SIZES = {
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-3xl",
  /** Nova importação — card mais largo e com blur */
  importWide:
    "sm:max-w-[540px] font-sans border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl rounded-2xl",
} as const;

/** Footer padrão de modais com formulário */
export const MODAL_FORM_FOOTER_BASE =
  "px-7 py-5 border-t-0 bg-muted/20 rounded-none";

/** Linha decorativa sob o header do modal de importação */
export const MODAL_IMPORT_HEADER_RULE =
  "absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent";

/** Atraso antes de resetar formulário ao fechar (animação do Dialog). */
export const MODAL_DIALOG_CLOSE_RESET_MS = 150;
