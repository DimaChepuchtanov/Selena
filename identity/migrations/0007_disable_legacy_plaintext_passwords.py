from django.contrib.auth.hashers import make_password
from django.db import migrations


def disable_plaintext_passwords(apps, schema_editor):
    User = apps.get_model("identity", "User")
    alias = schema_editor.connection.alias
    for login, plaintext in (
        ("root@mail.ru", "root"),
        ("user@mail.ru", "user"),
    ):
        User.objects.using(alias).filter(
            login=login,
            password=plaintext,
        ).update(password=make_password(None))


class Migration(migrations.Migration):
    dependencies = [
        ("identity", "0006_role_max_length"),
    ]
    operations = [
        migrations.RunPython(disable_plaintext_passwords, reverse_code=migrations.RunPython.noop),
    ]
