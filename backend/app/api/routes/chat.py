"""Chat routes with Claude streaming."""
import json
from typing import List
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.db import get_db
from app.models.models import ChatMessage
from app.schemas.schemas import ChatMessageCreate, ChatMessageOut
from app.services.claude import stream_chat

router = APIRouter()


@router.post("/message")
async def send_message(data: ChatMessageCreate, db: AsyncSession = Depends(get_db)):
    """Send a message and stream the Claude response as SSE."""
    # Save user message
    user_msg = ChatMessage(
        session_id=data.session_id,
        role="user",
        content=data.content,
    )
    db.add(user_msg)
    await db.commit()

    # Load full history for this session
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == data.session_id)
        .order_by(ChatMessage.created_at)
    )
    history = result.scalars().all()

    messages = [{"role": m.role, "content": m.content} for m in history]

    async def event_generator():
        full_response = []
        try:
            async for chunk in stream_chat(messages=messages, session_id=data.session_id):
                full_response.append(chunk)
                payload = json.dumps({"delta": chunk})
                yield f"data: {payload}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            return

        # Save assistant response
        assistant_content = "".join(full_response)
        async with db.begin():
            assistant_msg = ChatMessage(
                session_id=data.session_id,
                role="assistant",
                content=assistant_content,
            )
            db.add(assistant_msg)

        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/history/{session_id}", response_model=List[ChatMessageOut])
async def get_history(session_id: str, db: AsyncSession = Depends(get_db)):
    """Get message history for a session."""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    messages = result.scalars().all()
    return [ChatMessageOut.model_validate(m) for m in messages]


@router.delete("/history/{session_id}")
async def clear_history(session_id: str, db: AsyncSession = Depends(get_db)):
    """Clear all messages for a session."""
    await db.execute(
        delete(ChatMessage).where(ChatMessage.session_id == session_id)
    )
    await db.commit()
    return {"cleared": True, "session_id": session_id}
