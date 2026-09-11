# AI Socratic Tutor 🎓

> A multi-agent, voice-first tutoring system that never gives the answer — it diagnoses *why* a student's reasoning broke and adapts what it teaches next using a real mastery model.

**Nerdy Hackathon 2026 · Built end-to-end in one week**

---

## Architecture

```
Student (voice / text / photo)
    ↓
React Frontend (Vercel)
    ↓ SSE streaming
FastAPI Backend (Render)
    ↓
LangGraph Orchestrator
    ├── Tutor Agent (Gemini 2.0 Flash) — Socratic dialogue
    ├── Diagnostic Agent (Gemini Vision) — OCR + misconception detection
    └── Content Agent (Gemini + pgvector) — adaptive problem selection
                    ↓
          BKT Mastery Model (per-student, per-skill)
                    ↓
          Supabase (Postgres + pgvector)
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Backend | FastAPI + LangGraph |
| LLM + Vision | Google Gemini 2.0 Flash |
| Database | Supabase (Postgres + pgvector) |
| Voice STT | Web Speech API (free, browser) |
| Voice TTS | ElevenLabs free tier |
| Mastery Model | Bayesian Knowledge Tracing (BKT) |
| Frontend deploy | Vercel |
| Backend deploy | Render |

---

## Setup

### 1. Clone + install

```bash
git clone <repo>
cd ainerd

# Frontend
cd frontend && npm install && cd ..

# Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cd ..
```

### 2. Configure environment

```bash
# Copy the template
cp .env.example .env
# Fill in your values in .env:
# GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, ELEVENLABS_API_KEY
```

### 3. Set up Supabase database

1. Go to your Supabase project → SQL Editor
2. Paste and run the contents of `scripts/setup_db.sql`

### 4. Seed the problem bank

```bash
cd backend
python ../scripts/seed_db.py
```

This embeds all 20 problems into pgvector.

### 5. Run locally

```bash
# Terminal 1 — Backend
cd backend
uvicorn main:app --reload

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open http://localhost:5173

---

## How It Works

### Agents
1. **Tutor Agent** — Uses Gemini 2.0 Flash with a Socratic system prompt. Never reveals the answer. Asks one guiding question at a time.
2. **Diagnostic Agent** — Uses Gemini Vision to OCR handwritten work, then names the specific misconception using Eedi-derived few-shot examples.
3. **Content Agent** — Queries Supabase pgvector for the next problem, filtered by skill gap and difficulty calibrated to mastery probability.

### Mastery Model (BKT)
Bayesian Knowledge Tracing tracks P(mastery) per student per skill using 4 parameters:
- **Prior**: starting probability of knowing the skill
- **Learn**: probability of transitioning from not-knowing to knowing after one attempt
- **Guess**: probability of correct answer despite not knowing
- **Slip**: probability of incorrect answer despite knowing

Updates after every problem attempt. Stored in Supabase.

### Voice
- **STT**: Web Speech API (Chrome/Edge built-in, no API key needed)
- **TTS**: ElevenLabs free tier via backend proxy (preserves API key security)
- **Fallback**: Browser SpeechSynthesis if ElevenLabs is unavailable

---

## Deployment

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. Connect repo to Vercel
3. Set `VITE_API_URL` to your Render backend URL

### Backend → Render
1. Push `backend/` to GitHub
2. Create a new Web Service on Render
3. Set all env vars from `.env.example` in the Render dashboard
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

> ⚠️ Render free tier spins down when idle. Send a warm-up request before your demo!

---

## Data Sources
- **GSM8K** (OpenAI) — math reasoning dataset
- **Eedi / NeurIPS 2020** — misconception taxonomy (used as few-shot examples)
- **Common Core State Standards** — skill taxonomy (4.NF.B.3, etc.)
- **Hand-curated seed set** — 20 guaranteed-clean demo problems

---

## Pitch Summary

> "Most AI tutors either give the answer or grade a multiple-choice quiz. Mine never gives the answer — it figures out exactly where a student's thinking broke, using real misconception patterns from published education-research datasets, and adapts what it teaches next using a Bayesian Knowledge Tracing model. It's a LangGraph pipeline of specialized agents — a tutor, a diagnostician, and a curriculum-matching agent — feeding that mastery model, built end-to-end by one person in a week."
