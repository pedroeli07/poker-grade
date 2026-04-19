/** Perfil / avatar do utilizador. */

export const PROFILE_AVATAR_MAX_BYTES = 2 * 1024 * 1024;

/** Valor do atributo `accept` no `<input type="file">` do avatar. */
export const PROFILE_AVATAR_INPUT_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

export const profileAvatarMessages = {
  toast: {
    notImage: "Selecione um arquivo de imagem.",
    tooLarge: "Imagem muito grande (máx. 2MB).",
    readFailed: "Não foi possível ler o arquivo.",
    uploadFailed: "Erro ao enviar avatar.",
    uploadSuccess: "Avatar atualizado!",
  },
} as const;
