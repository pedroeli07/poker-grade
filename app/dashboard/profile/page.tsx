import { requireSession } from "@/lib/auth/session";
import ProfileClient from "./profile-client";
import { profilePageMetadata } from "@/lib/constants/metadata";
import { loadProfilePageData } from "@/lib/profile/profile-page-load";
import ProfileNotFound from "@/components/profile/profile-not-found";

export const dynamic = "force-dynamic";

export const metadata = profilePageMetadata;

export default async function ProfilePage() {
  const session = await requireSession();
  const profile = await loadProfilePageData(session);

  if (!profile) {
    return <ProfileNotFound />;
  }

  return <ProfileClient profile={profile} />;
}
