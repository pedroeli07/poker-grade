/**
 * Classes Tailwind reutilizáveis para cards interativos (hover).
 * Importe: `import { cardHoverLift } from "@/lib/constants/interactive-card"`
 * e use: `className={cn("rounded-2xl border ...", cardHoverLift)}`
 *
 * Os stat cards de **Meus Torneios** e **Rituais** aplicam isso em `PlayerTourneyStatCard`.
 */

/**
 * Transição de hover: mais longa e ease-in-out para movimento e sombra suaves.
 * Sombra base/animação extra em cards neutros: use `cardHoverLiftShadow`.
 */
export const cardHoverLift =
  "will-change-transform transition-[transform,box-shadow] duration-500 ease-in-out motion-reduce:duration-0 motion-reduce:transition-none hover:-translate-y-0.5 motion-reduce:hover:translate-y-0";

/**
 * Cards neutros (`bg-card`): sombra visível no repouso e mais forte no hover.
 * Stat cards com tom usam `STAT_CARD_TONES` + `cardHoverLift` (sombras de cor vêm dali + `cardHover`).
 */
export const cardHoverLiftShadow = `${cardHoverLift} shadow-[0_8px_28px_rgba(15,23,42,0.1),0_2px_8px_rgba(15,23,42,0.05)] dark:shadow-[0_8px_28px_rgba(0,0,0,0.32),0_2px_8px_rgba(0,0,0,0.15)] hover:shadow-[0_18px_48px_rgba(15,23,42,0.16),0_6px_16px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.45),0_8px_20px_rgba(0,0,0,0.2)]`;
