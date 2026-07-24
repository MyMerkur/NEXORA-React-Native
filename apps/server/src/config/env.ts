import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  ATLAS_URI_DEV: z.string().min(1, "ATLAS_URI_DEV is required"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  FIELD_ENCRYPTION_KEY: z.string().min(32, "FIELD_ENCRYPTION_KEY is required (min 32 chars)"),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:8081")
    .transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean)),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(10),
  R2_ENDPOINT: z.string().default(""),
  R2_ACCESS_KEY: z.string().default(""),
  R2_SECRET_KEY: z.string().default(""),
  R2_BUCKET: z.string().default(""),
  ANTHROPIC_API_KEY: z.string().default(""),
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.string().default(""),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  SMTP_FROM: z.string().default(""),
  IYZICO_API_KEY: z.string().default(""),
  IYZICO_SECRET_KEY: z.string().default(""),
  IYZICO_BASE_URL: z.string().default("https://sandbox-api.iyzipay.com"),
  IYZICO_MERCHANT_ID: z.string().default(""),
  IYZICO_PRICING_PLAN_REFERENCE_CODE: z.string().default(""),
  IYZICO_CALLBACK_URL: z.string().default(""),
  PAYMENT_RATE_LIMIT_MAX: z.coerce.number().default(20),
  ADMIN_EMAILS: z
    .string()
    .default("")
    .transform((value) => value.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean)),
});

export const env = envSchema.parse(process.env);
