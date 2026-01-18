import { ApiError, ApiErrorData } from "@/types/api";
import { getAuthToken } from "@/utils/authStorage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "" : "http://localhost:8080");

const buildError = (status: number, data?: ApiErrorData): ApiError => {
  const error = new Error(data?.message ?? "Request failed") as ApiError;
  error.status = status;
  error.data = data;
  return error;
};

export const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    let data: ApiErrorData | undefined;
    try {
      data = (await response.json()) as ApiErrorData;
    } catch {
      data = undefined;
    }
    throw buildError(response.status, data);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
};
