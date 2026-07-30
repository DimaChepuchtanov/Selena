from django.urls import path

from .api import (
    ProductCardAPI,
    ProductListAPI,
    ProductCreateAPI,
    ProductCommentListCreateAPIView
)


app_name = "catalog"


urlpatterns = [
    path(
        "products/",
        ProductListAPI.as_view(),
        name="product-list",
    ),
    path(
        "products/<uuid:product_uuid>/",
        ProductCardAPI.as_view(),
        name="product-detail",
    ),
    path(
        route='products/add',
        view=ProductCreateAPI.as_view(),
        name='product-create'
    ),
    path(
        "products/<uuid:product_uuid>/comments/",
        ProductCommentListCreateAPIView.as_view(),
        name="product-comments",
    ),
]