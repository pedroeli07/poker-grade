"use client";

import { useCallback, useMemo, useState } from "react";
import type { SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import {
  getPasswordPolicyGaps,
  passwordMeetsPolicy,
} from "@/lib/auth/password-policy";
import {
  FORGOT_PASSWORD_OTP_LENGTH,
  forgotPasswordApi,
  forgotPasswordMessages,
  type ForgotPasswordResetStep,
} from "@/lib/constants/forgot-password";
import { toast } from "@/lib/toast";
import { isValidEmailFormat } from "@/lib/utils/email-format";

export function useForgotPasswordResetForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<ForgotPasswordResetStep>("EMAIL");
  const [code, setCode] = useState("");

  const emailOk = useMemo(() => isValidEmailFormat(email), [email]);
  const policyOk = useMemo(() => passwordMeetsPolicy(password), [password]);
  const policyGaps = useMemo(() => getPasswordPolicyGaps(password), [password]);

  const sendCode = useCallback(
    async (e: SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!emailOk) {
        toast.error(forgotPasswordMessages.toast.invalidEmail);
        return;
      }
      setLoading(true);

      try {
        const res = await fetch(forgotPasswordApi.sendCode, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            type: forgotPasswordMessages.sendCodeBody.type,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(
            typeof data.error === "string" ? data.error : forgotPasswordMessages.toast.sendCodeGeneric
          );
          return;
        }
        toast.success(
          forgotPasswordMessages.toast.sendCodeSuccessPrefix + email
        );
        setStep("OTP_NEW_PASSWORD");
      } catch {
        toast.error(forgotPasswordMessages.toast.sendCodeNetwork);
      } finally {
        setLoading(false);
      }
    },
    [email, emailOk]
  );

  const completeReset = useCallback(
    async (e: SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (code.length !== FORGOT_PASSWORD_OTP_LENGTH) {
        toast.error(
          forgotPasswordMessages.toast.otpIncomplete(FORGOT_PASSWORD_OTP_LENGTH)
        );
        return;
      }
      if (!policyOk) {
        toast.error(forgotPasswordMessages.toast.policy);
        return;
      }

      setLoading(true);

      try {
        const res = await fetch(forgotPasswordApi.reset, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            code,
            newPassword: password,
          }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          toast.error(
            typeof data.error === "string" ? data.error : forgotPasswordMessages.toast.resetGeneric
          );
          return;
        }
        toast.success(forgotPasswordMessages.toast.resetSuccess);
        router.push("/login");
        router.refresh();
      } catch {
        toast.error(forgotPasswordMessages.toast.resetNetwork);
      } finally {
        setLoading(false);
      }
    },
    [code, email, password, policyOk, router]
  );

  const goBackToEmailStep = useCallback(() => {
    setStep("EMAIL");
  }, []);

  return {
    loading,
    email,
    setEmail,
    password,
    setPassword,
    step,
    code,
    setCode,
    emailOk,
    policyOk,
    policyGaps,
    sendCode,
    completeReset,
    goBackToEmailStep,
    otpLength: FORGOT_PASSWORD_OTP_LENGTH,
  };
}
