from __future__ import annotations

from django.db.models import Model, IntegerField, CharField



class ProductCatalog(Model):
    id: IntegerField[int, int] = IntegerField(
        verbose_name="Уникальный номер каталога",
        primary_key=True,
        auto_created=True
    )

    name: CharField[str, str] = CharField(
        verbose_name="Наименование каталога",
        max_length=255
    )

    def __str__(self) -> str:
        return self.name[:20]


    class Meta:
        db_table = '"product"."catalog"'