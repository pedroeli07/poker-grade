export function playerNicksCollectionPath(playerId: string): string {
  return `/api/players/${playerId}/nicks`;
}

export function playerNickItemPath(playerId: string, nickId: string): string {
  return `${playerNicksCollectionPath(playerId)}/${nickId}`;
}
