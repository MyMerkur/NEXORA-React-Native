import axios, { isAxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

export interface RefreshedTokens {
  accessToken: string;
  refreshToken: string;
}

export interface CreateApiClientOptions {
  baseURL: string;
  getAccessToken?: () => string | null;
  getRefreshToken?: () => string | null;
  refreshTokens?: (refreshToken: string) => Promise<RefreshedTokens>;
  onTokensRefreshed?: (tokens: RefreshedTokens) => void;
  onSessionExpired?: () => void;
}

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
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

  // Access tokens are short-lived; a 401 on any non-auth request triggers exactly one
  // refresh attempt (concurrent 401s share the same in-flight refresh) before retrying
  // the original request. If refresh itself fails, the session is treated as expired.
  let refreshPromise: Promise<string | null> | null = null;

  async function refreshAccessToken(): Promise<string | null> {
    const currentRefreshToken = options.getRefreshToken?.();
    if (!options.refreshTokens || !currentRefreshToken) {
      return null;
    }
    try {
      const tokens = await options.refreshTokens(currentRefreshToken);
      options.onTokensRefreshed?.(tokens);
      return tokens.accessToken;
    } catch {
      return null;
    }
  }

  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!isAxiosError(error) || !error.config) {
        return Promise.reject(error);
      }

      const config = error.config as RetriableRequestConfig;
      const isAuthEndpoint = (config.url ?? "").includes("/auth/");

      if (error.response?.status === 401 && !config._retry && !isAuthEndpoint) {
        config._retry = true;

        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newAccessToken = await refreshPromise;

        if (newAccessToken) {
          config.headers.set("Authorization", `Bearer ${newAccessToken}`);
          return client.request(config);
        }

        options.onSessionExpired?.();
      }

      return Promise.reject(error);
    },
  );

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

export async function uploadFileToPresignedUrl(uploadUrl: string, fileUri: string, contentType: string): Promise<void> {
  const fileResponse = await fetch(fileUri);
  const blob = await fileResponse.blob();

  const putResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });

  if (!putResponse.ok) {
    throw new Error("Dosya yüklenemedi");
  }
}
