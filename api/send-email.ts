import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers for API
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  const { to, subject, text, html, secretKey } = req.body || {};

  // 1. Validar parámetros obligatorios
  if (!to || !subject || (!text && !html)) {
    res.status(400).json({ error: "Faltan parámetros obligatorios (to, subject, text/html)" });
    return;
  }

  // 2. Validar clave de seguridad para evitar spammer/abusadores
  const systemSecret = process.env.API_SECRET_KEY || "guaike-system-default-secret-key-2026";
  if (secretKey !== systemSecret) {
    res.status(401).json({ error: "No autorizado. Clave secreta inválida." });
    return;
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS; // Contraseña de aplicación de Google

  if (!gmailUser || !gmailPass) {
    res.status(500).json({
      error: "Error de configuración de correo en el servidor. Variables GMAIL_USER y GMAIL_PASS no definidas.",
    });
    return;
  }

  try {
    // 3. Configurar transporte SMTP para Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    // 4. Configurar datos del correo
    const mailOptions = {
      from: `"GUAIKE.DÍAZ" <${gmailUser}>`,
      to,
      subject,
      text,
      html,
    };

    // 5. Enviar el correo
    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Correo enviado exitosamente",
      messageId: info.messageId,
    });
  } catch (error: any) {
    console.error("Error enviando correo SMTP:", error);
    res.status(500).json({
      error: "Error interno al enviar el correo",
      details: error.message || error,
    });
  }
}
