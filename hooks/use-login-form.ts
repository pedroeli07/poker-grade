"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LOGIN_EMAIL_STORAGE_KEY,
  LOGIN_PASSWORD_STORAGE_KEY,
  loginApi,
  loginMessages,
  loginOAuthErrorMessages,
} from "@/lib/constants/login";
import { toast } from "@/lib/toast";

export function useLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const oauthToastShown = useRef(false);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(LOGIN_EMAIL_STORAGE_KEY);
      const savedPwd = localStorage.getItem(LOGIN_PASSWORD_STORAGE_KEY);
      if (savedEmail) {
        setEmail(savedEmail);
        setRemember(true);
      }
      if (savedPwd) {
        setPassword(savedPwd);
        setRemember(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (oauthToastShown.current) return;
    const err = params.get("error");
    if (!err) return;
    oauthToastShown.current = true;

    if (err === "forbidden") {
      toast.error(loginMessages.toast.forbidden);
    } else {
      toast.error(loginOAuthErrorMessages[err] ?? loginMessages.toast.oauthGoogleGeneric);
    }
  }, [params]);

  const submit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);

      try {
        if (remember) {
          localStorage.setItem(LOGIN_EMAIL_STORAGE_KEY, email);
          localStorage.setItem(LOGIN_PASSWORD_STORAGE_KEY, password);
        } else {
          localStorage.removeItem(LOGIN_EMAIL_STORAGE_KEY);
          localStorage.removeItem(LOGIN_PASSWORD_STORAGE_KEY);
        }

        const res = await fetch(loginApi.login, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          toast.error(
            typeof data.error === "string" ? data.error : loginMessages.toast.loginFailed
          );
          return;
        }
        toast.success(loginMessages.toast.sessionStarted);
        router.push("/admin/dashboard");
        router.refresh();
      } catch {
        toast.error(loginMessages.toast.network);
      } finally {
        setLoading(false);
      }
    },
    [email, password, remember, router]
  );

  return {
    loading,
    email,
    setEmail,
    password,
    setPassword,
    remember,
    setRemember,
    submit,
  };
}
