"""Public and management catalog API regression tests."""
import json
from uuid import uuid4

from django.contrib.auth import get_user_model
from django.db import connection
from django.test import TestCase
from django.test.utils import CaptureQueriesContext

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

    def test_schemas_exist_on_new_test_database(self):
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT schema_name FROM information_schema.schemata "
                "WHERE schema_name IN ('identity', 'product')"
            )
            schemas = {row[0] for row in cursor.fetchall()}
        self.assertEqual(schemas, {"identity", "product"})
