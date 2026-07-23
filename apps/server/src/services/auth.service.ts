import bcrypt from "bcryptjs";
import type { Types } from "mongoose";
import { createUser, findUserByEmail, findUserById } from "../repositories/user.repository";
import { createRefreshToken, findValidByHash, revokeByHash } from "../repositories/refreshToken.repository";
import {
  refreshTokenExpiryDate,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { sha256Hex } from "../utils/hash";
import { logger } from "../utils/logger";
import { USER_ROLES } from "../models/User";

const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
  }
}

interface SessionUser {
  _id: Types.ObjectId;
  email: string;
  role: string;
}

async function issueSession(user: SessionUser) {
  const subject = { sub: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(subject);
  const refreshToken = signRefreshToken(subject);

  await createRefreshToken(user._id, sha256Hex(refreshToken), refreshTokenExpiryDate());

  return {
    user: { id: user._id.toString(), email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
}

export async function register(email: string, password: string, role: (typeof USER_ROLES)[number]) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AuthError("Bu e-posta adresi zaten kayıtlı", 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser({ email, passwordHash, role });

  logger.info("auth.register", { userId: user._id.toString(), email: user.email });

  return issueSession(user);
}

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    logger.info("auth.login.failed", { email, reason: "unknown_email" });
    throw new AuthError("Geçersiz e-posta veya şifre", 401);
  }

  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    logger.info("auth.login.blocked", { userId: user._id.toString(), reason: "locked" });
    throw new AuthError("Hesap çok fazla başarısız denemeden dolayı geçici olarak kilitlendi", 423);
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
      user.failedLoginAttempts = 0;
      logger.info("auth.login.locked", { userId: user._id.toString() });
    }
    await user.save();
    logger.info("auth.login.failed", { userId: user._id.toString(), reason: "bad_password" });
    throw new AuthError("Geçersiz e-posta veya şifre", 401);
  }

  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  await user.save();

  logger.info("auth.login.success", { userId: user._id.toString() });

  return issueSession(user);
}

export async function refresh(refreshTokenRaw: string) {
  let subject: { sub: string };
  try {
    subject = verifyRefreshToken(refreshTokenRaw);
  } catch {
    throw new AuthError("Geçersiz oturum", 401);
  }

  const tokenHash = sha256Hex(refreshTokenRaw);
  const stored = await findValidByHash(tokenHash);
  if (!stored) {
    logger.info("auth.refresh.rejected", { userId: subject.sub });
    throw new AuthError("Geçersiz oturum", 401);
  }

  await revokeByHash(tokenHash);

  const user = await findUserById(subject.sub);
  if (!user) {
    throw new AuthError("Geçersiz oturum", 401);
  }

  logger.info("auth.refresh.success", { userId: user._id.toString() });

  return issueSession(user);
}

export async function logout(refreshTokenRaw: string): Promise<void> {
  const tokenHash = sha256Hex(refreshTokenRaw);
  await revokeByHash(tokenHash);
  logger.info("auth.logout", { tokenHash });
}
