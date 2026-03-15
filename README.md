# CCIE Study App

Full-stack CCIE Enterprise Infrastructure exam prep tool.

## Stack

- **Backend**: FastAPI + PostgreSQL (Railway)
- **Frontend**: React + Vite + TypeScript + Tailwind CSS (Cloudflare Pages)
- **AI**: Anthropic Claude (streaming chat mentor)
- **Labs**: Cisco CML via virl2-client

## Local Development

### Backend

```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL, ANTHROPIC_API_KEY, CML_* vars

pip install -r requirements.txt
uvicorn app.main:app --reload
# API at http://localhost:8000

# Seed quiz cards
python seed_quiz_data.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App at http://localhost:5173
```

## Deploy

- **Backend**: Push to Railway, set env vars, it uses `railway.toml`
- **Frontend**: Push to Cloudflare Pages, set `VITE_API_URL` to Railway URL

## Features

- Dashboard with programme timeline (Feb 2026 – Jan 2027)
- SM-2 spaced repetition flashcards (OSPF, BGP, EIGRP)
- Claude-powered streaming chat mentor
- CML lab launcher with injected faults + answer key
