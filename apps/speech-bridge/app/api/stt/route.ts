import { NextRequest, NextResponse } from "next/server";
import { khayaSTT, type KhayaLang } from "@/lib/providers/khaya";
import { recordCall } from "@/lib/budget";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get("audio") as File | null;
    const lang = formData.get("lang") as string | null;

    if (!audio || !lang) {
      return NextResponse.json({ error: "audio (file) and lang are required" }, { status: 400 });
    }

    const audioBlob = new Blob([await audio.arrayBuffer()], { type: audio.type });

    // STT is never cached — each audio clip is unique
    recordCall("stt");
    const { transcript, provider } = await khayaSTT(audioBlob, lang as KhayaLang);

    return NextResponse.json({ transcript, confidence: null, provider });
  } catch (err) {
    console.error("[stt]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "STT failed" },
      { status: 500 }
    );
  }
}
