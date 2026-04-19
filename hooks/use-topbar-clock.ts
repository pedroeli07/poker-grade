"use client";

import { useEffect, useMemo, useState } from "react";
import { formatTopbarClockStrings } from "@/lib/utils/topbar-datetime";

export function useTopbarClock() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setMounted(true);
      setTime(new Date());
    });
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
    };
  }, []);

  const formatted = useMemo(() => formatTopbarClockStrings(time), [time]);

  return { mounted, ...formatted };
}
