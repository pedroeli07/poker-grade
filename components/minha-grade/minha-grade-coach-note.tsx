import { Info } from "lucide-react";

export function MinhaGradeCoachNote({ description }: { description: string }) {
  return (
    <div className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-6 flex gap-5">
      <div className="shrink-0">
        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
          <Info className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div>
        <p className="text-[13px] font-bold text-primary uppercase tracking-widest mb-2">Nota do Coach</p>
        <p className="text-[15px] text-foreground/80 leading-relaxed whitespace-pre-line">{description}</p>
      </div>
    </div>
  );
}
