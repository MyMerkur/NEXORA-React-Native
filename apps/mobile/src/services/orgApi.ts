import type { MicroCompetencyTag } from "@nexora/shared-constants";
import { apiClient } from "./authApi";
import type { UserProfile } from "./profileApi";

export interface OrgSearchResult {
  id: string;
  displayName: string;
  workplace: string;
}

export interface OrgTeamMember {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface OrgOpenJob {
  id: string;
  title: string;
  location: string;
  specialties: MicroCompetencyTag[];
  createdAt: string;
}

export interface OrgRecentCase {
  id: string;
  title: string;
  imageUrl: string | null;
  createdAt: string;
}

export interface OrgProfile {
  id: string;
  displayName: string;
  title: string;
  bio: string;
  avatarUrl: string | null;
  workplace: string;
  city: string;
  specialties: MicroCompetencyTag[];
  isVerifiedOrg: boolean;
  team: OrgTeamMember[];
  openJobs: OrgOpenJob[];
  recentCases: OrgRecentCase[];
}

export async function searchOrgs(query: string): Promise<OrgSearchResult[]> {
  const { data } = await apiClient.get<{ orgs: OrgSearchResult[] }>("/api/v1/orgs/search", { params: { q: query } });
  return data.orgs;
}

export async function getOrgProfile(userId: string): Promise<OrgProfile> {
  const { data } = await apiClient.get<OrgProfile>(`/api/v1/orgs/${userId}`);
  return data;
}

export async function setAffiliation(orgUserId: string | null): Promise<UserProfile> {
  const { data } = await apiClient.patch<UserProfile>("/api/v1/users/me/affiliation", { orgUserId });
  return data;
}
