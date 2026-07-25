import { env } from "./env";

export class InstagramNotConfiguredError extends Error {}

export function isInstagramConfigured(): boolean {
  return Boolean(env.INSTAGRAM_APP_ID && env.INSTAGRAM_APP_SECRET && env.INSTAGRAM_REDIRECT_URI);
}

export function ensureInstagramConfigured(): void {
  if (!isInstagramConfigured()) {
    throw new InstagramNotConfiguredError("Instagram entegrasyonu yapılandırılmamış");
  }
}

const INSTAGRAM_SCOPE = "instagram_business_basic";

export function buildAuthorizeUrl(state: string): string {
  ensureInstagramConfigured();
  const params = new URLSearchParams({
    client_id: env.INSTAGRAM_APP_ID,
    redirect_uri: env.INSTAGRAM_REDIRECT_URI,
    response_type: "code",
    scope: INSTAGRAM_SCOPE,
    state,
  });
  return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
}
