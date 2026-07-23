import axios, { isAxiosError, type AxiosInstance } from "axios";

export interface CreateApiClientOptions {
  baseURL: string;
  getAccessToken?: () => string | null;
}

export function createApiClient(options: CreateApiClientOptions): AxiosInstance {
  const client = axios.create({ baseURL: options.baseURL });

  client.interceptors.request.use((config) => {
    const token = options.getAccessToken?.();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
}

interface ApiErrorBody {
  message?: string;
  issues?: { message: string }[];
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data;
    if (body?.issues?.length) {
      return body.issues.map((issue) => issue.message).join(", ");
    }
    if (body?.message) {
      return body.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
