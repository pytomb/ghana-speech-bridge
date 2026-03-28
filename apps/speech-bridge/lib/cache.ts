/**
 * Translation + TTS cache.
 *
 * Uses a flat JSON file in development. Swap `get`/`set` for
 * Redis (Upstash) or Postgres (Neon) in production by replacing
 * the two functions below — the rest of the codebase is unaffected.
 *
 * Cache key strategy:
 *   translate: sha256(text + from + to)
 *   tts:       sha256(text + lang)
 *
 * TTL defaults:
 *   translations  — 7 days  (text meaning doesn't change)
 *   TTS audio     — 30 days (audio files are large, reuse aggressively)
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

const CACHE_FILE = path.join(process.cwd(), ".cache.json");

interface CacheEntry {
  value: string;
  expiresAt: number;
}

type CacheStore = Record<string, CacheEntry>;

const TTL_TRANSLATE = parseInt(process.env.CACHE_TTL_TRANSLATE ?? "604800", 10) * 1000;
const TTL_TTS = parseInt(process.env.CACHE_TTL_TTS ?? "2592000", 10) * 1000;

function load(): CacheStore {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
    }
  } catch {
    // corrupt — reset
  }
  return {};
}

function save(store: CacheStore): void {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(store));
  } catch {
    // read-only FS (Vercel prod) — degrade silently
  }
}

function hash(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 16);
}

function get(key: string): string | null {
  const store = load();
  const entry = store[key];
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    delete store[key];
    save(store);
    return null;
  }
  return entry.value;
}

function set(key: string, value: string, ttlMs: number): void {
  const store = load();
  store[key] = { value, expiresAt: Date.now() + ttlMs };
  save(store);
}

// ── Public API ───────────────────────────────────────────────────────────────

export function getCachedTranslation(
  text: string,
  from: string,
  to: string
): string | null {
  return get(hash(`translate:${from}:${to}:${text}`));
}

export function setCachedTranslation(
  text: string,
  from: string,
  to: string,
  result: string
): void {
  set(hash(`translate:${from}:${to}:${text}`), result, TTL_TRANSLATE);
}

export function getCachedTTS(text: string, lang: string): string | null {
  return get(hash(`tts:${lang}:${text}`));
}

export function setCachedTTS(text: string, lang: string, audioBase64: string): void {
  set(hash(`tts:${lang}:${text}`), audioBase64, TTL_TTS);
}
