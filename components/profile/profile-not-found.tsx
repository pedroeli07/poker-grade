import { memo } from "react";

const ProfileNotFound = memo(function ProfileNotFound() {
  return (
    <div className="text-center py-16 text-muted-foreground">Usuário não encontrado.</div>
  );
});

ProfileNotFound.displayName = "ProfileNotFound";

export default ProfileNotFound;
