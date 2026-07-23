import { createApiClient } from "@nexora/api-client";
import { useAuthStore } from "../store/useAuthStore";

const API_BASE_URL = "http://localhost:4000";

export const apiClient = createApiClient({
  baseURL: API_BASE_URL,
  getAccessToken: () => useAuthStore.getState().accessToken,
});

export interface AuthResponse {
  user: { id: string; email: string; role: string };
  accessToken: string;
  refreshToken: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/api/v1/auth/login", { email, password });
  return data;
}

export async function register(email: string, password: string, role: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/api/v1/auth/register", { email, password, role });
  return data;
}
