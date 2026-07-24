import { apiClient } from "./authApi";

export interface InstructorInviteResult {
  id: string;
  email: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

export async function acceptInstructorInvite(token: string): Promise<InstructorInviteResult> {
  const { data } = await apiClient.post<InstructorInviteResult>(`/api/v1/instructor-invites/${token}/accept`);
  return data;
}
