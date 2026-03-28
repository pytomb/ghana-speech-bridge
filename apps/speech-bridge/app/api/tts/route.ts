import { NextRequest, NextResponse } from "next/server";
import { khayaTTS, type KhayaLang } from "@/lib/providers/khaya";
import { getCachedTTS, setCachedTTS } from "@/lib/cache";
import { recordCall, recordCacheHit } from "@/lib/budget";

export async function POST(req: NextRequest) {
  try {
    const { text, lang } = await req.json();

    if (!text || !lang) {
      return NextResponse.json({ error: "text and lang are required" }, { status: 400 });
    }

    // TTS is aggressively cached — same text+lang always produces same audio
    const cached = getCachedTTS(text, lang);
    if (cached) {
      recordCacheHit();
      return NextResponse.json({
        audioBase64: cached,
        mimeType: "audio/mp3",
        cached: true,
        provider: "cache",
      });
    }

    recordCall("tts");
    const { audioBase64, mimeType, provider } = await khayaTTS(text, lang as KhayaLang);

    setCachedTTS(text, lang, audioBase64);

    return NextResponse.json({ audioBase64, mimeType, cached: false, provider });
  } catch (err) {
    console.error("[tts]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "TTS failed" },
      { status: 500 }
    );
  }
}
