import { Types } from "mongoose";
import { z } from "zod";
import { createCase as createCaseRecord, listCasesPage } from "../repositories/case.repository";
import { findUserById } from "../repositories/user.repository";
import { buildCaseImageStorageKey, createDownloadUrl, createUploadUrl } from "../config/storage";
import { HttpError } from "../utils/httpError";
import type { createCaseSchema } from "../validators/case.validator";

type CreateCaseBody = z.infer<typeof createCaseSchema>;

interface AuthorInfo {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

interface AuthorSource {
  _id: Types.ObjectId;
  email: string;
  showcase: { displayName: string; avatarKey?: string | null };
}

interface CaseLike {
  _id: Types.ObjectId;
  title: string;
  description: string;
  specialties: string[];
  images: { storageKey: string; stage: string }[];
  createdAt: Date;
}

async function resolveAuthor(user: AuthorSource): Promise<AuthorInfo> {
  const avatarUrl = user.showcase.avatarKey ? await createDownloadUrl(user.showcase.avatarKey) : null;
  return {
    id: user._id.toString(),
    displayName: user.showcase.displayName || user.email,
    avatarUrl,
  };
}

async function serializeCase(caseDoc: CaseLike, author: AuthorInfo) {
  const images = await Promise.all(
    caseDoc.images.map(async (image) => ({
      stage: image.stage,
      url: await createDownloadUrl(image.storageKey),
    })),
  );

  return {
    id: caseDoc._id.toString(),
    title: caseDoc.title,
    description: caseDoc.description,
    specialties: caseDoc.specialties,
    images,
    author,
    createdAt: caseDoc.createdAt,
  };
}

export async function requestImageUploadUrl(userId: string, contentType: string) {
  const storageKey = buildCaseImageStorageKey(userId, contentType);
  const uploadUrl = await createUploadUrl(storageKey, contentType);
  return { uploadUrl, storageKey };
}

export async function createCase(userId: string, input: CreateCaseBody) {
  const user = await findUserById(userId);
  if (!user) {
    throw new HttpError("Kullanıcı bulunamadı", 404);
  }
  if (user.kycLevel < 1) {
    throw new HttpError("Vaka paylaşmak için kimlik doğrulaması (Level 1) gerekli", 403);
  }

  const created = await createCaseRecord({
    userId: new Types.ObjectId(userId),
    title: input.title,
    description: input.description ?? "",
    specialties: input.specialties ?? [],
    images: input.images,
  });

  const author = await resolveAuthor(user);
  return serializeCase(created, author);
}

export async function getFeed(params: { cursor?: string; limit: number }) {
  const cursorDate = params.cursor ? new Date(params.cursor) : undefined;
  const { cases, hasMore } = await listCasesPage({ cursor: cursorDate, limit: params.limit });

  const items = await Promise.all(
    cases.map(async (caseDoc) => {
      const populatedUser = caseDoc.userId as unknown as AuthorSource;
      const author = await resolveAuthor(populatedUser);
      return serializeCase(caseDoc, author);
    }),
  );

  const last = cases[cases.length - 1];
  return {
    cases: items,
    nextCursor: hasMore && last ? last.createdAt.toISOString() : null,
  };
}
