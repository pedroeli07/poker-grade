import { redirect } from "next/navigation";

export default function NewPlayerPage() {
  redirect("/dashboard/players");
}
