/** Login (e-mail/senha + OAuth callback via query). */

export const LOGIN_EMAIL_STORAGE_KEY = "gg_auth_email";
export const LOGIN_PASSWORD_STORAGE_KEY = "gg_auth_pwd";

export const loginApi = {
  login: "/api/auth/login",
} as const;

/** Erros conhecidos na query `?error=` após redirect OAuth. */
export const loginOAuthErrorMessages: Record<string, string> = {
  oauth_failed: "Não foi possível entrar com o Google. Tente de novo.",
  oauth_state: "Sessão expirada. Tente «Entrar com Google» novamente.",
  oauth_config: "Login Google não configurado no servidor.",
  access_denied: "Login com Google cancelado.",
  account_conflict: "Conflito na conta. Fale com o administrador.",
  email_not_verified: "Confirme o e-mail na conta Google antes de continuar.",
};

export const loginMessages = {
  toast: {
    forbidden: "Sem permissão para acessar este recurso.",
    oauthGoogleGeneric: "Erro ao entrar com Google.",
    loginFailed: "Não foi possível entrar.",
    sessionStarted: "Sessão iniciada",
    network: "Erro de rede. Tente novamente.",
  },
} as const;
