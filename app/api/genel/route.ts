import { ExecuteQuery, ExecuteQueryDataset } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { apiError, apiSuccess, optionsResponse } from "@/lib/cors";

const queryTypes = {
  GET_ILLER: (params: any) => `[Il_SELECTByIDUlke] '${params.IDUlke}'`,
  GET_ILCELER: (params: any) => `[Ilce_SELECTByIlKodu] '${params.IlKodu}',''`,
  GET_VERGIDAIRELERI: (params: any) =>
    `[VergiDairesi_SELECTByIlKodu] '${params.IlKodu}',''`,
  GET_IZIN_TIPLERI: (params: any) => `[PersonelEksikGunNedeni_SELECTAll]`,
  GET_SABIT_TANIMLAR: (params: any) => `[SabitTanimMadde_SELECTAll]`,
  GET_PERSONEL_SABIT_TANIMLAR: (params: any) =>
    `[PersonelSgkBelgeTuru_SELECTAllTypes]`,
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
      IDUlke: payload.IDUlke,
      IlKodu: payload.IlKodu,
    };

    const queryFunction = queryTypes[type as keyof typeof queryTypes];

    if (!queryFunction) {
      return apiError("Gecersiz sorgu tipi.", 400);
    }

    const query = queryFunction(params);
    const result =
      type === "GET_SABIT_TANIMLAR" || type === "GET_PERSONEL_SABIT_TANIMLAR"
        ? await ExecuteQueryDataset(query)
        : await ExecuteQuery(query);

    return apiSuccess(result);
  } catch (error) {
    console.error("lokasyon POST error:", error);
    return apiError("Sunucu hatasi.", 500, "SERVER_ERROR");
  }
}
