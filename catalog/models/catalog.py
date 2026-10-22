from __future__ import annotations

from django.db.models import Model, BigAutoField, CharField



class ProductCatalog(Model):
    id = BigAutoField(
        primary_key=True,
        verbose_name="Уникальный номер каталога",
    )

    name: CharField[str, str] = CharField(
        verbose_name="Наименование каталога",
        max_length=255
    )

    def __str__(self) -> str:
        return self.name[:20]


    class Meta:
        db_table = '"product"."catalog"'