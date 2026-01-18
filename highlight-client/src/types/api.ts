export interface ApiErrorData {
  message?: string;
  errors?: Record<string, string> | string;
}

export interface ApiError extends Error {
  status: number;
  data?: ApiErrorData;
}

export interface ApiListResponse<T> {
  data: T[] | null;
}

export interface ApiItemsResponse<T> {
  items: T[];
}

export const isApiError = (error: unknown): error is ApiError => {
  return Boolean(error && typeof error === "object" && "status" in error);
};
