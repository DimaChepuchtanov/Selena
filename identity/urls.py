from django.urls import path
from .views import login_view, register_view


app_name = "identity"

urlpatterns = [
    path("auth/", login_view, name="login"),
    path("reg/", register_view, name="register"),
]