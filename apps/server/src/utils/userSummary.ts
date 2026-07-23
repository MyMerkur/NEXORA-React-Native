import type { Types } from "mongoose";
import { createDownloadUrl } from "../config/storage";

export interface UserSummary {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface UserSummarySource {
  _id: Types.ObjectId;
  email: string;
  showcase: { displayName: string; avatarKey?: string | null };
}

export async function resolveUserSummary(user: UserSummarySource): Promise<UserSummary> {
  const avatarUrl = user.showcase.avatarKey ? await createDownloadUrl(user.showcase.avatarKey) : null;
  return {
    id: user._id.toString(),
    displayName: user.showcase.displayName || user.email,
    avatarUrl,
  };
}
