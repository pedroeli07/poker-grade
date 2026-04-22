"use client";

import type { PlayerStatus } from "@prisma/client";
import { useCallback, useMemo, useState, type SubmitEvent } from "react";
import { updatePlayer } from "@/lib/queries/db/player/update-mutations";
import { toast } from "@/lib/toast";
import { useInvalidate } from "@/hooks/use-invalidate";
import { type CoachOpt, type GradeOpt, ErrorTypes } from "@/lib/types/primitives";
import type { PlayerTableRow, PlayerNickFormRow } from "@/lib/types/player/index";
import { NONE } from "@/lib/constants/sharkscope/ui";
import {
  PLAYER_MODAL_ABI_UNIT_NONE,
  PLAYER_MODAL_SELECT_NONE,
} from "@/lib/constants/modals";
import { appendEmptyNickRow, removeNickRowAt, updateNickNetworkAt, updateNickValueAt } from "@/lib/utils/player";
function initialAbiUnit(u: string | null | undefined): string {
  const t = u?.trim();
  if (!t) return PLAYER_MODAL_ABI_UNIT_NONE;
  if (t === "$" || t === "â‚¬" || t === "Â¥") return t;
  return PLAYER_MODAL_ABI_UNIT_NONE;
}

export function useEditPlayerModalForm({
  player,
  coaches,
  grades,
  isPending,
  startTransition,
  onClose,
}: {
  player: PlayerTableRow;
  coaches: CoachOpt[];
  grades: GradeOpt[];
  isPending: boolean;
  startTransition: (fn: () => void) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(player.name);
  const [playerGroup, setPlayerGroup] = useState(player.playerGroup ?? "");
  const [nicks, setNicks] = useState<PlayerNickFormRow[]>(() =>
    (player.nicks ?? []).filter((n) => n.network !== "PlayerGroup")
  );
  const [coachId, setCoachId] = useState(
    player.coachKey === NONE ? PLAYER_MODAL_SELECT_NONE : player.coachKey
  );
  const [mainGradeId, setMainGradeId] = useState(
    player.gradeKey === NONE ? PLAYER_MODAL_SELECT_NONE : player.gradeKey
  );
  const [abiAlvoValue, setAbiAlvoValue] = useState(
    player.abiNumericValue != null ? String(player.abiNumericValue) : ""
  );
  const [abiAlvoUnit, setAbiAlvoUnit] = useState(() => initialAbiUnit(player.abiUnit));
  const [status, setStatus] = useState<PlayerStatus>(player.status);
  const invalidatePlayers = useInvalidate("players");
  const formDisabled = isPending;

  const gradeOptions = useMemo(() => {
    const list = [...grades];
    if (
      player.gradeKey !== NONE &&
      !list.some((g) => g.id === player.gradeKey)
    ) {
      list.push({ id: player.gradeKey, name: player.gradeLabel });
    }
    return list;
  }, [grades, player.gradeKey, player.gradeLabel]);

  const handleSubmit = useCallback(
    (e: SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const payload: Record<string, string> = {
        id: player.id,
        name: name.trim(),
        coachId,
        mainGradeId,
        abiAlvoValue,
        abiAlvoUnit,
        status,
        playerGroup: playerGroup.trim(),
        nicksData: JSON.stringify(nicks),
      };
      for (const [key, value] of Object.entries(payload)) {
        formData.set(key, value);
      }

      startTransition(() => {
        void (async () => {
          try {
            await updatePlayer(formData);
            toast.success("Jogador atualizado", "As alterações foram salvas com sucesso.");
            onClose();
            setTimeout(() => {
              invalidatePlayers();
            }, 0);
          } catch (err) {
            const msg =
              err instanceof Error && err.message === ErrorTypes.FORBIDDEN
                ? "Sem permissão para editar este jogador."
                : err instanceof Error && err.message
                  ? err.message
                  : "Verifique os dados e tente novamente.";
            toast.error("Erro ao atualizar", msg);
          }
        })();
      });
    },
    [
      player.id,
      name,
      coachId,
      mainGradeId,
      abiAlvoValue,
      abiAlvoUnit,
      status,
      playerGroup,
      nicks,
      startTransition,
      onClose,
      invalidatePlayers,
    ]
  );

  const setNickNetwork = useCallback((index: number, network: string) => {
    setNicks((prev) => updateNickNetworkAt(prev, index, network));
  }, []);

  const setNickValue = useCallback((index: number, nick: string) => {
    setNicks((prev) => updateNickValueAt(prev, index, nick));
  }, []);

  const removeNick = useCallback((index: number) => {
    setNicks((prev) => removeNickRowAt(prev, index));
  }, []);

  const addNick = useCallback(() => {
    setNicks((prev) => appendEmptyNickRow(prev));
  }, []);

  return {
    coaches,
    gradeOptions,
    name,
    setName,
    playerGroup,
    setPlayerGroup,
    nicks,
    coachId,
    setCoachId,
    mainGradeId,
    setMainGradeId,
    abiAlvoValue,
    setAbiAlvoValue,
    abiAlvoUnit,
    setAbiAlvoUnit,
    status,
    setStatus,
    formDisabled,
    handleSubmit,
    setNickNetwork,
    setNickValue,
    removeNick,
    addNick,
  };
}

