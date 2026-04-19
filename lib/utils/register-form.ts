/**
 * Regras de validação e texto de ajuda do formulário de registro (fora do JSX).
 */
export function passwordsMatchForRegister(password: string, confirm: string): boolean {
  return confirm.length > 0 && password.length > 0 && password === confirm;
}

export function getRegisterSubmitHint(
  loading: boolean,
  emailOk: boolean,
  password: string,
  policyOk: boolean,
  confirm: string,
  passwordsMatch: boolean
): string {
  if (loading) return "";
  const parts: string[] = [];
  if (!emailOk) parts.push("Informe um e-mail válido.");
  if (emailOk && password.length === 0) parts.push("Defina uma senha.");
  if (emailOk && password.length > 0 && !policyOk) {
    parts.push("Complete todos os requisitos da senha (lista acima).");
  }
  if (emailOk && policyOk && password.length > 0 && confirm.length === 0) {
    parts.push("Repita a senha no campo «Confirmar».");
  }
  if (confirm.length > 0 && !passwordsMatch) {
    parts.push("As duas senhas têm de ser iguais.");
  }
  return parts.join(" ");
}
