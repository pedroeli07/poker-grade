"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 bg-background text-foreground">
        <h1 className="text-xl font-semibold">Erro inesperado</h1>
        <p className="text-muted-foreground text-center">
          Não foi possível carregar a aplicação.
        </p>
        <button
          type="button"
          className="cursor-pointer rounded-md border border-border px-4 py-2 text-sm"
          onClick={() => reset()}
        >
          Recarregar
        </button>
      </body>
    </html>
  );
}
