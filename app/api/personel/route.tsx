import { ExecuteQuery } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { apiError, apiSuccess, optionsResponse } from "@/lib/cors";

const queryTypes = {
  GET_PERSONEL_DETAY: (params: any) =>
    `[SubePersonel_SELECTByIDSubePersonel] '${params.IDSubePersonel}'`,
};

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return apiError(
        auth.error ?? "Yetkilendirme hatasi.",
        401,
        "UNAUTHORIZED",
      );
    }

    const payload = await request.json();
    const { type } = payload;

    const params = {
      IDSubePersonel: payload.IDSubePersonel,
    };

    const queryFunction = queryTypes[type as keyof typeof queryTypes];

    if (!queryFunction) {
      return apiError("Gecersiz sorgu tipi.", 400);
    }

    const query = queryFunction(params);
    const result = await ExecuteQuery(query);

    return apiSuccess(result);
  } catch (error) {
    console.error("lokasyon POST error:", error);
    return apiError("Sunucu hatasi.", 500, "SERVER_ERROR");
  }
}
