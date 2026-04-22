/**
 * Estilo das opções do quiz: após envio, se o usuário errou, não revela a alternativa correta
 * (sem destaque verde na resposta certa).
 */
export function getOnboardingOptionClass(
  isSelected: boolean,
  isOptionCorrect: boolean,
  showResult: boolean,
  questionAnsweredCorrectly: boolean,
): string {
  const base = "flex items-center gap-3 p-3 rounded-lg border transition-colors ";
  if (!showResult) {
    return base + (isSelected
      ? "bg-blue-50/80 border-primary/40 cursor-pointer"
      : "bg-card border-border hover:bg-muted/40 cursor-pointer");
  }
  if (questionAnsweredCorrectly) {
    if (isSelected && isOptionCorrect) return base + "bg-emerald-100 border-emerald-500 cursor-default";
    if (isSelected && !isOptionCorrect) return base + "bg-red-100 border-red-500 cursor-default";
    if (!isSelected && isOptionCorrect) {
      return base + "bg-emerald-50/80 border-emerald-300/80 cursor-default";
    }
    return base + "bg-card border-border opacity-60 cursor-default";
  }
  if (isSelected) return base + "bg-red-100 border-red-500 cursor-default";
  return base + "bg-card border-border opacity-60 cursor-default";
}
