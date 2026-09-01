import { z } from "zod";
import { ExecuteQuery } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import {
  apiError,
  apiSuccess,
  corsHeaders,
  jsonResponse,
  optionsResponse,
} from "@/lib/cors";

// Bu endpoint'e sadece admin (1) ve yonetici (2) erisebilir
const ALLOWED_USER_TYPES = ["1", "2"];

type SqlParam = { name: string; type: string; value: unknown };

type ActionConfig<T> = {
  schema: z.ZodType<T>;
  build: (params: T) => { query: string; inputs: SqlParam[] };
};

const selectSchema = z.object({
  IDBolum: z.coerce.number().int(),
});

const insertSchema = z.object({
  IDBolum: z.coerce.number().int(),
  LokasyonAdi: z.string().trim().min(1).max(200),
  Enlem: z.coerce.number(),
  Boylam: z.coerce.number(),
  Aktif: z.coerce.boolean(),
});

const updateSchema = insertSchema.extend({
  IDBolumLokasyon: z.coerce.number().int(),
});

const deleteSchema = z.object({
  IDBolumLokasyon: z.coerce.number().int(),
});

// Her action'ın kendi validasyonu + parametreli query'si burada tanımlı.
// DIKKAT: UPDATE/DELETE proc adlarını orijinal kodda yanlış (SELECT proc'una
// yönlendirilmiş) buldum, aşağıda gerçek isimlerini varsaydım. Kendi SP
// isimlerinle eşleşmiyorsa sadece `query` satırlarını değiştirmen yeterli.
const actions = {
  SELECT_LOCATION: {
    schema: selectSchema,
    build: (p) => ({
      query: `EXEC [BolumLokasyon_SELECTByIDBolum] @IDBolum`,
      inputs: [{ name: "IDBolum", type: "Int", value: p.IDBolum }],
    }),
  },
  INSERT_LOCATION: {
    schema: insertSchema,
    build: (p) => ({
      query: `EXEC [BolumLokasyon_INSERT] @IDBolum, @LokasyonAdi, @Enlem, @Boylam, @Aktif`,
      inputs: [
        { name: "IDBolum", type: "Int", value: p.IDBolum },
        { name: "LokasyonAdi", type: "NVarChar", value: p.LokasyonAdi },
        { name: "Enlem", type: "Float", value: p.Enlem },
        { name: "Boylam", type: "Float", value: p.Boylam },
        { name: "Aktif", type: "Bit", value: p.Aktif },
      ],
    }),
  },
  UPDATE_LOCATION: {
    schema: updateSchema,
    build: (p) => ({
      query: `EXEC [BolumLokasyon_UPDATEByIDBolumLokasyon] @IDBolumLokasyon, @IDBolum, @LokasyonAdi, @Enlem, @Boylam, @Aktif`,
      inputs: [
        { name: "IDBolumLokasyon", type: "Int", value: p.IDBolumLokasyon },
        { name: "IDBolum", type: "Int", value: p.IDBolum },
        { name: "LokasyonAdi", type: "NVarChar", value: p.LokasyonAdi },
        { name: "Enlem", type: "Float", value: p.Enlem },
        { name: "Boylam", type: "Float", value: p.Boylam },
        { name: "Aktif", type: "Bit", value: p.Aktif },
      ],
    }),
  },
  DELETE_LOCATION: {
    schema: deleteSchema,
    build: (p) => ({
      query: `EXEC [BolumLokasyon_DELETEByIDBolumLokasyon] @IDBolumLokasyon`,
      inputs: [
        { name: "IDBolumLokasyon", type: "Int", value: p.IDBolumLokasyon },
      ],
    }),
  },
} satisfies Record<string, ActionConfig<any>>;

type ActionType = keyof typeof actions;

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request) {
  try {
    // 1) Auth kontrolu
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

    // 2) Body parse
    const body = await request.json().catch(() => null);
    if (!body || typeof body.type !== "string" || !body.params) {
      return jsonResponse(
        { Sonuc: "hata", message: "type ve params zorunlu." },
        400,
      );
    }

    const type = body.type as ActionType;
    const action = actions[type];

    if (!action) {
      return apiError(
        "Gecersiz sorgu tipi.",
        400,
      );
    }

    // 3) Validasyon (zod)
    const parsed = action.schema.safeParse(body.params);
    if (!parsed.success) {
      return apiError(
        "Gecersiz parametreler.",
        400,
        "VALIDATION_ERROR",
        parsed.error.flatten(),
      );
    }

    // 4) Parametreli sorguyu calistir (SQL injection yok, mssql .input() ile bind ediliyor)
    const { query, inputs } = action.build(parsed.data as never);
    const result = await ExecuteQuery(query, inputs);

    return apiSuccess(result);
  } catch (error) {
    console.error("lokasyon POST error:", error);
    return apiError("Sunucu hatasi.", 500, "SERVER_ERROR");
  }
}
