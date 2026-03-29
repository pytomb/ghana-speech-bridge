/**
 * Khaya AI (GhanaNLP) client
 * Docs: https://translation.ghananlp.org
 *
 * Confirmed endpoints (sourced from official Python client library):
 *   Translation: POST /v1/translate          body: { in, lang: "en-tw" }
 *   TTS:         POST /tts/v1/tts            body: { text, language }
 *   STT:         POST /asr/v1/transcribe     query: ?language=tw   body: raw audio/mpeg
 *
 * Auth: Ocp-Apim-Subscription-Key header (Azure API Management)
 *
 * Supported language codes: tw, ee, gaa, dag, fat, gur, yo
 */

const BASE = "https://translation-api.ghananlp.org";

function apiKey(): string {
  const key = process.env.KHAYA_API_KEY;
  if (!key) throw new Error("KHAYA_API_KEY is not set");
  return key;
}

// ── Types ────────────────────────────────────────────────────────────────────

export type KhayaLang = "en" | "tw" | "ee" | "gaa" | "dag" | "fat" | "gur" | "yo";

export interface TranslateResult {
  translatedText: string;
  provider: "khaya";
}

export interface STTResult {
  transcript: string;
  provider: "khaya";
}

export interface TTSResult {
  audioBase64: string;
  mimeType: "audio/mp3";
  provider: "khaya";
}

// ── Translation ──────────────────────────────────────────────────────────────

export async function khayaTranslate(
  text: string,
  from: KhayaLang,
  to: KhayaLang
): Promise<TranslateResult> {
  const res = await fetch(`${BASE}/v1/translate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "Ocp-Apim-Subscription-Key": apiKey(),
    },
    body: JSON.stringify({ in: text, lang: `${from}-${to}` }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Khaya translate failed (${res.status}): ${body}`);
  }

  // Khaya returns a plain JSON string, not an object
  const translatedText: string = await res.json();
  return { translatedText, provider: "khaya" };
}

// ── Speech-to-Text ───────────────────────────────────────────────────────────

export async function khayaSTT(
  audioBlob: Blob,
  lang: KhayaLang
): Promise<STTResult> {
  const audioBuffer = await audioBlob.arrayBuffer();

  const res = await fetch(`${BASE}/asr/v1/transcribe?language=${lang}`, {
    method: "POST",
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-cache",
      "Ocp-Apim-Subscription-Key": apiKey(),
    },
    body: audioBuffer,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Khaya STT failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  // Normalise across possible response field names
  const transcript: string = data.transcript ?? data.transcription ?? data.text ?? "";
  return { transcript, provider: "khaya" };
}

// ── Text-to-Speech ───────────────────────────────────────────────────────────

export async function khayaTTS(
  text: string,
  lang: KhayaLang
): Promise<TTSResult> {
  const res = await fetch(`${BASE}/tts/v1/tts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "Ocp-Apim-Subscription-Key": apiKey(),
    },
    // TTS uses "language" field (not "lang")
    body: JSON.stringify({ text, language: lang }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Khaya TTS failed (${res.status}): ${body}`);
  }

  // Khaya returns raw audio bytes
  const audioBuffer = await res.arrayBuffer();
  const audioBase64 = Buffer.from(audioBuffer).toString("base64");
  return { audioBase64, mimeType: "audio/mp3", provider: "khaya" };
}
