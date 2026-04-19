import { UserRole } from "@prisma/client";
import type { UserColumnKey } from "@/lib/types";

// ─── users-page ───────────────────────────────────────────────────────────────

export const USERS_PAGE_ALLOWED_ROLES = [
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.COACH,
] as const;

export const USERS_TABLE_ENTITY_LABELS: [string, string] = [
  "utilizador",
  "utilizadores",
];

// ─── user-invite-modal ─────────────────────────────────────────────────────────

/** Textos da UI do modal de convite (página Utilizadores). */

export const USER_INVITE_MODAL_TITLE = "Convidar usuário";

export const USER_INVITE_MODAL_DESCRIPTION =
  "O e-mail passa a poder criar conta na página de registro, já com o cargo definido abaixo. Se o envio de e-mails estiver configurado no servidor, a pessoa recebe automaticamente um convite com o link e instruções.";

export const USER_INVITE_EMAIL_LABEL = "E-mail";
export const USER_INVITE_EMAIL_INPUT_ID = "invite-email";
export const USER_INVITE_EMAIL_PLACEHOLDER = "nome@exemplo.com";
export const USER_INVITE_EMAIL_MAX_LENGTH = 320;

export const USER_INVITE_ROLE_LABEL = "Cargo após o cadastro";
export const USER_INVITE_ROLE_SELECT_PLACEHOLDER = "Cargo";

export const USER_INVITE_CANCEL = "Cancelar";
export const USER_INVITE_SUBMIT_SAVING = "Salvando…";
export const USER_INVITE_SUBMIT = "Adicionar convite";

export const USER_INVITE_TOAST_SUCCESS =
  "Convite adicionado. O usuário poderá criar conta com esse email.";

/** Convite guardado e e-mail de convite enviado com sucesso. */
export const USER_INVITE_TOAST_EMAIL_SENT_TITLE = "Convite enviado";
export const USER_INVITE_TOAST_EMAIL_SENT_DESC =
  "Enviámos um e-mail com o link de registo e instruções.";

/** Convite guardado; envio automático indisponível (mailer não configurado). */
export const USER_INVITE_TOAST_NO_MAILER_TITLE = "Convite adicionado";
export const USER_INVITE_TOAST_NO_MAILER_DESC =
  "Configure RESEND_API_KEY ou Gmail no servidor para enviar o convite por e-mail automaticamente.";

/** Convite guardado, mas o envio do e-mail falhou. */
export const USER_INVITE_TOAST_EMAIL_FAILED_TITLE = "Convite adicionado";
export const USER_INVITE_TOAST_EMAIL_FAILED_DESC =
  "Não foi possível enviar o e-mail. O convite está guardado — pode avisar o utilizador manualmente.";

/** Assunto do e-mail de convite (enviado pelo mailer). */
export const USER_INVITE_EMAIL_SUBJECT = "Convite para criar conta — Gestão de Grades";

// ─── users-table-ui ─────────────────────────────────────────────────────────────

/** Rótulos PT por coluna (filtros e ordenação no diretório de utilizadores). */
export const USERS_TABLE_COLUMN_LABELS: Record<UserColumnKey, string> = {
  email: "Membro",
  role: "Cargo",
  status: "Status",
};

export const USERS_FILTER_SUMMARY_EMPTY_SELECTION = "(nenhum valor selecionado)";

/** Prefixo da linha de resumo quando há texto de busca. */
export const USERS_FILTER_SUMMARY_SEARCH_PREFIX = "Busca: ";

/** Valores de `status` usados nos filtros (alinhado a opções da UI). */
export const USER_DIRECTORY_STATUS = {
  REGISTERED: "REGISTERED",
  PENDING: "PENDING",
} as const;
