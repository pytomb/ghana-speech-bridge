import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight language detection.
 *
 * Current implementation: heuristic pattern matching (zero API calls).
 * This is sufficient for routing decisions and costs nothing.
 *
 * Long-term: replace `detectLanguage` with a FastText classifier
 * trained on GhanaNLP text data (~1MB model, fully offline).
 */

// Distinctive characters and high-frequency words per language
const LANGUAGE_SIGNALS: Record<string, { chars: RegExp; words: string[] }> = {
  tw: {
    chars: /[ɛɔ]/,
    words: ["me", "wo", "ɛ", "ɔ", "sɛ", "na", "ko", "pɛ", "aane", "daabi", "akwaaba", "maakye"],
  },
  ee: {
    chars: /[ɖƒɣŋ]/,
    words: ["nye", "ame", "le", "kple", "enyo", "dzro", "agoo"],
  },
  gaa: {
    chars: /[ŋ]/,
    words: ["mi", "ni", "ko", "ojekoo", "ogboo", "eba"],
  },
  dag: {
    chars: /[ŋ]/,
    words: ["n", "di", "ka", "naa", "ni", "tiŋ"],
  },
};

function detectLanguage(text: string): {
  language: string;
  confidence: number;
  codeSwitched: boolean;
} {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  const scores: Record<string, number> = { en: 0, tw: 0, ee: 0, gaa: 0, dag: 0 };

  // Score each language
  for (const [lang, signals] of Object.entries(LANGUAGE_SIGNALS)) {
    if (signals.chars.test(lower)) scores[lang] += 3;
    for (const w of signals.words) {
      if (words.includes(w)) scores[lang] += 2;
    }
  }

  // English heuristic: ASCII-only words
  const asciiWords = words.filter((w) => /^[a-z]+$/.test(w)).length;
  scores.en = asciiWords / Math.max(words.length, 1);

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topLang, topScore] = sorted[0];
  const [, secondScore] = sorted[1] ?? ["", 0];

  // Code-switch: two languages both scoring significantly
  const codeSwitched = topScore > 0 && secondScore / topScore > 0.5;

  // Confidence: how much the winner dominates
  const total = Object.values(scores).reduce((s, n) => s + n, 0);
  const confidence = total > 0 ? Math.min(topScore / total, 1) : 0.5;

  return {
    language: topScore > 0 ? topLang : "en",
    confidence: parseFloat(confidence.toFixed(2)),
    codeSwitched,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const result = detectLanguage(text);
    return NextResponse.json({ ...result, provider: "heuristic" });
  } catch (err) {
    console.error("[detect]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Detection failed" },
      { status: 500 }
    );
  }
}
