from __future__ import annotations

from typing import TYPE_CHECKING, override, ClassVar
from uuid import uuid4

from django.contrib.auth.base_user import BaseUserManager
from django.db.models import UUIDField, EmailField, ForeignKey, PROTECT, Manager, QuerySet
from django.contrib.auth.models import AbstractBaseUser
from django.utils.translation import gettext_lazy as _

from .role import Role


if TYPE_CHECKING:
    from uuid import UUID


class UserQuerySet(QuerySet['User']):
    def get_user(self, uuid: UUID) -> UserQuerySet:
        return self.get(uuid=uuid)

    def get_users(self) -> UserQuerySet:
        return self.all()

    def create_user(self, login: str, password: str, **extra_fields) -> User:
        if "role" not in extra_fields:
            extra_fields["role"] = Role.objects.get(
                role=Role.RoleChoices.USER
            )
        user = self.model(login=login, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user


class UserManager(BaseUserManager['User']):
    @override
    def get_queryset(self) -> UserQuerySet:
        return UserQuerySet(model=self.model, using=self._db)

    def get_user(self, uuid: UUID) -> UserQuerySet:
        return self.get_queryset().get_user(uuid=uuid)

    def get_users(self) -> UserQuerySet:
        return self.get_queryset().get_users()

    def create_user(self, login: str, password: str, **extra_fields) -> User:
        return self.get_queryset().create_user(login=login, password=password, **extra_fields)


class User(AbstractBaseUser):
    uuid: UUIDField[UUID, UUID] = UUIDField(
        verbose_name=_("Уникальный номер пользователя"),
        primary_key=True,
        editable=False,
        default=uuid4
    )

    login: EmailField[str, str] = EmailField(
        verbose_name=_("Логин пользователя"),
        unique=True,
        max_length=250
    )

    role: ForeignKey[Role, Role] = ForeignKey(
        to=Role,
        on_delete=PROTECT
    )

    objects: ClassVar[UserManager] = UserManager()

    USERNAME_FIELD = 'login'

    class Meta:
        db_table = '"identity"."users"'
        