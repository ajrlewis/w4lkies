from datetime import datetime, timedelta, timezone

import pytest
import httpx

pytestmark = pytest.mark.anyio


def _iso_now(days_offset: int = 0) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=days_offset)).isoformat()


async def _create_customer(
    async_client: httpx.AsyncClient, admin_headers: dict[str, str]
) -> dict:
    response = await async_client.post(
        "/customers/",
        headers=admin_headers,
        json={
            "name": "Route Test Customer",
            "phone": "+44 7000 111111",
            "email": f"route.customer.{datetime.now().timestamp()}@example.com",
            "emergency_contact_name": "Route Emergency",
            "emergency_contact_phone": "+44 7000 111112",
            "signed_up_on": _iso_now(),
            "is_active": True,
        },
    )
    assert response.status_code == 200, response.text
    return response.json()


async def _create_vet(
    async_client: httpx.AsyncClient, admin_headers: dict[str, str]
) -> dict:
    response = await async_client.post(
        "/vets/",
        headers=admin_headers,
        json={
            "name": "Route Test Vet",
            "address": "123 Route Street",
            "phone": "+44 161 555 9999",
        },
    )
    assert response.status_code == 200, response.text
    return response.json()


async def _create_service(
    async_client: httpx.AsyncClient, admin_headers: dict[str, str]
) -> dict:
    response = await async_client.post(
        "/services/",
        headers=admin_headers,
        json={
            "name": "Route Test Service",
            "price": 19.99,
            "description": "Route testing service",
            "duration": 30,
            "is_publicly_offered": True,
            "is_active": True,
        },
    )
    assert response.status_code == 200, response.text
    return response.json()


