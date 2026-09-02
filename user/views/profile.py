from __future__ import annotations

from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.request import Request


@api_view(["GET"])
def get_profile(request: Request, uuid: str) -> Response:
    # Волидация пользователя

    return render(
        request=request,
        template_name="profile.html",
        context={}
    )