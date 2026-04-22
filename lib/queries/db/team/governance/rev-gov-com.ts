import { TEAM_PATH } from "@/lib/constants/team/paths";
import { revalidateTeamPaths } from "@/lib/queries/db/team/revalidate-paths";

export function revalidateDecisionsMural() {
  revalidateTeamPaths(TEAM_PATH.governance);
}
