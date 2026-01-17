export interface ApiErrorData {
  message?: string;
  errors?: Record<string, string> | string;
}

export interface ApiError extends Error {
  status: number;
  data?: ApiErrorData;
}

export const isApiError = (error: unknown): error is ApiError => {
  return Boolean(error && typeof error === "object" && "status" in error);
};
