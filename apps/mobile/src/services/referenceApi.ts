import { apiClient } from "./authApi";

export type ReferenceStatus = "pending" | "written" | "hidden";

export interface ReferenceItem {
  id: string;
  status: ReferenceStatus;
  relationship: string;
  body: string;
  counterpart: { id: string; displayName: string; avatarUrl: string | null };
  createdAt: string;
}

export async function requestReference(targetUserId: string): Promise<ReferenceItem> {
  const { data } = await apiClient.post<ReferenceItem>("/api/v1/references/requests", { targetUserId });
  return data;
}

export async function writeReference(targetUserId: string, body: string, relationship?: string): Promise<ReferenceItem> {
  const { data } = await apiClient.post<ReferenceItem>("/api/v1/references", { targetUserId, body, relationship });
  return data;
}

export async function getIncomingRequests(): Promise<ReferenceItem[]> {
  const { data } = await apiClient.get<{ references: ReferenceItem[] }>("/api/v1/references/requests/incoming");
  return data.references;
}

export async function fulfillRequest(referenceId: string, body: string, relationship?: string): Promise<ReferenceItem> {
  const { data } = await apiClient.post<ReferenceItem>(`/api/v1/references/requests/${referenceId}/fulfill`, {
    body,
    relationship,
  });
  return data;
}

export async function getMyReferences(): Promise<ReferenceItem[]> {
  const { data } = await apiClient.get<{ references: ReferenceItem[] }>("/api/v1/references/me");
  return data.references;
}

export async function setReferenceVisibility(referenceId: string, hidden: boolean): Promise<ReferenceItem> {
  const { data } = await apiClient.patch<ReferenceItem>(`/api/v1/references/${referenceId}/visibility`, { hidden });
  return data;
}
