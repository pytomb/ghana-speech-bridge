# Ghana Speech Bridge — Backlog

> **How to use this file**
> - Move items DOWN as they progress: `Backlog → Up Next → In Progress → Done`
> - Each item has a workstream tag: `[API]` `[ML]` `[i18n]` `[Factory]` `[Infra]`
> - Add a date when moving to Done: `✅ 2026-03-28`
> - Commit this file with every meaningful status change

---

## ✅ Done

| # | Item | Workstream | Date |
|---|------|------------|------|
| 1 | Initial repo scaffold — speech bridge API, i18n packages, ML notebooks | `[API]` `[ML]` `[i18n]` | 2026-03-28 |
| 2 | Khaya AI client with translate / STT / TTS endpoints | `[API]` | 2026-03-28 |
| 3 | Monthly call budget tracker with 80% alert threshold | `[API]` | 2026-03-28 |
| 4 | Translation + TTS cache (SHA256 keys, 7d / 30d TTL) | `[API]` | 2026-03-28 |
| 5 | Model registry with graduation path (planned → training → active) | `[API]` | 2026-03-28 |
| 6 | Heuristic language detector — zero API calls (Twi, Ewe, Ga, Dagbani) | `[API]` | 2026-03-28 |
| 7 | Locale files for 5 languages: Twi, Ewe, Ga, Dagbani, Fante | `[i18n]` | 2026-03-28 |
| 8 | Domain vocabulary packs: fintech, healthcare, agriculture | `[i18n]` | 2026-03-28 |
| 9 | 60-sentence en↔tw evaluation test set (5 categories) | `[ML]` | 2026-03-28 |
| 10 | Gemma 2B evaluation notebook (`01_evaluate_gemma.ipynb`) — T4 Colab | `[ML]` | 2026-03-28 |
| 11 | Whisper-Small Twi fine-tune notebook (`02_whisper_twi_finetune.ipynb`) — TPU | `[ML]` | 2026-03-28 |
| 12 | Factory SKILL.md — auto-injects into factory when Ghana signals detected | `[Factory]` | 2026-03-28 |
| 13 | Model roadmap + graduation checklist | `[Factory]` | 2026-03-28 |
| 14 | GitHub repo published — pytomb/ghana-speech-bridge | `[Infra]` | 2026-03-28 |

---

## 🔄 In Progress

| # | Item | Workstream | Owner | Notes |
|---|------|------------|-------|-------|
| — | — | — | — | — |

---

## ⏫ Up Next (prioritized, ready to start)

| # | Item | Workstream | Effort | Notes |
|---|------|------------|--------|-------|
| 1 | Deploy `apps/speech-bridge` to Vercel — set `KHAYA_API_KEY` env var | `[Infra]` | 30 min | Use Jules or `vercel deploy` |
| 2 | Run `01_evaluate_gemma.ipynb` on existing Gemma 2B checkpoint | `[ML]` | 2–4 hrs | T4 Colab free tier. Set `MODEL_PATH` + `KHAYA_API_KEY` |
| 3 | Whisper-Small Twi full training run (`QUICK_RUN=False`) | `[ML]` | 4–8 hrs | TPU v3 Colab. Set `HF_TOKEN` + `HF_REPO` |
| 4 | Native speaker review of Twi locale (`packages/ghana-i18n/locales/tw.json`) | `[i18n]` | 1–2 days | Connect with GhanaNLP community or local partner |
| 5 | Add `tsconfig.json` to `apps/speech-bridge` | `[Infra]` | 15 min | Needed for full TypeScript compilation |

---

## 📋 Backlog

### API / Infrastructure

| # | Item | Workstream | Effort | Notes |
|---|------|------------|--------|-------|
| B-1 | Swap file-based cache for Redis/Postgres (Upstash or Neon) | `[API]` | 1 day | Cache interface already abstracted — just swap the adapter |
| B-2 | `/api/pipeline` endpoint — full STT→translate→LLM→translate→TTS in one call | `[API]` | 2 days | Compose existing endpoints; expose latency breakdown in response |
| B-3 | Health check endpoint `/api/health` — Khaya API ping + registry status | `[API]` | 2 hrs | Required before client projects depend on this service |
| B-4 | Rate limiting on all endpoints (prevent accidental Khaya quota burn) | `[API]` | 1 day | Use Upstash rate limit or simple in-memory counter |
| B-5 | Pre-render top 50 common TTS phrases → store in Vercel Blob | `[API]` | 1 day | Zero API calls for confirmation messages, greetings, error prompts |
| B-6 | Webhook for budget alerts — POST to Slack/Discord when ≥80% | `[API]` | 3 hrs | Currently only console.warn; needs external visibility |

### Machine Learning

