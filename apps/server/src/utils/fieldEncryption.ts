import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { env } from "../config/env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function deriveKey(): Buffer {
  return createHash("sha256").update(env.FIELD_ENCRYPTION_KEY).digest();
}

export function encryptField(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, deriveKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${ciphertext.toString("base64")}`;
}

export function decryptField(payload: string): string {
  const [ivPart, authTagPart, ciphertextPart] = payload.split(":");
  if (!ivPart || !authTagPart || !ciphertextPart) {
    throw new Error("Geçersiz şifreli alan formatı");
  }
  const decipher = createDecipheriv(ALGORITHM, deriveKey(), Buffer.from(ivPart, "base64"));
  decipher.setAuthTag(Buffer.from(authTagPart, "base64"));
  const plaintext = Buffer.concat([decipher.update(Buffer.from(ciphertextPart, "base64")), decipher.final()]);
  return plaintext.toString("utf8");
}
