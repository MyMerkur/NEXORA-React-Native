import rateLimit from "express-rate-limit";
import { env } from "../config/env";

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Çok fazla deneme yapıldı, lütfen daha sonra tekrar deneyin" },
});

export const paymentRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: env.PAYMENT_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Çok fazla ödeme isteği yapıldı, lütfen daha sonra tekrar deneyin" },
});
