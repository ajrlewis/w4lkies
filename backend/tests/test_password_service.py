from services import password_service


def test_hash_password_returns_secure_hash():
    password = "my-test-password"
    hashed_password = password_service.hash_password(password)

    assert hashed_password != password
    assert hashed_password.startswith("$2")
    assert password_service.verify_password(password, hashed_password) is True


def test_verify_password_returns_false_for_bad_hash():
    assert password_service.verify_password("my-test-password", "not-a-bcrypt-hash") is False
