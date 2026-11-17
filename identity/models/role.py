from __future__ import annotations


from typing import TYPE_CHECKING, override
from uuid import uuid4

from django.db.models import Model, UUIDField, CharField, TextChoices
from django.utils.translation import gettext_lazy as _


if TYPE_CHECKING:
    from uuid import UUID


class Role(Model):
    class RoleChoices(TextChoices):
        USER = "Пользователь", _("User")
        ADMIN = "Администратор", _("Admin")

    uuid: UUIDField[UUID, UUID] = UUIDField(
        primary_key=True,
        default=uuid4
    )

    role: CharField[str, str] = CharField(
        verbose_name="Наименование роли",
        max_length=20,
        choices=RoleChoices.choices,
        default=RoleChoices.USER
    )

    @override
    def __str__(self) -> str:
        return self.role
    
    class Meta:
        db_table = '"identity"."role"'
        default_related_name = 'role'

    