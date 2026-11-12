from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from django.views.generic import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from catalog.public_detail_api import PublicProductDetail
from catalog.urls import urls as catalog_urls
from identity.views import current_user_view
from profile_.views import profile_page

urlpatterns = [
    path("", RedirectView.as_view(url=settings.FRONTEND_ORIGIN + "/", permanent=False)),
    path("profile/", profile_page),
    path("user/", include("identity.urls")),
    path("api/me/", current_user_view, name="current-user"),
    path("api/manage/", include("catalog.admin_urls")),
    path("api/catalog/products/<uuid:product_id>/", PublicProductDetail.as_view(), name="public-product-detail"),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
] + catalog_urls

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
