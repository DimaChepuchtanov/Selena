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
        current_catalog = ProductCard.objects.filter(catalog=catalog_id, is_published=True)
        return Response(data=[
            (card.id, card.title, card.price, card.stock)
            for card
            in current_catalog
        ]
        )

