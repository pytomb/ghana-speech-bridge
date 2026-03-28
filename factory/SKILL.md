---
name: ghana-language
description: Ghana language + voice support — Twi, Ewe, Ga, Dagbani. Guides AI when scaffolding localized or voice-native apps for Ghanaian users.
type: factory-skill
metadata:
  priority: 15
  pathPatterns:
    - '*/locales/*.json'
    - '*/i18n/*'
    - '*language-bridge*'
    - '*speech-bridge*'
  promptSignals:
    phrases:
      - "ghana"
      - "twi"
      - "ewe"
      - "akan"
      - "dagbani"
      - "local language"
      - "voice native"
      - "low literacy"
      - "khaya"
      - "ghananlp"
---

# Ghana Language + Voice Skill

## When to activate this skill

Load this skill when:
- Project intake signals Ghana, West Africa, or local Ghanaian languages
- User mentions voice-first, low-literacy, or rural accessibility requirements
- Project stack includes `khaya`, `next-intl`, or speech bridge dependencies

---

## Core Architecture Decision

**Always separate capabilities into individual services:**

| Capability | Short-term | Long-term |
|------------|-----------|-----------|
| Language detection | Heuristic (free, instant) | FastText classifier |
| ASR (speech→text) | Khaya STT | Whisper-Small fine-tuned |
| Translation | Khaya API + cache | Gemma 2B fine-tuned |
| LLM reasoning | Claude/Gemini (English only) | Same |
| TTS (text→speech) | Khaya TTS + audio cache | Coqui XTTS |

Never ask one model to do all five. One model = one job.

---

## Integration Tiers

### Tier 1 — UI Translation (1–2 days)
Static interface strings only. Zero API calls after first run.
- Add `next-intl` v4.x
- Copy locale files from `@ghana-speech-bridge/i18n`
- Add `LanguageSwitcher` component

**Use when:** Coordinator-facing apps. Users are literate but prefer local language UI.

### Tier 2 — Content Translation (3–5 days)
Tier 1 + dynamic content via Khaya API with caching.
- Add Khaya API route (`/api/translate`)
- Cache translations by hash (DB or Redis)
- Track monthly API call budget

**Use when:** End-users read dynamic content in their language.

### Tier 3 — Voice Native (1–2 weeks)
Full pipeline: STT → translate → LLM → translate → TTS.
- Add speech bridge client pointing to `ghana-speech-bridge` service
- `VoiceInput` component (tap-to-talk)
- `SpeakButton` component (TTS playback)
- Voice-first UX (no text menus, audio confirmations)

**Use when:** Low-literacy users. Rural contexts. Voice-first product design.

---

## Supported Languages

| Code | Language | Speakers | Notes |
|------|----------|----------|-------|
| `tw` | Twi (Akan) | ~9M | Primary target. Best model support. |
| `ee` | Ewe | ~3.8M | Volta region |
| `gaa` | Ga | ~745K | Greater Accra |
| `dag` | Dagbani | ~1.2M | Northern region |
| `fat` | Fante | Regional | Central/Western |

---

## API Budget Rules (Khaya Free Tier = 100 calls/month)

1. **Pre-translate all static UI strings** — stored in locale JSON, zero API calls
2. **Cache aggressively** — translation cache by hash, TTS cache by text+lang
3. **Record every call** — `recordCall(type)` in budget.ts
4. **Alert at 80%** — console warning + dashboard indicator
5. **Common phrase audio** — pre-render top 50 TTS phrases, store in Vercel Blob

---

## Voice-First UX Principles

For low-literacy users (critical — ignored at your peril):

- **No menus** — speak the action, don't show a dropdown
- **Guided turns** — one question at a time, wait for answer
- **Audio confirmation** — always read back what the system understood ("You said: send 50 cedis to Kofi. Is that right?")
- **Error tolerance** — design flows that survive ~30% WER transcription errors
- **Cultural trust signals** — hearing confirmation in native language builds trust (80% trust rate in TumaPay study)
- **Icons over text** — use culturally relevant pictograms alongside every action
- **Alternative auth** — PIN codes fail for non-literate users; consider animal-pattern or voice-biometric login

---

## Code-Switching

Real Ghanaian speech frequently mixes English + Twi mid-sentence.
Example: "Me pɛ sɛ me send GHS 50 to Kofi."

**Design for this:**
- Use the `/api/detect` endpoint to classify before routing to ASR
- For mixed utterances, use Khaya STT (it handles some code-switching)
- When Whisper-Akan is active, route pure Twi there, mixed to Khaya

---

## Factory Intake Questions

Add to project intake when Ghana signals are detected:

```yaml
localization:
  - Does your target audience need local language support?
  - Which Ghanaian languages? (Twi / Ewe / Ga / Dagbani / Fante)
  - Voice input needed? (many users cannot type)
  - Offline capability needed? (rural = intermittent connectivity)
  - What is the literacy level of your primary users?
```

---

## State.json Extension

```json
{
  "localization": {
    "enabled": true,
    "tier": "voice",
    "languages": ["tw", "ee"],
    "speechBridgeUrl": "https://your-speech-bridge.vercel.app",
    "offlineCapable": false,
    "khayaTier": "developer"
  }
}
```

---

## Environment Variables Required

```bash
KHAYA_API_KEY=           # From https://translation.ghananlp.org
SPEECH_BRIDGE_URL=       # Your deployed ghana-speech-bridge service
BUDGET_ALERT_THRESHOLD=80
```

---

## References

- [Ghana Speech Bridge repo](https://github.com/YOUR_ORG/ghana-speech-bridge)
- [Khaya AI API](https://translation.ghananlp.org)
- [GhanaNLP GitHub](https://github.com/GhanaNLP)
- [UGSpeechData](https://huggingface.co/datasets/UGSpeech/UGSpeechData)
- [Mozilla Common Voice Twi](https://commonvoice.mozilla.org/tw)
