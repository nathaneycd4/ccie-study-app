"""Quiz / flashcard routes."""
from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.db import get_db
from app.models.models import QuizCard, CardReview
from app.schemas.schemas import (
    CardWithReview, AnswerSubmit, AnswerResult, TopicStats
)
from app.services.srs import calculate_next_review, quality_label

router = APIRouter()


@router.get("/topics", response_model=List[TopicStats])
async def get_topics(db: AsyncSession = Depends(get_db)):
    """Get all topics with card counts and accuracy stats."""
    today = date.today()

    # Get distinct topics
    topics_result = await db.execute(select(QuizCard.topic).distinct())
    topics = [row[0] for row in topics_result.all()]

    stats = []
    for topic in topics:
        # Total cards
        count_result = await db.execute(
            select(func.count(QuizCard.id)).where(QuizCard.topic == topic)
        )
        total = count_result.scalar() or 0

        # Cards due today (join with review)
        due_result = await db.execute(
            select(func.count(CardReview.id))
            .join(QuizCard, CardReview.card_id == QuizCard.id)
            .where(and_(QuizCard.topic == topic, CardReview.next_review <= today))
        )
        due = due_result.scalar() or 0

        # Average ease factor
        ease_result = await db.execute(
            select(func.avg(CardReview.ease_factor))
            .join(QuizCard, CardReview.card_id == QuizCard.id)
            .where(QuizCard.topic == topic)
        )
        avg_ease = float(ease_result.scalar() or 2.5)

        # Average interval
        interval_result = await db.execute(
            select(func.avg(CardReview.interval_days))
            .join(QuizCard, CardReview.card_id == QuizCard.id)
            .where(QuizCard.topic == topic)
        )
        avg_interval = float(interval_result.scalar() or 1.0)

        stats.append(TopicStats(
            topic=topic,
            total_cards=total,
            due_today=due,
            avg_ease=round(avg_ease, 2),
            avg_interval=round(avg_interval, 1),
        ))

    return stats


@router.get("/deck/{topic}", response_model=List[CardWithReview])
async def get_deck(topic: str, db: AsyncSession = Depends(get_db)):
    """Get cards due today for a topic (max 20)."""
    today = date.today()

    # Cards with existing reviews due today
    result = await db.execute(
        select(QuizCard, CardReview)
        .join(CardReview, CardReview.card_id == QuizCard.id)
        .where(and_(QuizCard.topic == topic, CardReview.next_review <= today))
        .limit(20)
    )
    rows = result.all()

    # Also grab cards with no review yet (new cards)
    reviewed_ids = [card.id for card, _ in rows]
    new_result = await db.execute(
        select(QuizCard)
        .where(
            and_(
                QuizCard.topic == topic,
                ~QuizCard.id.in_(reviewed_ids) if reviewed_ids else QuizCard.id.isnot(None)
            )
        )
        .limit(max(0, 20 - len(rows)))
    )
    new_cards = new_result.scalars().all()

    cards_out = []

    for card, review in rows:
        cards_out.append(CardWithReview(
            id=card.id,
            topic=card.topic,
            question=card.question,
            answer=card.answer,
            tags=card.tags,
            ease_factor=review.ease_factor,
            interval_days=review.interval_days,
            repetitions=review.repetitions,
            next_review=review.next_review,
            last_result=review.last_result,
        ))

    for card in new_cards:
        cards_out.append(CardWithReview(
            id=card.id,
            topic=card.topic,
            question=card.question,
            answer=card.answer,
            tags=card.tags,
            ease_factor=2.5,
            interval_days=1,
            repetitions=0,
            next_review=today,
            last_result=None,
        ))

    return cards_out


@router.post("/answer", response_model=AnswerResult)
async def submit_answer(data: AnswerSubmit, db: AsyncSession = Depends(get_db)):
    """Submit an answer and update SRS data."""
    if data.quality not in (1, 3, 5):
        raise HTTPException(status_code=422, detail="quality must be 1, 3, or 5")

    # Get or create CardReview
    result = await db.execute(
        select(CardReview).where(CardReview.card_id == data.card_id)
    )
    review = result.scalar_one_or_none()

    if review is None:
        # Verify card exists
        card_result = await db.execute(select(QuizCard).where(QuizCard.id == data.card_id))
        card = card_result.scalar_one_or_none()
        if not card:
            raise HTTPException(status_code=404, detail="Card not found")

        review = CardReview(card_id=data.card_id)
        db.add(review)

    new_ef, new_interval, new_reps, next_review = calculate_next_review(
        ease_factor=review.ease_factor,
        interval=review.interval_days,
        repetitions=review.repetitions,
        quality=data.quality,
    )

    review.ease_factor = new_ef
    review.interval_days = new_interval
    review.repetitions = new_reps
    review.next_review = next_review
    review.last_result = quality_label(data.quality)

    await db.commit()

    return AnswerResult(
        card_id=data.card_id,
        new_interval=new_interval,
        new_ease_factor=round(new_ef, 2),
        next_review=next_review,
        result=quality_label(data.quality),
    )


@router.get("/stats", response_model=List[TopicStats])
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Alias for /topics with stats."""
    return await get_topics(db=db)
