import { Types } from "mongoose";
import { DeviceTokenModel, type DevicePlatform } from "../models/DeviceToken";

export async function upsertToken(userId: string, token: string, platform: DevicePlatform) {
  return DeviceTokenModel.findOneAndUpdate(
    { token },
    { $set: { userId: new Types.ObjectId(userId), platform } },
    { upsert: true, new: true },
  );
}

export async function listTokensByUser(userId: string) {
  return DeviceTokenModel.find({ userId: new Types.ObjectId(userId) });
}

export async function removeTokens(tokens: string[]) {
  return DeviceTokenModel.deleteMany({ token: { $in: tokens } });
}
