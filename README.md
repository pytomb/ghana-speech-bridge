# Ghana Speech Bridge

> Voice-native language infrastructure for Ghanaian applications.
> Supports Twi, Ewe, Ga, Dagbani, Fante — with code-switching and offline-first design.

---

## What This Is

A standalone service + ML workspace that gives any app in the MVP Factory
voice and language capabilities for Ghanaian users — especially those without
formal education who need to speak and hear in their native tongue.

**Two parallel tracks:**

| Track | What | Timeline |
|-------|------|----------|
| **Short-term** | API-powered bridge (Khaya AI) with smart caching + call budget | Now |
| **Long-term** | Own every layer: fine-tuned Whisper ASR, Gemma 2B translation, Coqui TTS | Ongoing |

The service interface stays constant — backend providers swap underneath.
Every app built on this bridge gets improvements automatically.

---

## Architecture

```
User speaks (Twi / Ewe / Ga / Dagbani / mixed)
    │
    ▼
[1] Language Detector          → fast classifier, runs locally
    │
    ▼
[2] ASR  /api/stt              → Khaya STT (now) → Whisper-Akan (soon)
    │  "Me pɛ sɛ me kɔ fie"
    ▼
[3] Translate /api/translate   → Khaya API (now) → Gemma 2B fine-tuned (soon)
    │  "I want to go home"
    ▼
[4] LLM Reasoning              → Claude / Gemini (always English, always cloud)
    │  "Here are 3 bus routes..."
    ▼
[5] Translate back             → same as step 3
    │
    ▼
[6] TTS /api/tts               → Khaya TTS (now) → Coqui XTTS (soon)
    │
    ▼
User hears response in their language
```

---

## Repo Structure

```
ghana-speech-bridge/
├── apps/
│   └── speech-bridge/         # Next.js API service — deploy to Vercel
│       ├── app/api/
│       │   ├── stt/           # Speech → Text
│       │   ├── tts/           # Text → Speech (returns audio URL)
│       │   ├── translate/     # Text translation
│       │   ├── detect/        # Language detection
│       │   └── budget/        # API call usage dashboard
│       └── lib/
│           ├── providers/
│           │   └── khaya.ts   # Khaya AI client
│           ├── router.ts      # Routes to best available provider
│           ├── cache.ts       # Translation + TTS cache
│           └── budget.ts      # Monthly call tracker + alerts
│
├── packages/
│   └── ghana-i18n/            # Shared locale assets (npm package)
│       ├── locales/           # UI strings: en, tw, ee, gaa, dag
│       └── domains/           # Domain term packs: fintech, health, agriculture
│
├── ml/                        # Google Colab notebooks
│   ├── 01_evaluate_gemma.ipynb       # Evaluate your Gemma 2B fine-tune
│   ├── 02_whisper_twi_finetune.ipynb # Fine-tune Whisper-Small on UGSpeechData
│   ├── 03_collect_test_set.ipynb     # Build evaluation dataset
│   └── data/
│       └── test_sentences.json       # 100-sentence eval set (en↔tw)
│
├── factory/
│   └── SKILL.md               # MVP Factory skill — injected during project build
│
└── docs/
    ├── architecture.md
    └── model-roadmap.md
```

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/YOUR_ORG/ghana-speech-bridge.git
cd ghana-speech-bridge
npm install
```

### 2. Set environment variables

```bash
cp apps/speech-bridge/.env.example apps/speech-bridge/.env.local
# Add your KHAYA_API_KEY
```

### 3. Run locally

```bash
npm run dev
# Speech Bridge API: http://localhost:3001
```

### 4. Test the API

```bash
# Translate English → Twi
curl -X POST http://localhost:3001/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, how are you?", "from": "en", "to": "tw"}'

