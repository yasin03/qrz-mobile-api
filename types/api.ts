export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "SERVER_ERROR"
  | "MISSING_SUBE"
  | (string & {});

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiErrorBody = {
  message: string;
  code?: ApiErrorCode;
  details?: unknown;
};

export type ApiError = {
  success: false;
  error: ApiErrorBody;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;