from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from django.db.models import (
    Model,
    ImageField,
    ForeignKey,
    BooleanField,
    CASCADE,
    UniqueConstraint,
    Q
)

from .card import ProductCard



class ProductImage(Model):

    def product_image_path(instance, filename):
        extension = Path(filename).suffix.lower()

        return (
            f"products/{instance.product_id}/"
            f"{uuid4().hex}{extension}"
    )

    product = ForeignKey(
        ProductCard,
        on_delete=CASCADE,
        related_name='images'
    )

    img = ImageField(
        upload_to=product_image_path,
        verbose_name="Изображение",
        max_length=255
    )

    is_primary = BooleanField(
        verbose_name="Главное фото",
        default=False
    )

    def __str__(self) -> str:
        return f"Фото для {self.product}"


    class Meta:
        db_table = '"product"."images"'
        constraints = [
            UniqueConstraint(
                fields=["product"],
                condition=Q(is_primary=True),
                name="unique_primary_image_per_product",
            )
        ]