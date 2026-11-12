"""Create local-development accounts with hashed, configurable passwords.

These are development fixtures, not production accounts. Existing usable passwords
are intentionally preserved; only missing or disabled test accounts are initialized.
"""
import os

from django.conf import settings
from django.contrib.auth.hashers import is_password_usable, make_password
from django.db import migrations


ADMIN_EMAIL = "root@mail.ru"
USER_EMAIL = "user@mail.ru"


def create_development_users(apps, schema_editor):
    if not settings.DEBUG:
        return

    Role = apps.get_model("identity", "Role")
    User = apps.get_model("identity", "User")
    using = schema_editor.connection.alias

    accounts = (
        (
            ADMIN_EMAIL,
            "Администратор",
            os.environ.get("SELENA_TEST_ADMIN_PASSWORD", "SelenaAdmin-2026!"),
        ),
        (
            USER_EMAIL,
            "Пользователь",
            os.environ.get("SELENA_TEST_USER_PASSWORD", "SelenaUser-2026!"),
        ),
    )

    for login, role_name, password in accounts:
        if not password:
            raise ValueError(f"Empty password for development account {login}")

        role = Role.objects.using(using).get(role=role_name)
        user, created = User.objects.using(using).get_or_create(
            login=login,
            defaults={
                "role_id": role.pk,
                "password": make_password(password),
            },
        )
        if created:
            continue

        changed_fields = []
        if user.role_id != role.pk:
            user.role_id = role.pk
            changed_fields.append("role_id")

        # Older revisions stored un-hashed or disabled test credentials.
        # Never overwrite a deliberately set, usable password on an existing account.
        if not is_password_usable(user.password):
            user.password = make_password(password)
            changed_fields.append("password")

        if changed_fields:
            user.save(using=using, update_fields=changed_fields)


class Migration(migrations.Migration):
    dependencies = [
        ("identity", "0007_disable_legacy_plaintext_passwords"),
    ]

    operations = [
        migrations.RunPython(create_development_users, migrations.RunPython.noop),
    ]
