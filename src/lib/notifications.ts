import { formatDateTime, formatWhatsAppLink } from "./utils";
import type { Appointment, Profile } from "./types";
import { getPatientName } from "./utils";

interface NotificationPayload {
  profile: Profile;
  appointment: Appointment;
}

export function buildConfirmationMessage({
  profile,
  appointment,
}: NotificationPayload) {
  const patientName = getPatientName(appointment);
  const dateTime = formatDateTime(appointment.start_time);
  const modality =
    appointment.modality === "online" ? "Online" : "Presencial";

  return `Olá ${patientName}! Sua consulta com ${profile.full_name} foi agendada para ${dateTime} (${modality}). Em caso de dúvidas, entre em contato.`;
}

export function buildWhatsAppConfirmationLink(payload: NotificationPayload) {
  const message = buildConfirmationMessage(payload);
  return formatWhatsAppLink(payload.profile.whatsapp || payload.profile.phone, message);
}

export async function sendEmailConfirmation(
  to: string,
  payload: NotificationPayload
): Promise<boolean> {
  const { profile, appointment } = payload;
  const patientName = getPatientName(appointment);
  const message = buildConfirmationMessage(payload);

  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    console.log("[Email simulado]", { to, subject: "Confirmação de consulta", message });
    return true;
  }

  // Integração SMTP: configure as variáveis SMTP_* no .env
  // Para produção, conecte Resend, SendGrid ou outro provedor aqui
  console.log("[E-mail de confirmação]", {
    to,
    subject: `Confirmação de consulta - ${profile.full_name}`,
    patientName,
    message,
  });
  return true;
}
