import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "../repositories/user.repository";
import { signAccessToken, signRefreshToken } from "../utils/jwt";
import { USER_ROLES } from "../models/User";

const SALT_ROUNDS = 12;

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
  }
}

export async function register(email: string, password: string, role: (typeof USER_ROLES)[number]) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AuthError("Bu e-posta adresi zaten kayıtlı", 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser({ email, passwordHash, role });

  return {
    user: { id: user._id.toString(), email: user.email, role: user.role },
    accessToken: signAccessToken({ sub: user._id.toString(), role: user.role }),
    refreshToken: signRefreshToken({ sub: user._id.toString(), role: user.role }),
  };
}

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AuthError("Geçersiz e-posta veya şifre", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new AuthError("Geçersiz e-posta veya şifre", 401);
  }

  return {
    user: { id: user._id.toString(), email: user.email, role: user.role },
    accessToken: signAccessToken({ sub: user._id.toString(), role: user.role }),
    refreshToken: signRefreshToken({ sub: user._id.toString(), role: user.role }),
  };
}
