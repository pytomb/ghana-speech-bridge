# Contributing to Ghana Speech Bridge

Thank you for helping build language infrastructure for West Africa.

This project only works if it reflects how real people actually speak —
and that requires contributors who know these languages, communities, and contexts
far better than any AI model can. Every contribution matters.

---

## Three ways to contribute

### 1. Native Speaker Review (highest impact, no coding required)

Our locale files were created with AI assistance and are marked `"reviewed": false`.
They need verification from native speakers before they can be trusted in production.

**Languages that need review:**

| Language | File | Status |
|----------|------|--------|
| Twi (Akan) | `packages/ghana-i18n/locales/tw.json` | Needs review |
| Ewe | `packages/ghana-i18n/locales/ee.json` | Needs review |
| Ga | `packages/ghana-i18n/locales/gaa.json` | Needs review |
| Dagbani | `packages/ghana-i18n/locales/dag.json` | Needs review |

**How to review:**

1. Fork the repo and open the locale file for your language
2. Read through each string — correct any errors directly in the JSON
3. Pay special attention to:
   - Voice UI strings (the `voice` namespace) — these get spoken aloud, so they must sound natural
   - Financial terms (check `domains/fintech.json`) — accuracy matters for trust
   - Error messages — they should be kind and clear, not technical
4. When you're satisfied, change `"reviewed": false` to `"reviewed": true` at the top of the file
5. Open a PR with the title: `i18n(tw): native speaker review` (replace `tw` with your language code)

**No GitHub experience?** Email corrections to the maintainer or open an Issue —
we'll handle the PR for you.

---

### 2. Domain Vocabulary (no coding required)

We currently have domain packs for `fintech`, `healthcare`, and `agriculture`.
Missing domains that Ghanaian app developers need:

- `education` — school enrollment, attendance, grades, parent communication
- `government-services` — ID registration, NHIS, voter registration, permits
- `transport` — routes, fares, trotro stops, intercity travel
- `market-trading` — prices, negotiation, market days, produce names

**How to add a domain pack:**

1. Copy `packages/ghana-i18n/domains/fintech.json` as your template
2. Create `packages/ghana-i18n/domains/[domain-name].json`
3. Fill in the `terms` (key vocabulary) and `voice_prompts` (spoken phrases)
4. Mark translations `"reviewed": false` if AI-assisted, `"reviewed": true` if written by a native speaker
5. Open a PR with the title: `i18n(domain): add [domain-name] pack`

**Domain pack format:**
```json
{
  "_meta": {
    "domain": "your-domain",
    "description": "What this pack covers",
    "reviewed": false,
    "reviewNote": "Native speaker review needed"
  },
  "terms": {
    "key_term": {
      "en": "English term",
      "tw": "Twi translation",
      "ee": "Ewe translation",
      "gaa": "Ga translation"
    }
  },
  "voice_prompts": {
    "prompt_key": {
      "en": "What would you like to do?",
      "tw": "Twi version...",
      "ee": "Ewe version..."
    }
  }
}
```

---

### 3. Code Contributions

**Good first issues** (check the [Issues](https://github.com/pytomb/ghana-speech-bridge/issues) tab):

- `tsconfig.json` for `apps/speech-bridge`
- `/api/health` endpoint — Khaya API ping + registry status
- Redis adapter for the translation cache (replaces file-based cache)
- Pre-render top 50 common TTS phrases → Vercel Blob storage
- `VoiceInput` React component (tap-to-talk → `/api/stt`)
- `SpeakButton` React component (text → `/api/tts` → audio playback)
- FastText language detector to replace the current heuristic in `/api/detect`

**Branch naming:**
```
feat/your-feature
fix/what-you-fixed
ml/notebook-name
i18n/language-code
```

**Commit format:**
```
feat(api): add /api/health endpoint
fix(cache): handle read-only filesystem on Vercel
i18n(tw): native speaker review — voice namespace
ml(whisper): add Ewe fine-tune notebook
```

---

## ML contributions (Google Colab)

If you have GPU or TPU access and want to help train models:

1. Open any notebook in `ml/` directly in Colab
2. Set `QUICK_RUN = True` first to validate the pipeline (takes ~5 min)
3. When ready for a full run, set `QUICK_RUN = False`
4. Push trained models to Hugging Face Hub under your username
5. Open a PR that updates `apps/speech-bridge/lib/registry.ts` with the model URL and WER/BLEU score

**Model graduation criteria** (from `docs/model-roadmap.md`):
- ASR: WER < 35% on spontaneous speech
- Translation: BLEU within 5% of Khaya API baseline
- Tested on real-world audio, not just scripted sentences

---

## Community and questions

- **GhanaNLP community**: [github.com/GhanaNLP](https://github.com/GhanaNLP)
- **UGSpeechData** (dataset): [huggingface.co/UGSpeech](https://huggingface.co/datasets/UGSpeech/UGSpeechData)
- Open an [Issue](https://github.com/pytomb/ghana-speech-bridge/issues) for anything unclear

---

## Code of conduct

Be kind. This project serves communities that have been historically underrepresented
in technology. Center their needs in every decision.
