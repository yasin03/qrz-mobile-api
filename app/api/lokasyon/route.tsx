import { ExecuteQuery } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { apiError, apiSuccess, optionsResponse } from "@/lib/cors";

const ALLOWED_USER_TYPES = ["1", "2", "3"]; 

const queryTypes = {
  SELECT_LOCATION: (params: any) =>
    `[BolumLokasyon_SELECTByIDBolum] '${params.IDBolum}'`,
  INSERT_LOCATION: (params: any) =>
    `[BolumLokasyon_INSERT] '${params.IDBolum}','${params.LokasyonAdi}','${params.Enlem}','${params.Boylam}','${params.Aktif}'`,
  UPDATE_LOCATION: (params: any) =>
    `[BolumLokasyon_UPDATEByIDBolumLokasyon] '${params.IDBolumLokasyon}','${params.IDBolum}','${params.LokasyonAdi}','${params.Enlem}','${params.Boylam}','${params.Aktif}'`,
  DELETE_LOCATION: (params: any) =>
    `[BolumLokasyon_DELETEByIDBolumLokasyon] '${params.IDBolumLokasyon}'`,
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
