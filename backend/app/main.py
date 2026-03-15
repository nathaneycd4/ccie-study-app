"""FastAPI application entry point."""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.db import create_tables
from app.api.routes import progress, quiz, chat, labs


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

# CORS — allow frontend origin
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(progress.router, prefix="/progress", tags=["progress"])
app.include_router(quiz.router, prefix="/quiz", tags=["quiz"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(labs.router, prefix="/labs", tags=["labs"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ccie-study-app"}
