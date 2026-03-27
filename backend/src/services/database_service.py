import time

from loguru import logger
from sqlalchemy.sql import text

from dependencies import GetDBDep


def ping(
    db: GetDBDep, max_attempts: int = 5, initial_delay: int = 1, max_delay: int = 30
) -> bool:
    delay = initial_delay
    for attempt in range(max_attempts):
        try:
            logger.debug(
                f"Trying attempt {attempt + 1} of {max_attempts} with {delay = }"
            )
            db.execute(text("SELECT 1"))
            return True
        except Exception as e:
            if attempt < max_attempts - 1:
                time.sleep(delay)
                delay = min(delay * 2, max_delay)  # exponential backoff
            else:
                raise Exception(
                    f"Failed to wake up database after {max_attempts} attempts: {str(e)}"
                )
