/**
 * Model registry — tracks what providers are available and routes accordingly.
 *
 * To graduate a fine-tuned model into production:
 * 1. Deploy it (Hugging Face Inference, Modal, Replicate, or self-hosted)
 * 2. Add its URL to .env: WHISPER_AKAN_URL=https://...
 * 3. Update its status here to "active"
 * 4. The router will prefer it over Khaya for its language
 */

export type ProviderStatus = "active" | "training" | "planned" | "deprecated";
export type Capability = "translate" | "stt" | "tts" | "detect";

export interface ModelEntry {
  id: string;
  capability: Capability;
  languages: string[];      // language codes this model handles
  status: ProviderStatus;
  envKey?: string;          // env var that holds the endpoint URL
  notes?: string;
}

export const MODEL_REGISTRY: ModelEntry[] = [
  // ── Translation ────────────────────────────────────────────────────────
  {
    id: "khaya-translate",
    capability: "translate",
    languages: ["tw", "ee", "gaa", "dag", "fat", "gur"],
    status: "active",
    notes: "Khaya AI hosted API — primary provider",
  },
  {
    id: "gemma-2b-tw",
    capability: "translate",
    languages: ["tw"],
    status: "training",
    envKey: "GEMMA_TW_URL",
    notes: "Gemma 2B fine-tuned on GhanaNLP parallel corpus. Evaluate with ml/01_evaluate_gemma.ipynb before activating.",
  },

  // ── ASR (Speech-to-Text) ───────────────────────────────────────────────
  {
    id: "khaya-stt",
    capability: "stt",
    languages: ["tw", "ee", "gaa", "dag", "fat"],
    status: "active",
    notes: "Khaya AI STT — primary provider",
  },
  {
    id: "whisper-small-akan",
    capability: "stt",
    languages: ["tw"],
    status: "planned",
    envKey: "WHISPER_AKAN_URL",
    notes: "Fine-tune with ml/02_whisper_twi_finetune.ipynb using UGSpeechData (104h Akan transcribed)",
  },
  {
    id: "whisper-small-ewe",
    capability: "stt",
    languages: ["ee"],
    status: "planned",
    envKey: "WHISPER_EWE_URL",
    notes: "Same approach as Akan — UGSpeechData has 106h Ewe",
  },

  // ── TTS (Text-to-Speech) ───────────────────────────────────────────────
  {
    id: "khaya-tts",
    capability: "tts",
    languages: ["tw", "ee", "gaa", "dag"],
    status: "active",
    notes: "Khaya AI TTS — primary provider",
  },
  {
    id: "coqui-xtts-tw",
    capability: "tts",
    languages: ["tw"],
    status: "planned",
    envKey: "COQUI_TW_URL",
    notes: "Requires ~30 min of clean studio Twi audio. Reach out to GhanaNLP for voice talent.",
  },
];

/**
 * Returns the best active provider for a given capability + language.
 * Prefers owned/fine-tuned models over Khaya when available (lower cost, no dependency).
 */
export function getBestProvider(
  capability: Capability,
  lang: string
): ModelEntry | null {
  const candidates = MODEL_REGISTRY.filter(
    (m) => m.capability === capability && m.languages.includes(lang) && m.status === "active"
  );

  // Prefer non-Khaya (owned) providers
  const owned = candidates.find((m) => !m.id.startsWith("khaya"));
  return owned ?? candidates[0] ?? null;
}

export function getRegistryStatus() {
  return MODEL_REGISTRY.map((m) => ({
    id: m.id,
    capability: m.capability,
    languages: m.languages,
    status: m.status,
    ready: m.status === "active",
    notes: m.notes,
  }));
}