async def test_customers_crud_and_auth(
    async_client: httpx.AsyncClient, admin_headers: dict[str, str]
):
    unauthorized = await async_client.get("/customers/")
    assert unauthorized.status_code == 401

    created = await _create_customer(async_client, admin_headers)
    customer_id = created["customer_id"]

    list_response = await async_client.get("/customers/", headers=admin_headers)
    assert list_response.status_code == 200
    assert any(item["customer_id"] == customer_id for item in list_response.json())

    detail_response = await async_client.get(
        f"/customers/{customer_id}", headers=admin_headers
    )
    assert detail_response.status_code == 200
    assert detail_response.json()["customer_id"] == customer_id

    update_response = await async_client.put(
        f"/customers/{customer_id}",
        headers=admin_headers,
        json={"name": "Updated Route Customer"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["name"] == "Updated Route Customer"

    delete_response = await async_client.delete(
        f"/customers/{customer_id}", headers=admin_headers
    )
    assert delete_response.status_code == 200

    not_found_response = await async_client.get(
        f"/customers/{customer_id}", headers=admin_headers
    )
    assert not_found_response.status_code == 404


async def test_vets_crud(
    async_client: httpx.AsyncClient, admin_headers: dict[str, str]
):
    created = await _create_vet(async_client, admin_headers)
    vet_id = created["vet_id"]

    update_response = await async_client.put(
        f"/vets/{vet_id}",
        headers=admin_headers,
        json={"name": "Updated Route Vet"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["name"] == "Updated Route Vet"

    delete_response = await async_client.delete(f"/vets/{vet_id}", headers=admin_headers)
    assert delete_response.status_code == 200


async def test_services_crud(
    async_client: httpx.AsyncClient, admin_headers: dict[str, str]
):
    created = await _create_service(async_client, admin_headers)
    service_id = created["service_id"]

    update_response = await async_client.put(
        f"/services/{service_id}",
        headers=admin_headers,
        json={"name": "Updated Route Service", "price": 25.5},
    )
    assert update_response.status_code == 200
    assert update_response.json()["name"] == "Updated Route Service"
    assert update_response.json()["price"] == 25.5

    delete_response = await async_client.delete(
        f"/services/{service_id}",
        headers=admin_headers,
    )
    assert delete_response.status_code == 200


async def test_dogs_crud(
    async_client: httpx.AsyncClient, admin_headers: dict[str, str]
):
    customer = await _create_customer(async_client, admin_headers)
    vet = await _create_vet(async_client, admin_headers)

    create_response = await async_client.post(
        "/dogs/",
        headers=admin_headers,
        json={
            "name": "Route Test Dog",
            "date_of_birth": _iso_now(days_offset=-365),
            "breed": "Whippet",
            "is_allowed_treats": True,
            "is_allowed_off_the_lead": False,
            "is_allowed_on_social_media": True,
            "is_neutered_or_spayed": True,
            "behavioral_issues": "None",
            "medical_needs": "None",
            "customer_id": customer["customer_id"],
            "vet_id": vet["vet_id"],
        },
    )
    assert create_response.status_code == 200, create_response.text
    dog_id = create_response.json()["dog_id"]

    update_response = await async_client.put(
        f"/dogs/{dog_id}",
        headers=admin_headers,
        json={
            "name": "Updated Route Dog",
            "date_of_birth": _iso_now(days_offset=-300),
            "breed": "Greyhound",
            "is_allowed_treats": True,
            "is_allowed_off_the_lead": True,
            "is_allowed_on_social_media": True,
            "is_neutered_or_spayed": True,
            "behavioral_issues": "",
            "medical_needs": "",
            "customer_id": customer["customer_id"],
            "vet_id": vet["vet_id"],
        },
    )
    assert update_response.status_code == 200
    assert update_response.json()["name"] == "Updated Route Dog"

    delete_response = await async_client.delete(f"/dogs/{dog_id}", headers=admin_headers)
    assert delete_response.status_code == 200

    await async_client.delete(f"/customers/{customer['customer_id']}", headers=admin_headers)
    await async_client.delete(f"/vets/{vet['vet_id']}", headers=admin_headers)


async def test_bookings_routes(
    async_client: httpx.AsyncClient,
    admin_headers: dict[str, str],
    user_headers: dict[str, str],
):
    time_choices = await async_client.get("/bookings/time_choices")
    assert time_choices.status_code == 200
    assert len(time_choices.json()) > 0

    all_bookings = await async_client.get("/bookings/", headers=user_headers)
    assert all_bookings.status_code == 200
    assert isinstance(all_bookings.json(), list)

    upcoming = await async_client.get("/bookings/upcoming", headers=user_headers)
    assert upcoming.status_code == 200

    history = await async_client.get("/bookings/history", headers=user_headers)
    assert history.status_code == 200

    create_response = await async_client.post(
        "/bookings/",
        headers=admin_headers,
        json={
            "date": _iso_now(days_offset=3),
            "time": "09:45:00",
            "customer_id": 1,
            "service_id": 1,
            "user_id": 2,
        },
    )
    assert create_response.status_code == 200, create_response.text
    booking_id = create_response.json()["booking_id"]

    detail_response = await async_client.get(f"/bookings/{booking_id}", headers=user_headers)
    assert detail_response.status_code == 200
    assert detail_response.json()["booking_id"] == booking_id

    update_response = await async_client.put(
        f"/bookings/{booking_id}",
        headers=admin_headers,
        json={"time": "10:00:00"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["time"].startswith("10:00")

    delete_response = await async_client.delete(
        f"/bookings/{booking_id}", headers=admin_headers
    )
    assert delete_response.status_code == 200


async def test_invoices_admin_routes(
    async_client: httpx.AsyncClient, admin_headers: dict[str, str]
):
    generate_response = await async_client.post(
        "/invoices/generate",
        headers=admin_headers,
        json={
            "customer_id": 1,
            "date_start": _iso_now(days_offset=-2),
            "date_end": _iso_now(days_offset=14),
        },
    )
    assert generate_response.status_code == 200, generate_response.text
    generated_invoice = generate_response.json()
    invoice_id = generated_invoice["invoice_id"]

    mark_paid_response = await async_client.put(
        f"/invoices/{invoice_id}/mark_as_paid",
        headers=admin_headers,
    )
    assert mark_paid_response.status_code == 200
    assert mark_paid_response.json()["date_paid"] is not None


async def test_invoice_generation_includes_start_and_end_dates(
    async_client: httpx.AsyncClient, admin_headers: dict[str, str]
):
    for booking_date, booking_time in (
        ("2025-03-01T00:00:00+00:00", "09:00:00"),
        ("2025-03-31T00:00:00+00:00", "10:00:00"),
        ("2025-04-01T00:00:00+00:00", "11:00:00"),
    ):
        create_response = await async_client.post(
            "/bookings/",
            headers=admin_headers,
            json={
                "date": booking_date,
                "time": booking_time,
                "customer_id": 2,
                "service_id": 1,
                "user_id": 2,
            },
        )
        assert create_response.status_code == 200, create_response.text

    generate_response = await async_client.post(
        "/invoices/generate",
        headers=admin_headers,
        json={
            "customer_id": 2,
            "date_start": "2025-03-01T00:00:00+00:00",
            "date_end": "2025-03-31T00:00:00+00:00",
        },
    )
    assert generate_response.status_code == 200, generate_response.text
    generated_invoice = generate_response.json()
    booking_dates = {booking["date"][:10] for booking in generated_invoice["bookings"]}

    assert "2025-03-01" in booking_dates
    assert "2025-03-31" in booking_dates
    assert "2025-04-01" not in booking_dates


async def test_expenses_crud(
    async_client: httpx.AsyncClient,
    admin_headers: dict[str, str],
    user_headers: dict[str, str],
):
    forbidden_response = await async_client.get("/expenses/", headers=user_headers)
    assert forbidden_response.status_code == 403

    list_response = await async_client.get("/expenses/", headers=admin_headers)
    assert list_response.status_code == 200
    assert isinstance(list_response.json(), list)

    create_response = await async_client.post(
        "/expenses/",
        headers=admin_headers,
        json={
            "date": _iso_now(days_offset=-1),
            "price": 42.75,
            "description": "Route test expense",
            "category": "Marketing",
        },
    )
    assert create_response.status_code == 200, create_response.text
    expense_id = create_response.json()["expense_id"]

    update_response = await async_client.put(
        f"/expenses/{expense_id}",
        headers=admin_headers,
        json={"description": "Updated route test expense", "price": 43.0},
    )
    assert update_response.status_code == 200
    assert update_response.json()["description"] == "Updated route test expense"
    assert update_response.json()["price"] == 43.0

    delete_response = await async_client.delete(
        f"/expenses/{expense_id}", headers=admin_headers
    )
    assert delete_response.status_code == 200
