import { apiClient } from "./authApi";

export interface InstagramStatus {
  connected: boolean;
  username: string | null;
}

export interface InstagramMediaItem {
  id: string;
  caption: string;
  mediaUrl: string;
  permalink: string;
  timestamp: string;
}

export async function getConnectAuthorizeUrl(): Promise<string> {
  const { data } = await apiClient.get<{ authorizeUrl: string }>("/api/v1/instagram/connect");
  return data.authorizeUrl;
}

export async function getInstagramStatus(): Promise<InstagramStatus> {
  const { data } = await apiClient.get<InstagramStatus>("/api/v1/instagram/status");
  return data;
}

export async function listInstagramMedia(): Promise<InstagramMediaItem[]> {
  const { data } = await apiClient.get<{ items: InstagramMediaItem[] }>("/api/v1/instagram/media");
  return data.items;
}

export async function disconnectInstagram(): Promise<void> {
  await apiClient.delete("/api/v1/instagram/connection");
}
