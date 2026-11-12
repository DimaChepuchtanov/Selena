from django.urls import path
from .views import profile_page


urls = [
    path("profile/", profile_page, name="profile"),
]