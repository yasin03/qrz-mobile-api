import { NextResponse } from "next/server";

import { createAccessToken } from "@/lib/auth";
import { corsHeaders, optionsResponse } from "@/lib/cors";
import { ExecuteQuery } from "@/lib/db";

export async function OPTIONS() {
  return optionsResponse();
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
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const [sonuc] = await ExecuteQuery(
      "[LoginKontrol] '" + username + "', '" + password + "'",
    );

    console.log("auth POST sonuc", sonuc);

    if (!sonuc || sonuc.Sonuc !== "1") {
      return NextResponse.json(sonuc ?? { Sonuc: "0" }, {
        headers: corsHeaders,
      });
    }

    const token = await createAccessToken(sonuc);

    return NextResponse.json(
      {
        ...sonuc,
        token,
      },
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("auth POST error:", error);

    return NextResponse.json(
      {
        Sonuc: "hata",
        message: "Sunucu hatasi",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
