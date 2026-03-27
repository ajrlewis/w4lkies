from pydantic import BaseModel


class PaginationParamsSchema(BaseModel):
    page: int = 1
    page_size: int = 100
