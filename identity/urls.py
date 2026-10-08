from django.urls import path, include
from rest_framework.routers import BaseRouter
from .views import UserResponse


urlpatterns = [
    path("user/<uuid>", UserResponse.as_view(), name="with uuid"),
]