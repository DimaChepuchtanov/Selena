from __future__ import annotations

from uuid import UUID
from typing import override
from uuid import uuid4

from django.utils.translation import gettext_lazy
from django.db.models import UUIDField, Model, IntegerField, IntegerChoices


class NameRole(IntegerChoices):
    USER_ROLE = 1, gettext_lazy('Простой пользователь')
    ADMIN_ROLE = 2, gettext_lazy("Администратор")
    

class UserRole(Model):
    uuid: UUIDField[UUID, UUID] = UUIDField(
        verbose_name="Уникальный номер роли",
        primary_key=True,
        editable=False,
        default=uuid4
    )

    name: IntegerField[int, int] = IntegerField(
        verbose_name="Название роли",
        default=NameRole.USER_ROLE,
        choices=NameRole.choices,
    )

    @override
    def __str__(self) -> str:
        return f"{self.get_name_display()}"

    class Meta:
        db_table = "role"
        default_related_name = "role"