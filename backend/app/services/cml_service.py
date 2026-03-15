"""CML lab creation service."""
import asyncio
import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db import AsyncSessionLocal
from app.models.models import Lab

logger = logging.getLogger(__name__)


async def create_lab_background(
    lab_db_id: int,
    topic: str,
    fault_count: int,
    seed: Optional[int],
) -> None:
    """
    Background task: build the lab in CML and update the DB record.
    Runs in a thread pool because virl2_client is synchronous.
    """
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        _create_lab_sync,
        lab_db_id,
        topic,
        fault_count,
        seed,
    )


def _create_lab_sync(
    lab_db_id: int,
    topic: str,
    fault_count: int,
    seed: Optional[int],
) -> None:
    """Synchronous lab creation — runs in a thread."""
    import asyncio

    async def _update_db(cml_lab_id: Optional[str], status: str, faults: Optional[list], cml_url: Optional[str]):
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(Lab).where(Lab.id == lab_db_id))
            lab = result.scalar_one_or_none()
            if lab:
                if cml_lab_id:
                    lab.cml_lab_id = cml_lab_id
                lab.status = status
                if faults is not None:
                    lab.fault_descriptions = faults
                if cml_url:
                    lab.cml_url = cml_url
                await session.commit()

    try:
        if topic.lower() == "ospf":
            from labs.ospf import build_ospf_lab
            cml_lab_id, injected_faults, cml_url = build_ospf_lab(
                fault_count=fault_count, seed=seed
            )
        else:
            logger.warning(f"Unknown topic: {topic}, falling back to OSPF")
            from labs.ospf import build_ospf_lab
            cml_lab_id, injected_faults, cml_url = build_ospf_lab(
                fault_count=fault_count, seed=seed
            )

        # Update DB with success
        asyncio.run(_update_db(cml_lab_id, "ready", injected_faults, cml_url))

    except Exception as e:
        logger.error(f"Lab creation failed for lab_db_id={lab_db_id}: {e}", exc_info=True)
        asyncio.run(_update_db(None, "error", None, None))
