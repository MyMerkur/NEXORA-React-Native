import { Types } from "mongoose";
import { InstagramOAuthStateModel } from "../models/InstagramOAuthState";

export async function create(data: { state: string; userId: string; expiresAt: Date }) {
  return InstagramOAuthStateModel.create({
    state: data.state,
    userId: new Types.ObjectId(data.userId),
    expiresAt: data.expiresAt,
  });
}

export async function findByState(state: string) {
  return InstagramOAuthStateModel.findOne({ state });
}

export async function deleteById(id: string) {
  await InstagramOAuthStateModel.findByIdAndDelete(id);
}
