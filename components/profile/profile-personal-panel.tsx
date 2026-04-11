"use client";

import type { ProfileData, UserRole } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/constants";
import FieldLabel from "@/components/profile/profile-form-fields";
import TextInput from "@/components/profile/profile-text-input";
import { memo } from "react";
import ProfileAvatarBadge from "./profile-avatar-badge";

const ProfilePersonalPanel = memo(function ProfilePersonalPanel({
  profile,
  displayName,
  setDisplayName,
  whatsapp,
  setWhatsapp,
  discord,
  setDiscord,
  isSaving,
  handleSave,
  initials,
}: {
  profile: ProfileData;
  displayName: string;
  setDisplayName: (v: string) => void;
  whatsapp: string;
  setWhatsapp: (v: string) => void;
  discord: string;
  setDiscord: (v: string) => void;
  isSaving: boolean;
  handleSave: () => void | Promise<void>;
  initials: string;
}) {
  return (
    <div className="border-r border-border bg-card/20 p-8 space-y-6">
      <div className="section-label text-[15px] tracking-[0.18em]">Informações Pessoais</div>

      <ProfileAvatarBadge initials={initials} />

      <div>
        <FieldLabel>Email (Não Editável)</FieldLabel>
        <TextInput id="profile-email" value={profile.email} disabled />
      </div>

      <div>
        <FieldLabel>Nome Completo</FieldLabel>
        <TextInput
          id="profile-name"
          value={displayName}
          onChange={setDisplayName}
          placeholder="Seu nome completo"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>WhatsApp</FieldLabel>
          <TextInput
            id="profile-whatsapp"
            value={whatsapp}
            onChange={setWhatsapp}
            placeholder="(00) 00000-0000"
          />
        </div>
        <div>
          <FieldLabel>Discord</FieldLabel>
          <TextInput
            id="profile-discord"
            value={discord}
            onChange={setDiscord}
            placeholder="usuario#0000"
          />
        </div>
      </div>

      <div>
        <FieldLabel>Função</FieldLabel>
        <TextInput
          id="profile-role"
          value={ROLE_LABELS[profile.role as UserRole] ?? profile.role}
          disabled
        />
      </div>

      <div>
        <FieldLabel>Membro Desde</FieldLabel>
        <TextInput id="profile-since" value={profile.createdAt} disabled />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="w-full h-11 rounded-md bg-primary text-primary-foreground text-xs font-bold tracking-[0.18em] uppercase hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed glow-primary-intense"
      >
        {isSaving ? "Salvando..." : "Salvar Perfil"}
      </button>
    </div>
  );
});

ProfilePersonalPanel.displayName = "ProfilePersonalPanel";

export default ProfilePersonalPanel;
