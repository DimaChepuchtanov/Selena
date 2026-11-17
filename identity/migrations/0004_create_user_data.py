from django.db import migrations


class Migration(migrations.Migration):
    # Legacy migration once created accounts with plaintext passwords.
    # Do not seed insecure credentials in new installations.
    dependencies = [
        ("identity", "0003_create_user_model"),
    ]
    operations = [
        migrations.RunPython(migrations.RunPython.noop),
    ]
