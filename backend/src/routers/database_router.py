from fastapi import APIRouter, HTTPException, status
from loguru import logger

from dependencies import GetDBDep
from exceptions import DatabaseError, NotFoundError
from services import database_service

database_router = APIRouter(prefix="/database", tags=["Database"])


@database_router.get("/ping")
async def ping(db: GetDBDep) -> dict:
    """Ping (wake up) the database."""
    try:
        database_service.ping(db)
        return {"message": "pong"}
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
