import json
from typing import Annotated, Any

from fastapi import Response
from pydantic import BaseModel

from schemas.pagination_schema import PaginationParamsSchema


def paginate(
    query, pagination_params: PaginationParamsSchema, response: Response
) -> dict[str, Any]:
    offset = (pagination_params.page - 1) * pagination_params.page_size
    paginated_query = query.offset(offset).limit(pagination_params.page_size)
    items = paginated_query.all()

    # Get the total count of items that match the query criteria
    total_items = query.offset(None).limit(None).count()

    # Compute pagination parameters
    total_pages = (
        total_items + pagination_params.page_size - 1
    ) // pagination_params.page_size
    has_next = pagination_params.page < total_pages
    has_prev = pagination_params.page > 1
    next_page = pagination_params.page + 1 if has_next else None
    prev_page = pagination_params.page - 1 if has_prev else None

    pagination = {
        "page": pagination_params.page,
        "page_size": pagination_params.page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "has_next": has_next,
        "has_prev": has_prev,
        "next_page": next_page,
        "prev_page": prev_page,
    }

    # Add pagination data to the headers
    response.headers["X-Pagination"] = json.dumps(pagination)

    return items
