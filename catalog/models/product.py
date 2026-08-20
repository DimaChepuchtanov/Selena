from __future__ import annotations

from typing import Protocol, cast, override
from uuid import UUID
from decimal import Decimal
from datetime import datetime
from uuid import uuid4


from django.db.models import (
    DateTimeField,
    Model,
    UUIDField,
    CharField,
    TextField,
    FloatField,
    DecimalField,
    PositiveIntegerField,
    Manager,
    QuerySet
)


class ProductProtocol(Protocol):
    title: str
    description: str
    rating: float
    price: Decimal


class ProductQuerySet(QuerySet['Product']):
    def get_product(self, product_uuid: UUID) -> ProductQuerySet:
        return self.filter(uuid=product_uuid)
    

class ProductManager(Manager['Product']):
    @override
    def get_queryset(self) -> ProductQuerySet:
        return ProductQuerySet(model=self.model, using=self._db)

    def get_product(self, product_uuid: UUID) -> ProductQuerySet:
        return self.get_queryset().get_product(product_uuid=product_uuid)


class Product(Model):
    uuid: UUIDField[UUID, UUID] = UUIDField(primary_key=True, verbose_name="Уникальный номер товара", editable=False, default=uuid4)

    title: CharField[str, str] = CharField(
        verbose_name="Название товара",
        max_length=255,
    )

    description: TextField[str, str] = TextField(
        verbose_name="Описание товара",
        max_length=1000
    )

    rating: FloatField[float, float] = FloatField(
        verbose_name="Рейтинг товара",
        default=0.0
    )

    price: DecimalField[Decimal, Decimal] = DecimalField(
        verbose_name="Цена товара",
        max_digits=10,
        decimal_places=2
    )

    stock_quantity: PositiveIntegerField[int, int] = PositiveIntegerField(
        verbose_name="Остаток товара"
    )

    created_at: DateTimeField[datetime, datetime] = DateTimeField(
        verbose_name="Дата заведения товара",
        auto_now_add=True
    )

    objects = ProductManager()

    def as_protocol(self) -> ProductProtocol:
        return cast(ProductProtocol, self)
    
    class Meta:
        db_table = "product"
        ordering = ('uuid', 'rating',)


__all__ = ['ProductProtocol', 'Product', "ProductManager"]