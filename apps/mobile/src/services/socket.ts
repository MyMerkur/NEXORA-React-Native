import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "../store/useAuthStore";
import { API_BASE_URL } from "./authApi";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  const accessToken = useAuthStore.getState().accessToken;
  if (!accessToken) {
    return null;
  }

  if (socket && socket.auth && (socket.auth as { token?: string }).token === accessToken) {
    return socket;
  }

  socket?.disconnect();
  socket = io(API_BASE_URL, { auth: { token: accessToken }, transports: ["websocket"] });
  return socket;
}
