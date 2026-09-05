import { jwtVerify, SignJWT } from "jose";

import type { User } from "@/types/auth";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is missing");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export async function createAccessToken(user: User) {
  return await new SignJWT({
    IDKullanici: user.IDKullanici,
    IDKullaniciTip: user.IDKullaniciTip,
    IDGurup: user.IDGurup,
    IDSirket: user.IDSirket,
    IDSube: user.IDSube,
    IDSubePersonel: user.IDSubePersonel,
    IDDevice: user.IDDevice,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);

    return payload;
  } catch {
    return null;
  }
}
