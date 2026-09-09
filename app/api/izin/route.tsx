import { ExecuteQuery } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { apiError, apiSuccess, optionsResponse } from "@/lib/cors";

const ALLOWED_USER_TYPES = ["1", "2", "3"];

const queryTypes = {
  SELECT_IZIN: (params: any) =>
    `[IzinGenel_SELECTByIDSubePersonel] '${params.IDSube}','${params.IDSubePersonel}','${params.BaslangicTarihi}','${params.BitisTarihi}','${params.Aciklama}'`,
  INSERT_IZIN: (params: any) =>
    `[IzinGenel_Insert] '${params.IDSubePersonel}','${params.BaslangicTarihi}','${params.BitisTarihi}','${params.Aciklama}','${params.Gun}','${params.AitOlduguYil}','${params.CizelgeDurum}'`,
  DELETE_IZIN: (params: any) =>
    `[IzinGenel_DELETEByIDIzinGenel] '${params.IDIzinGenel}'`,
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

    const payload = await request.json();
    const { type } = payload;

    const params = {
      IDIzinGenel: payload.IDIzinGenel,
      IDSubePersonel: payload.IDSubePersonel,
      IDSube: payload.IDSube,
      BaslangicTarihi: payload.BaslangicTarihi,
      BitisTarihi: payload.BitisTarihi,
      Aciklama: payload.Aciklama,
      Gun: payload.Gun,
      AitOlduguYil: payload.AitOlduguYil,
      CizelgeDurum: payload.CizelgeDurum,
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
