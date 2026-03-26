"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface ProfileData {
  email: string;
  displayName: string | null;
  role: string;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  COACH: "Coach",
  MANAGER: "Manager",
  PLAYER: "Jogador",
  VIEWER: "Visualizador",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-1.5">
      {children}
    </label>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}: {
  id: string;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "w-full h-11 rounded-md border border-border bg-card/60 px-3 text-sm text-foreground placeholder:text-muted-foreground/50",
        "focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    />
  );
}

function PasswordInput({
  id,
  placeholder,
}: {
  id: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder ?? "••••••••"}
        className="w-full h-11 rounded-md border border-border bg-card/60 px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function ProfileClient({ profile }: { profile: ProfileData }) {
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const initials = (profile.displayName || profile.email)
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-start pt-2 pb-12">
      {/* Page title */}
      <div className="w-full max-w-4xl mb-8">
        <h2 className="text-4xl font-bold tracking-tight">
          Meu{" "}
          <span className="text-primary italic font-bold">Perfil</span>
        </h2>
        <p className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground mt-2">
          Gerencie suas informações pessoais e credenciais
        </p>
      </div>

      {/* Two-column layout */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-0 border border-border rounded-xl overflow-hidden">

        {/* LEFT — Informações Pessoais */}
        <div className="border-r border-border bg-card/20 p-8 space-y-6">
          {/* Section label */}
          <div className="section-label text-[10px] tracking-[0.18em]">
            Informações Pessoais
          </div>

          {/* Avatar */}
          <div className="flex justify-center pb-2">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-2 border-border bg-muted flex items-center justify-center text-3xl font-bold text-foreground select-none overflow-hidden">
                <span>{initials}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-primary cursor-pointer hover:bg-sidebar-accent transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <FieldLabel>Email (Não Editável)</FieldLabel>
            <TextInput
              id="profile-email"
              value={profile.email}
              disabled
            />
          </div>

          {/* Nome */}
          <div>
            <FieldLabel>Nome Completo</FieldLabel>
            <TextInput
              id="profile-name"
              value={displayName}
              onChange={setDisplayName}
              placeholder="Seu nome completo"
            />
          </div>

          {/* Role */}
          <div>
            <FieldLabel>Função</FieldLabel>
            <TextInput
              id="profile-role"
              value={ROLE_LABELS[profile.role] ?? profile.role}
              disabled
            />
          </div>

          {/* Membro desde */}
          <div>
            <FieldLabel>Membro Desde</FieldLabel>
            <TextInput
              id="profile-since"
              value={profile.createdAt}
              disabled
            />
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-11 rounded-md bg-primary text-primary-foreground text-xs font-bold tracking-[0.18em] uppercase hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed glow-primary-intense"
          >
            {isSaving ? "Salvando..." : "Salvar Perfil"}
          </button>
        </div>

        {/* RIGHT — Alterar Senha */}
        <div className="bg-card/10 p-8 space-y-6">
          <div className="section-label text-[10px] tracking-[0.18em]">
            Alterar Senha
          </div>

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

          {/* Update button */}
          <button
            type="button"
            className="w-full h-11 rounded-md border border-border bg-card/60 text-foreground text-xs font-bold tracking-[0.18em] uppercase hover:bg-sidebar-accent hover:border-primary/30 transition-all cursor-pointer mt-4"
          >
            Atualizar Senha
          </button>
        </div>
      </div>
    </div>
  );
}
