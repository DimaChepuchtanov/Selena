from django.urls import path
from .views import CatalogView, PagesView


urls = [
    path("catalog/", PagesView.as_view({'get': 'catalog'}), name="catalog"),
    path("api/catalog/", CatalogView.as_view({'get': 'get_catalog'}), name="catalog-all"),
    path("api/catalog/<int:catalog_id>", CatalogView.as_view({'get': 'get_current_catalog'}), name='catalog-current')
]