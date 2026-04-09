export interface DashboardStats {
  totalPlayers: number;
  activePlayers: number;
  pendingReviews: number;
  totalTournaments: number;
  inGradePercentage: number;
  suspectCount: number;
  outOfGradeCount: number;
  recentInfractions: number;
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
}
