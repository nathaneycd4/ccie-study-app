"""CML lab creation service."""
import asyncio
import logging
import os
from typing import Optional
from sqlalchemy import select

logger = logging.getLogger(__name__)


async def _update_lab_status(
    lab_db_id: int,
    status: str,
    cml_lab_id: Optional[str] = None,
    faults: Optional[list] = None,
    cml_url: Optional[str] = None,
) -> None:
    """Update lab status using a fresh NullPool connection (safe to call from any event loop)."""
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
    from sqlalchemy.pool import NullPool
    from app.models.models import Lab

    db_url = os.environ.get(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres@localhost:5432/ccie_study",
    )
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif db_url.startswith("postgresql://") and "+asyncpg" not in db_url:
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    engine = create_async_engine(db_url, poolclass=NullPool)
    try:
        Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        async with Session() as session:
            result = await session.execute(select(Lab).where(Lab.id == lab_db_id))
            lab = result.scalar_one_or_none()
            if lab:
                lab.status = status
                if cml_lab_id:
                    lab.cml_lab_id = cml_lab_id
                if faults is not None:
                    lab.fault_descriptions = faults
                if cml_url:
                    lab.cml_url = cml_url
                await session.commit()
    finally:
        await engine.dispose()


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
    print(f"[LAB] Starting lab creation: id={lab_db_id} topic={topic}", flush=True)
    loop = asyncio.get_running_loop()
    try:
        print(f"[LAB] Connecting to CML...", flush=True)
        cml_lab_id, injected_faults, cml_url = await loop.run_in_executor(
            None,
            _build_lab_sync,
            topic,
            fault_count,
            seed,
        )
        print(f"[LAB] CML lab created: {cml_lab_id}, updating DB to ready", flush=True)
        await _update_lab_status(lab_db_id, "ready", cml_lab_id, injected_faults, cml_url)
        print(f"[LAB] Done.", flush=True)
    except Exception as e:
        print(f"[LAB] ERROR: {e}", flush=True)
        logger.error(f"Lab creation failed for lab_db_id={lab_db_id}: {e}", exc_info=True)
        try:
            await _update_lab_status(lab_db_id, "error")
        except Exception as e2:
            print(f"[LAB] ERROR updating status to error: {e2}", flush=True)


def _build_lab_sync(
    topic: str,
    fault_count: int,
    seed: Optional[int],
):
    """Synchronous CML lab build — runs in a thread. Returns (cml_lab_id, faults, cml_url)."""
    t = topic.lower()
    if t == "ospf":
        from labs.ospf import build_ospf_lab
        return build_ospf_lab(fault_count=fault_count, seed=seed)
    elif t == "bgp":
        from labs.bgp import build_bgp_lab
        return build_bgp_lab(fault_count=fault_count, seed=seed)
    elif t == "eigrp":
        from labs.eigrp import build_eigrp_lab
        return build_eigrp_lab(fault_count=fault_count, seed=seed)
    else:
        logger.warning(f"Unknown topic: {topic}, falling back to OSPF")
        from labs.ospf import build_ospf_lab
        return build_ospf_lab(fault_count=fault_count, seed=seed)
