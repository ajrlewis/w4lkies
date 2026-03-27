from typing import Annotated, Union

from fastapi import APIRouter, BackgroundTasks, Form, HTTPException, status, Request
from loguru import logger

from config import settings
from dependencies import GetDBDep, GetCurrentUserDep
from emails import send_email
from schemas.contact_us_schema import ContactUsSchema
from templates import render_template


contact_us_router = APIRouter(prefix="/contact_us", tags=["Contact Us"])


@contact_us_router.post("/")
async def submit_contact_form(
    background_tasks: BackgroundTasks,
    request: Request,
    contact_us_message: ContactUsSchema,
):
    try:
        name = contact_us_message.name
        email = contact_us_message.email
        message = contact_us_message.message

        content = render_template(
            "emails/contact_us.html",
            {"name": name, "email": email, "message": message, "request": request},
        )

        if settings.MAIL_SERVER and settings.MAIL_USERNAME and settings.MAIL_PASSWORD:
            background_tasks.add_task(
                send_email,
                to=[contact_us_message.email],
                bcc=[settings.MAIL_USERNAME],
                subject="🐶📩 W4lkies Contact Us 📩🐶",
                content=content,
            )
        else:
            logger.debug("Skipping contact email; mail settings are incomplete")

        return {"message": "Contact us notification sent in the background"}

    except Exception as e:
        logger.error(f"Error processing contact form: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error",
        )
