import { memo } from "react";

const ProfileAvatarBadge = memo(function ProfileAvatarBadge({ initials }: { initials: string }) {
    return (
      <div className="flex justify-center pb-2">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-2 border-border bg-muted flex items-center justify-center text-3xl font-bold text-foreground select-none overflow-hidden">
            <span>{initials}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-primary cursor-pointer hover:bg-sidebar-accent transition-colors">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </div>
        </div>
      </div>
    );
  });
  
  ProfileAvatarBadge.displayName = "ProfileAvatarBadge";
  
  export default ProfileAvatarBadge;