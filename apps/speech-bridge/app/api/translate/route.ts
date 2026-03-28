import { NextRequest, NextResponse } from "next/server";
import { khayaTranslate, type KhayaLang } from "@/lib/providers/khaya";
import { getCachedTranslation, setCachedTranslation } from "@/lib/cache";
import { recordCall, recordCacheHit } from "@/lib/budget";

export async function POST(req: NextRequest) {
  try {
    const { text, from = "en", to } = await req.json();

    if (!text || !to) {
      return NextResponse.json({ error: "text and to are required" }, { status: 400 });
    }

    if (from === to) {
      return NextResponse.json({ result: text, cached: true, provider: "passthrough" });
    }

    // Cache check — avoids API call entirely
    const cached = getCachedTranslation(text, from, to);
    if (cached) {
      recordCacheHit();
      return NextResponse.json({ result: cached, cached: true, provider: "cache" });
    }

    // Live call
    recordCall("translate");
    const { translatedText, provider } = await khayaTranslate(
      text,
      from as KhayaLang,
      to as KhayaLang
    );

    setCachedTranslation(text, from, to, translatedText);

    return NextResponse.json({ result: translatedText, cached: false, provider });
  } catch (err) {
    console.error("[translate]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Translation failed" },
      { status: 500 }
    );
  }
}
