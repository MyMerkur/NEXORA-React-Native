import { findUserById, findByAffiliatedOrg } from "../repositories/user.repository";
import * as orgVoteRepo from "../repositories/orgVote.repository";
import * as orgVoteBallotRepo from "../repositories/orgVoteBallot.repository";
import { notifyOrgVoteOpened } from "./notification.service";
import { HttpError } from "../utils/httpError";
import type { OrgVoteStatus } from "../models/OrgVote";

async function requireDernekOwner(userId: string, orgId: string) {
  if (userId !== orgId) {
    throw new HttpError("Bu işlem için derneğin sahibi olmalısınız", 403);
  }
  const user = await findUserById(userId);
  if (!user) {
    throw new HttpError("Kullanıcı bulunamadı", 404);
  }
  if (user.role !== "dernek") {
    throw new HttpError("Bu özellik sadece dernek hesapları için kullanılabilir", 403);
  }
  return user;
}

async function requireOrgMember(userId: string, orgId: string) {
  if (userId === orgId) {
    return;
  }
  const user = await findUserById(userId);
  if (!user || user.affiliatedOrgId?.toString() !== orgId) {
    throw new HttpError("Bu içeriğe erişmek için derneğe üye olmalısınız", 403);
  }
}

interface VoteLike {
  _id: { toString(): string };
  orgId: { toString(): string };
  question: string;
  options: string[];
  status: OrgVoteStatus;
  createdAt: Date;
}

async function serializeVote(vote: VoteLike, userId: string) {
  const counts = await orgVoteBallotRepo.countsByVote(vote._id.toString());
  const myBallot = await orgVoteBallotRepo.findByVoteAndUser(vote._id.toString(), userId);

  return {
    id: vote._id.toString(),
    orgId: vote.orgId.toString(),
    question: vote.question,
    status: vote.status,
    results: vote.options.map((option, index) => ({ option, count: counts.get(index) ?? 0 })),
    myOptionIndex: myBallot ? myBallot.optionIndex : null,
    createdAt: vote.createdAt,
  };
}

export async function createVote(userId: string, orgId: string, input: { question: string; options: string[] }) {
  const owner = await requireDernekOwner(userId, orgId);

  const created = await orgVoteRepo.create({ orgId, question: input.question, options: input.options });

  const orgName = owner.showcase.displayName || owner.email;
  const members = await findByAffiliatedOrg(orgId);
  await Promise.all(members.map((member) => notifyOrgVoteOpened(member._id.toString(), orgName, input.question)));

  return serializeVote(created, userId);
}

export async function listVotes(userId: string, orgId: string) {
  await requireOrgMember(userId, orgId);
  const votes = await orgVoteRepo.listByOrg(orgId);
  return Promise.all(votes.map((vote) => serializeVote(vote, userId)));
}

export async function castBallot(userId: string, voteId: string, optionIndex: number) {
  const vote = await orgVoteRepo.findById(voteId);
  if (!vote) {
    throw new HttpError("Oylama bulunamadı", 404);
  }
  await requireOrgMember(userId, vote.orgId.toString());
  if (vote.status !== "open") {
    throw new HttpError("Bu oylama artık kapalı", 400);
  }
  if (optionIndex < 0 || optionIndex >= vote.options.length) {
    throw new HttpError("Geçersiz seçenek", 400);
  }

  const existing = await orgVoteBallotRepo.findByVoteAndUser(voteId, userId);
  if (existing) {
    throw new HttpError("Bu oylamada zaten oy kullandınız", 409);
  }

  await orgVoteBallotRepo.create({ voteId, userId, optionIndex });
  return serializeVote(vote, userId);
}

export async function closeVote(userId: string, voteId: string) {
  const vote = await orgVoteRepo.findById(voteId);
  if (!vote) {
    throw new HttpError("Oylama bulunamadı", 404);
  }
  await requireDernekOwner(userId, vote.orgId.toString());

  const updated = await orgVoteRepo.updateStatus(voteId, "closed");
  return serializeVote(updated!, userId);
}
