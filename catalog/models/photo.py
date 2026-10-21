from __future__ import annotations

from django.db.models import Model, ImageField, ForeignKey, BooleanField, CASCADE

from .card import ProductCard


class ProductImage(Model):
    def get_path(self) -> str:
        return f'products/{self.product.uuid}/'

    product = ForeignKey(
        ProductCard,
        on_delete=CASCADE,
        related_name='images'
    )

    img = ImageField(upload_to=get_path, verbose_name="Изображение")
    is_primary = BooleanField(
        verbose_name="Главное фото",
        default=False
    )

    def __str__(self) -> str:
        return f"Фото для {self.product}"


    class Meta:
        db_table = '"product"."images"'