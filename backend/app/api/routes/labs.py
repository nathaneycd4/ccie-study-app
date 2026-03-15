"""Lab management routes."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.db import get_db
from app.models.models import Lab
from app.schemas.schemas import LabCreate, LabOut, LabAnswerKey
from app.services.cml_service import create_lab_background

router = APIRouter()


@router.post("/create", response_model=LabOut)
async def create_lab(
    data: LabCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Create a new lab (kicks off background CML provisioning)."""
    lab = Lab(
        topic=data.topic,
        fault_count=data.fault_count,
        seed=data.seed,
        status="booting",
    )
    db.add(lab)
    await db.commit()
    await db.refresh(lab)

    background_tasks.add_task(
        create_lab_background,
        lab_db_id=lab.id,
        topic=data.topic,
        fault_count=data.fault_count,
        seed=data.seed,
    )

    return LabOut.model_validate(lab)


@router.get("/", response_model=List[LabOut])
async def list_labs(db: AsyncSession = Depends(get_db)):
    """List all labs ordered by creation time."""
    result = await db.execute(
        select(Lab).order_by(desc(Lab.created_at)).limit(50)
    )
    labs = result.scalars().all()
    return [LabOut.model_validate(lab) for lab in labs]


@router.get("/{lab_id}", response_model=LabOut)
async def get_lab(lab_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single lab by ID."""
    result = await db.execute(select(Lab).where(Lab.id == lab_id))
    lab = result.scalar_one_or_none()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    return LabOut.model_validate(lab)


@router.get("/{lab_id}/answer-key", response_model=LabAnswerKey)
async def get_answer_key(lab_id: int, db: AsyncSession = Depends(get_db)):
    """Get the fault answer key for a lab."""
    result = await db.execute(select(Lab).where(Lab.id == lab_id))
    lab = result.scalar_one_or_none()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    if not lab.fault_descriptions:
        raise HTTPException(status_code=404, detail="Answer key not available yet (lab may still be booting)")

    return LabAnswerKey(
        lab_id=lab.id,
        topic=lab.topic,
        fault_descriptions=lab.fault_descriptions,
    )


@router.delete("/{lab_id}")
async def delete_lab(lab_id: int, db: AsyncSession = Depends(get_db)):
    """Stop and delete a lab (also stops in CML if possible)."""
    result = await db.execute(select(Lab).where(Lab.id == lab_id))
    lab = result.scalar_one_or_none()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")

    # Attempt to stop in CML
    if lab.cml_lab_id:
        try:
            from cml_client import get_client
            client = get_client()
            cml_lab = client.find_labs_by_title(lab.cml_lab_id)
            if cml_lab:
                cml_lab[0].stop()
                cml_lab[0].wipe()
        except Exception:
            pass  # Don't fail if CML is unreachable

    await db.delete(lab)
    await db.commit()
    return {"deleted": True, "lab_id": lab_id}
