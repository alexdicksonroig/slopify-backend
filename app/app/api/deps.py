from typing import AsyncGenerator, Annotated

from fastapi import Depends, HTTPException, status, Request
from loguru import logger
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.session import SessionLocal

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Get an asynchronous database session.

    Yields:
        AsyncSession: An asynchronous database session.
    """
    db = None
    try:
        db = SessionLocal()
        yield db
        await db.commit()
    except Exception as exc:
        if db is not None:
            logger.error(f'Exception: {exc}, rolling back.')
            await db.rollback()
    finally:
        if db is not None:
            await db.close()


AsyncSessionDependency = Annotated[AsyncSession, Depends(get_db)]
