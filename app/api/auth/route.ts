import { createAccessToken } from "@/lib/auth";
import { apiError, apiSuccess, optionsResponse } from "@/lib/cors";
import { ExecuteQuery } from "@/lib/db";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return apiError(
        "Kullanici adi ve sifre zorunlu.",
        400,
        "VALIDATION_ERROR",
      );
    }

    const [sonuc] = await ExecuteQuery(
      "EXEC [LoginKontrol] @username, @password",
      [
        { name: "username", type: "NVarChar", value: String(username) },
        { name: "password", type: "NVarChar", value: String(password) },
      ],
    );

    console.log("auth POST sonuc", sonuc);

    if (!sonuc || sonuc.Sonuc != "1") {
      return apiError("Kullanici adi veya sifre hatali.", 401, "UNAUTHORIZED");
    } 

    const token = await createAccessToken(sonuc);
    const { Sonuc, ...userData } = sonuc;

    return apiSuccess({ ...userData, token });
  } catch (error) {
    console.error("auth POST error:", error);
    return apiError("Sunucu hatasi.", 500, "SERVER_ERROR");
  }
}
