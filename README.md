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

## Deployment Guide

### Backend → Render

The backend is configured for instant deployment using either Render Blueprints (`render.yaml`) or a manual Web Service.

#### Option A: 1-Click via Render Blueprint (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**.
2. Connect your GitHub repository (`Susil-commits/AINerd`).
3. Render will automatically detect the root `render.yaml` and configure:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3.11
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Health Check**: `/health`
4. Fill in the required secret environment variables prompted by Render:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `SUPABASE_URL`: Your Supabase project URL (`https://xyz.supabase.co`)
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `ELEVENLABS_API_KEY`: Your ElevenLabs API key (optional for voice)
   - `FRONTEND_URL`: Your Vercel frontend URL (or leave blank; Vercel preview & production domains are automatically supported by CORS regex)
5. Click **Apply**. Once built, note your backend URL (e.g. `https://ainerd-backend.onrender.com`).

#### Option B: Manual Web Service
- **Type**: Web Service
- **Root Directory**: `backend` (or leave default `./` — root fallbacks are included)
- **Environment**: Python 3.11
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT` (if root dir is `backend`) or `uvicorn backend.main:app --host 0.0.0.0 --port $PORT` (if root dir is `./`)
- **Health Check Path**: `/health`
- Add Environment Variables matching `backend/.env.example` (or `render.yaml`).

> 💡 **Tip for Demo Day**: Render free tier instances spin down after 15 minutes of inactivity. Send a warm-up `GET https://your-backend.onrender.com/health` 2 minutes before presenting!

---

### Frontend → Vercel

The frontend is ready for Vercel with automatic SPA routing and API binding.

1. Go to [Vercel Dashboard](https://vercel.com/new) → **Add New Project** → Import `Susil-commits/AINerd`.
2. Configure Project Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (default, supported via root `vercel.json`) or `frontend`
   - **Build Command**: `npm run build` (or automatic via Vite preset)
   - **Output Directory**: `dist` (if root directory is `frontend`) or `frontend/dist` (if root directory is `./`)
3. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Render backend URL (e.g., `https://ainerd-backend.onrender.com` — no trailing slash needed)
4. Click **Deploy**.
5. Once deployed, test the connection by starting a tutoring session! CORS in FastAPI is preconfigured to accept all `*.vercel.app` domains automatically (and custom domains via `FRONTEND_URL`).

---

## Data Sources
- **GSM8K** (OpenAI) — math reasoning dataset
- **Eedi / NeurIPS 2020** — misconception taxonomy (used as few-shot examples)
- **Common Core State Standards** — skill taxonomy (4.NF.B.3, etc.)
- **Hand-curated seed set** — 20 guaranteed-clean demo problems

---

## Pitch Summary

> "Most AI tutors either give the answer or grade a multiple-choice quiz. Mine never gives the answer — it figures out exactly where a student's thinking broke, using real misconception patterns from published education-research datasets, and adapts what it teaches next using a Bayesian Knowledge Tracing model. It's a LangGraph pipeline of specialized agents — a tutor, a diagnostician, and a curriculum-matching agent — feeding that mastery model, built end-to-end by one person in a week."
