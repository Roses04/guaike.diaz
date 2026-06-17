import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

// ── Supabase Admin client (uses service role key – NEVER expose to frontend) ──
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ── Nodemailer transporter via Gmail SMTP ──────────────────────────────────────
const getTransporter = () => {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

  if (!user || !pass) throw new Error("Variables SMTP_USER/GMAIL_USER y SMTP_PASS/GMAIL_PASS no definidas en el servidor.");

  const host = process.env.SMTP_HOST;
  if (host) {
    return nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    });
  }
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
};

// ── Email HTML templates ───────────────────────────────────────────────────────
const confirmationEmailHtml = (actionLink: string) => `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirma tu correo - GUAIKE.DÍAZ</title></head>
<body style="margin:0;padding:0;background:#0a0f14;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f14;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0f1a2e,#0d1b2a);border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(90deg,#003b6e,#0093d9,#b8860b);height:4px;"></td>
        </tr>
        <tr>
          <td style="padding:40px 48px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:13px;letter-spacing:3px;color:#0093d9;text-transform:uppercase;font-weight:700;">Sistema Geoespacial</p>
            <h1 style="margin:0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">GUAIKE.DÍAZ</h1>
            <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.4);">Municipio Díaz · Nueva Esparta, Venezuela</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:0 48px 40px;">
            <div style="background:rgba(255,255,255,0.04);border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,0.06);">
              <h2 style="margin:0 0 12px;font-size:22px;color:#ffffff;font-weight:700;">Confirma tu correo electrónico</h2>
              <p style="margin:0 0 24px;font-size:15px;color:rgba(255,255,255,0.65);line-height:1.7;">
                Gracias por registrarte en el Sistema Geoespacial de GUAIKE.DÍAZ. Para activar tu cuenta y comenzar a explorar el directorio turístico-artesanal del Municipio Díaz, confirma tu dirección de correo.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${actionLink}"
                   style="display:inline-block;background:linear-gradient(135deg,#0093d9,#005fa8);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:16px 40px;border-radius:12px;letter-spacing:0.3px;box-shadow:0 8px 24px rgba(0,147,217,0.35);">
                  ✓ &nbsp;Confirmar mi cuenta
                </a>
              </div>
              <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.35);text-align:center;line-height:1.6;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="${actionLink}" style="color:#0093d9;word-break:break-all;font-size:12px;">${actionLink}</a>
              </p>
            </div>
            <p style="margin:28px 0 0;font-size:13px;color:rgba(255,255,255,0.25);text-align:center;">
              Este enlace expira en 24 horas. Si no creaste esta cuenta, puedes ignorar este correo de forma segura.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 48px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);">
              © 2026 GUAIKE.DÍAZ · Alcaldía del Municipio Díaz · Nueva Esparta, Venezuela
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const recoveryEmailHtml = (actionLink: string) => `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Restablecer contraseña - GUAIKE.DÍAZ</title></head>
<body style="margin:0;padding:0;background:#0a0f14;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f14;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0f1a2e,#0d1b2a);border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
        <tr><td style="background:linear-gradient(90deg,#003b6e,#0093d9,#b8860b);height:4px;"></td></tr>
        <tr>
          <td style="padding:40px 48px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:13px;letter-spacing:3px;color:#0093d9;text-transform:uppercase;font-weight:700;">Sistema Geoespacial</p>
            <h1 style="margin:0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">GUAIKE.DÍAZ</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:0 48px 40px;">
            <div style="background:rgba(255,255,255,0.04);border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,0.06);">
              <h2 style="margin:0 0 12px;font-size:22px;color:#ffffff;font-weight:700;">Restablece tu contraseña</h2>
              <p style="margin:0 0 24px;font-size:15px;color:rgba(255,255,255,0.65);line-height:1.7;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para crear una nueva contraseña. Si no solicitaste esto, ignora este correo.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${actionLink}"
                   style="display:inline-block;background:linear-gradient(135deg,#b8860b,#d4a017);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:16px 40px;border-radius:12px;letter-spacing:0.3px;box-shadow:0 8px 24px rgba(184,134,11,0.35);">
                  🔑 &nbsp;Crear nueva contraseña
                </a>
              </div>
              <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.35);text-align:center;line-height:1.6;">
                Si el botón no funciona, copia y pega este enlace:<br>
                <a href="${actionLink}" style="color:#0093d9;word-break:break-all;font-size:12px;">${actionLink}</a>
              </p>
            </div>
            <p style="margin:28px 0 0;font-size:13px;color:rgba(255,255,255,0.25);text-align:center;">
              Este enlace expira en 1 hora por razones de seguridad.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 48px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);">
              © 2026 GUAIKE.DÍAZ · Alcaldía del Municipio Díaz · Nueva Esparta, Venezuela
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ── Main handler ───────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Método no permitido." }); return; }

  const { type, email, password, metadata, redirectTo, secretKey } = req.body || {};

  // Validate secret
  const systemSecret = process.env.API_SECRET_KEY || "guaike-system-default-secret-key-2026";
  if (secretKey !== systemSecret) {
    res.status(401).json({ error: "No autorizado." });
    return;
  }

  if (!email) { res.status(400).json({ error: "El correo es obligatorio." }); return; }

  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const fromName = process.env.SMTP_FROM_NAME || "GUAIKE.DÍAZ";
  const fromAddress = process.env.SMTP_FROM_EMAIL || smtpUser;

  try {
    const transporter = getTransporter();

    if (type === "signup") {
      if (!password) { res.status(400).json({ error: "La contraseña es obligatoria para el registro." }); return; }

      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email,
        password,
        options: { data: metadata ?? {}, redirectTo: redirectTo || "" },
      });

      if (error) {
        // If user already exists, generate a magic link to resend confirmation
        if (error.message?.includes("already") || error.message?.includes("registered")) {
          const { data: ml, error: mlErr } = await supabaseAdmin.auth.admin.generateLink({
            type: "magiclink",
            email,
            options: { redirectTo: redirectTo || "" },
          });
          if (mlErr || !ml?.properties?.action_link) {
            res.status(400).json({ error: "Este correo ya está registrado. Intenta iniciar sesión." });
            return;
          }
          await transporter.sendMail({
            from: `"${fromName}" <${fromAddress}>`,
            to: email,
            subject: "Confirma tu correo electrónico · GUAIKE.DÍAZ",
            html: confirmationEmailHtml(ml.properties.action_link),
            text: `Confirma tu cuenta en GUAIKE.DÍAZ: ${ml.properties.action_link}`,
          });
          res.status(200).json({ message: "Correo de confirmación reenviado." });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }

      const actionLink = data?.properties?.action_link;
      if (!actionLink) { res.status(500).json({ error: "No se pudo generar el enlace de confirmación." }); return; }

      await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: email,
        subject: "Confirma tu correo electrónico · GUAIKE.DÍAZ",
        html: confirmationEmailHtml(actionLink),
        text: `Confirma tu cuenta en GUAIKE.DÍAZ visitando: ${actionLink}`,
      });

      res.status(200).json({ message: "Correo de confirmación enviado correctamente." });
      return;
    }

    if (type === "recovery") {
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo: redirectTo || "" },
      });

      if (error) { res.status(400).json({ error: error.message }); return; }

      const actionLink = data?.properties?.action_link;
      if (!actionLink) { res.status(500).json({ error: "No se pudo generar el enlace de recuperación." }); return; }

      await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: email,
        subject: "Restablece tu contraseña · GUAIKE.DÍAZ",
        html: recoveryEmailHtml(actionLink),
        text: `Restablece tu contraseña en GUAIKE.DÍAZ: ${actionLink}`,
      });

      res.status(200).json({ message: "Correo de recuperación enviado correctamente." });
      return;
    }

    if (type === "reset") {
      const { password } = req.body || {};
      if (!password) { res.status(400).json({ error: "La contraseña es obligatoria para el restablecimiento." }); return; }

      // 1. Obtener el auth_id del usuario desde la tabla usuarios
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("usuarios")
        .select("auth_id")
        .eq("correo", email)
        .maybeSingle();

      if (profileError || !profile || !profile.auth_id) {
        res.status(404).json({ error: "Usuario no registrado o no tiene una cuenta de autenticación vinculada." });
        return;
      }

      // 2. Actualizar la contraseña del usuario en Supabase Auth
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(profile.auth_id, {
        password: password,
      });

      if (updateError) {
        res.status(400).json({ error: updateError.message });
        return;
      }

      res.status(200).json({ message: "Contraseña restablecida exitosamente." });
      return;
    }

    res.status(400).json({ error: `Tipo de correo no reconocido: ${type}` });
  } catch (err: any) {
    console.error("[auth-email] Error:", err);
    res.status(500).json({ error: err.message || "Error interno al enviar el correo." });
  }
}
