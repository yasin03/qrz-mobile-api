import { ExecuteQuery } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { apiError, apiSuccess, optionsResponse } from "@/lib/cors";

const ALLOWED_USER_TYPES = ["1", "2", "3"];

const queryTypes = {
  SELECT_AVANS: (params: any) =>
    `[SubePersonelAvans_SELECTByIDSube] '${params.IDSube}','${params.BaslangicTarihi}','${params.BitisTarihi}'`,
  INSERT_AVANS: (params: any) =>
    `[AvansGenel_Insert] '${params.IDSubePersonel}','${params.Tutar}','${params.TaksitSayisi}','${params.BordroKesintiTutari}','${params.Mesaj}', '${params.OdemeBaslangicTarihi}'`,
  DELETE_AVANS: (params: any) =>
    `[AvansGenel_DELETEByIDIzinGenel] '${params.IDIzinGenel}'`,

  SELECT_TALEP: (params: any) =>
    `[SubePersonelAvansTalep_SELECT] '${params.IDSube}','${params.IDSubePersonel}','${params.BaslangicTarihi}','${params.BitisTarihi}'`,
  INSERT_TALEP: (params: any) =>
    `[SubePersonelAvansTalep_INSERT] '${params.IDSubePersonel}','${params.Tutar}','${params.TaksitSayisi}','${params.BordroKesintiTutari}','${params.Mesaj}', '${params.OdemeBaslangicTarihi}'`,
  UPDATE_TALEP: (params: any) =>
    `[SubePersonelAvansTalep_Update] '${params.IDSubePersonelAvansTalep}','${params.IDKullanici}','${params.KabulRed}','${params.RedAciklama}'`,
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
      Tutar: payload.Tutar,
      TaksitSayisi: payload.TaksitSayisi,
      BordroKesintiTutari: payload.BordroKesintiTutari,
      Mesaj: payload.Mesaj,
      OdemeBaslangicTarihi: payload.OdemeBaslangicTarihi,
      BaslangicTarihi: payload.BaslangicTarihi,
      BitisTarihi: payload.BitisTarihi,
      IDKullanici: auth.user.IDKullanici,
    };

    const queryFunction = queryTypes[type as keyof typeof queryTypes];

    if (!queryFunction) {
      return apiError("Gecersiz sorgu tipi.", 400);
    }

    const query = queryFunction(params);
    console.log("Executing query:", query);
    const result = await ExecuteQuery(query);
    return apiSuccess(result);
  } catch (error) {
    console.error("lokasyon POST error:", error);
    return apiError("Sunucu hatasi.", 500, "SERVER_ERROR");
  }
}
