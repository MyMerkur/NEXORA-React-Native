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

// A user's full email is PII and shouldn't be shown to other users just because they haven't
// set a showcase display name — this surfaces everywhere resolveUserSummary is used (thread
// lists, candidate cards, reference authorship, team listings), including to people who are
// otherwise strangers to the account. The local part of the email is a much smaller exposure
// than the full address (no domain, not directly usable to contact/spam them).
export function fallbackDisplayName(email: string): string {
  return email.split("@")[0] ?? email;
}

export async function resolveUserSummary(user: UserSummarySource): Promise<UserSummary> {
  const avatarUrl = user.showcase.avatarKey ? await createDownloadUrl(user.showcase.avatarKey) : null;
  return {
    id: user._id.toString(),
    displayName: user.showcase.displayName || fallbackDisplayName(user.email),
    avatarUrl,
  };
}
