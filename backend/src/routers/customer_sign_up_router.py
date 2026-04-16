from fastapi import APIRouter, BackgroundTasks, Form, HTTPException, Request, status
from loguru import logger

from config import settings
from dependencies import GetDBDep, GetCurrentUserDep
from emails import send_email
from schemas.customer_sign_up_schema import CustomerSignUpSchema
from templates import render_template


customer_sign_up_router = APIRouter(prefix="/sign_up", tags=["Customer Sign Up"])


@customer_sign_up_router.post("/")
async def submit_customer_sign_up(
    background_tasks: BackgroundTasks,
    request: Request,
    data: CustomerSignUpSchema,
):
    try:
        customer = data.customer
        dogs = data.dogs

        logger.debug(f"{customer = }")
        logger.debug(f"{dogs = }")

        customer_content = render_template(
            "emails/customer_sign_up.html",
            {"customer": customer, "dogs": dogs, "request": request},
        )
        admin_content = render_template(
            "emails/admin_customer_sign_up.html",
            {"customer": customer, "dogs": dogs, "request": request},
        )

        if settings.MAIL_SERVER and settings.MAIL_USERNAME and settings.MAIL_PASSWORD:
            background_tasks.add_task(
                send_email,
                to=[customer.email],
                subject="W4lkies sign-up confirmation",
                content=customer_content,
            )
            background_tasks.add_task(
                send_email,
                to=[settings.MAIL_USERNAME],
                subject=f"New W4lkies sign-up: {customer.name}",
                content=admin_content,
            )
        else:
            logger.debug("Skipping customer sign-up email; mail settings are incomplete")

        return {"message": "Customer sign-up notification sent in the background"}

    except Exception as e:
        logger.error(f"Error processing customer signup form: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error",
        )
