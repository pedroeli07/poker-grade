import { Badge } from "../ui/badge";
import { memo } from "react";
import { REVIEW_STATUS_MAP } from "@/lib/constants/review";


const ReviewStatusBadge = memo(function ReviewStatusBadge({ status }: { status: string }) {
    const cfg = REVIEW_STATUS_MAP[status] ?? REVIEW_STATUS_MAP.PENDING;
    return (
      <Badge className={`${cfg.cls} border text-xs`}>{cfg.label}</Badge>
    );
  });
  
  ReviewStatusBadge.displayName = "ReviewStatusBadge";
  
  export default ReviewStatusBadge;
  