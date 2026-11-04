from django.views import View
from django.shortcuts import render
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response

from .models import ProductCatalog, ProductCard


class PagesView(ViewSet):
    def catalog(self, request):
        return render(request, 'catalog.html')


class CatalogView(ViewSet):
    def get_catalog(self, request):
        catalog = ProductCatalog.objects.all()
        return Response(data=[(cat.id, cat.name) for cat in catalog])

    def get_current_catalog(self, request, catalog_id):
        current_catalog = ProductCard.objects.filter(
            catalog_id=catalog_id,
            is_published=True
        )

        result = []

        for card in current_catalog:
            main_image = card.images.filter(is_primary=True).first()

            result.append({
                "uuid": card.uuid,
                "name": card.name,
                "price": card.price,
                "stock": card.stock,
                "image": main_image.img.url if main_image else None
            })

        return Response(data=result)

