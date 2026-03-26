"use client";

import { toast as sonner } from "sonner";

const defaultOpts = { duration: 5000 };

/**
 * Toasts para feedback no cliente (Sonner).
 * Use apenas em componentes com `"use client"`.
 */
export const toast = {
  success: (message: string, description?: string) =>
    sonner.success(message, { ...defaultOpts, description }),

  info: (message: string, description?: string) =>
    sonner.info(message, { ...defaultOpts, description }),

  warning: (message: string, description?: string) =>
    sonner.warning(message, { ...defaultOpts, description }),

  error: (message: string, description?: string) =>
    sonner.error(message, { ...defaultOpts, description }),

  loading: (message: string) => sonner.loading(message),

  dismiss: sonner.dismiss,

  promise: sonner.promise,
};