| # | Item | Workstream | Effort | Notes |
|---|------|------------|--------|-------|
| B-7 | FastText language detector — replaces heuristic in `/api/detect` | `[ML]` | 2 hrs | Train on GhanaNLP text corpora; ~1MB model, no GPU needed |
| B-8 | Gemma 2B fine-tune on GhanaNLP Parallel Corpora (41K pairs) | `[ML]` | 1 weekend | Only if BLEU eval shows < 80% of Khaya baseline |
| B-9 | Whisper-Small Ewe fine-tune (`03_whisper_ewe_finetune.ipynb`) | `[ML]` | 4–8 hrs | Same approach as Twi. UGSpeechData Ewe (106h transcribed) |
| B-10 | Whisper-Small Dagbani fine-tune | `[ML]` | TBD | UGSpeechData Dagbani — check transcription hours before committing |
| B-11 | Coqui XTTS Twi TTS — requires 30+ min clean studio audio | `[ML]` | 2–4 weeks | Block on: sourcing native Twi voice actor via GhanaNLP community |
| B-12 | Expand test set to 120 sentences (add Ewe + Ga reference translations) | `[ML]` | 1 day | Needs native speaker input |
| B-13 | Benchmark notebook: Whisper vs Khaya STT on spontaneous speech | `[ML]` | 1 day | Once Whisper model is trained — compare WER on held-out audio |

### i18n / Localization

| # | Item | Workstream | Effort | Notes |
|---|------|------------|--------|-------|
| B-14 | Native speaker review — Ewe locale (`ee.json`) | `[i18n]` | 1–2 days | GhanaNLP Volta region contacts |
| B-15 | Native speaker review — Ga locale (`gaa.json`) | `[i18n]` | 1–2 days | Greater Accra partners |
| B-16 | Native speaker review — Dagbani locale (`dag.json`) | `[i18n]` | 1–2 days | Northern region community |
| B-17 | Add `education` domain vocabulary pack | `[i18n]` | 1 day | School enrollment, attendance, grades — needed for EdTech clients |
| B-18 | Add `government-services` domain vocabulary pack | `[i18n]` | 1 day | ID registration, permits, NHIS, voter registration |
| B-19 | Code-switching detection improvement — mixed Twi+English utterances | `[i18n]` | 3 hrs | Add to `/api/detect` — currently binary; needs confidence split |

### Factory Integration

| # | Item | Workstream | Effort | Notes |
|---|------|------------|--------|-------|
| B-20 | `VoiceInput` React component (tap-to-talk) | `[Factory]` | 2 days | MediaRecorder → send to `/api/stt` → return transcript |
| B-21 | `SpeakButton` React component (TTS playback) | `[Factory]` | 1 day | Calls `/api/tts` → plays base64 audio → shows loading state |
| B-22 | `LanguageSwitcher` component for Tier 1 integration | `[Factory]` | 4 hrs | Dropdown: Twi / Ewe / Ga / Dagbani / English |
| B-23 | Copy factory SKILL.md → main factory `.claude/skills/ghana-language/SKILL.md` | `[Factory]` | 15 min | Do after first client project uses this bridge successfully |
| B-24 | Demo app — voice fintech transfer flow (Tier 3 reference implementation) | `[Factory]` | 3 days | Full STT→LLM→TTS pipeline; mobile-first; serves as pitch demo |

---

## 🧊 Icebox (good ideas, not yet prioritized)

| Item | Why deferred |
|------|-------------|
| Offline whisper.cpp edge inference | Needs packaging work; defer until Whisper model is production-stable |
| Animal-pattern login (alternative auth for non-literate users) | High impact for low-literacy, but needs UX research + usability testing first |
| Ga and Dagbani ASR models | Blocked on UGSpeechData transcription hours — verify before committing GPU time |
| Voice biometric authentication | Research phase — no open datasets for Ghanaian voice biometrics yet |
| SMS fallback for voice pipelines | USSD/SMS integration is a separate vendor relationship (Africa's Talking) |
| Hausa / Yoruba expansion (WAXAL dataset) | Out of current scope — valid future expansion if client base grows to Nigeria/Senegal |

---

## 📐 Model Graduation Tracker

| Model | Capability | Status | WER / BLEU | Notes |
|-------|-----------|--------|------------|-------|
| khaya-translate | Translation (en↔tw, en↔ee, en↔gaa) | `active` | — | Baseline / fallback |
| gemma-2b-tw | Translation en→tw | `training` | TBD | Run eval notebook first |
| khaya-stt | ASR (Twi, Ewe) | `active` | — | Baseline / fallback |
| whisper-small-akan | ASR Twi | `planned` | — | Fine-tune this week |
| whisper-small-ewe | ASR Ewe | `planned` | — | After Twi is stable |
| khaya-tts | TTS (Twi, Ewe) | `active` | — | Baseline / fallback |
| coqui-xtts-tw | TTS Twi | `planned` | — | Blocked on voice actor |
| fasttext-detect | Language detection | `planned` | — | ~2 hrs once Whisper done |

---

*Last updated: 2026-03-28 — @pytomb*
