"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { canEditOpponentNote } from "@/lib/utils/auth-permissions";
import type { AppSession } from "@/lib/types/auth";
import type { OpponentClassification, OpponentStyle } from "@prisma/client";
import { normalizeOpponentNickKey } from "./opponent-nick";

function computeConsolidated(
  notes: Array<{ classification: OpponentClassification | null; style: OpponentStyle | null }>
) {
  const classificationCounts: Record<string, number> = {};
  const styleCounts: Record<string, number> = {};
  for (const n of notes) {
    if (n.classification) classificationCounts[n.classification] = (classificationCounts[n.classification] ?? 0) + 1;
    if (n.style) styleCounts[n.style] = (styleCounts[n.style] ?? 0) + 1;
  }

  const mode = (counts: Record<string, number>) => {
    const entries = Object.entries(counts);
    if (entries.length === 0) return { value: null, tie: false } as const;
    const max = Math.max(...entries.map(([, c]) => c));
    const winners = entries.filter(([, c]) => c === max);
    return { value: winners[0][0], tie: winners.length > 1 } as const;
  };

  const cls = mode(classificationCounts);
  const sty = mode(styleCounts);
  const notesUsed = notes.length;
  const confidence: "low" | "medium" | "high" = notesUsed >= 6 ? "high" : notesUsed >= 3 ? "medium" : "low";

  return {
    classification: (cls.value as OpponentClassification | null) ?? null,
    classificationTie: cls.tie,
    classificationCounts,
    style: (sty.value as OpponentStyle | null) ?? null,
    styleTie: sty.tie,
    styleCounts,
    confidence,
    notesUsed,
  };
}

export async function listOpponentsForSession(session: AppSession) {
  const grouped = await prisma.opponentNote.groupBy({
    by: ["network", "nickKey"],
    where: { deletedAt: null },
    _count: { _all: true },
    _max: { createdAt: true, nick: true },
    orderBy: { _max: { createdAt: "desc" } },
  });

  const rows = await Promise.all(
    grouped.map(async (g) => {
      const notes = await prisma.opponentNote.findMany({
        where: { network: g.network, nickKey: g.nickKey, deletedAt: null },
        select: {
          id: true,
          authorId: true,
          classification: true,
          style: true,
          nick: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
      const editableNoteId =
        notes.find((n) => canEditOpponentNote(session, n.authorId))?.id ?? null;
      return {
        network: g.network,
        nick: notes[0]?.nick ?? g.nickKey,
        nickKey: g.nickKey,
        notesCount: notes.length,
        lastNoteAt: notes[0]?.createdAt ?? new Date(),
        consolidated: computeConsolidated(notes),
        editableNoteId,
      };
    })
  );

  return rows;
}

/** Uma nota para edição (autor ou ADMIN). */
export async function getOpponentNoteByIdForEdit(id: string) {
  const session = await requireSession();
  const note = await prisma.opponentNote.findUnique({
    where: { id },
    include: { author: { select: { displayName: true, email: true } } },
  });
  if (!note || note.deletedAt) return null;
  if (!canEditOpponentNote(session, note.authorId)) return null;
  return {
    id: note.id,
    network: note.network,
    nick: note.nick,
    body: note.body,
    classification: note.classification,
    style: note.style,
    authorId: note.authorId,
    authorName: note.author?.displayName ?? null,
    authorEmail: note.author?.email ?? "",
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

export async function getOpponentDetailForSession(
  session: AppSession,
  network: string,
  nick: string
) {
  void session;
  const nickKey = normalizeOpponentNickKey(nick);
  const notes = await prisma.opponentNote.findMany({
    where: { network, nickKey, deletedAt: null },
    include: { author: { select: { id: true, displayName: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const displayNick = notes[0]?.nick ?? nick;
  return {
    network,
    nick: displayNick,
    notes,
    consolidated: computeConsolidated(
      notes.map((n) => ({ classification: n.classification, style: n.style }))
    ),
  };
}
