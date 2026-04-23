/**
 * Mensagens curtas para toast/UI — evita expor stack traces e textos enormes do Prisma.
 */
export function prismaErrorToUserMessage(e: unknown): string {
  const code =
    typeof e === "object" && e !== null && "code" in e && typeof (e as { code: unknown }).code === "string"
      ? (e as { code: string }).code
      : undefined;

  if (code === "P2003") {
    return "Referência inválida: o vínculo não existe na base (por exemplo, o responsável escolhido). Verifique o DRI ou tente outro.";
  }
  if (code === "P2002") {
    return "Já existe um registo com estes dados.";
  }
  if (code === "P2025") {
    return "Registo não encontrado ou já foi removido.";
  }

  if (e instanceof Error) {
    const msg = e.message;
    if (/Foreign key constraint/i.test(msg) || msg.includes("P2003")) {
      return "Dados inválidos: verifique o responsável (DRI) — contas da matriz sem login usam o nome, não o ID de utilizador.";
    }
    if (msg.length > 240) {
      return "Não foi possível concluir a operação. Tente de novo ou contacte o suporte.";
    }
    return msg;
  }
  return "Operação falhou.";
}
