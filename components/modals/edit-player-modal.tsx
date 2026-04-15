"use client";

import { memo } from "react";
import { Dialog } from "@/components/ui/dialog";
import ModalDialogContent from "@/components/modals/primitives/modal-dialog-content";
import type { EditPlayerModalProps } from "@/lib/types"
import { useEditPlayerModal } from "@/hooks/players/use-edit-player-modal";
import EditPlayerModalInner from "./edit-player-modal-inner";

const EditPlayerModal = memo(function EditPlayerModal({
  player,
  open,
  onOpenChange,
  coaches,
  grades,
  allowCoachSelect,
}: EditPlayerModalProps) {
  const { isPending, startTransition, handleDialogOpenChange } = useEditPlayerModal({
    onOpenChange,
  });

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <ModalDialogContent size="xl">
        {player ? (
          <EditPlayerModalInner
            key={player.id}
            player={player}
            coaches={coaches}
            grades={grades}
            allowCoachSelect={allowCoachSelect}
            isPending={isPending}
            startTransition={startTransition}
            onClose={() => handleDialogOpenChange(false)}
          />
        ) : null}
      </ModalDialogContent>
    </Dialog>
  );
});

EditPlayerModal.displayName = "EditPlayerModal";

export default EditPlayerModal;
