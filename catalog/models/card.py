from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import uuid4

from django.db.models import (
    Model,
    UUIDField,
    CharField,
    TextField,
    PositiveIntegerField
)


if TYPE_CHECKING:
    from uuid import UUID


class ProductCard(Model):
    uuid: UUIDField[UUID, UUID] = UUIDField(
        verbose_name="Уникальный номер карточки товара",
        primary_key=True,
        default=uuid4,
        editable=False
    )

    name: CharField[str, str] = CharField(
        verbose_name="Наименование товара",
        max_length=200,
        null=False,
    )

    describe: TextField[str, str] = TextField(
        verbose_name="Описание товара"
    )

    stock: PositiveIntegerField[int, int] = PositiveIntegerField(
        verbose_name="Количество товара",
        default=0
    )

    price: PositiveIntegerField[int, int] = PositiveIntegerField(
        verbose_name="Цена за товар",
        default=0
    )


    def __str__(self):
        return self.name


    class Meta:
        db_table = '"product"."card"'


