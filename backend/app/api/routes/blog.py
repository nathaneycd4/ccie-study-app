"""Blog routes."""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db import get_db
from app.models.models import BlogPost
from app.schemas.schemas import BlogPostCreate, BlogPostOut

router = APIRouter()

@router.get("/", response_model=List[BlogPostOut])
async def list_posts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BlogPost).order_by(desc(BlogPost.created_at)))
    return [BlogPostOut.model_validate(p) for p in result.scalars().all()]

@router.post("/", response_model=BlogPostOut)
async def create_post(data: BlogPostCreate, db: AsyncSession = Depends(get_db)):
    post = BlogPost(**data.model_dump())
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return BlogPostOut.model_validate(post)

@router.get("/{post_id}", response_model=BlogPostOut)
async def get_post(post_id: int, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return BlogPostOut.model_validate(post)

@router.delete("/{post_id}")
async def delete_post(post_id: int, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    await db.delete(post)
    await db.commit()
    return {"deleted": True}
