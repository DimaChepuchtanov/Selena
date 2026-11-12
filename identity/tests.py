"""Authentication and navigation regression tests for Selena Znaju."""
from django.contrib.auth import get_user_model
from django.test import Client, TestCase
from django.urls import reverse

from .models import Role


class AuthenticationTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.customer_role, _ = Role.objects.get_or_create(role=Role.RoleChoices.USER)
        cls.admin_role, _ = Role.objects.get_or_create(role=Role.RoleChoices.ADMIN)
        cls.customer = get_user_model().objects.create_user(
            login="buyer@example.com",
            password="SafePassword-2026!",
        )

    def test_seeded_test_accounts_are_present_with_correct_roles_and_passwords(self):
        import os

        admin = get_user_model().objects.get(login="root@mail.ru")
        customer = get_user_model().objects.get(login="user@mail.ru")
        self.assertEqual(admin.role.role, Role.RoleChoices.ADMIN)
        self.assertEqual(customer.role.role, Role.RoleChoices.USER)

        self.assertTrue(admin.check_password(
            os.environ.get("SELENA_TEST_ADMIN_PASSWORD", "SelenaAdmin-2026!")
        ))
        self.assertTrue(customer.check_password(
            os.environ.get("SELENA_TEST_USER_PASSWORD", "SelenaUser-2026!")
        ))

        self.client.force_login(admin)
        self.assertEqual(self.client.get("/api/manage/me/").status_code, 200)
        self.client.force_login(customer)
        self.assertEqual(self.client.get("/api/manage/me/").status_code, 403)

    def test_csrf_endpoint_sets_cookie(self):
        response = self.client.get("/user/csrf/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("csrfToken", response.json())
        self.assertIn("csrftoken", response.cookies)

    def test_csrf_is_enforced_on_registration(self):
        client = Client(enforce_csrf_checks=True)
        response = client.post(
            "/user/reg/",
            {"email": "new@example.com", "password": "SafePassword-2026!",
             "password_confirm": "SafePassword-2026!", "agreement": "on"},
            HTTP_ACCEPT="application/json",
        )
        self.assertEqual(response.status_code, 403)

    def test_valid_registration_creates_hashed_password_and_session(self):
        payload = {
            "email": "new@example.com",
            "password": "SafePassword-2026!",
            "password_confirm": "SafePassword-2026!",
            "agreement": "on",
        }
        response = self.client.post("/user/reg/", payload, HTTP_ACCEPT="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["ok"])
        user = get_user_model().objects.get(login="new@example.com")
        self.assertTrue(user.check_password(payload["password"]))
        self.assertEqual(user.role.role, Role.RoleChoices.USER)
        self.assertEqual(self.client.get("/api/me/").status_code, 200)

    def test_registration_rejects_duplicate_and_mismatch(self):
        response = self.client.post("/user/reg/", {
            "email": "buyer@example.com", "password": "SafePassword-2026!",
            "password_confirm": "SafePassword-2026!", "agreement": "on",
        }, HTTP_ACCEPT="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.json()["errors"])

        response = self.client.post("/user/reg/", {
            "email": "another@example.com", "password": "SafePassword-2026!",
            "password_confirm": "wrong-password", "agreement": "on",
        }, HTTP_ACCEPT="application/json")
        self.assertEqual(response.status_code, 400)

    def test_login_success_wrong_password_logout(self):
        response = self.client.post("/user/auth/", {
            "email": "buyer@example.com", "password": "SafePassword-2026!",
            "remember": "on",
        }, HTTP_ACCEPT="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["ok"])
        self.assertEqual(self.client.get("/api/me/").json()["login"], "buyer@example.com")

        response = self.client.post("/user/logout/", HTTP_ACCEPT="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.get("/api/me/").status_code, 401)

        response = self.client.post("/user/auth/", {
            "email": "buyer@example.com", "password": "wrong",
        }, HTTP_ACCEPT="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("errors", response.json())

    def test_login_csrf_cookie_required(self):
        client = Client(enforce_csrf_checks=True)
        csrf = client.get("/user/csrf/").json()["csrfToken"]
        response = client.post("/user/auth/", {
            "email": "buyer@example.com", "password": "SafePassword-2026!",
        }, HTTP_ACCEPT="application/json", HTTP_X_CSRFTOKEN=csrf)
        self.assertEqual(response.status_code, 200)

    def test_browser_login_page_and_legacy_redirects(self):
        self.assertEqual(self.client.get("/user/auth/").status_code, 200)
        self.assertEqual(self.client.get("/user/reg/").status_code, 200)
        self.assertEqual(self.client.get("/").status_code, 302)
        self.assertEqual(self.client.get("/catalog/").status_code, 302)
        self.assertEqual(self.client.get("/profile/").status_code, 302)

    def test_customer_cannot_access_management(self):
        self.client.force_login(self.customer)
        self.assertEqual(self.client.get("/api/manage/me/").status_code, 403)
        self.assertEqual(self.client.get("/api/manage/products/").status_code, 403)

    def test_admin_can_access_management(self):
        administrator = get_user_model().objects.create_user(
            login="admin@example.com", password="SafePassword-2026!", role=self.admin_role
        )
        self.client.force_login(administrator)
        self.assertEqual(self.client.get("/api/manage/me/").status_code, 200)
        self.assertEqual(self.client.get("/api/manage/products/").status_code, 200)

    def test_initial_roles_exist_without_plaintext_seed_passwords(self):
        self.assertTrue(Role.objects.filter(role=Role.RoleChoices.USER).exists())
        self.assertTrue(Role.objects.filter(role=Role.RoleChoices.ADMIN).exists())
        for name, password in (("root@mail.ru", "root"), ("user@mail.ru", "user")):
            self.assertFalse(get_user_model().objects.filter(login=name, password=password).exists())
