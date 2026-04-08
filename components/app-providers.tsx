"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createBrowserQueryClient } from "@/lib/react-query/create-query-client";
import type { AppProvidersProps } from "@/lib/types";
import { APP_TOASTER_PROPS, TOOLTIP_DELAY_MS } from "@/lib/constants";

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => createBrowserQueryClient());

  return (
    <>
      <TooltipProvider delayDuration={TOOLTIP_DELAY_MS}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </TooltipProvider>
      <Toaster {...APP_TOASTER_PROPS} />
    </>
  );
}
