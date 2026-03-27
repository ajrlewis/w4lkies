from datetime import datetime, timezone

import pytest
import httpx

pytestmark = pytest.mark.anyio


async def test_read_vets(async_client: httpx.AsyncClient):
    response = await async_client.get("/vets/")
    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, list)
    assert len(payload) >= 1
    assert "vet_id" in payload[0]


async def test_read_vet_by_id(async_client: httpx.AsyncClient):
    response = await async_client.get("/vets/1")
    assert response.status_code == 200
    payload = response.json()
    assert payload["vet_id"] == 1


async def test_read_dogs(async_client: httpx.AsyncClient):
    response = await async_client.get("/dogs/")
    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, list)
    assert len(payload) >= 1
    assert "dog_id" in payload[0]


async def test_read_dog_breeds(async_client: httpx.AsyncClient):
    response = await async_client.get("/dogs/breeds")
    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, list)
    assert len(payload) >= 1


async def test_read_dog_images(async_client: httpx.AsyncClient):
    response = await async_client.get("/dogs/images")
    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, list)


async def test_read_services(async_client: httpx.AsyncClient):
    response = await async_client.get("/services/")
    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, list)
    assert len(payload) >= 1
    assert "service_id" in payload[0]


async def test_read_service_by_id(async_client: httpx.AsyncClient):
    response = await async_client.get("/services/1")
    assert response.status_code == 200
    payload = response.json()
    assert payload["service_id"] == 1


async def test_read_invoices(async_client: httpx.AsyncClient):
    response = await async_client.get("/invoices/")
    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, list)
    assert len(payload) >= 1
    assert "invoice_id" in payload[0]


async def test_read_invoice_by_id(async_client: httpx.AsyncClient):
    response = await async_client.get("/invoices/1")
    assert response.status_code == 200
    payload = response.json()
    assert payload["invoice_id"] == 1


async def test_download_invoice_pdf(async_client: httpx.AsyncClient):
    response = await async_client.get("/invoices/1/download")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "attachment; filename=" in response.headers["content-disposition"]
    assert len(response.content) > 100


async def test_read_expense_categories(async_client: httpx.AsyncClient):
    response = await async_client.get("/expenses/categories")
    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, list)
    assert "Marketing" in payload


async def test_submit_contact_us_form(async_client: httpx.AsyncClient):
    response = await async_client.post(
        "/contact_us/",
        json={
            "name": "Test Customer",
            "email": "test.customer@example.com",
            "message": "Can I get more details on services?",
        },
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Contact us notification sent in the background"


async def test_submit_customer_sign_up(async_client: httpx.AsyncClient):
    now_iso = datetime.now(timezone.utc).isoformat()
    response = await async_client.post(
        "/sign_up/",
        json={
            "customer": {
                "name": "Signup Customer",
                "phone": "+44 7000 123456",
                "email": "signup.customer@example.com",
                "emergency_contact_name": "Emergency Contact",
                "emergency_contact_phone": "+44 7000 654321",
            },
            "dogs": [
                {
                    "name": "Poppy",
                    "date_of_birth": now_iso,
                    "breed": "Cockapoo",
                    "is_allowed_treats": True,
                    "is_allowed_off_the_lead": False,
                    "is_allowed_on_social_media": True,
                    "is_neutered_or_spayed": True,
                    "behavioral_issues": "",
                    "medical_needs": "",
                    "vet_name": "Dr. Test",
                    "vet_address": "1 Test Street",
                }
            ],
            "declaration": True,
        },
    )
    assert response.status_code == 200
    assert (
        response.json()["message"]
        == "Customer sign-up notification sent in the background"
    )
