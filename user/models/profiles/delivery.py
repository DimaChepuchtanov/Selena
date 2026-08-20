from __future__ import annotations

from uuid import UUID
import re

from django.db.models import (
    Model,
    ForeignKey,
    UUIDField,
    CharField,
    TextChoices,
    IntegerField,
    CASCADE
)
from django.utils.translation import gettext_lazy as _

from .. import User


class DeliveryType(TextChoices):
    CDEK = "cdek", "СДЭК"
    RUSSIAN_POST = "russian_post", "ПОЧТА РОССИИ"


class DeliveryProfile(Model):
    PHONE_PATTERN = re.compile(
        r"^(?:\+7|8)\s*"
        r"(?:\(\d{3}\)|\d{3})\s*"
        r"\d{3}[-\s]?\d{2}[-\s]?\d{2}$"
    )

    def validate_phone(self, phone: str) -> bool:
        return self.PHONE_PATTERN.fullmatch(phone.strip()) is not None

    uuid: UUIDField[UUID, UUID] = UUIDField(
        verbose_name="Уникальный номер профиля доставки",
        primary_key=True,
        editable=False
    )

    delivery_service: CharField[str, str] = CharField(
        verbose_name="Тип доставки",
        choices=DeliveryType.choices,
        max_length=255
    )
    
    user: ForeignKey[User, User] = ForeignKey(
        to=User,
        verbose_name="Учетная запись",
        on_delete=CASCADE
    )


    fio: CharField[str, str] = CharField(
        verbose_name="ФИО пользователя",
        max_length=255,
    )


    phone: CharField[str, str] = CharField(
        validators=[validate_phone],
        verbose_name="Номер телефона",
        max_length=255
    )

    index_post: IntegerField[int, int] = IntegerField(
        verbose_name="Почтовый индекс"
    )

    country: CharField[str, str] = CharField(
        verbose_name="Страна",
        max_length=255
    )

    city: CharField[str, str] = CharField(
        verbose_name="Город",
        max_length=255
    )

    street: CharField[str, str] = CharField(
        verbose_name="Улица",
        max_length=255
    )

    build: CharField[str, str] = CharField(
        verbose_name="Дом",
        max_length=255
    )

    room: CharField[str, str] = CharField(
        verbose_name="Квартира/Комната",
        max_length=255
    )

    class Meta: 
        db_table = "delivery_profile"
        default_related_name = "delivery"


__all__ = ["DeliveryProfile", "DeliveryType"]