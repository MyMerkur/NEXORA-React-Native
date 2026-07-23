import { z } from "zod";
import { USER_ROLES } from "../models/User";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
  role: z.enum(USER_ROLES),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
