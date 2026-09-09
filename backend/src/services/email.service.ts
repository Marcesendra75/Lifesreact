import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// envoltorio visual compartido por todos los emails, con la identidad de marca de la app
function wrapEmail(title: string, bodyHtml: string) {
  return `
  <div style="background:#fbf9f5; padding:40px 20px; font-family:Georgia, 'Times New Roman', serif;">
    <div style="max-width:480px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e4e2de;">
      <div style="background:#03192e; padding:28px 32px; text-align:center;">
        <span style="font-family:Georgia, serif; font-style:italic; font-size:28px; font-weight:bold; color:#C9A84C;">Life's</span>
      </div>
      <div style="padding:32px;">
        <h1 style="font-size:20px; color:#03192e; margin:0 0 16px;">${title}</h1>
        ${bodyHtml}
      </div>
      <div style="padding:20px 32px; background:#f5f3ef; text-align:center;">
        <p style="font-size:12px; color:#84878c; margin:0;">© ${new Date().getFullYear()} Life's. Preservando historias con dignidad.</p>
      </div>
    </div>
  </div>`;
}

function buttonHtml(url: string, label: string) {
  return `
    <div style="text-align:center; margin:28px 0;">
      <a href="${url}" style="background:#03192e; color:#ffffff; padding:14px 32px; border-radius:8px; text-decoration:none; font-weight:bold; font-family:Georgia, serif; display:inline-block;">
        ${label}
      </a>
    </div>`;
}

export async function sendVerificationEmail(to: string, firstName: string, token: string) {
  const url = `${FRONTEND_URL}/verificar-email?token=${token}`;

  const html = wrapEmail('Confirmá tu cuenta', `
    <p style="font-size:15px; color:#43474d; line-height:1.6;">Hola ${firstName},</p>
    <p style="font-size:15px; color:#43474d; line-height:1.6;">
      Gracias por crear tu cuenta en Life's. Confirmá tu email para empezar a guardar tus recuerdos.
    </p>
    ${buttonHtml(url, 'Confirmar mi cuenta')}
    <p style="font-size:13px; color:#84878c;">Este link vence en 24 horas. Si no creaste esta cuenta, ignorá este email.</p>
  `);

   const result = await resend.emails.send({
    from: `Life's <${FROM_EMAIL}>`,
    to,
    subject: "Confirmá tu cuenta en Life's",
    html,
  });

  if (result.error) {
    console.error('Error al enviar email de verificación:', result.error);
  }
}

export async function sendPasswordResetEmail(to: string, firstName: string, code: string) {
  const html = wrapEmail('Recuperá tu contraseña', `
    <p style="font-size:15px; color:#43474d; line-height:1.6;">Hola ${firstName},</p>
    <p style="font-size:15px; color:#43474d; line-height:1.6;">
      Recibimos un pedido para restablecer tu contraseña. Usá este código para continuar:
    </p>
    <div style="text-align:center; margin:28px 0;">
      <span style="display:inline-block; background:#f5f3ef; color:#03192e; font-size:32px; font-weight:bold; letter-spacing:8px; padding:16px 24px; border-radius:8px; font-family:Georgia, serif;">
        ${code}
      </span>
    </div>
    <p style="font-size:13px; color:#84878c;">Este código vence en 15 minutos. Si no fuiste vos, ignorá este email — tu contraseña sigue siendo la misma.</p>
  `);

  const result = await resend.emails.send({
    from: `Life's <${FROM_EMAIL}>`,
    to,
    subject: "Tu código para recuperar la contraseña en Life's",
    html,
  });

  if (result.error) {
    console.error('Error al enviar email de recuperación:', result.error);
  }
}