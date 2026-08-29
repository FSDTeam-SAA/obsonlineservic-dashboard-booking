import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { getSession } from "next-auth/react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5010/api/v1";

export const api: AxiosInstance = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Cache for background refresh promise to avoid duplicate refreshes
let tokenRefreshPromise: Promise<string | null> | null = null;

async function executeTokenRefresh(): Promise<string | null> {
  try {
    // Call next-auth session endpoint to trigger server-side token refresh cycle
    // or trigger custom endpoint if needed.
    const res = await axios.get("/api/auth/session?update");
    const session = res.data;
    return session?.accessToken || null;
  } catch (err) {
    console.error("Failed to execute background token refresh:", err);
    return null;
  }
}

// Request Interceptor: Attach bearer tokens
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Silent Auth (401) and Resilient Retries (429, 503, 504)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retryCount?: number; _authRetried?: boolean };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;

    // 1. Resilient Retries with Exponential Backoff + Jitter for 429, 503, 504
    if (status === 429 || status === 503 || status === 504) {
      originalRequest._retryCount = originalRequest._retryCount ?? 0;

      if (originalRequest._retryCount < 3) {
        originalRequest._retryCount += 1;
        const delayBase = Math.pow(2, originalRequest._retryCount) * 1000;
        const jitter = Math.random() * 1000; // random jitter up to 1s
        const totalDelay = delayBase + jitter;

        console.warn(`API error ${status}. Retrying attempt ${originalRequest._retryCount} in ${Math.round(totalDelay)}ms...`);
        
        await new Promise((resolve) => setTimeout(resolve, totalDelay));
        return api(originalRequest);
      }
    }

    // 2. Silent Auth Cycle for 401 (detect 401s, execute background token refresh, and retry)
    if (status === 401 && !originalRequest._authRetried) {
      originalRequest._authRetried = true;

      if (!tokenRefreshPromise) {
        tokenRefreshPromise = executeTokenRefresh().finally(() => {
          tokenRefreshPromise = null;
        });
      }

      const newAccessToken = await tokenRefreshPromise;
      if (newAccessToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);
