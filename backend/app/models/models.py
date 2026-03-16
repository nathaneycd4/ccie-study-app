"""SQLAlchemy ORM models."""
from datetime import date, datetime
from typing import Optional, List
from sqlalchemy import Integer, String, Float, Text, Date, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db import Base


class StudySession(Base):
    __tablename__ = "study_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    module: Mapped[str] = mapped_column(String(100), nullable=False)
    duration_min: Mapped[int] = mapped_column(Integer, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class QuizCard(Base):
    __tablename__ = "quiz_cards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    topic: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    tags: Mapped[Optional[List]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    reviews: Mapped[List["CardReview"]] = relationship("CardReview", back_populates="card", cascade="all, delete-orphan")


class CardReview(Base):
    __tablename__ = "card_reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    card_id: Mapped[int] = mapped_column(Integer, ForeignKey("quiz_cards.id"), nullable=False, index=True)
    ease_factor: Mapped[float] = mapped_column(Float, default=2.5, nullable=False)
    interval_days: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    repetitions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    next_review: Mapped[date] = mapped_column(Date, default=date.today, nullable=False)
    last_result: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    card: Mapped["QuizCard"] = relationship("QuizCard", back_populates="reviews")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Lab(Base):
    __tablename__ = "labs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    cml_lab_id: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    topic: Mapped[str] = mapped_column(String(100), nullable=False)
    fault_count: Mapped[int] = mapped_column(Integer, nullable=False)
    seed: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="booting", nullable=False)
    fault_descriptions: Mapped[Optional[List]] = mapped_column(JSON, nullable=True)
    cml_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class BlogPost(Base):
    __tablename__ = "blog_posts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    excerpt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tags: Mapped[Optional[List]] = mapped_column(JSON, nullable=True)
    author: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
