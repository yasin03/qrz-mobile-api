import { NextResponse } from "next/server";

import { createAccessToken } from "@/lib/auth";
import { ExecuteQuery } from "@/lib/db";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
  });
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        {
          Sonuc: "hata",
          message: "Kullanici adi ve sifre zorunlu.",
        },
        { status: 400 },
      );
    }

    const [sonuc] = await ExecuteQuery(
      "[LoginKontrol] '" + username + "', '" + password + "'",
    );

    console.log("auth POST sonuc", sonuc);

    if (!sonuc || sonuc.Sonuc !== "1") {
      return NextResponse.json(sonuc ?? { Sonuc: "0" });
    }

    const token = await createAccessToken(sonuc);

    return NextResponse.json({
      ...sonuc,
      token,
    });
  } catch (error) {
    console.error("auth POST error:", error);

    return NextResponse.json(
      {
        Sonuc: "hata",
        message: "Sunucu hatasi",
      },
      { status: 500 },
    );
  }
}
