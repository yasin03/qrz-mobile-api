import { verifyAccessToken } from "@/lib/auth";

export type AuthUser = {
  IDKullanici: string;
  IDKullaniciTip: string;
  IDGurup: string | null;
  IDSirket: string | null;
  IDSube: string | null;
  IDSubePersonel: string | null;
};

export async function requireAuth(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return {
      authenticated: false as const,
      user: null,
      error: "Yetkilendirme bilgisi bulunamadi.",
    };
  }

  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    return {
      authenticated: false as const,
      user: null,
      error: "Gecersiz token.",
    };
  }

  const payload = await verifyAccessToken(token);

  if (!payload) {
    return {
      authenticated: false as const,
      user: null,
      error: "Token gecersiz veya suresi dolmus.",
    };
  }

  const user: AuthUser = {
    IDKullanici: String(payload.IDKullanici),
    IDKullaniciTip: String(payload.IDKullaniciTip),
    IDGurup: payload.IDGurup ? String(payload.IDGurup) : null,
    IDSirket: payload.IDSirket ? String(payload.IDSirket) : null,
    IDSube: payload.IDSube ? String(payload.IDSube) : null,
    IDSubePersonel: payload.IDSubePersonel
      ? String(payload.IDSubePersonel)
      : null,
  };

  return {
    authenticated: true as const,
    user,
    error: null,
  };
}
