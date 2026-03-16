"""Pydantic schemas for API request/response bodies."""
from datetime import date, datetime
from typing import Optional, List, Any
from pydantic import BaseModel


# ── Study Sessions ──────────────────────────────────────────────────────────

class StudySessionCreate(BaseModel):
    module: str
    duration_min: int
    notes: Optional[str] = None


class StudySessionOut(BaseModel):
    id: int
    module: str
    duration_min: int
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Schedule / Progress ─────────────────────────────────────────────────────

class ModuleInfo(BaseModel):
    name: str
    start_date: str
    end_date: str
    week_number: int
    day_number: int
    total_days: int
    days_remaining: int
    is_current: bool


class ProgressResponse(BaseModel):
    current_module: Optional[ModuleInfo]
    programme_start: str
    programme_end: str
    programme_days_total: int
    programme_days_elapsed: int
    programme_percent: float
    recent_sessions: List[StudySessionOut]
    all_modules: List[ModuleInfo]


# ── Quiz Cards ───────────────────────────────────────────────────────────────

class QuizCardCreate(BaseModel):
    topic: str
    question: str
    answer: str
    tags: Optional[List[str]] = None


class QuizCardOut(BaseModel):
    id: int
    topic: str
    question: str
    answer: str
    tags: Optional[List[str]]
    created_at: datetime

    model_config = {"from_attributes": True}


class CardReviewOut(BaseModel):
    id: int
    card_id: int
    ease_factor: float
    interval_days: int
    repetitions: int
    next_review: date
    last_result: Optional[str]
    updated_at: datetime

    model_config = {"from_attributes": True}


class CardWithReview(BaseModel):
    id: int
    topic: str
    question: str
    answer: str
    tags: Optional[List[str]]
    ease_factor: float
    interval_days: int
    repetitions: int
    next_review: date
    last_result: Optional[str]

    model_config = {"from_attributes": True}


class AnswerSubmit(BaseModel):
    card_id: int
    quality: int  # 5=correct, 3=almost, 1=missed


class AnswerResult(BaseModel):
    card_id: int
    new_interval: int
    new_ease_factor: float
    next_review: date
    result: str


class TopicStats(BaseModel):
    topic: str
    total_cards: int
    due_today: int
    avg_ease: float
    avg_interval: float


# ── Chat ────────────────────────────────────────────────────────────────────

class ChatMessageCreate(BaseModel):
    session_id: str
    content: str


class ChatMessageOut(BaseModel):
    id: int
    session_id: str
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Labs ─────────────────────────────────────────────────────────────────────

class LabCreate(BaseModel):
    topic: str = "ospf"
    fault_count: int = 2
    seed: Optional[int] = None


class LabOut(BaseModel):
    id: int
    cml_lab_id: Optional[str]
    topic: str
    fault_count: int
    seed: Optional[int]
    status: str
    fault_descriptions: Optional[List[str]]
    cml_url: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class LabAnswerKey(BaseModel):
    lab_id: int
    topic: str
    fault_descriptions: List[str]


# ── Blog ─────────────────────────────────────────────────────────────────────
class BlogPostCreate(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    tags: Optional[List[str]] = None
    author: Optional[str] = None

class BlogPostOut(BaseModel):
    id: int
    title: str
    content: str
    excerpt: Optional[str]
    tags: Optional[List[str]]
    author: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}
