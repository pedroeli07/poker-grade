import OpponentsListClient from "@/components/opponents/opponents-list-client";
import { getOpponentsListPageProps } from "@/lib/data/opponents";

export const dynamic = "force-dynamic";

export const metadata = { title: "Adversários | Gestão de Grades", description: "Notas de adversários do time." };

export default async function AdminOpponentsPage() {
  const props = await getOpponentsListPageProps();
  return <OpponentsListClient {...props} basePath="/admin/adversarios" />;
}
