import { Badge } from "../ui/badge";
import { memo } from "react";

const REVIEW_STATUS_MAP: Record<string, { label: string; cls: string }> = {
    PENDING: {
      label: "Pendente",
      cls: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    },
    APPROVED: {
      label: "Aprovado",
      cls: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    },
    EXCEPTION: {
      label: "Exceção",
      cls: "bg-blue-500/15 text-blue-500 border-blue-500/30",
    },
    REJECTED: {
      label: "Infração",
      cls: "bg-red-500/15 text-red-500 border-red-500/30",
    },
  };
  

const ReviewStatusBadge = memo(function ReviewStatusBadge({ status }: { status: string }) {
    const cfg = REVIEW_STATUS_MAP[status] ?? REVIEW_STATUS_MAP.PENDING;
    return (
      <Badge className={`${cfg.cls} border text-xs`}>{cfg.label}</Badge>
    );
  });
  
  ReviewStatusBadge.displayName = "ReviewStatusBadge";
  
  export default ReviewStatusBadge;
  