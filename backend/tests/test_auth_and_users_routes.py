import pytest
import httpx
from uuid import uuid4

pytestmark = pytest.mark.anyio


async def test_root_returns_hello_world(async_client: httpx.AsyncClient):
    response = await async_client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World!"}


async def test_login_success_returns_bearer_token(async_client: httpx.AsyncClient):
    response = await async_client.post(
        "/auth/token",
        data={"username": "admin", "password": "admin123"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["token_type"] == "bearer"
    assert isinstance(payload["access_token"], str)
    assert len(payload["access_token"]) > 20
    assert payload["scopes"] == ["admin"]


async def test_login_invalid_credentials_returns_401(async_client: httpx.AsyncClient):
    response = await async_client.post(
        "/auth/token",
        data={"username": "admin", "password": "wrong-password"},
    )
    assert response.status_code == 401


async def test_read_users_me_with_user_token(
    async_client: httpx.AsyncClient, user_headers: dict[str, str]
):
    response = await async_client.get("/users/me", headers=user_headers)
    assert response.status_code == 200
    payload = response.json()
    assert payload["username"] == "alice"
    assert payload["is_active"] is True


async def test_read_users_requires_admin(
    async_client: httpx.AsyncClient, user_headers: dict[str, str]
):
    response = await async_client.get("/users/", headers=user_headers)
    assert response.status_code == 403


async def test_read_users_with_admin_token(
    async_client: httpx.AsyncClient, admin_headers: dict[str, str]
):
    response = await async_client.get("/users/", headers=admin_headers)
    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, list)
    assert len(payload) >= 3
    assert any(user["username"] == "admin" for user in payload)


async def test_update_user_requires_admin(
    async_client: httpx.AsyncClient, user_headers: dict[str, str]
):
    response = await async_client.put(
        "/users/2",
        headers=user_headers,
        json={"email": "alice.updated@example.com"},
    )
    assert response.status_code == 403


async def test_update_user_with_admin_token(
    async_client: httpx.AsyncClient, admin_headers: dict[str, str]
):
    response = await async_client.put(
        "/users/3",
        headers=admin_headers,
        json={
            "username": "bob.updated",
            "email": "bob.updated@example.com",
            "is_admin": True,
            "is_active": False,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["user_id"] == 3
    assert payload["username"] == "bob.updated"
    assert payload["email"] == "bob.updated@example.com"
    assert payload["is_admin"] is True
    assert payload["is_active"] is False


async def test_update_user_prevents_self_demotion(
    async_client: httpx.AsyncClient, admin_headers: dict[str, str]
):
    rename_self = await async_client.put(
        "/users/1",
        headers=admin_headers,
        json={"username": "admin-renamed"},
    )
    assert rename_self.status_code == 400

    remove_admin = await async_client.put(
        "/users/1",
        headers=admin_headers,
        json={"is_admin": False},
    )
    assert remove_admin.status_code == 400

    deactivate_self = await async_client.put(
        "/users/1",
        headers=admin_headers,
        json={"is_active": False},
    )
    assert deactivate_self.status_code == 400


async def _create_user_for_password_tests(
    async_client: httpx.AsyncClient, admin_headers: dict[str, str]
) -> dict:
    username = f"pwd_user_{uuid4().hex[:8]}"
    initial_password = "initial123"
    response = await async_client.post(
        "/users/",
        headers=admin_headers,
        json={
            "username": username,
            "email": f"{username}@example.com",
            "password": initial_password,
            "is_admin": False,
            "is_active": True,
        },
    )
    assert response.status_code == 201, response.text
    return {
        "user_id": response.json()["user_id"],
        "username": username,
        "password": initial_password,
    }


async def _login(
    async_client: httpx.AsyncClient, username: str, password: str
) -> httpx.Response:
    return await async_client.post(
        "/auth/token",
        data={"username": username, "password": password},
    )


async def test_change_my_password_success(
    async_client: httpx.AsyncClient, admin_headers: dict[str, str]
):
    user_info = await _create_user_for_password_tests(async_client, admin_headers)
    login_response = await _login(
        async_client, user_info["username"], user_info["password"]
    )
    assert login_response.status_code == 200
    access_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}

    change_response = await async_client.put(
        "/users/me/password",
        headers=headers,
        json={
            "current_password": user_info["password"],
            "new_password": "updated123",
        },
    )
    assert change_response.status_code == 204

    old_password_login = await _login(
        async_client, user_info["username"], user_info["password"]
    )
    assert old_password_login.status_code == 401

    new_password_login = await _login(async_client, user_info["username"], "updated123")
    assert new_password_login.status_code == 200


async def test_change_my_password_rejects_wrong_current_password(
    async_client: httpx.AsyncClient, admin_headers: dict[str, str]
):
    user_info = await _create_user_for_password_tests(async_client, admin_headers)
    login_response = await _login(
        async_client, user_info["username"], user_info["password"]
    )
    assert login_response.status_code == 200
    access_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}

    change_response = await async_client.put(
        "/users/me/password",
        headers=headers,
        json={
            "current_password": "wrong-current-password",
            "new_password": "updated123",
        },
    )
    assert change_response.status_code == 400
    assert change_response.json()["detail"] == "Current password is incorrect."

    login_with_original = await _login(
        async_client, user_info["username"], user_info["password"]
    )
    assert login_with_original.status_code == 200


async def test_admin_reset_user_password_success(
    async_client: httpx.AsyncClient, admin_headers: dict[str, str]
):
    user_info = await _create_user_for_password_tests(async_client, admin_headers)

    reset_response = await async_client.put(
        f"/users/{user_info['user_id']}/password",
        headers=admin_headers,
        json={"new_password": "adminreset123"},
    )
    assert reset_response.status_code == 204

    old_password_login = await _login(
        async_client, user_info["username"], user_info["password"]
    )
    assert old_password_login.status_code == 401

    new_password_login = await _login(
        async_client, user_info["username"], "adminreset123"
    )
    assert new_password_login.status_code == 200


async def test_admin_reset_user_password_requires_admin(
    async_client: httpx.AsyncClient, user_headers: dict[str, str]
):
    response = await async_client.put(
        "/users/3/password",
        headers=user_headers,
        json={"new_password": "somepass123"},
    )
    assert response.status_code == 403


async def test_admin_reset_user_password_rejects_self(
    async_client: httpx.AsyncClient, admin_headers: dict[str, str]
):
    response = await async_client.put(
        "/users/1/password",
        headers=admin_headers,
        json={"new_password": "somepass123"},
    )
    assert response.status_code == 400
