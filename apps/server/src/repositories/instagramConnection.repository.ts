import { Types } from "mongoose";
import { InstagramConnectionModel } from "../models/InstagramConnection";

export async function upsertForUser(data: {
  userId: string;
  instagramUserId: string;
  username: string;
  accessTokenEncrypted: string;
  tokenExpiresAt: Date;
}) {
  return InstagramConnectionModel.findOneAndUpdate(
    { userId: new Types.ObjectId(data.userId) },
    {
      $set: {
        instagramUserId: data.instagramUserId,
        username: data.username,
        accessTokenEncrypted: data.accessTokenEncrypted,
        tokenExpiresAt: data.tokenExpiresAt,
      },
    },
    { new: true, upsert: true },
  );
}

export async function findByUserId(userId: string) {
  return InstagramConnectionModel.findOne({ userId: new Types.ObjectId(userId) });
}

export async function updateToken(id: string, data: { accessTokenEncrypted: string; tokenExpiresAt: Date }) {
  return InstagramConnectionModel.findByIdAndUpdate(id, { $set: data }, { new: true });
}

export async function deleteByUserId(userId: string) {
  await InstagramConnectionModel.deleteOne({ userId: new Types.ObjectId(userId) });
}
