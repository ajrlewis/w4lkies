from typing import Union

from pydantic import BaseModel, create_model
from schemas.customer_schema import CustomerBaseSchema
from schemas.dog_schema import DogBaseSchema


fields = {
    field: DogBaseSchema.__annotations__[field]
    for field in DogBaseSchema.__annotations__
    if field not in {"customer_id", "vet_id", "customer", "vet"}
}
fields["vet_name"] = str
fields["vet_address"] = str

DogSignUpSchema = create_model("DogSignUpSchema", **fields)


class CustomerSignUpSchema(BaseModel):
    customer: CustomerBaseSchema
    dogs: list[DogSignUpSchema]
    declaration: bool
