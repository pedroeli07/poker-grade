export const SESSION_COOKIE_NAME = "gg_session";

/** CSRF state para OAuth Google (cookie httpOnly). */
export const GOOGLE_OAUTH_STATE_COOKIE = "gg_oauth_state";

/** Access token / cookie max age (segundos) — máx. 24h conforme política */
export const SESSION_MAX_AGE_SEC = 60 * 60 * 12;

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;
