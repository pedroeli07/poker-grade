"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  const message =
    process.env.NODE_ENV === "production"
      ? "Algo deu errado. Tente novamente."
      : error.message;

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-lg font-semibold">Erro</h2>
      <p className="text-muted-foreground text-center max-w-md">{message}</p>
      <Button type="button" onClick={() => reset()}>
        Tentar de novo
      </Button>
    </div>
  );
}
