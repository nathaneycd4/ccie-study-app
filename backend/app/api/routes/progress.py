"""Progress and study session routes."""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.db import get_db
from app.models.models import StudySession
from app.schemas.schemas import StudySessionCreate, StudySessionOut, ProgressResponse
from app.services.schedule import get_progress

router = APIRouter()


@router.get("/", response_model=ProgressResponse)
async def read_progress(db: AsyncSession = Depends(get_db)):
    """Get current module progress and recent sessions."""
    result = await db.execute(
        select(StudySession).order_by(desc(StudySession.created_at)).limit(10)
    )
    sessions = result.scalars().all()
    recent = [StudySessionOut.model_validate(s) for s in sessions]
    return get_progress(recent_sessions=recent)


@router.post("/session", response_model=StudySessionOut)
async def log_session(data: StudySessionCreate, db: AsyncSession = Depends(get_db)):
    """Log a study session."""
    session = StudySession(
        module=data.module,
        duration_min=data.duration_min,
        notes=data.notes,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return StudySessionOut.model_validate(session)


@router.get("/sessions", response_model=List[StudySessionOut])
async def list_sessions(limit: int = 20, db: AsyncSession = Depends(get_db)):
    """List recent study sessions."""
    result = await db.execute(
        select(StudySession).order_by(desc(StudySession.created_at)).limit(limit)
    )
    sessions = result.scalars().all()
    return [StudySessionOut.model_validate(s) for s in sessions]
