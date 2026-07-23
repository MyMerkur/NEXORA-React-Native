import axios, { type AxiosInstance } from "axios";

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
