import { ExecuteQuery } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import {
  apiError,
  apiSuccess,
  jsonResponse,
  optionsResponse,
} from "@/lib/cors";

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

    const idSube = auth.user.IDSube;
    if (!idSube) {
      return apiError(
        "Kullaniciya ait sube bilgisi bulunamadi.",
        400,
        "MISSING_SUBE",
      );
    }

    const result = await ExecuteQuery(`EXEC [Bolum_SELECTByIDSube] @IDSube`, [
      { name: "IDSube", type: "Int", value: Number(idSube) },
    ]);

    return apiSuccess(result);
  } catch (error) {
    console.error("bolum POST error:", error);
    return apiError("Sunucu hatasi.", 500, "SERVER_ERROR");
  }
}
