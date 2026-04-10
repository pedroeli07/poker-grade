"use client";

import { useMemo, useState, useCallback } from "react";
import type { ProfileData } from "@/lib/types";
import { updateProfile } from "@/lib/queries/db/user-queries";
import { toast } from "@/lib/toast";

export function useProfilePage(profile: ProfileData) {
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp ?? "");
  const [discord, setDiscord] = useState(profile.discord ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const initials = useMemo(
    () =>
      (profile.displayName || profile.email)
        .split(/[\s@]/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join(""),
    [profile.displayName, profile.email]
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const res = await updateProfile({
      displayName,
      whatsapp,
      discord
    });
    
    setIsSaving(false);
    if ("error" in res) {
      toast.error(res.error ?? "Erro ao atualizar perfil.");
    } else {
      toast.success("Perfil atualizado com sucesso!");
    }
  }, [displayName, whatsapp, discord]);

  return {
    displayName,
    setDisplayName,
    whatsapp,
    setWhatsapp,
    discord,
    setDiscord,
    isSaving,
    handleSave,
    initials,
  };
}
