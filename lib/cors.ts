import { ApiErrorCode, ApiResponse } from "@/types/api";
import { NextResponse } from "next/server";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:8081",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function optionsResponse() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  });
}

export function apiSuccess<T>(data: T, status = 200) {
  const body: ApiResponse<T> = { success: true, data };
  return jsonResponse(body, status);
}

export function apiError(
  message: string,
  status = 400,
  code?: ApiErrorCode,
  details?: unknown,
) {
  const body: ApiResponse<never> = {
    success: false,
    error: { message, code, details },
  };
  return jsonResponse(body, status);
}
