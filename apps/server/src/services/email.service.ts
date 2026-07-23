import nodemailer from "nodemailer";
import { env } from "../config/env";

export class EmailNotConfiguredError extends Error {}

function isEmailConfigured(): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM);
}

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  if (!isEmailConfigured()) {
    throw new EmailNotConfiguredError("SMTP yapılandırılmamış");
  }

  const port = Number(env.SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: params.to,
    subject: params.subject,
    text: params.text,
  });
}
