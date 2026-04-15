"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import { addAllowedInvite } from "@/lib/queries/db/user-queries";
import { toast } from "@/lib/toast";
import { USER_INVITE_TOAST_SUCCESS } from "@/lib/constants";

export function useUserInviteModal(onOpenChange: (open: boolean) => void) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.VIEWER);

  const reset = useCallback(() => {
    setEmail("");
    setRole(UserRole.VIEWER);
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) reset();
      onOpenChange(next);
    },
    [onOpenChange, reset]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData();
      fd.set("email", email.trim());
      fd.set("role", role);

      startTransition(async () => {
        const res = await addAllowedInvite(fd);
        if ("error" in res && res.error) {
          toast.error(res.error);
          return;
        }
        toast.success(USER_INVITE_TOAST_SUCCESS);
        reset();
        onOpenChange(false);
        router.refresh();
      });
    },
    [email, role, onOpenChange, reset, router]
  );

  return {
    pending,
    email,
    setEmail,
    role,
    setRole,
    handleOpenChange,
    handleSubmit,
  };
}
