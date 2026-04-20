import Link from "next/link";
import { Target } from "lucide-react";

export function MinhaGradeDetailLink({ gradeId }: { gradeId: string }) {
  return (
    <div className="flex justify-center">
      <Link
        href={`/admin/grades/perfis/${gradeId}`}
        className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Target className="h-4 w-4" />
        Ver detalhes completos da grade
      </Link>
    </div>
  );
}
