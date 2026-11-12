from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("identity", "0005_alter_user_role"),
    ]

    operations = [
        migrations.AlterField(
            model_name="role",
            name="role",
            field=models.CharField(
                max_length=20,
                choices=[
                    ("Пользователь", "User"),
                    ("Администратор", "Admin"),
                ],
                default="Пользователь",
                verbose_name="Наименование роли",
            ),
        ),
    ]
