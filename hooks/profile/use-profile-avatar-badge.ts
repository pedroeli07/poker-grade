"use client";

import { useCallback, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { updateAvatar } from "@/lib/queries/db/user";
import {
  PROFILE_AVATAR_MAX_BYTES,
  profileAvatarMessages,
} from "@/lib/constants/profile";
import { toast } from "@/lib/toast";
import { readFileAsDataUrl, validateProfileAvatarFile } from "@/lib/utils/avatar-file";

export function useProfileAvatarBadge(avatarUrl: string | null) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [isUploading, setIsUploading] = useState(false);

  const openPicker = useCallback(() => {
    if (isUploading) return;
    inputRef.current?.click();
  }, [isUploading]);

  const onFile = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;

      const v = validateProfileAvatarFile(file, PROFILE_AVATAR_MAX_BYTES);
      if (!v.ok) {
        toast.error(v.message);
        return;
      }

      let dataUrl: string;
      try {
        dataUrl = await readFileAsDataUrl(file);
      } catch {
        toast.error(profileAvatarMessages.toast.readFailed);
        return;
      }

      setPreview(dataUrl);
      setIsUploading(true);
      const res = await updateAvatar(dataUrl);
      setIsUploading(false);

      if ("error" in res) {
        setPreview(avatarUrl);
        toast.error(res.error ?? profileAvatarMessages.toast.uploadFailed);
      } else {
        toast.success(profileAvatarMessages.toast.uploadSuccess);
      }
    },
    [avatarUrl]
  );

  return { inputRef, preview, isUploading, openPicker, onFile };
}
