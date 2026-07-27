import { Types } from "mongoose";
import { SniperUnlockModel } from "../models/SniperUnlock";

export async function create(employerId: string, candidateId: string) {
  return SniperUnlockModel.create({
    employerId: new Types.ObjectId(employerId),
    candidateId: new Types.ObjectId(candidateId),
  });
}

export async function findByEmployerAndCandidate(employerId: string, candidateId: string) {
  return SniperUnlockModel.findOne({
    employerId: new Types.ObjectId(employerId),
    candidateId: new Types.ObjectId(candidateId),
  });
}

export async function listCandidateIdsByEmployer(employerId: string): Promise<string[]> {
  const unlocks = await SniperUnlockModel.find({ employerId: new Types.ObjectId(employerId) }, { candidateId: 1 });
  return unlocks.map((unlock) => unlock.candidateId.toString());
}

export async function deleteByEmployerAndCandidate(employerId: string, candidateId: string) {
  await SniperUnlockModel.deleteOne({
    employerId: new Types.ObjectId(employerId),
    candidateId: new Types.ObjectId(candidateId),
  });
}
