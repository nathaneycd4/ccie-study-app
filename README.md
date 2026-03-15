# CCIE EI Study App

Personal study platform for CCIE Enterprise Infrastructure exam preparation.

## Live URLs

| | URL |
|---|---|
| Frontend | https://nathanfagan.net |
| Backend API | https://api.nathanfagan.net |
| CML | https://cml.nathanfagan.net |
| API Docs | https://api.nathanfagan.net/docs |

---

## Stack

| Layer | Technology | Host |
|---|---|---|
| Frontend | React + Vite + TypeScript + Tailwind | Cloudflare Pages |
| Backend | FastAPI + Python | Railway |
| Database | PostgreSQL + asyncpg | Railway |
| AI | Anthropic Claude (streaming SSE) | — |
| Lab Infra | Cisco CML on Proxmox | 192.168.137.10 |
| CML Tunnel | Cloudflare Tunnel | cml.nathanfagan.net → 192.168.137.10 |

---

## Features

**Topics covered:**

| Topic | Cards |
|---|---|
| OSPF | 15 |
| BGP | 12 |
| EIGRP | 8 |
| Spanning Tree | 5 |
| SD-WAN | 4 |
| QoS | 4 |
| Automation | 4 |
| VLANs | 3 |
| SD-Access | 3 |
| Security | 3 |
| Network Assurance | 3 |
| IP Services | 3 |
| Wireless | 3 |
| MPLS | 2 |

### Flashcard / Quiz System
- 72 cards across 14 CCIE EI topics
- SM-2 spaced repetition — cards scheduled based on performance
- Quality ratings: Correct (5) / Almost (3) / Missed (1)
- Skip button to advance without rating

### Study Progress Dashboard
- Current module based on Cohort 27 schedule (Feb 2026 – Jan 2027)
- Log study sessions with topic, duration, and notes
- View recent session history

### CCIE Mentor Chat
- Claude-powered AI mentor with CCIE EI system prompt
- Streaming responses via Server-Sent Events
- Detects lab creation intent — triggers CML lab directly from chat
- Persistent chat history per session
- Header shows current study module from Cohort 27 schedule

### CML Lab Launcher
- Creates troubleshooting labs on Cisco Modeling Labs for OSPF, BGP, and EIGRP
- Fault count slider (1–7 faults)
- Topology: 5 × IOL-XE routers (R1–R5, Ethernet0/x interfaces) — same physical layout for all lab types
- SVG topology diagram shown inline on each lab card
- Interactive fault checklist — tick off each fault as you fix it, with progress counter
- Answer key revealed on demand after lab is created

**OSPF fault types:** area mismatch, timer mismatch, missing network statement, MD5 auth mismatch, passive interface, MTU mismatch, wrong wildcard mask

**BGP fault types:** wrong remote-as, wrong neighbor IP, missing network statement, missing address-family activation, missing static route for loopback peering, missing next-hop-self, wrong AS on eBGP peer

**EIGRP fault types:** wrong AS number, passive interface, K-value mismatch, wrong wildcard, missing network statement, distribute-list blocking routes, MD5 auth mismatch

---

## Project Structure

```
ccie-study-app/
├── frontend/
│   ├── src/
│   │   ├── api/client.ts              # All API calls + SSE streaming
│   │   ├── components/
│   │   │   ├── FlashcardViewer.tsx    # Card flip + rating buttons + skip
│   │   │   ├── LabLauncher.tsx        # Lab creation form (topic/faults/seed)
│   │   │   ├── LabStatusCard.tsx      # Lab card with topology + fault checklist
│   │   │   ├── LabTopology.tsx        # SVG topology diagram (R1–R5)
│   │   │   ├── CurrentModuleCard.tsx  # Dashboard current module
│   │   │   └── ScheduleTimeline.tsx   # Programme schedule timeline
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx          # Study progress + session logging
│   │   │   ├── Quiz.tsx               # Topic selector
│   │   │   ├── FlashcardSession.tsx   # SM-2 card review session
│   │   │   ├── Chat.tsx               # AI mentor with streaming + module context
│   │   │   └── Labs.tsx               # CML lab launcher
│   │   ├── types/                     # TypeScript interfaces
│   │   └── index.css                  # Cyberpunk global styles
│   ├── tailwind.config.js             # cyber.* colour tokens
│   └── vite.config.ts
│
└── backend/
    ├── app/
    │   ├── main.py                    # FastAPI app, CORS, lifespan startup
    │   ├── db.py                      # Async SQLAlchemy + asyncpg
    │   ├── models/models.py           # ORM models
    │   ├── api/routes/
    │   │   ├── progress.py            # Study session endpoints
    │   │   ├── quiz.py                # Deck, answer, stats endpoints
    │   │   ├── chat.py                # SSE streaming chat
    │   │   └── labs.py                # CML lab CRUD
    │   └── services/
    │       ├── claude.py              # Anthropic streaming + lab intent
    │       ├── srs.py                 # SM-2 algorithm
    │       ├── schedule.py            # Cohort 27 programme schedule
    │       └── cml_service.py         # virl2-client CML integration + routing
    ├── labs/
    │   ├── ospf.py                    # OSPF lab generator (7 fault types)
    │   ├── bgp.py                     # BGP lab generator (7 fault types)
    │   └── eigrp.py                   # EIGRP lab generator (7 fault types)
    ├── cml_client.py                  # CML connection helper
    ├── seed_quiz_data.py              # Seed 72 CCIE EI quiz cards
    ├── requirements.txt
    ├── railway.toml                   # Railway build/deploy config
    └── nixpacks.toml                  # Nixpacks start command
```

