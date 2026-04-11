"use client";

import FieldLabel from "@/components/profile/profile-form-fields";
import PasswordInput from "@/components/profile/profile-password-input";
import { memo } from "react";

const ProfilePasswordPanel = memo(function ProfilePasswordPanel() {
  return (
    <div className="bg-card/10 p-8 space-y-6">
      <div className="section-label text-[15px] tracking-[0.18em]">Alterar Senha</div>

      <div className="space-y-5">
        <div>
          <FieldLabel>Senha Atual</FieldLabel>
          <PasswordInput id="current-password" />
        </div>

        <div>
          <FieldLabel>Nova Senha</FieldLabel>
          <PasswordInput id="new-password" />
        </div>

        <div>
          <FieldLabel>Confirmar Nova Senha</FieldLabel>
          <PasswordInput id="confirm-password" />
        </div>
      </div>

      <button
        type="button"
        className="w-full h-11 rounded-md bg-primary text-primary-foreground text-xs font-bold tracking-[0.18em] uppercase hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed glow-primary-intense"
      >
        Atualizar Senha
      </button>
    </div>
  );
});

ProfilePasswordPanel.displayName = "ProfilePasswordPanel";

export default ProfilePasswordPanel;
