"use client";

import {
  useCallback,
  useRef,
  useState,
  useTransition,
  type ComponentProps,
} from "react";

type FormOnSubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];
import { useRouter } from "next/navigation";
import { createPlayer } from "@/lib/queries/db/player/create-mutations";
import { toast } from "@/lib/toast";
import { useInvalidate } from "@/hooks/use-invalidate";
import type { NewPlayerModalProps, PlayerNickFormRow } from "@/lib/types/player/index";
import { MODAL_DIALOG_CLOSE_RESET_MS } from "@/lib/constants/modals";
import {
  PLAYER_MODAL_ABI_UNIT_NONE,
  PLAYER_MODAL_SELECT_NONE,
} from "@/lib/constants/modals";
import {
  appendEmptyNickRow,
  removeNickRowAt,
  updateNickNetworkAt,
  updateNickValueAt,
} from "@/lib/utils/player";

export function useNewPlayerModal({ coaches, grades }: NewPlayerModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [coachId, setCoachId] = useState<string>(PLAYER_MODAL_SELECT_NONE);
  const [mainGradeId, setMainGradeId] = useState<string>(PLAYER_MODAL_SELECT_NONE);
  const [abiAlvoValue, setAbiAlvoValue] = useState("");
  const [abiAlvoUnit, setAbiAlvoUnit] = useState<string>(PLAYER_MODAL_ABI_UNIT_NONE);
  const [nicks, setNicks] = useState<PlayerNickFormRow[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const invalidatePlayers = useInvalidate("players");

  const resetAfterClose = useCallback(() => {
    formRef.current?.reset();
    setCoachId(PLAYER_MODAL_SELECT_NONE);
    setMainGradeId(PLAYER_MODAL_SELECT_NONE);
    setAbiAlvoValue("");
    setAbiAlvoUnit(PLAYER_MODAL_ABI_UNIT_NONE);
    setNicks([]);
  }, []);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (isPending) return;
      setOpen(value);
      if (!value) setTimeout(resetAfterClose, MODAL_DIALOG_CLOSE_RESET_MS);
    },
    [isPending, resetAfterClose]
  );

  const handleSubmit = useCallback(
    (e: FormOnSubmitEvent) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      formData.set("coachId", coachId);
      formData.set("mainGradeId", mainGradeId);
      formData.set("abiAlvoValue", abiAlvoValue);
      formData.set("abiAlvoUnit", abiAlvoUnit);
      formData.set("nicksData", JSON.stringify(nicks));

      startTransition(async () => {
        try {
          await createPlayer(formData);
          toast.success("Jogador criado!", "O jogador foi adicionado ao time com sucesso.");
          handleOpenChange(false);
          invalidatePlayers();
          router.refresh();
        } catch (err) {
          const msg =
            err instanceof Error && err.message
              ? err.message
              : "Verifique os dados e tente novamente.";
          toast.error("Erro ao criar jogador", msg);
        }
      });
    },
    [
      coachId,
      mainGradeId,
      abiAlvoValue,
      abiAlvoUnit,
      nicks,
      startTransition,
      handleOpenChange,
      invalidatePlayers,
      router,
    ]
  );

  const openModal = useCallback(() => setOpen(true), []);

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
    grades,
    open,
    isPending,
    formRef,
    coachId,
    setCoachId,
    mainGradeId,
    setMainGradeId,
    abiAlvoValue,
    setAbiAlvoValue,
    abiAlvoUnit,
    setAbiAlvoUnit,
    nicks,
    handleOpenChange,
    handleSubmit,
    openModal,
    setNickNetwork,
    setNickValue,
    removeNick,
    addNick,
  };
}
