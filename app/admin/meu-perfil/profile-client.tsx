"use client";

import { memo } from "react";
import type { ProfileData } from "@/lib/types/user/index";
import ProfilePageHeader from "@/components/profile/profile-page-header";
import ProfilePersonalPanel from "@/components/profile/profile-personal-panel";
import ProfilePasswordPanel from "@/components/profile/profile-password-panel";
import { useProfilePage } from "@/hooks/profile/use-profile-page";

const ProfileClient = memo(function ProfileClient({ profile }: { profile: ProfileData }) {
  const {
    displayName,
    setDisplayName,
    whatsapp,
    setWhatsapp,
    discord,
    setDiscord,
    isSaving,
    handleSave,
    initials,
  } = useProfilePage(profile);

  return (
    <div className="min-h-full flex flex-col items-center justify-start pt-2 pb-12">
      <ProfilePageHeader />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-0 border border-border rounded-xl overflow-hidden bg-blue-500/10">
        <ProfilePersonalPanel
          profile={profile}
          displayName={displayName}
          setDisplayName={setDisplayName}
          whatsapp={whatsapp}
          setWhatsapp={setWhatsapp}
          discord={discord}
          setDiscord={setDiscord}
          isSaving={isSaving}
          handleSave={handleSave}
          initials={initials}
        />
        <ProfilePasswordPanel />
      </div>
    </div>
  );
});

ProfileClient.displayName = "ProfileClient";

export default ProfileClient;
