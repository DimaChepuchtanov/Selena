from __future__ import annotations

from uuid import UUID, uuid4
from datetime import datetime

from django.db.models import (
    Model,
    UUIDField,
    ForeignKey,
    FloatField,
    TextField,
    DateTimeField,
    CASCADE
)

from catalog.models import Product
from user.models import User



class Comment(Model):
    uuid: UUIDField[UUID, UUID] = UUIDField(
        verbose_name="Уникальный номер комментария",
        primary_key=True,
        default=uuid4(),
        editable=False
    )

    author: ForeignKey[User, User] = ForeignKey(
        to=User,
        verbose_name="Автор комментария",
        on_delete=CASCADE,
        null=True
    )

    product: ForeignKey[Product, Product] = ForeignKey(
        to=Product,
        verbose_name="Товар",
        on_delete=CASCADE
    )

    rating: FloatField[float, float] = FloatField(
        verbose_name="Рейтинг товара"
    )

    text: TextField[str, str] = TextField(
        verbose_name="Текст комментария",
        max_length=1000
    )

    created_at: DateTimeField[datetime, datetime] = DateTimeField(
        verbose_name="Дата создания комментария",
        auto_now_add=True
    )


    class Meta:
        db_table = "comment"
        default_related_name = "comments"


__all__ = ["Comment"]