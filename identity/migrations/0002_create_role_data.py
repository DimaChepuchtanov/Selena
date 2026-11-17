from django.db import migrations


def insert_roles(apps, schema_editor):
    Role = apps.get_model("identity", "Role")
    alias = schema_editor.connection.alias
    for name in ("Пользователь", "Администратор"):
        Role.objects.using(alias).get_or_create(role=name)


class Migration(migrations.Migration):
    dependencies = [
        ("identity", "0001_create_role_model"),
    ]
    operations = [
        migrations.RunPython(insert_roles, reverse_code=migrations.RunPython.noop),
    ]
