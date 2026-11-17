"""Security regression tests, run in both dev and production test environments."""
from django.contrib.auth import get_user_model
from django.test import Client, TestCase, override_settings

from identity.models import Role


@override_settings(SECURE_SSL_REDIRECT=False)
class DeploymentSecurityTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.customer_role, _ = Role.objects.get_or_create(role=Role.RoleChoices.USER)
        cls.admin_role, _ = Role.objects.get_or_create(role=Role.RoleChoices.ADMIN)
        cls.customer = get_user_model().objects.create_user(
            login="security_customer@example.com", password="Strong-Sample-Password-2026!",
            role=cls.customer_role,
        )
        cls.administrator = get_user_model().objects.create_user(
            login="security_admin@example.com", password="Strong-Sample-Password-2026!",
            role=cls.admin_role,
        )

    def test_anonymous_cannot_read_admin_api(self):
        for path in ("/api/manage/me/", "/api/manage/products/", "/api/manage/catalogs/"):
            with self.subTest(path=path):
                self.assertIn(self.client.get(path).status_code, (401, 403))

    def test_customer_cannot_mutate_admin_api_even_with_valid_csrf(self):
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.customer)
        token = client.get("/user/csrf/").json()["csrfToken"]
        response = client.post(
            "/api/manage/catalogs/", data='{"name":"Forbidden"}',
            content_type="application/json", HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(response.status_code, 403)

    def test_admin_write_rejected_without_csrf_token(self):
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.administrator)
        self.assertEqual(
            client.post("/api/manage/catalogs/", data='{"name":"Not allowed"}',
                        content_type="application/json").status_code,
            403,
        )

    def test_admin_write_accepted_with_valid_csrf_token(self):
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.administrator)
        token = client.get("/user/csrf/").json()["csrfToken"]
        response = client.post(
            "/api/manage/catalogs/", data='{"name":"Allowed"}',
            content_type="application/json", HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(response.status_code, 201)

    def test_authentication_session_is_cleared_by_logout(self):
        self.client.force_login(self.customer)
        self.assertEqual(self.client.get("/api/me/").status_code, 200)
        self.client.post("/user/logout/", HTTP_ACCEPT="application/json")
        self.assertEqual(self.client.get("/api/me/").status_code, 401)

    def test_registration_ignores_attacker_supplied_admin_role(self):
        response = self.client.post(
            "/user/reg/",
            data={
                "email": "security_new@example.com",
                "password": "Strong-Sample-Password-2026!",
                "password_confirm": "Strong-Sample-Password-2026!",
                "agreement": "on",
                "role": "Администратор",
            },
            HTTP_ACCEPT="application/json",
        )
        self.assertEqual(response.status_code, 200)
        account = get_user_model().objects.get(login="security_new@example.com")
        self.assertEqual(account.role.role, Role.RoleChoices.USER)

    def test_unauthenticated_current_user_is_not_exposed(self):
        result = self.client.get("/api/me/")
        self.assertEqual(result.status_code, 401)
        self.assertNotIn("role", result.json())

    def test_invalid_host_is_rejected_by_production_settings(self):
        with override_settings(DEBUG=False, ALLOWED_HOSTS=["example.test"]):
            response = self.client.get("/user/csrf/", HTTP_HOST="attacker.invalid")
            self.assertEqual(response.status_code, 400)
