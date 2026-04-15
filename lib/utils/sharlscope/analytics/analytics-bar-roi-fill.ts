/** Cor da barra por ROI % (alinhado ao gráfico por métrica quando métrica = ROI). */
export function analyticsBarRoiFillByPercent(roi: number): string {
  if (roi >= 5) return "#16a34a";
  if (roi >= 0) return "#22c55e";
  if (roi >= -20) return "#ca8a04";
  return "#dc2626";
}
