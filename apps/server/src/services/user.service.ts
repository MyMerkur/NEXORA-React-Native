import { findUserById } from "../repositories/user.repository";
import { buildAvatarStorageKey, createDownloadUrl, createUploadUrl } from "../config/storage";
import { HttpError } from "../utils/httpError";
import type { updateCareerSchema, updateShowcaseSchema } from "../validators/user.validator";
import type { z } from "zod";

type ShowcasePatch = z.infer<typeof updateShowcaseSchema>;
type CareerPatch = z.infer<typeof updateCareerSchema>;

export async function getMe(userId: string) {
  const user = await findUserById(userId);
  if (!user) {
    throw new HttpError("Kullanıcı bulunamadı", 404);
  }

  const avatarUrl = user.showcase.avatarKey ? await createDownloadUrl(user.showcase.avatarKey) : null;

  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    kycLevel: user.kycLevel,
    showcase: {
      displayName: user.showcase.displayName,
      title: user.showcase.title,
      bio: user.showcase.bio,
      avatarUrl,
      workplace: user.showcase.workplace,
      city: user.showcase.city,
      specialties: user.showcase.specialties,
    },
    career: {
      openToWork: user.career.openToWork,
      desiredPositions: user.career.desiredPositions,
      experienceYears: user.career.experienceYears,
      experience: user.career.experience,
    },
  };
}

export async function updateShowcase(userId: string, patch: ShowcasePatch) {
  const user = await findUserById(userId);
  if (!user) {
    throw new HttpError("Kullanıcı bulunamadı", 404);
  }

  Object.assign(user.showcase, patch);
  await user.save();

  return getMe(userId);
}

export async function updateCareer(userId: string, patch: CareerPatch) {
  const user = await findUserById(userId);
  if (!user) {
    throw new HttpError("Kullanıcı bulunamadı", 404);
  }

  Object.assign(user.career, patch);
  await user.save();

  return getMe(userId);
}

export async function requestAvatarUploadUrl(userId: string, contentType: string) {
  const storageKey = buildAvatarStorageKey(userId, contentType);
  const uploadUrl = await createUploadUrl(storageKey, contentType);
  return { uploadUrl, storageKey };
}
