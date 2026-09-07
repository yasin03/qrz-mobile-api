import { ExecuteQuery } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { apiError, apiSuccess, optionsResponse } from "@/lib/cors";

const ALLOWED_USER_TYPES = ["1", "2", "3"];

const queryTypes = {
  INSERT_PDKS: (params: any) =>
    `[SubePersonelSaat_InsertMobil] '${params.IDSubePersonel}','${params.JsonData}'`,
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
    if (!ALLOWED_USER_TYPES.includes(auth.user.IDKullaniciTip)) {
      return apiError("Bu islem icin yetkiniz yok.", 403, "FORBIDDEN");
    }

    const { type, params } = await request.json();

    if (!type || !params) {
      return apiError("type ve params zorunlu.", 400, "VALIDATION_ERROR");
    }

    const customParams = {
      IDSubePersonel: auth.user.IDSubePersonel,
      JsonData: JSON.stringify(params.jsonData),
      ...params,
    };

    const queryFunction = queryTypes[type as keyof typeof queryTypes];

    if (!queryFunction) {
      return apiError("Gecersiz sorgu tipi.", 400);
    }

    const query = queryFunction(customParams);
    console.log("Executing query:", query);
    const result = await ExecuteQuery(query);

    return apiSuccess(result);
  } catch (error) {
    console.error("lokasyon POST error:", error);
    return apiError("Sunucu hatasi.", 500, "SERVER_ERROR");
  }
}
