import {
  jsonResponse,
  optionsResponse,
} from "@/lib/cors";

import { requireAuth } from "@/lib/require-auth";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);

  if (!auth.authenticated) {
    return jsonResponse(
      {
        message: auth.error,
      },
      401,
    );
  }

  return jsonResponse({
    authenticated: true,
    user: auth.user,
  });
}