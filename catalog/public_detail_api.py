from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ProductCard


class PublicProductDetail(APIView):
    permission_classes = [AllowAny]

    def get(self, request, product_id):
        product = get_object_or_404(
            ProductCard.objects.select_related('catalog').prefetch_related('images'),
            pk=product_id,
            is_published=True,
        )
        images = [p.img.url for p in product.images.order_by('-is_primary', 'id') if p.img]
        return Response({
            'uuid': str(product.uuid),
            'name': product.name,
            'describe': product.describe,
            'description': product.describe,
            'full_description': product.describe,
            'price': product.price,
            'stock': product.stock,
            'catalog': product.catalog_id,
            'catalog_name': product.catalog.name,
            'images': images,
        })
