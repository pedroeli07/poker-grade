import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "./profile-client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meu Perfil",
  description: "Gerencie suas informações pessoais e credenciais",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireSession();

  const user = await prisma.authUser.findUnique({
    where: { id: session.userId },
    select: {
      email: true,
      displayName: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Usuário não encontrado.
      </div>
    );
  }

  return (
    <ProfileClient
      profile={{
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        createdAt: format(user.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
      }}
    />
  );
}
