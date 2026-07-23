import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { env } from "../config/env";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

export interface TokenSubject {
  sub: string;
  role: string;
}

interface AccessTokenPayload extends TokenSubject {
  type: "access";
}

interface RefreshTokenPayload extends TokenSubject {
  type: "refresh";
}

export function signAccessToken(payload: TokenSubject): string {
  const tokenPayload: AccessTokenPayload = { ...payload, type: "access" };
  return jwt.sign(tokenPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    jwtid: randomUUID(),
  });
}

export function signRefreshToken(payload: TokenSubject): string {
  const tokenPayload: RefreshTokenPayload = { ...payload, type: "refresh" };
  return jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL_SECONDS,
    jwtid: randomUUID(),
  });
}

export function refreshTokenExpiryDate(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
}

export function verifyAccessToken(token: string): TokenSubject {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  if (payload.type !== "access") {
    throw new jwt.JsonWebTokenError("Invalid token type");
  }
  return payload;
}

export function verifyRefreshToken(token: string): TokenSubject {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  if (payload.type !== "refresh") {
    throw new jwt.JsonWebTokenError("Invalid token type");
  }
  return payload;
}
