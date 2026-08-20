from __future__ import annotations

import random
import string
from typing import override
from uuid import UUID, uuid4
from datetime import datetime

from django.contrib.auth.models import AbstractBaseUser
from django.db.models import (
    UUIDField,
    EmailField,
    DateTimeField,
    BooleanField,
    CharField,
    ForeignKey,
    Manager,
    QuerySet,
    DO_NOTHING
)

from . import UserRole


class UserQuerySet(QuerySet):
    def get_user(self, uuid: UUID) -> UserQuerySet:
        return self.filter(uuid=uuid)

    def all(self) -> UserQuerySet:
        return self


class UserManager(Manager['User']): 
    @override
    def get_queryset(self) -> UserQuerySet:
        return UserQuerySet(model=self.model, using=self._db)

    def get_user(self, uuid: UUID) -> UserQuerySet:
        return self.get_queryset().get_user(uuid=uuid)

    def all(self) -> UserQuerySet:
        return self.get_queryset().all()


class User(AbstractBaseUser):
    def generate_code() -> str:
        characters = string.ascii_letters + string.digits
        code = ''.join(random.choices(characters, k=4))
        return code

    uuid: UUIDField[UUID, UUID] = UUIDField(
        verbose_name="Уникальный номер пользователя",
        editable=False,
        primary_key=True,
        default=uuid4
    )

    email: EmailField[str, str] = EmailField(
        verbose_name="Почта пользователя",
        unique=True
    )

    is_verification: BooleanField[bool, bool] = BooleanField(
        verbose_name="Верифицирован ли пользователь",
        default=False
    )

    verification_code: CharField[int, int] = CharField(
        verbose_name="Верификационный код",
        default=generate_code,
        max_length=255
    )

    tg: CharField[str, str] = CharField(
        verbose_name="Телеграмм_аккаунт",
        max_length=255,
        null=True,
        blank=True,
        default=''
    )

    role: ForeignKey[UserRole, UserRole] = ForeignKey(
        to=UserRole,
        verbose_name="Роль пользователя",
        on_delete=DO_NOTHING,
        default=UUID("f469ac4d-ade8-4acf-91c9-5e8f474a9295"),
        null=True
    )

    created_at: DateTimeField[datetime, datetime] =DateTimeField(
        verbose_name="Дата создания аккаунта",
        auto_now_add=True
    )

    objects = UserManager()

    USERNAME_FIELD = 'email' # Поле для аутентификации (вместо username)

    class Meta:
        db_table = "user"
        default_related_name = "user"


