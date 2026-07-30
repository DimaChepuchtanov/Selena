from __future__ import annotations

from uuid import UUID
from typing import override

from django.utils.translation import gettext_lazy
from django.db.models import UUIDField, Model, IntegerField, IntegerChoices


class NameRole(IntegerChoices):
    USER_ROLE = 1, gettext_lazy('Простой пользователь') # f469ac4d-ade8-4acf-91c9-5e8f474a9295
    ADMIN_ROLE = 2, gettext_lazy("Администратор") # 00d136c0-6678-4ce4-83b2-d41132808356
    

class UserRole(Model):
    uuid: UUIDField[UUID, UUID] = UUIDField(
        verbose_name="Уникальный номер роли",
        primary_key=True,
        editable=False
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