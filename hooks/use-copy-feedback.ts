"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const DEFAULT_MS = 2000;

type StopEvent = { stopPropagation?: () => void };

export function useCopyFeedback(options: {
  successTitle: string;
  getDescription: () => string;
  durationMs?: number;
}) {
  const { successTitle, getDescription, durationMs = DEFAULT_MS } = options;
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const copy = useCallback(
    (text: string, e?: StopEvent) => {
      e?.stopPropagation?.();
      void navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(successTitle, {
        description: getDescription(),
        duration: durationMs,
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
        timeoutRef.current = null;
      }, durationMs);
    },
    [successTitle, getDescription, durationMs]
  );

  return { copied, copy };
}
