from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import uuid4

from django.db.models import UUIDField, EmailField, ForeignKey, PROTECT
from django.contrib.auth.models import AbstractBaseUser
from django.utils.translation import gettext_lazy as _

from .role import Role


if TYPE_CHECKING:
    from uuid import UUID


class User(AbstractBaseUser):
    uuid: UUIDField[UUID, UUID] = UUIDField(
        verbose_name=_("Уникальный номер пользователя"),
        primary_key=True,
        default=uuid4
    )

    login: EmailField[str, str] = EmailField(
        verbose_name=_("Логин пользователя"),
        unique=True,
        max_length=250
    )

    role: ForeignKey[Role, Role] = ForeignKey(
        to=Role,
        on_delete=PROTECT,
        default=Role.RoleChoices.USER
    )

    class Meta:
        db_table = '"identity"."users"'
        