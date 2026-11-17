from django.urls import path
from .admin_api import (
    AdminMe, CatalogCollection, CatalogItem,
    ProductCollection, ProductItem, ProductImages, ProductImageItem,
)

urlpatterns = [
    path('me/', AdminMe.as_view(), name='selena-admin-me'),
    path('catalogs/', CatalogCollection.as_view(), name='selena-admin-catalogs'),
    path('catalogs/<int:catalog_id>/', CatalogItem.as_view(), name='selena-admin-catalog'),
    path('products/', ProductCollection.as_view(), name='selena-admin-products'),
    path('products/<uuid:product_id>/', ProductItem.as_view(), name='selena-admin-product'),
    path('products/<uuid:product_id>/images/', ProductImages.as_view(), name='selena-admin-images'),
    path('products/<uuid:product_id>/images/<int:image_id>/', ProductImageItem.as_view(), name='selena-admin-image'),
]
