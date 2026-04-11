import { sharkscopeScoutingPageMetadata } from "@/lib/constants/metadata";
import { memo } from "react";

const ScoutingPageHeader = memo(function ScoutingPageHeader() {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight text-primary">{sharkscopeScoutingPageMetadata.title}</h2>
      <p className="text-muted-foreground mt-1">{sharkscopeScoutingPageMetadata.description}</p>
    </div>
  );
});

ScoutingPageHeader.displayName = "ScoutingPageHeader";

export default ScoutingPageHeader;
