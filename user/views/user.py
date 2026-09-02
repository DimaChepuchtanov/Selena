from __future__ import annotations

from typing import List
from uuid import UUID

from django.shortcuts import render
from django.db import transaction
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_204_NO_CONTENT,
)
from rest_framework.views import APIView, Request
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import login
from django.shortcuts import redirect

from user.models.role import NameRole, UserRole

from ..models import User
from ..serializes import serialize_user
from ..forms import UserForm, CreateUserForm


DEFAULT_ROLE_UUID = UUID(
    "f469ac4d-ade8-4acf-91c9-5e8f474a9295"
)

class UserListAPI(APIView):
    """
    METHODS

    GET - список пользователей
    """

    renderer_classes = [JSONRenderer]

    def get(self, request: Request) -> Response:
        users: List[User] = User.objects.all()

        return Response(
            data=[
                serialize_user(user=user)
                for user in users
            ],
            status=HTTP_200_OK
        )


class UserAPI(APIView):
    """
    METHODS
    
    GET - учетные данные пользователя
    PATH - изменение учетных данных пользователя
    DELETE - удаление учетной записи пользователя
    """

    renderer_classes = [JSONRenderer]

    form = UserForm

    def get(self, request: Request, uuid: str) -> Response:
        user: User = get_object_or_404(
           klass=User,
           uuid=uuid
        )

        return Response(
            data=serialize_user(user=user),
            status=HTTP_200_OK
        )

    # def patch(self, request: Response, uuid: str) -> Response:
    #     user: User = get_object_or_404(
    #         klass=User,
    #         uuid=uuid
    #     )

    def delete(self, request: Request, uuid: str) -> Response:
        user: User = get_object_or_404(
            klass=User,
            uuid=uuid
        )

        user.delete()

        return Response(
            status=HTTP_204_NO_CONTENT
        )


class UserCreateAPI(APIView):
    """METHOD
    
    post - создание нового пользователя
    """

    form = CreateUserForm

    def get(self, request: Request) -> Response:
        return render(
            request=request,
            template_name="user.html",
            context={
                "form": CreateUserForm,
            },
        )

    @transaction.atomic
    def post(self, request: Request) -> Response:

        create_form = CreateUserForm(request.POST)

        if create_form.is_valid():
            user = create_form.save(commit=False)
            role, _ = UserRole.objects.get_or_create(
                uuid=DEFAULT_ROLE_UUID,
                defaults={"name": NameRole.USER_ROLE},
            )

            user.role = role
            user.save()

            login(request, user)
            return redirect('/')
            

__all__ = ["UserAPI", "UserCreateAPI", "UserListAPI"]
