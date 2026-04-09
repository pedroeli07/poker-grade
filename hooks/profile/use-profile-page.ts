"use client";

import { useMemo, useState, useCallback } from "react";
import type { ProfileData } from "@/lib/types";

export function useProfilePage(profile: ProfileData) {
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
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
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
  }, []);

  return {
    displayName,
    setDisplayName,
    isSaving,
    handleSave,
    initials,
  };
}
