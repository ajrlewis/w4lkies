from datetime import datetime, timedelta, timezone
from typing import Annotated, Union

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, status
import jwt
from jwt.exceptions import InvalidTokenError
from loguru import logger

from config import settings
from dependencies import GetDBDep, OAuth2FormDataDep
from emails import send_email
from services import auth_service
from schemas.token_schema import Token
from templates import render_template

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])


@auth_router.post("/token")
async def login_for_access_token(
    background_tasks: BackgroundTasks,
    request: Request,
    db: GetDBDep,
    form_data: OAuth2FormDataDep,
) -> Token:
    user = auth_service.authenticate_user(db, form_data.username, form_data.password)
    logger.debug(f"{user = }")
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": user.name},
        expires_delta=access_token_expires,
    )

    try:
        if user.name not in [
            "Active User",
            "Active Admin",
            "Inactive User",
            "Inactive Admin",
        ]:
            content = render_template(
                "emails/user_sign_in.html", {"user": user, "request": request}
            )
            if settings.MAIL_SERVER and settings.MAIL_USERNAME and settings.MAIL_PASSWORD:
                background_tasks.add_task(
                    send_email,
                    to=[user.email],
                    subject="⚠️❗ W4lkies Sign In ❗⚠️",
                    content=content,
                )
                logger.debug("User sign-in notification sent in the background")
            else:
                logger.debug("Skipping sign-in notification; mail settings are incomplete")
    except Exception as e:
        logger.error(f"Error processing contact form: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error",
        )
    scopes = ["admin"] if user.is_admin else ["user"]
    return Token(access_token=access_token, scopes=scopes, token_type="bearer")
