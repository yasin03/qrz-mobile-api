import jwt from "jsonwebtoken";
import { SignJWT, jwtVerify } from "jose";

export const generateUserToken = (user, time) => {
  return jwt.sign(
    {
      Ad: user.Ad,
      IDKullanici: user.IDKullanici,
      KullaniciTipi: user.KullaniciTipi,
      IDKullaniciTipi: user.IDKullaniciTip,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: time,
    },
  );
};

export const decodeToken = (token) => {
  let sonuc = "";
  jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
    if (err) {
      sonuc = "Invalid Token";
    } else {
      sonuc = decode;
    }
  });
  return sonuc;
};

export const validateToken = (token) => {
  let sonuc = false;
  jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
    if (err) {
      sonuc = false;
    } else {
      sonuc = true;
    }
  });
  return sonuc;
};

export const joseEncrypt = async (payload, time = "24h") => {
  const key = new TextEncoder().encode(process.env.JWT_SECRET);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(time)
    .sign(key);
};

export const joseDecrypt = async (token) => {
  const key = new TextEncoder().encode(process.env.JWT_SECRET);
  let payload = null;
  try {
    const joseDecoded = await jwtVerify(token, key, { algorithms: ["HS256"] });
    payload = joseDecoded.payload;
  } catch (e) {}
  return payload;
};
