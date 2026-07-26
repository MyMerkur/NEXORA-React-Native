import { randomUUID } from "crypto";
import { findUserById } from "../repositories/user.repository";
import {
  create as createOAuthState,
  findByState,
  deleteById as deleteOAuthStateById,
} from "../repositories/instagramOAuthState.repository";
import {
  upsertForUser,
  findByUserId,
  updateToken,
  deleteByUserId,
} from "../repositories/instagramConnection.repository";
import { buildAuthorizeUrl } from "../config/instagram";
import * as instagramGraph from "./instagramGraph.service";
import { encryptField, decryptField } from "../utils/fieldEncryption";
import { HttpError } from "../utils/httpError";

const INSTRUCTOR_KYC_LEVEL = 4;
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const TOKEN_REFRESH_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

async function requireInstructor(userId: string) {
  const user = await findUserById(userId);
  if (!user) {
    throw new HttpError("Kullanıcı bulunamadı", 404);
  }
  if (user.kycLevel < INSTRUCTOR_KYC_LEVEL) {
    throw new HttpError("Bu özellik sadece eğitmenler için kullanılabilir", 403);
  }
}

export async function startConnect(userId: string): Promise<{ authorizeUrl: string }> {
  await requireInstructor(userId);
  const state = randomUUID();
  await createOAuthState({ state, userId, expiresAt: new Date(Date.now() + OAUTH_STATE_TTL_MS) });
  return { authorizeUrl: buildAuthorizeUrl(state) };
}

const SUCCESS_HTML = "<html><body><p>Instagram bağlantısı başarılı. Bu pencereyi kapatabilirsin.</p></body></html>";
const CANCELLED_HTML = "<html><body><p>Instagram bağlantısı iptal edildi. Bu pencereyi kapatabilirsin.</p></body></html>";

export async function handleOauthCallback(query: {
  code?: string;
  state?: string;
  error?: string;
}): Promise<string> {
  if (query.error) {
    if (query.state) {
      const stateDoc = await findByState(query.state);
      if (stateDoc) {
        await deleteOAuthStateById(stateDoc._id.toString());
      }
    }
    return CANCELLED_HTML;
  }

  if (!query.state || !query.code) {
    throw new HttpError("Geçersiz Instagram geri çağrısı", 400);
  }

  const stateDoc = await findByState(query.state);
  if (!stateDoc || stateDoc.expiresAt < new Date()) {
    throw new HttpError("Instagram bağlantı isteğinin süresi doldu, lütfen tekrar deneyin", 400);
  }

  const { accessToken: shortLivedToken } = await instagramGraph.exchangeCodeForToken(query.code);
  const { accessToken: longLivedToken, expiresInSeconds } =
    await instagramGraph.exchangeForLongLivedToken(shortLivedToken);
  const profile = await instagramGraph.fetchProfile(longLivedToken);

  await upsertForUser({
    userId: stateDoc.userId.toString(),
    instagramUserId: profile.id,
    username: profile.username,
    accessTokenEncrypted: encryptField(longLivedToken),
    tokenExpiresAt: new Date(Date.now() + expiresInSeconds * 1000),
  });

  await deleteOAuthStateById(stateDoc._id.toString());
  return SUCCESS_HTML;
}

export async function getConnectionStatus(userId: string): Promise<{ connected: boolean; username: string | null }> {
  await requireInstructor(userId);
  const connection = await findByUserId(userId);
  return { connected: Boolean(connection), username: connection?.username ?? null };
}

export async function disconnectInstagram(userId: string): Promise<void> {
  await requireInstructor(userId);
  await deleteByUserId(userId);
}

export interface InstagramMediaSummary {
  id: string;
  caption: string;
  mediaUrl: string;
  permalink: string;
  timestamp: string;
}

export async function listRecentMedia(userId: string): Promise<InstagramMediaSummary[]> {
  await requireInstructor(userId);

  const connection = await findByUserId(userId);
  if (!connection) {
    throw new HttpError("Instagram hesabı bağlı değil", 404);
  }

  let accessToken = decryptField(connection.accessTokenEncrypted);

  if (connection.tokenExpiresAt.getTime() - Date.now() < TOKEN_REFRESH_THRESHOLD_MS) {
    const refreshed = await instagramGraph.refreshLongLivedToken(accessToken);
    accessToken = refreshed.accessToken;
    await updateToken(connection._id.toString(), {
      accessTokenEncrypted: encryptField(refreshed.accessToken),
      tokenExpiresAt: new Date(Date.now() + refreshed.expiresInSeconds * 1000),
    });
  }

  let media;
  try {
    media = await instagramGraph.fetchMedia(accessToken);
  } catch {
    throw new HttpError("Instagram bağlantısının süresi dolmuş, lütfen yeniden bağlayın", 409);
  }

  return media
    .filter((item) => item.media_type === "IMAGE")
    .map((item) => ({
      id: item.id,
      caption: item.caption ?? "",
      mediaUrl: item.media_url,
      permalink: item.permalink,
      timestamp: item.timestamp,
    }));
}
