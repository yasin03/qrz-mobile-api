// mobile-api/api/auth
import { createAccessToken } from "@/lib/auth";
import { apiError, apiSuccess, optionsResponse } from "@/lib/cors";
import { ExecuteQuery } from "@/lib/db";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request) {
  try {
    const { username, password, idDevice } = await request.json();

    if (!username || !password) {
      return apiError(
        "Kullanici adi ve sifre zorunlu.",
        400,
        "VALIDATION_ERROR",
      );
    }

    const [sonuc] = await ExecuteQuery(
      `[LoginKontrolMobil] '${username}', '${password}', '${idDevice}'`,
    );

    console.log("auth POST sonuc", sonuc);

    if (!sonuc) {
      return apiError("Sunucu hatasi.", 500, "SERVER_ERROR");
    }

    switch (sonuc.Sonuc) {
      case "0":
        return apiError(
          sonuc.Aciklama || "Kullanici adi veya sifre hatali.",
          401,
          "UNAUTHORIZED",
        );

      case "2":
        return apiError(
          sonuc.Aciklama ||
            "Cihaz kayit bilgileriniz tutarsizdir. Sistem yoneticinize basvurunuz.",
          403,
          "DEVICE_MISMATCH",
        );

      case "3":
        return apiError(
          sonuc.Aciklama ||
            "Hesabiniz kapatilmistir. Sistem yoneticinize basvurunuz.",
          403,
          "ACCOUNT_CLOSED",
        );

      case "1": {
        const token = await createAccessToken(sonuc);
        const { Sonuc, Aciklama, ...userData } = sonuc;

        return apiSuccess({
          ...userData,
          token,
          message: Aciklama,
        });
      }

      default:
        return apiError("Beklenmeyen sunucu yaniti.", 500, "SERVER_ERROR");
    }
  } catch (error) {
    console.error("auth POST error:", error);
    return apiError("Sunucu hatasi.", 500, "SERVER_ERROR");
  }
}
