"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getPasswordPolicyGaps,
  passwordMeetsPolicy,
} from "@/lib/auth/password-policy";
import {
  REGISTER_OTP_LENGTH,
  REGISTER_QUERY_NOT_INVITED,
  registerApi,
  registerFormDomIds,
  registerMessages,
  type RegisterFormStep,
} from "@/lib/constants/register";
import { toast } from "@/lib/toast";
import { isValidEmailFormat } from "@/lib/utils/email-format";
import {
  getRegisterSubmitHint,
  passwordsMatchForRegister,
} from "@/lib/utils/register-form";

/** Autofill do browser pode preencher o DOM sem disparar onChange no React. */
function syncRegisterFieldsFromDom(
  setters: {
    setEmail: (v: string | ((c: string) => string)) => void;
    setPassword: (v: string | ((c: string) => string)) => void;
    setConfirm: (v: string | ((c: string) => string)) => void;
    setDisplayName: (v: string | ((c: string) => string)) => void;
  }
) {
  const el = (id: string) =>
    document.getElementById(id) as HTMLInputElement | null;
  const em = el(registerFormDomIds.email);
  const pw = el(registerFormDomIds.password);
  const cf = el(registerFormDomIds.confirm);
  const nm = el(registerFormDomIds.name);
  if (em?.value) setters.setEmail((cur) => cur || em.value);
  if (pw?.value) setters.setPassword((cur) => cur || pw.value);
  if (cf?.value) setters.setConfirm((cur) => cur || cf.value);
  if (nm?.value) setters.setDisplayName((cur) => cur || nm.value);
}

export function useRegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<RegisterFormStep>("CREDENTIALS");
  const [code, setCode] = useState("");
  const inviteToastShown = useRef(false);

  useEffect(() => {
    const run = () =>
      syncRegisterFieldsFromDom({
        setEmail,
        setPassword,
        setConfirm,
        setDisplayName,
      });
    const t0 = window.setTimeout(run, 50);
    const t1 = window.setTimeout(run, 400);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
    };
  }, []);

  const emailOk = useMemo(() => isValidEmailFormat(email), [email]);
  const policyOk = useMemo(() => passwordMeetsPolicy(password), [password]);
  const passwordsMatch = useMemo(
    () => passwordsMatchForRegister(password, confirm),
    [password, confirm]
  );
  const canSubmit = emailOk && policyOk && passwordsMatch && !loading;

  const policyGaps = useMemo(() => getPasswordPolicyGaps(password), [password]);

  const submitBlockerHint = useMemo(
    () =>
      getRegisterSubmitHint(
        loading,
        emailOk,
        password,
        policyOk,
        confirm,
        passwordsMatch
      ),
    [loading, emailOk, password, policyOk, confirm, passwordsMatch]
  );

  useEffect(() => {
    if (inviteToastShown.current) return;
    if (params.get("error") === REGISTER_QUERY_NOT_INVITED) {
      inviteToastShown.current = true;
      toast.error(registerMessages.toast.notInvited);
    }
  }, [params]);

  const sendCode = useCallback(
    async (e: SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitted(true);
      if (!canSubmit) return;
      setLoading(true);

      try {
        const res = await fetch(registerApi.sendCode, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            type: registerMessages.sendCodeBody.type,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(
            typeof data.error === "string"
              ? data.error
              : registerMessages.toast.sendCodeDenied
          );
          return;
        }
        toast.success(registerMessages.toast.sendCodeSuccessPrefix + email);
        setStep("OTP");
      } catch {
        toast.error(registerMessages.toast.sendCodeNetwork);
      } finally {
        setLoading(false);
      }
    },
    [canSubmit, email]
  );

  const completeRegister = useCallback(
    async (e: SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (code.length !== REGISTER_OTP_LENGTH) {
        toast.error(
          registerMessages.toast.otpIncomplete(REGISTER_OTP_LENGTH)
        );
        return;
      }
      setLoading(true);

      try {
        const res = await fetch(registerApi.register, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password,
            confirmPassword: confirm,
            displayName: displayName.trim() || undefined,
            code,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          redirect?: string;
        };
        if (!res.ok) {
          toast.error(
            typeof data.error === "string"
              ? data.error
              : registerMessages.toast.registerFailed
          );
          return;
        }
        toast.success(registerMessages.toast.registerSuccess);
        router.push(data.redirect ?? "/admin/dashboard");
        router.refresh();
      } catch {
        toast.error(registerMessages.toast.registerNetwork);
      } finally {
        setLoading(false);
      }
    },
    [code, confirm, displayName, email, password, router]
  );

  const goBackToCredentials = useCallback(() => {
    setStep("CREDENTIALS");
  }, []);

  return {
    loading,
    password,
    setPassword,
    confirm,
    setConfirm,
    displayName,
    setDisplayName,
    email,
    setEmail,
    submitted,
    step,
    code,
    setCode,
    emailOk,
    policyOk,
    passwordsMatch,
    canSubmit,
    policyGaps,
    submitBlockerHint,
    sendCode,
    completeRegister,
    goBackToCredentials,
    otpLength: REGISTER_OTP_LENGTH,
  };
}
