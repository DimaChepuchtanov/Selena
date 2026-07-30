from django.urls import path

from .views import (
    UserListAPI,
    UserAPI,
    UserCreateAPI
)


app_name = "user"


urlpatterns = [
    path(
        "users/",
        UserListAPI.as_view(),
        name="users-list",
    ),
    path(
        route="users/<uuid:uuid>",
        view=UserAPI.as_view(),
        name="users-detail"
    ),
    path(
        route="users/new",
        view=UserCreateAPI.as_view(),
        name="user-new"
    )
]