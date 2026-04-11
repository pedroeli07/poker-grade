import { profilePageMetadata } from "@/lib/constants/metadata";
import { memo } from "react";

const ProfilePageHeader = memo(function ProfilePageHeader() {
  return (
    <div className="w-full max-w-4xl mb-8">
      <h2 className="text-4xl font-bold tracking-tight">
        Meu <span className="text-primary italic font-bold">Perfil</span>
      </h2>
      <p className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground mt-2">
        {profilePageMetadata.description}
      </p>
    </div>
  );
});

ProfilePageHeader.displayName = "ProfilePageHeader";

export default ProfilePageHeader;
