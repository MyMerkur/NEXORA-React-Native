import { z } from "zod";
import { USER_ROLES } from "../models/User";

const passwordPolicy = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalı")
  .max(72, "Şifre en fazla 72 karakter olabilir")
  .regex(/[a-z]/, "Şifre en az bir küçük harf içermeli")
  .regex(/[A-Z]/, "Şifre en az bir büyük harf içermeli")
  .regex(/[0-9]/, "Şifre en az bir rakam içermeli");

export const registerSchema = z.object({
  email: z.string().email(),
  password: passwordPolicy,
  role: z.enum(USER_ROLES),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(72),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});
