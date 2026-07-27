import * as userRepo from "../repositories/user.repository";
import * as sniperUnlockRepo from "../repositories/sniperUnlock.repository";
import { requireVerifiedEmployer } from "./sniperCredit.service";
import { decrementSniperCreditsIfSufficient } from "../repositories/user.repository";
import { resolveUserSummary, type UserSummarySource } from "../utils/userSummary";
import { startOrGetThread } from "./inbox.service";
import { HttpError } from "../utils/httpError";

const UNLOCK_COST = 1;

interface SearchFilters {
  specialties?: string[];
  city?: string;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  limit?: number;
}

interface CandidateForSerialization {
  _id: { toString(): string };
  email: string;
  showcase: { displayName: string; avatarKey?: string | null; specialties: string[]; city: string };
  career: { experienceYears: number | null };
}

async function serializeCandidate(candidate: CandidateForSerialization, unlocked: boolean) {
  if (unlocked) {
    const summary = await resolveUserSummary(candidate as unknown as UserSummarySource);
    return {
      candidateId: candidate._id.toString(),
      unlocked: true,
      displayName: summary.displayName,
      avatarUrl: summary.avatarUrl,
      specialties: candidate.showcase.specialties,
      city: candidate.showcase.city,
      experienceYears: candidate.career.experienceYears,
    };
  }

  return {
    candidateId: candidate._id.toString(),
    unlocked: false,
    displayName: null,
    avatarUrl: null,
    specialties: candidate.showcase.specialties,
    city: candidate.showcase.city,
    experienceYears: candidate.career.experienceYears,
  };
}

export async function searchCandidates(employerId: string, filters: SearchFilters) {
  await requireVerifiedEmployer(employerId);

  const candidates = await userRepo.searchSniperCandidates({
    specialties: filters.specialties ?? [],
    city: filters.city,
    minExperienceYears: filters.minExperienceYears,
    maxExperienceYears: filters.maxExperienceYears,
    limit: Math.min(filters.limit ?? 20, 50),
  });

  const unlockedIds = new Set(await sniperUnlockRepo.listCandidateIdsByEmployer(employerId));

  return Promise.all(
    candidates.map((candidate) =>
      serializeCandidate(candidate as unknown as CandidateForSerialization, unlockedIds.has(candidate._id.toString())),
    ),
  );
}

export async function unlockCandidate(employerId: string, candidateId: string) {
  await requireVerifiedEmployer(employerId);

  const candidate = await userRepo.findDiscoverableCandidateById(candidateId);
  if (!candidate) {
    throw new HttpError("Aday bulunamadı", 404);
  }

  const existing = await sniperUnlockRepo.findByEmployerAndCandidate(employerId, candidateId);
  if (!existing) {
    const updated = await decrementSniperCreditsIfSufficient(employerId, UNLOCK_COST);
    if (!updated) {
      throw new HttpError("Yetersiz Keskin Nişancı kredisi", 402);
    }
    await sniperUnlockRepo.create(employerId, candidateId);
  }

  const thread = await startOrGetThread(employerId, candidateId);
  const candidateSummary = await serializeCandidate(candidate as unknown as CandidateForSerialization, true);

  return { candidate: candidateSummary, thread };
}
