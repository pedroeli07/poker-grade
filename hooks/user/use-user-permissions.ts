"use client";

import { useState, useEffect } from "react";
import { getUserPermissions } from "@/lib/queries/db/user";

export function useUserPermissions() {
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    getUserPermissions().then((p) => {
      setCanManage(p.canManage);
    });
  }, []);

  return { canManage };
}