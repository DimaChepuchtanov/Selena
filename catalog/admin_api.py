"""Selena Znaju: private management endpoints for catalogs, cards, images."""
from django.db import transaction
from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView

from identity.models.role import Role
from .models import ProductCatalog, ProductCard, ProductImage
from .admin_serializers import (
    CatalogSerializer, ProductWriteSerializer, AdminProductSerializer, UploadImageSerializer,
)


class IsSelenaAdmin(BasePermission):
    message = 'Доступ разрешён только пользователям с ролью администратора.'

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and
            getattr(getattr(user, 'role', None), 'role', None) == Role.RoleChoices.ADMIN
        )


class AdminAPIView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsSelenaAdmin]


class AdminMe(AdminAPIView):
    def get(self, request):
        return Response({'login': request.user.login, 'role': request.user.role.role})


class CatalogCollection(AdminAPIView):
    def get(self, request):
        qs = ProductCatalog.objects.annotate(product_count=Count('productcard')).order_by('id')
        return Response(CatalogSerializer(qs, many=True).data)

    def post(self, request):
        name = str(request.data.get('name') or '').strip()
        if not name or len(name) > 255:
            return Response({'name': ['Название: от 1 до 255 символов.']}, status=400)
        if ProductCatalog.objects.filter(name__iexact=name).exists():
            return Response({'name': ['Такой каталог уже существует.']}, status=400)
        item = ProductCatalog.objects.create(name=name)
        return Response(CatalogSerializer(item).data, status=201)


class CatalogItem(AdminAPIView):
    def patch(self, request, catalog_id):
        catalog = get_object_or_404(ProductCatalog, pk=catalog_id)
        name = str(request.data.get('name') or '').strip()
        if not name or len(name) > 255:
            return Response({'name': ['Название: от 1 до 255 символов.']}, status=400)
        if ProductCatalog.objects.filter(name__iexact=name).exclude(pk=catalog.pk).exists():
            return Response({'name': ['Такой каталог уже существует.']}, status=400)
        catalog.name = name
        catalog.save(update_fields=['name'])
        return Response(CatalogSerializer(catalog).data)

    def delete(self, request, catalog_id):
        catalog = get_object_or_404(ProductCatalog, pk=catalog_id)
        if ProductCard.objects.filter(catalog=catalog).exists():
            return Response({'detail': 'Нельзя удалить каталог с товарами. Сначала перенесите товары.'}, status=409)
        catalog.delete()
        return Response(status=204)


class ProductCollection(AdminAPIView):
    def get(self, request):
        qs = ProductCard.objects.select_related('catalog').prefetch_related('images').order_by('-created_at')
        catalog_id = request.query_params.get('catalog')
        if catalog_id:
            qs = qs.filter(catalog_id=catalog_id)
        return Response(AdminProductSerializer(qs, many=True).data)

    def post(self, request):
        serializer = ProductWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response(AdminProductSerializer(product).data, status=201)


class ProductItem(AdminAPIView):
    def get(self, request, product_id):
        product = get_object_or_404(ProductCard.objects.select_related('catalog'), pk=product_id)
        return Response(AdminProductSerializer(product).data)

    def patch(self, request, product_id):
        product = get_object_or_404(ProductCard, pk=product_id)
        serializer = ProductWriteSerializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        product.refresh_from_db()
        return Response(AdminProductSerializer(product).data)

    def delete(self, request, product_id):
        product = get_object_or_404(ProductCard, pk=product_id)
        image_files = [p.img for p in product.images.all() if p.img]
        product.delete()
        for file in image_files:
            file.delete(save=False)
        return Response(status=204)


class ProductImages(AdminAPIView):
    def post(self, request, product_id):
        product = get_object_or_404(ProductCard, pk=product_id)
        serializer = UploadImageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            ProductCard.objects.select_for_update().get(pk=product.pk)
            has_primary = ProductImage.objects.filter(product=product, is_primary=True).exists()
            image = ProductImage.objects.create(
                product=product,
                img=serializer.validated_data['image'],
                is_primary=not has_primary,
            )
        return Response({'id': image.pk, 'url': image.img.url, 'is_primary': image.is_primary}, status=201)


class ProductImageItem(AdminAPIView):
    def patch(self, request, product_id, image_id):
        with transaction.atomic():
            ProductCard.objects.select_for_update().get(pk=product_id)
            image = get_object_or_404(ProductImage, pk=image_id, product_id=product_id)
            if request.data.get('is_primary') is not True:
                return Response({'is_primary': ['Передайте true для выбора обложки.']}, status=400)
            ProductImage.objects.filter(product_id=product_id, is_primary=True).update(is_primary=False)
            image.is_primary = True
            image.save(update_fields=['is_primary'])
        return Response({'id': image.pk, 'url': image.img.url, 'is_primary': True})

    def delete(self, request, product_id, image_id):
        with transaction.atomic():
            ProductCard.objects.select_for_update().get(pk=product_id)
            image = get_object_or_404(ProductImage, pk=image_id, product_id=product_id)
            was_primary = image.is_primary
            file = image.img
            image.delete()
            if was_primary:
                replacement = ProductImage.objects.filter(product_id=product_id).order_by('id').first()
                if replacement:
                    replacement.is_primary = True
                    replacement.save(update_fields=['is_primary'])
        if file:
            file.delete(save=False)
        return Response(status=204)
