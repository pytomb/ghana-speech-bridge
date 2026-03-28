/**
 * Khaya AI (GhanaNLP) client
 * Docs: https://translation.ghananlp.org
 *
 * Supported language pairs (format: "src-tgt"):
 *   en-tw, tw-en, en-ee, ee-en, en-gaa, gaa-en,
 *   en-dag, dag-en, en-fat, fat-en, en-gur, gur-en
 */

const KHAYA_BASE = "https://translation-api.ghananlp.org/v1";

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
  const res = await fetch(`${KHAYA_BASE}/translate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({ in: text, lang: `${from}-${to}` }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Khaya translate failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return { translatedText: data.translatedText, provider: "khaya" };
}

// ── Speech-to-Text ───────────────────────────────────────────────────────────

export async function khayaSTT(
  audioBlob: Blob,
  lang: KhayaLang
): Promise<STTResult> {
  const form = new FormData();
  form.append("audio", audioBlob, "audio.wav");
  form.append("lang", lang);

  const res = await fetch(`${KHAYA_BASE}/stt`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey()}` },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Khaya STT failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return { transcript: data.transcription, provider: "khaya" };
}

// ── Text-to-Speech ───────────────────────────────────────────────────────────

export async function khayaTTS(
  text: string,
  lang: KhayaLang
): Promise<TTSResult> {
  const res = await fetch(`${KHAYA_BASE}/tts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({ text, lang }),
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
