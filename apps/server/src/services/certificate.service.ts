import QRCode from "qrcode";
import { env } from "../config/env";
import { findByVerificationCode } from "../repositories/certificate.repository";

export function buildVerificationUrl(verificationCode: string): string {
  return env.PUBLIC_APP_BASE_URL
    ? `${env.PUBLIC_APP_BASE_URL}/api/v1/certificates/verify/${verificationCode}`
    : verificationCode;
}

export async function getQrCodeDataUrl(verificationCode: string): Promise<string> {
  return QRCode.toDataURL(buildVerificationUrl(verificationCode));
}

export interface CertificateVerificationResult {
  valid: boolean;
  participantName?: string;
  courseTitle?: string;
  instructorName?: string;
  issuedAt?: Date;
}

export async function verifyCertificate(code: string): Promise<CertificateVerificationResult> {
  const certificate = await findByVerificationCode(code);
  if (!certificate || certificate.revoked) {
    return { valid: false };
  }

  const course = certificate.courseId as unknown as {
    title: string;
    instructorId: { email: string; showcase: { displayName: string } };
  };
  const participant = certificate.userId as unknown as { email: string; showcase: { displayName: string } };

  return {
    valid: true,
    participantName: participant.showcase.displayName || participant.email,
    courseTitle: course.title,
    instructorName: course.instructorId.showcase.displayName || course.instructorId.email,
    issuedAt: certificate.issuedAt,
  };
}
