/** Registro (credenciais → OTP → conta). */

export const REGISTER_OTP_LENGTH = 6;

export const REGISTER_OTP_INPUT_PATTERN = "^[0-9]+$";

/** IDs usados no DOM e no sync de autofill (devem bater com o formulário). */
export const registerFormDomIds = {
  name: "reg-name",
  email: "reg-email",
  password: "reg-password",
  confirm: "reg-confirm",
} as const;

export type RegisterFormStep = "CREDENTIALS" | "OTP";

export const registerApi = {
  sendCode: "/api/auth/send-code",
  register: "/api/auth/register",
} as const;

export const registerMessages = {
  toast: {
    notInvited:
      "Este Google não está autorizado. Peça um convite ao administrador ou use o e-mail convidado.",
    sendCodeDenied: "Acesso negado para este e-mail.",
    sendCodeSuccessPrefix: "Código enviado para ",
    sendCodeNetwork: "Erro ao enviar código.",
    otpIncomplete: (digits: number) => `Preencha o código de ${digits} dígitos.`,
    registerFailed: "Não foi possível criar a conta.",
    registerSuccess: "Conta criada. Bem-vindo!",
    registerNetwork: "Erro de rede. Tente novamente.",
  },
  sendCodeBody: { type: "REGISTER" as const },
} as const;

/** Query OAuth: `?error=not_invited` */
export const REGISTER_QUERY_NOT_INVITED = "not_invited";
