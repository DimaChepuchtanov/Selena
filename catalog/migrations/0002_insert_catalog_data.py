from django.db import migrations


def insert_catalogs(apps, schema_editor):
    ProductCatalog = apps.get_model("catalog", "ProductCatalog")
    alias = schema_editor.connection.alias
    for name in ("Колоды", "Аксессуары"):
        ProductCatalog.objects.using(alias).get_or_create(name=name)


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0001_initial"),
    ]
    operations = [
        migrations.RunPython(insert_catalogs, reverse_code=migrations.RunPython.noop),
    ]
