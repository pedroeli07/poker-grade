/** Fluxo de recuperação de senha (forgot-password / reset-form). */

export const FORGOT_PASSWORD_OTP_LENGTH = 6;

/** Padrão HTML para InputOTP (apenas dígitos). */
export const FORGOT_PASSWORD_OTP_INPUT_PATTERN = "^[0-9]+$";

export const forgotPasswordApi = {
  sendCode: "/api/auth/send-code",
  reset: "/api/auth/reset",
} as const;

export const forgotPasswordMessages = {
  toast: {
    invalidEmail: "Informe um e-mail válido.",
    sendCodeGeneric: "Houve um problema. Tente novamente.",
    sendCodeSuccessPrefix: "Se a conta existir, um código foi enviado para ",
    sendCodeNetwork: "Erro ao enviar código.",
    otpIncomplete: (digits: number) => `Preencha o código de ${digits} dígitos.`,
    policy: "A senha não atende os requisitos mínimos.",
    resetGeneric: "Não foi possível redefinir a senha.",
    resetSuccess: "Senha redefinida com sucesso!",
    resetNetwork: "Erro de rede. Tente novamente.",
  },
  sendCodeBody: { type: "RESET" as const },
} as const;

export type ForgotPasswordResetStep = "EMAIL" | "OTP_NEW_PASSWORD";
