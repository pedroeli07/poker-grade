"use client";

import { Dialog } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import ModalDialogContent from "@/components/modals/primitives/modal-dialog-content";
import ModalFormFooter from "@/components/modals/primitives/modal-form-footer";
import ModalGradientHeader from "@/components/modals/primitives/modal-gradient-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, Mail } from "lucide-react";
import { UserRole } from "@prisma/client";
import {
  INVITE_ROLES, USER_INVITE_CANCEL, USER_INVITE_EMAIL_INPUT_ID, USER_INVITE_EMAIL_LABEL,
  USER_INVITE_EMAIL_MAX_LENGTH, USER_INVITE_EMAIL_PLACEHOLDER, USER_INVITE_MODAL_DESCRIPTION,
  USER_INVITE_MODAL_TITLE, USER_INVITE_ROLE_LABEL, USER_INVITE_ROLE_SELECT_PLACEHOLDER,
  USER_INVITE_SUBMIT, USER_INVITE_SUBMIT_SAVING,
} from "@/lib/constants";
import { UserInviteModalProps } from "@/lib/types";
import { useUserInviteModal } from "@/hooks/users/use-user-invite-modal";
import { memo } from "react";

const UserInviteModal = memo(function UserInviteModal({ open, onOpenChange }: UserInviteModalProps) {
  const {
    pending,
    email,
    setEmail,
    role,
    setRole,
    handleOpenChange,
    handleSubmit,
  } = useUserInviteModal(onOpenChange);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <ModalDialogContent size="md">
        <ModalGradientHeader
          icon={Mail}
          title={USER_INVITE_MODAL_TITLE}
          description={USER_INVITE_MODAL_DESCRIPTION}
          density="compact"
        />
        <Separator />
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor={USER_INVITE_EMAIL_INPUT_ID}>{USER_INVITE_EMAIL_LABEL}</Label>
              <Input
                id={USER_INVITE_EMAIL_INPUT_ID}
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={USER_INVITE_EMAIL_PLACEHOLDER}
                maxLength={USER_INVITE_EMAIL_MAX_LENGTH}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label>{USER_INVITE_ROLE_LABEL}</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as UserRole)}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder={USER_INVITE_ROLE_SELECT_PLACEHOLDER} />
                </SelectTrigger>
                <SelectContent>
                  {INVITE_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ModalFormFooter className="!flex-row flex-wrap gap-2 border-t border-border/40 px-6 py-4 sm:justify-stretch [&>button]:min-w-0 [&>button]:flex-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={pending}
              className="border-border/60"
            >
              {USER_INVITE_CANCEL}
            </Button>
            <Button
              type="submit"
              className="flex items-center justify-center gap-2 glow-primary"
              disabled={pending || !email.trim()}
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {USER_INVITE_SUBMIT_SAVING}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  {USER_INVITE_SUBMIT}
                </>
              )}
            </Button>
          </ModalFormFooter>
        </form>
      </ModalDialogContent>
    </Dialog>
  );
});

UserInviteModal.displayName = "UserInviteModal";

export default UserInviteModal;
