import { requireSession } from "@/lib/auth/session";
import { Metadata } from "next";
import { ProfileClient } from "./profile-client";
import { loadProfilePageData } from "../../../hooks/profile/profile-page-load";

export const metadata: Metadata = {
  title: "Meu Perfil",
  description: "Gerencie suas informações pessoais e credenciais",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireSession();
  const profile = await loadProfilePageData(session);

  if (!profile) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Usuário não encontrado.
      </div>
    );
  }

  return <ProfileClient profile={profile} />;
}