# Check API budget
curl http://localhost:3001/api/budget
```

---

## API Reference

### `POST /api/translate`
```json
{ "text": "Hello", "from": "en", "to": "tw" }
→ { "result": "Maakye", "cached": true, "provider": "khaya" }
```

### `POST /api/stt`
```
multipart/form-data: audio (file), lang (tw|ee|gaa|dag)
→ { "transcript": "...", "confidence": 0.87, "provider": "khaya" }
```

### `POST /api/tts`
```json
{ "text": "Akwaaba", "lang": "tw" }
→ { "audioUrl": "...", "cached": true, "provider": "khaya" }
```

### `POST /api/detect`
```json
{ "text": "Me pɛ sɛ me kɔ fie" }
→ { "language": "tw", "confidence": 0.94, "codeSwitched": false }
```

### `GET /api/budget`
```json
{
  "month": "2026-03",
  "callsUsed": 47,
  "callsLimit": 100,
  "percentUsed": 47,
  "cacheHits": 312,
  "callsSaved": 312,
  "breakdown": { "translate": 30, "stt": 12, "tts": 5 }
}
```

---

## ML Workspace (Google Colab)

Open notebooks directly in Colab:

| Notebook | Purpose | TPU needed? |
|----------|---------|-------------|
| [01_evaluate_gemma](ml/01_evaluate_gemma.ipynb) | Score your Gemma 2B fine-tune vs Khaya | No (T4 GPU) |
| [02_whisper_twi_finetune](ml/02_whisper_twi_finetune.ipynb) | Fine-tune Whisper-Small on UGSpeechData | Yes (TPU v2/v3) |
| [03_collect_test_set](ml/03_collect_test_set.ipynb) | Build + validate evaluation dataset | No |

### Key datasets (all open-source)
- **UGSpeechData** — 5,384 hrs Ghanaian speech (Akan, Ewe, Dagbani) — University of Ghana
- **Mozilla Common Voice Twi** — community-contributed Twi audio
- **GhanaNLP Parallel Corpora** — 41,000+ human-translated sentence pairs
- **Financial Inclusion Dataset** — 7,800 audio samples in Twi, Ewe, Ga (domain-specific)

---

## Language Support

| Language | Code | Speakers | ASR | TTS | Translation |
|----------|------|----------|-----|-----|-------------|
| Twi (Akan) | `tw` | ~9M | Khaya → Whisper-Akan | Khaya | Khaya → Gemma 2B |
| Ewe | `ee` | ~3.8M | Khaya | Khaya | Khaya |
| Ga | `gaa` | ~745K | Khaya | Khaya | Khaya |
| Dagbani | `dag` | ~1.2M | Khaya | Khaya | Khaya |
| Fante | `fat` | Regional | Khaya | Khaya | Khaya |
| Gh. Pidgin | `pcm-gh` | ~5M urban | Planned | Planned | Planned |

---

## Parallelization Guide (Jules + Colab)

This repo is structured for parallel workstreams:

| Workstream | Who/What | Branch |
|------------|----------|--------|
| Speech Bridge API + caching | Jules / you | `feat/speech-bridge` |
| Gemma 2B evaluation | Google Colab | `ml/gemma-eval` |
| Whisper Twi fine-tuning | Google Colab (TPU) | `ml/whisper-twi` |
| Locale file expansion | Jules | `feat/locales` |
| Domain pack curation | Manual / native speakers | `feat/domain-packs` |

**Merge strategy**: ML branches output model weights + evaluation reports.
Model references go into `lib/registry.ts` when ready for production routing.

---

## Factory Integration

Once a component graduates (quality verified), it gets registered in the
MVP Factory as a skill. Projects signal language needs during intake:

```yaml
localization:
  enabled: true
  tier: "voice"          # ui | content | voice
  languages: ["tw", "ee"]
  offline_capable: true
```

The factory build step auto-scaffolds the bridge client + voice components.

---

## Contributing

- Native speaker translations welcome — see `packages/ghana-i18n/locales/`
- Domain terminology packs — see `packages/ghana-i18n/domains/`
- Please tag all AI-generated translations with `"reviewed": false`
- Native speaker review required before `"reviewed": true`

---

## License

MIT — build freely, attribute generously.
