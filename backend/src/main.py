from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger

from config import settings
from routers import (
    auth_router,
    user_router,
    customer_router,
    vet_router,
    dog_router,
    service_router,
    booking_router,
    invoice_router,
    expense_router,
    # income_statement_router,
)

logger.debug("Creating application ...")
app = FastAPI(
    docs_url="/docs",
    redoc_url=None,
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    summary=settings.PROJECT_SUMMARY,
    version=settings.PROJECT_VERSION,
    # terms_of_service=settings.PROJECT_TERMS_OF_SERVICE,
    # contact={
    #     "name": settings.PROJECT_CONTACT_NAME
    #     "url": settings.PROJECT_CONTACT_URL,
    #     "email": settings.PROJECT_CONTACT_EMAIL,
    # },
    license_info={
        "name": settings.PROJECT_LICENSE,
        "url": settings.PROJECT_LICENSE_URL,
    },
)


logger.debug("Mounting static directory ...")
app.mount("/static", StaticFiles(directory="src/static"), name="static")

logger.debug("Adding CORS middleware ...")
allow_origins = settings.ALLOW_ORIGINS.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Pagination"],
    expose_headers=["Content-Disposition", "X-Pagination"],
)


logger.debug("Including routes ...")
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(customer_router)
app.include_router(vet_router)
app.include_router(dog_router)
app.include_router(service_router)
app.include_router(booking_router)
app.include_router(invoice_router)
app.include_router(expense_router)
# app.include_router(income_statement_router)


from routers import contact_us_router, customer_sign_up_router

app.include_router(contact_us_router)
app.include_router(customer_sign_up_router)

# from routers import database_router

# app.include_router(database_router)


@app.get("/")
async def read_root():
    return {"message": "Hello World!"}


# import json

# from fastapi import Request
# from fastapi.responses import JSONResponse


# @app.middleware("http")
# async def debug_middleware(request: Request, call_next):
#     # Log the request method and URL
#     logger.debug(f"Request Method: {request.method}")
#     logger.debug(f"Request URL: {request.url}")

#     # Log the request headers
#     logger.debug("Request Headers:")
#     for key, value in request.headers.items():
#         logger.debug(f"  {key}: {value}")

#     # Log the request body
#     if request.method in ["POST", "PUT", "PATCH"]:
#         body = await request.body()
#         logger.debug(f"Request Body: {body}")
#         try:
#             data = json.loads(body)
#             logger.debug(data)
#         except json.JSONDecodeError:
#             logger.debug(body.decode("utf-8"))

#     # Continue with the next middleware/route handler
#     response = await call_next(request)

#     # Log the response status code and headers
#     logger.debug(f"Response Status Code: {response.status_code}")
#     logger.debug("Response Headers:")
#     for key, value in response.headers.items():
#         logger.debug(f"  {key}: {value}")

#     return response
