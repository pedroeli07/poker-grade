import { Playfair_Display } from "next/font/google";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

export function AuthMarketingShell({
  subtitle,
  children,
}: {
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_50%_at_50%_-15%,rgba(99,102,241,0.1),transparent_55%)]" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-[440px] rounded-2xl border border-border bg-card p-8 shadow-[0_24px_80px_-20px_rgba(99,102,241,0.15)] sm:p-10">
          <h1
            className={cn(
              playfair.className,
              "text-center text-[2rem] font-semibold leading-tight tracking-tight sm:text-[2.25rem]"
            )}
          >
            <span className="text-foreground">CL</span>
            <span className="text-primary">TEAM</span>
          </h1>
          <p className="mt-3 text-center font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            {subtitle}
          </p>
          <div className="mt-8">{children}</div>
        </div>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para o site
        </Link>
      </div>
    </div>
  );
}
