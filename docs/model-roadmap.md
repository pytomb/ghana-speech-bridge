# Model Roadmap

> One capability = one model. Upgrade each independently.

## Current State (Short-term)

```
All capabilities → Khaya AI API
Budget: 100 calls/month (Developer tier)
Dependency risk: HIGH (single vendor)
```

## Target State (Long-term)

```
Translation → Gemma 2B fine-tuned (you own it, zero per-call cost)
ASR Twi    → Whisper-Small fine-tuned on UGSpeechData
ASR Ewe    → Whisper-Small fine-tuned on UGSpeechData
TTS        → Coqui XTTS with native voice actors
Detection  → FastText classifier (~1MB, fully offline)
Khaya      → Fallback only (rare edge cases)
```

## Graduation Checklist (per model)

A model graduates from `training` → `active` when:
- [ ] WER (ASR) < 35% OR BLEU (translation) within 5% of Khaya
- [ ] Tested on spontaneous speech (not just scripted)
- [ ] Inference endpoint deployed and health-checked
- [ ] `envKey` URL set in `.env`
- [ ] `registry.ts` status updated to `active`
- [ ] Budget dashboard shows Khaya calls dropping

## Priority Order

### 1. Gemma 2B Translation (in progress)
- Run `ml/01_evaluate_gemma.ipynb` to get baseline scores
- If BLEU < 80% of Khaya → fine-tune on GhanaNLP Parallel Corpora (41K pairs)
- If BLEU ≥ 95% of Khaya → activate immediately

### 2. Whisper-Small Twi ASR (next)
- Dataset: UGSpeechData Akan (104h transcribed) + Common Voice Twi
- Fine-tune: `ml/02_whisper_twi_finetune.ipynb` (TPU weekend)
- Target WER: < 30% on spontaneous speech

### 3. FastText Language Detector
- Train on GhanaNLP text corpora
- Replace heuristic in `/api/detect`
- ~2 hours of work, no GPU needed

### 4. Whisper-Small Ewe ASR
- Same approach as Twi
- UGSpeechData Ewe (106h transcribed)

### 5. Coqui XTTS Twi TTS
- Requires: 30+ min clean studio audio from native Twi voice actor
- Connect with GhanaNLP community for voice talent
- Highest impact for low-literacy users

## Data Sources

| Dataset | Languages | Size | Access |
|---------|-----------|------|--------|
| UGSpeechData | Akan, Ewe, Dagbani | 5,384 hrs audio / 518 hrs transcribed | Hugging Face |
| GhanaNLP Parallel Corpora | Twi, Ewe, Ga, Fante, Kusaal | 41,000+ sentence pairs | GitHub/HF |
| Mozilla Common Voice Twi | Twi | Community-growing | commonvoice.mozilla.org |
| Financial Inclusion Dataset | Twi, Ewe, Ga | 7,800 audio samples | LinkedIn/AdwumaTech |
| WAXAL (Google) | Hausa, Yoruba + | 11,000 hrs | HuggingFace |

## Cost at Scale

| State | Monthly Cost (1,000 users) | Risk |
|-------|---------------------------|------|
| All Khaya | ~$90–750/month (Standard/Enterprise) | High vendor dependency |
| Gemma 2B active | ~$15/month (STT + TTS only) | Reduced |
| All owned | Hosting costs only (~$20–50) | Low |
