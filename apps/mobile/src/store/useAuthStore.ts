import { create } from "zustand";

export interface SessionUser {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: SessionUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (session: { user: SessionUser; accessToken: string; refreshToken: string }) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  setSession: ({ user, accessToken, refreshToken }) => set({ user, accessToken, refreshToken }),
  clearSession: () => set({ user: null, accessToken: null, refreshToken: null }),
}));
