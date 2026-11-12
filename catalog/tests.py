"""Public and management catalog API regression tests."""
import json
from io import BytesIO
from tempfile import TemporaryDirectory
from uuid import uuid4

from django.contrib.auth import get_user_model
from django.db import connection
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.test.utils import CaptureQueriesContext

from PIL import Image

from identity.models import Role
from .models import ProductCard, ProductCatalog, ProductImage


class CatalogApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.catalog, _ = ProductCatalog.objects.get_or_create(name="Колоды")
        cls.product = ProductCard.objects.create(
            name="Тестовый оракул",
            describe="Описание тестовой колоды",
            price=1999,
            stock=4,
            catalog=cls.catalog,
            is_published=True,
        )
        ProductImage.objects.create(
            product=cls.product,
            img="products/test-cover.png",
            is_primary=True,
        )
        cls.draft = ProductCard.objects.create(
            name="Неопубликованный товар",
            describe="Черновик",
            price=100,
            stock=1,
            catalog=cls.catalog,
            is_published=False,
        )

    def test_catalog_list_and_primary_cover(self):
        response = self.client.get(f"/api/catalog/{self.catalog.pk}")
        self.assertEqual(response.status_code, 200)
        products = response.json()
        self.assertEqual(len(products), 1)
        self.assertEqual(products[0]["uuid"], str(self.product.uuid))
        self.assertEqual(products[0]["image"], "/media/products/test-cover.png")

    def test_detail_gallery_and_draft_is_hidden(self):
        response = self.client.get(f"/api/catalog/products/{self.product.pk}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["images"], ["/media/products/test-cover.png"])
        self.assertEqual(response.json()["description"], self.product.describe)
        self.assertEqual(
            self.client.get(f"/api/catalog/products/{self.draft.pk}/").status_code,
            404,
        )

    def test_primary_image_prefetch_avoids_n_plus_one(self):
        for index in range(4):
            item = ProductCard.objects.create(
                name=f"Колода {index}", describe="", price=50, stock=1,
                catalog=self.catalog, is_published=True,
            )
            ProductImage.objects.create(
                product=item,
                img=f"products/photo{index}.png",
                is_primary=True,
            )
        with CaptureQueriesContext(connection) as captured:
            response = self.client.get(f"/api/catalog/{self.catalog.pk}")
        self.assertEqual(response.status_code, 200)
        self.assertLessEqual(len(captured), 4)
        self.assertEqual(len(response.json()), 5)

    def test_administrator_can_create_and_update_catalog(self):
        role, _ = Role.objects.get_or_create(role=Role.RoleChoices.ADMIN)
        user = get_user_model().objects.create_user(
            login="shopadmin@example.com",
            password="SafePassword-2026!",
            role=role,
        )
        self.client.force_login(user)
        created = self.client.post(
            "/api/manage/catalogs/",
            data=json.dumps({"name": "Тестовый каталог"}),
            content_type="application/json",
        )
        self.assertEqual(created.status_code, 201)
        catalog_id = created.json()["id"]
        renamed = self.client.patch(
            f"/api/manage/catalogs/{catalog_id}/",
            data=json.dumps({"name": "Новое название"}),
            content_type="application/json",
        )
        self.assertEqual(renamed.status_code, 200)
        self.assertEqual(renamed.json()["name"], "Новое название")

    def test_cannot_delete_catalog_with_products(self):
        role, _ = Role.objects.get_or_create(role=Role.RoleChoices.ADMIN)
        user = get_user_model().objects.create_user(
            login="anotheradmin@example.com", password="SafePassword-2026!", role=role
        )
        self.client.force_login(user)
        self.assertEqual(
            self.client.delete(f"/api/manage/catalogs/{self.catalog.pk}/").status_code, 409
        )

    def test_admin_creates_draft_then_publishes_product(self):
        role, _ = Role.objects.get_or_create(role=Role.RoleChoices.ADMIN)
        user = get_user_model().objects.create_user(
            login="publisher@example.com", password="SafePassword-2026!", role=role
        )
        self.client.force_login(user)
        response = self.client.post(
            "/api/manage/products/",
            data=json.dumps({
                "name": "Публикуемая колода", "describe": "Описание",
                "price": 999, "stock": 2, "catalog": self.catalog.pk,
                "is_published": False,
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        product_id = response.json()["uuid"]
        self.assertEqual(self.client.get(f"/api/catalog/products/{product_id}/").status_code, 404)
        published = self.client.patch(
            f"/api/manage/products/{product_id}/",
            data=json.dumps({"is_published": True}),
            content_type="application/json",
        )
        self.assertEqual(published.status_code, 200)
        self.assertEqual(self.client.get(f"/api/catalog/products/{product_id}/").status_code, 200)

    def test_admin_uploads_changes_cover_and_deletes_photo(self):
        role, _ = Role.objects.get_or_create(role=Role.RoleChoices.ADMIN)
        user = get_user_model().objects.create_user(
            login="photoadmin@example.com", password="SafePassword-2026!", role=role
        )
        self.client.force_login(user)
        with TemporaryDirectory() as directory:
            with override_settings(MEDIA_ROOT=directory):
                buffer = BytesIO()
                Image.new("RGB", (2, 2), "white").save(buffer, format="PNG")
                image_bytes = buffer.getvalue()
                endpoint = f"/api/manage/products/{self.product.pk}/images/"
                a = self.client.post(endpoint, {
                    "image": SimpleUploadedFile("front.png", image_bytes, content_type="image/png"),
                })
                b = self.client.post(endpoint, {
                    "image": SimpleUploadedFile("back.png", image_bytes, content_type="image/png"),
                })
                self.assertEqual(a.status_code, 201)
                self.assertEqual(b.status_code, 201)
                self.assertFalse(b.json()["is_primary"])  # the product already has a cover

                selected = self.client.patch(
                    f"{endpoint}{b.json()['id']}/",
                    data=json.dumps({"is_primary": True}),
                    content_type="application/json",
                )
                self.assertEqual(selected.status_code, 200)
                self.assertTrue(selected.json()["is_primary"])
                self.assertEqual(
                    ProductImage.objects.filter(product=self.product, is_primary=True).count(),
                    1,
                )
                removed = self.client.delete(f"{endpoint}{b.json()['id']}/")
                self.assertEqual(removed.status_code, 204)
                self.assertEqual(
                    ProductImage.objects.filter(product=self.product, is_primary=True).count(),
                    1,
                )

    def test_schemas_exist_on_new_test_database(self):
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT schema_name FROM information_schema.schemata "
                "WHERE schema_name IN ('identity', 'product')"
            )
            schemas = {row[0] for row in cursor.fetchall()}
        self.assertEqual(schemas, {"identity", "product"})


class CatalogExtendedTests(TestCase):
    """Focused catalog regressions; uses isolated PostgreSQL test database."""

    @classmethod
    def setUpTestData(cls):
        cls.decks, _ = ProductCatalog.objects.get_or_create(name="Колоды")
        cls.acc, _ = ProductCatalog.objects.get_or_create(name="Аксессуары")
        cls.visible = ProductCard.objects.create(
            name="Колода Солнце", describe="Слово для поиска: созвездие",
            price=1200, stock=2, catalog=cls.decks, is_published=True,
        )
        cls.hidden = ProductCard.objects.create(
            name="Черновик Луна", describe="Секрет", price=100,
            stock=0, catalog=cls.decks, is_published=False,
        )
        cls.other = ProductCard.objects.create(
            name="Чехол", describe="Аксессуар", price=200,
            stock=1, catalog=cls.acc, is_published=True,
        )

    def login_admin(self):
        role = Role.objects.get(role=Role.RoleChoices.ADMIN)
        user = get_user_model().objects.create_user(
            login="catalog-regression-admin@example.com",
            password="LongTestPassword-2026!", role=role,
        )
        self.client.force_login(user)

    def test_category_filter_and_hidden_draft(self):
        response = self.client.get(f"/api/catalog/{self.decks.pk}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            {item["uuid"] for item in response.json()},
            {str(self.visible.pk)},
        )

    def test_listing_exposes_description_for_client_search(self):
        response = self.client.get(f"/api/catalog/{self.decks.pk}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()[0]["description"], self.visible.describe)

    def test_product_without_image_returns_null_cover(self):
        response = self.client.get(f"/api/catalog/{self.decks.pk}")
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json()[0]["image"])

    def test_primary_image_is_first_in_details(self):
        ProductImage.objects.create(
            product=self.visible, img="products/secondary.png", is_primary=False,
        )
        ProductImage.objects.create(
            product=self.visible, img="products/primary.png", is_primary=True,
        )
        with CaptureQueriesContext(connection) as sql:
            response = self.client.get(f"/api/catalog/products/{self.visible.pk}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["images"], [
            "/media/products/primary.png",
            "/media/products/secondary.png",
        ])
        self.assertLessEqual(len(sql), 2, "Product detail must reuse prefetched images")

    def test_unpublished_product_and_unknown_uuid_are_not_accessible(self):
        self.assertEqual(
            self.client.get(f"/api/catalog/products/{self.hidden.pk}/").status_code,
            404,
        )
        self.assertEqual(
            self.client.get(f"/api/catalog/products/{uuid4()}/").status_code,
            404,
        )

    def test_regular_user_cannot_mutate_catalog(self):
        self.client.force_login(get_user_model().objects.create_user(
            login="catalog-buyer@example.com", password="LongTestPassword-2026!",
        ))
        response = self.client.post(
            "/api/manage/catalogs/",
            data=json.dumps({"name": "Запрещено"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

    def test_invalid_price_stock_and_catalog_are_rejected(self):
        self.login_admin()
        for name, price, stock, catalog_id in [
            ("Отрицательная цена", -1, 1, self.decks.pk),
            ("Отрицательный остаток", 10, -1, self.decks.pk),
            ("Чужой каталог", 10, 1, 999999),
        ]:
            with self.subTest(name=name):
                response = self.client.post(
                    "/api/manage/products/",
                    data=json.dumps({
                        "name": name, "price": price, "stock": stock,
                        "catalog": catalog_id,
                    }),
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 400)

    def test_case_insensitive_duplicate_name_is_rejected(self):
        self.login_admin()
        response = self.client.post(
            "/api/manage/products/",
            data=json.dumps({
                "name": "колода солнце", "price": 10, "stock": 1,
                "catalog": self.decks.pk,
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_publishing_and_unpublishing_updates_public_catalog(self):
        self.login_admin()
        url = f"/api/manage/products/{self.hidden.pk}/"
        response = self.client.patch(
            url, data=json.dumps({"is_published": True}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            self.client.get(f"/api/catalog/products/{self.hidden.pk}/").status_code,
            200,
        )
        response = self.client.patch(
            url, data=json.dumps({"is_published": False}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            self.client.get(f"/api/catalog/products/{self.hidden.pk}/").status_code,
            404,
        )

    def test_price_stock_and_description_are_updated_in_public_detail(self):
        self.login_admin()
        response = self.client.patch(
            f"/api/manage/products/{self.visible.pk}/",
            data=json.dumps({"price": 2500, "stock": 0, "describe": "Обновлено"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        detail = self.client.get(f"/api/catalog/products/{self.visible.pk}/").json()
        self.assertEqual(
            (detail["price"], detail["stock"], detail["description"]),
            (2500, 0, "Обновлено"),
        )
