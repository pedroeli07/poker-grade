export function playerDashboardOnGradePct(played: number, extraPlay: number): number | null {
  const total = played + extraPlay;
  return total > 0 ? Math.round((played / total) * 100) : null;
}
