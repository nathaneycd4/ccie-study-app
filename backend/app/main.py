"""FastAPI application entry point."""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.db import create_tables
from app.api.routes import progress, quiz, chat, labs, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create DB tables on startup."""
    await create_tables()
    yield


app = FastAPI(
    title="CCIE Study App API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — parse comma-separated CORS_ORIGINS env var
_raw = os.environ.get("CORS_ORIGINS", "http://localhost:5173")
CORS_ORIGINS = [o.strip() for o in _raw.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(progress.router, prefix="/progress", tags=["progress"])
app.include_router(quiz.router, prefix="/quiz", tags=["quiz"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(labs.router, prefix="/labs", tags=["labs"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ccie-study-app"}