---

## Infrastructure

### Home Lab
- **Proxmox**: 192.168.137.5
- **CML**: 192.168.137.10 (VM on Proxmox)
- **CML login**: cisco / 275GlasSharp!%

### Cloudflare Tunnel
Config: `C:\Users\natha\.cloudflared\config.yml`
Tunnel ID: `995081b0-073f-4b81-8b21-163f4b54d5b1`

Run manually:
```powershell
& "C:\Users\natha\AppData\Local\Programs\cloudflared.exe" tunnel run
```

Install as Windows service (run PowerShell as Administrator):
```powershell
& "C:\Users\natha\AppData\Local\Programs\cloudflared.exe" service install
```

### DNS Records (nathanfagan.net)
| Name | Type | Target | Proxied |
|---|---|---|---|
| `@` | — | Cloudflare Pages | Yes |
| `api` | CNAME | apgd7q6r.up.railway.app | **No** |
| `cml` | — | Cloudflare Tunnel | Yes |
| `_railway-verify.api` | TXT | railway-verify=a223033e... | — |

> `api` must stay **unproxied** (grey cloud) — Railway handles its own TLS.

### Railway IDs
| | ID |
|---|---|
| Project | `53cdc11f-31e7-4d6f-af11-8cf9f189777b` |
| Service | `1e41b715-d22f-41c7-b4ab-3cc9060db317` |
| Environment | `58bb9f74-b84b-45b4-ad1f-b9bbdb861744` |
| Custom Domain | `595ced5c-ad71-4147-9894-0812c605f179` |

---

## Environment Variables

### Backend — `backend/.env`
```
DATABASE_URL=postgresql+asyncpg://ccie_user:ccie_secure_2026@metro.proxy.rlwy.net:35969/ccie_study
ANTHROPIC_API_KEY=sk-ant-api03-...
CML_HOST=https://cml.nathanfagan.net
CML_USER=cisco
CML_PASS=275GlasSharp!%
CORS_ORIGINS=https://nathanfagan.net,https://www.nathanfagan.net,http://localhost:5173
```

### Frontend — Cloudflare Pages environment variable
```
VITE_API_URL=https://api.nathanfagan.net
```

---

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# API docs: http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

Create `frontend/.env.local`:
```
VITE_API_URL=http://localhost:8000
```

### Seed database
```bash
cd backend
python seed_quiz_data.py
```

---

## Deployment

Repository: `github.com/nathaneycd4/ccie-study-app`

### Frontend (Cloudflare Pages)
Auto-deploys on every push to `main`. No action needed.

### Backend (Railway)
Auto-deploys via GitHub Actions (`.github/workflows/deploy-backend.yml`).
Triggers on any push that touches `backend/**`, calls Railway API with `latestCommit: true`.

GitHub secret required: `RAILWAY_TOKEN` (already set).

### Manual backend redeploy
```bash
curl -X POST https://backboard.railway.app/graphql/v2 \
  -H "Authorization: Bearer <railway-token>" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { serviceInstanceDeploy(serviceId: \"1e41b715-d22f-41c7-b4ab-3cc9060db317\", environmentId: \"58bb9f74-b84b-45b4-ad1f-b9bbdb861744\", latestCommit: true) }"}'
```

---

## Design

Cyberpunk aesthetic — Share Tech Mono font, neon cyan/magenta/green on near-black.

Tailwind colour tokens: `cyber.bg` `cyber.surface` `cyber.cyan` `cyber.magenta` `cyber.green`

Global utilities in `frontend/src/index.css`: `card-cyber`, `btn-cyber`, `neon-text`, scanlines overlay.
