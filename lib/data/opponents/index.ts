import { requireSession } from "@/lib/auth/session";
import {
  listOpponentsForSession,
  getOpponentDetailForSession,
} from "@/lib/queries/db/opponent/reads";
import {
  canCreateOpponentNote,
  canEditOpponentNote,
} from "@/lib/utils/auth-permissions";
import type {
  OpponentsListPageProps,
  OpponentDetailProps,
  OpponentNoteRow,
} from "@/lib/types/opponent";

export async function getOpponentsListPageProps(): Promise<OpponentsListPageProps> {
  const session = await requireSession();
  const rows = await listOpponentsForSession(session);
  return { rows, canCreate: canCreateOpponentNote(session) };
}

export async function getOpponentDetailPageProps(
  network: string,
  nick: string,
): Promise<OpponentDetailProps> {
  const session = await requireSession();
  const detail = await getOpponentDetailForSession(session, network, nick);

  const notes: OpponentNoteRow[] = detail.notes.map((n) => ({
    id: n.id,
    network: n.network,
    nick: n.nick,
    body: n.body,
    classification: n.classification,
    style: n.style,
    authorId: n.authorId,
    authorName: n.author?.displayName ?? null,
    authorEmail: n.author?.email ?? "",
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
    canEdit: canEditOpponentNote(session, n.authorId),
  }));

  return {
    network: detail.network,
    nick: detail.nick,
    notes,
    consolidated: detail.consolidated,
    canCreate: canCreateOpponentNote(session),
  };
}
