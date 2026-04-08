import nodemailer from 'nodemailer';
import { env } from 'process';

const user = env.GMAIL_USER;
const pass = env.GMAIL_APP_PASSWORD;

// Helper to check if mailer is configured
export const isMailerConfigured = () => !!(user && pass);

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user,
    pass,
  },
});

/**
 * Envia código de 6 dígitos para verificação de registro.
 */
export async function sendRegisterVerificationEmail(email: string, code: string, ip?: string) {
  if (!isMailerConfigured()) throw new Error("Mailer não configurado: GMAIL_USER/GMAIL_APP_PASSWORD ausentes.");

  const mailOptions = {
    from: `"Gestão Poker Team" <${user}>`,
    to: email,
    subject: `Cód. ${code} - Verificação de E-mail`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #2563eb;">Bem-vindo(a)!</h2>
        <p>Você iniciou o cadastro no nosso sistema de Gestão de Grades.</p>
        <p>Utilize o código de verificação abaixo para concluir a criação da sua conta:</p>
        <div style="margin: 30px 0; font-size: 28px; font-weight: bold; letter-spacing: 4px; padding: 15px; background: #f3f4f6; text-align: center; border-radius: 8px;">
          ${code}
        </div>
        <p>Este código expira em 15 minutos.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #888;">
          Se você não solicitou este código, por favor ignore este aviso.
          ${ip ? `<br/>Solicitado pelo IP: ${ip}` : ""}
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Envia código de 6 dígitos para recuperação de senha.
 */
export async function sendPasswordResetEmail(email: string, code: string, ip?: string) {
  if (!isMailerConfigured()) throw new Error("Mailer não configurado: GMAIL_USER/GMAIL_APP_PASSWORD ausentes.");

  const mailOptions = {
    from: `"Gestão Poker Team" <${user}>`,
    to: email,
    subject: `Cód. ${code} - Redefinição de Senha`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #ea580c;">Recuperação de Acesso</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p>Insira o código de 6 dígitos abaixo na tela de recuperação:</p>
        <div style="margin: 30px 0; font-size: 28px; font-weight: bold; letter-spacing: 4px; padding: 15px; background: #fff7ed; color: #ea580c; text-align: center; border-radius: 8px;">
          ${code}
        </div>
        <p>Este código expira em 15 minutos.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #888;">
          Se você não solicitou a redefinição de senha, sinta-se seguro para ignorar este e-mail.
          ${ip ? `<br/>Solicitado a partir do IP: ${ip}` : ""}
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}
