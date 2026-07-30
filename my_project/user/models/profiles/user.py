from __future__ import annotations

from uuid import UUID

from django.db.models import (
    Model,
    UUIDField,
    OneToOneField,
    CharField,
    CASCADE
)

from .. import User


class UserProfile(Model):
    uuid: UUIDField[UUID, UUID] = UUIDField(
        verbose_name="Уникальный номер профиля",
        editable=False,
        primary_key=True
    )

    user: OneToOneField[User, User] = OneToOneField(
        to=User,
        on_delete=CASCADE,
        verbose_name="Учетная запись"
    )

    name: CharField[str, str] = CharField(
        verbose_name="Имя пользователя",
        max_length=255
    )


    class Meta:
        db_table = "profile"
        default_related_name = "profile"


__all__ = ["UserProfile"]