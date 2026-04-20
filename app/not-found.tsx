import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFoundPageMetadata } from "@/lib/constants/metadata";
import { Compass, Home } from "lucide-react";

export const metadata = notFoundPageMetadata;

export default function NotFound() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/12),transparent_55%),radial-gradient(ellipse_at_bottom,theme(colors.primary/8),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,theme(colors.border/35)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/35)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-2xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <div className="flex items-center gap-3 rounded-full border border-border/70 bg-card/60 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground shadow-sm backdrop-blur">
          <Compass className="h-3.5 w-3.5 text-primary" />
          Erro 404
        </div>

        <div className="space-y-4">
          <h1 className="bg-gradient-to-br from-primary via-primary/80 to-primary/50 bg-clip-text text-7xl font-black tracking-tight text-transparent sm:text-8xl">
            404
          </h1>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl text-white">
            Página não encontrada
          </h2>
          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-white">
            O endereço que você tentou acessar não existe, foi movido ou você não tem permissão para vê-lo.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="min-w-[10rem] rounded-lg shadow-sm">
            <Link href="/admin/dashboard">
              <Home className="h-4 w-4" />
              Voltar ao início
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="min-w-[10rem] rounded-lg">
            <Link href="/login">Ir para o login</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
