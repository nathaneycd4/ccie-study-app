"""Auth logging — records who logs in to Railway logs."""
import logging
from datetime import datetime, timezone
from fastapi import APIRouter
from pydantic import BaseModel, EmailStr

logger = logging.getLogger("auth")
router = APIRouter()


class LoginLog(BaseModel):
    email: str


@router.post("/login")
async def log_login(data: LoginLog):
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    logger.info(f"LOGIN [{ts}] {data.email}")
    print(f"LOGIN [{ts}] {data.email}", flush=True)
    return {"ok": True}
