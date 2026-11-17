from django.conf import settings
from django.db.models import Prefetch
from django.shortcuts import redirect
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from .models import ProductCard, ProductCatalog, ProductImage


class PagesView(ViewSet):
    def catalog(self, request):
        # Legacy Django URL: the storefront has moved to React.
        return redirect(settings.FRONTEND_ORIGIN.rstrip("/") + "/catalog")


class CatalogView(ViewSet):
    def get_catalog(self, request):
        catalogs = ProductCatalog.objects.all()
        return Response([(cat.id, cat.name) for cat in catalogs])

    def get_current_catalog(self, request, catalog_id):
        products = (
            ProductCard.objects
            .filter(catalog_id=catalog_id, is_published=True)
            .prefetch_related(Prefetch(
                "images",
                queryset=ProductImage.objects.filter(is_primary=True),
                to_attr="primary_images",
            ))
        )
        return Response([
            {
                "uuid": card.uuid,
                "name": card.name,
                "description": card.describe,
                "price": card.price,
                "stock": card.stock,
                "image": (
                    card.primary_images[0].img.url
                    if card.primary_images and card.primary_images[0].img else None
                ),
            }
            for card in products
        ])
