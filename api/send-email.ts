/**
 * FUNCIÓN SERVERLESS DE VERCEL: ENVÍO GENÉRICO DE CORREOS ELECTRÓNICOS
 * 
 * Este endpoint maneja el envío de correos genéricos (como notificaciones,
 * avisos del administrador, etc.) a través de SMTP o Gmail utilizando Nodemailer.
 * Posee un sistema de autorización por clave secreta compartida (`secretKey`) para evitar
 * abusos y que terceros puedan usar el servidor para realizar SPAM.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configuración de cabeceras CORS para permitir la invocación desde la PWA/Frontend
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  // Atender peticiones CORS de tipo OPTIONS
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Restringir el método a únicamente POST
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

  // 2. Validar clave de seguridad para evitar spammer/abusadores en producción
  const systemSecret = process.env.API_SECRET_KEY || "guaike-system-default-secret-key-2026";
  if (secretKey !== systemSecret) {
    res.status(401).json({ error: "No autorizado. Clave secreta inválida." });
    return;
  }

  // 3. Carga de variables de configuración de SMTP desde el entorno del servidor
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const smtpSecure = process.env.SMTP_SECURE === "true";
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_PASS;
  const fromName = process.env.SMTP_FROM_NAME || "GUAIKE.DÍAZ";
  const fromEmail = process.env.SMTP_FROM_EMAIL || smtpUser;

  // Si no se encuentran credenciales SMTP básicas, se cancela el proceso informando el error
  if (!smtpUser || !smtpPass) {
    res.status(500).json({
      error: "Error de configuración de correo en el servidor. Variables SMTP_USER y SMTP_PASS (o GMAIL_USER y GMAIL_PASS) no definidas.",
    });
    return;
  }

  // Configuración dinámica del transportador
  const transporterConfig: any = {
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  };

  if (smtpHost) {
    // Si se especifica un servidor SMTP propio (ej. Sendgrid, Mailgun o hosting)
    transporterConfig.host = smtpHost;
    transporterConfig.port = smtpPort || 587;
    transporterConfig.secure = smtpSecure;
  } else {
    // Si no hay host, se recurre a la configuración predeterminada de Gmail
    transporterConfig.service = "gmail";
  }

  try {
    const transporter = nodemailer.createTransport(transporterConfig);

    // 4. Configurar datos de la cabecera y cuerpo del correo
    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    };

    // 5. Enviar el correo electrónico
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
