import { env } from "../config/env";
import { ensureInstagramConfigured } from "../config/instagram";
import { HttpError } from "../utils/httpError";
import { logger } from "../utils/logger";

export interface TokenExchangeResult {
  accessToken: string;
  instagramUserId: string;
}

export interface LongLivedTokenResult {
  accessToken: string;
  expiresInSeconds: number;
}

export interface InstagramProfile {
  id: string;
  username: string;
}

export type InstagramMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

export interface RawInstagramMedia {
  id: string;
  caption?: string;
  media_type: InstagramMediaType;
  media_url: string;
  permalink: string;
  timestamp: string;
}

interface GraphErrorEnvelope {
  error?: { message?: string; type?: string; code?: number };
}

async function parseGraphResponse<T>(response: Response, context: string): Promise<T> {
  const json = (await response.json().catch(() => null)) as (T & GraphErrorEnvelope) | null;

  if (!response.ok || !json || json.error) {
    logger.error("instagramGraph.request.failed", {
      context,
      httpStatus: response.status,
      errorMessage: json?.error?.message,
    });
    throw new HttpError("Instagram isteği başarısız", 502);
  }

  return json as T;
}

export async function exchangeCodeForToken(code: string): Promise<TokenExchangeResult> {
  ensureInstagramConfigured();

  const form = new FormData();
  form.set("client_id", env.INSTAGRAM_APP_ID);
  form.set("client_secret", env.INSTAGRAM_APP_SECRET);
  form.set("grant_type", "authorization_code");
  form.set("redirect_uri", env.INSTAGRAM_REDIRECT_URI);
  form.set("code", code);

  let response: Response;
  try {
    response = await fetch("https://api.instagram.com/oauth/access_token", { method: "POST", body: form });
  } catch (error) {
    logger.error("instagramGraph.exchangeCode.network_error", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new HttpError("Instagram'a ulaşılamadı", 502);
  }

  const json = await parseGraphResponse<{ access_token: string; user_id: string }>(response, "exchangeCodeForToken");
  return { accessToken: json.access_token, instagramUserId: json.user_id };
}

export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<LongLivedTokenResult> {
  ensureInstagramConfigured();
  const params = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: env.INSTAGRAM_APP_SECRET,
    access_token: shortLivedToken,
  });

  let response: Response;
  try {
    response = await fetch(`https://graph.instagram.com/access_token?${params.toString()}`);
  } catch (error) {
    logger.error("instagramGraph.exchangeLongLived.network_error", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new HttpError("Instagram'a ulaşılamadı", 502);
  }

  const json = await parseGraphResponse<{ access_token: string; expires_in: number }>(
    response,
    "exchangeForLongLivedToken",
  );
  return { accessToken: json.access_token, expiresInSeconds: json.expires_in };
}

export async function refreshLongLivedToken(accessToken: string): Promise<LongLivedTokenResult> {
  const params = new URLSearchParams({ grant_type: "ig_refresh_token", access_token: accessToken });

  let response: Response;
  try {
    response = await fetch(`https://graph.instagram.com/refresh_access_token?${params.toString()}`);
  } catch (error) {
    logger.error("instagramGraph.refresh.network_error", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new HttpError("Instagram'a ulaşılamadı", 502);
  }

  const json = await parseGraphResponse<{ access_token: string; expires_in: number }>(response, "refreshLongLivedToken");
  return { accessToken: json.access_token, expiresInSeconds: json.expires_in };
}

export async function fetchProfile(accessToken: string): Promise<InstagramProfile> {
  const params = new URLSearchParams({ fields: "id,username", access_token: accessToken });

  let response: Response;
  try {
    response = await fetch(`https://graph.instagram.com/me?${params.toString()}`);
  } catch (error) {
    logger.error("instagramGraph.fetchProfile.network_error", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new HttpError("Instagram'a ulaşılamadı", 502);
  }

  return parseGraphResponse<InstagramProfile>(response, "fetchProfile");
}

export async function fetchMedia(accessToken: string): Promise<RawInstagramMedia[]> {
  const params = new URLSearchParams({
    fields: "id,caption,media_type,media_url,permalink,timestamp",
    access_token: accessToken,
  });

  let response: Response;
  try {
    response = await fetch(`https://graph.instagram.com/me/media?${params.toString()}`);
  } catch (error) {
    logger.error("instagramGraph.fetchMedia.network_error", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new HttpError("Instagram'a ulaşılamadı", 502);
  }

  const json = await parseGraphResponse<{ data: RawInstagramMedia[] }>(response, "fetchMedia");
  return json.data;
}
