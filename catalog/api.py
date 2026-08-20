from __future__ import annotations

from uuid import UUID
from decimal import Decimal

from django.db import transaction
from django.shortcuts import render
from rest_framework.views import APIView, Request
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.renderers import JSONRenderer
from rest_framework.permissions import (
    IsAuthenticatedOrReadOnly,
)

from .forms import ProductForm
from .models import Product
from .serializes import serialize_product_list, serialize_product, ProductCommentSerializer



class ProductListAPI(APIView):
    """
    METHODS 

    GET - ПОЛУЧЕНИЕ ВСЕХ ПРОДУКТОВ
    """
    renderer_classes = [JSONRenderer]

    def get(self, request: Request) -> Response:
        product_list: list = (
            Product.objects.all().
            order_by('-rating')
        )

        return Response(
            [
                serialize_product_list(product=product)
                for product in product_list
            ],
            status=status.HTTP_200_OK
        )

class ProductCreateAPI(APIView):
    """
    METHODS

    POST - СОЗДАНИЕ КАРТОЧКИ
    """

    renderer_classes = [JSONRenderer]

    def get(self, request: Request):
        return render(
            request=request,
            template_name="catalog/product_create.html",
            context={
                "form": ProductForm,
            },
        )

    @transaction.atomic
    def post(self, request: Request) -> Response:
        # ==== base data ====
    
        title = request.data.get("title")
        description = request.data.get("description")
        price = Decimal(str(request.data.get('price')))
        stock_quantity = int(request.data.get('stock_quantity'))

        print(title, description, price, stock_quantity)
        if not all([title, description, price, stock_quantity]):
            return Response(
                data="Не указан один из обязательных параметров",
                status=status.HTTP_400_BAD_REQUEST
            )
    
        if price < 0 or stock_quantity < 0:
            return Response(
                data="Не указана корректная цена или количество товара",
                status=status.HTTP_400_BAD_REQUEST
            )

        print('here', flush=True)
        product = Product.objects.create(
            title=title,
            description=description,
            price=price,
            stock_quantity=stock_quantity
        )
    
        return Response(
            data=serialize_product(product=product),
            status=status.HTTP_201_CREATED
        )

class ProductCardAPI(APIView):
    """
    METHODS

    GET - ПОЛУЧЕНИЕ КОНКРЕТНОЙ КАРТОЧКИ
    PATCH - ОБНОВЛЕНИЕ КАРТОЧКИ
    DELETE - УДАЛЕНИЕ КАРТОЧКИ
    """
    edit_fields = ("title", "description", "rating", "price", "stock_quantity")
    renderer_classes = [JSONRenderer]

    form = ProductForm()

    def get(self, request: Request, product_uuid: UUID) -> Response:
        product = get_object_or_404(
            Product,
            uuid=product_uuid
        )

        return render(
            request=request,
            template_name="catalog/product.html",
                context={
                    "product": product,
                },
            )

    @transaction.atomic
    def patch(self, request: Request, product_uuid: UUID) -> Response:
        product = get_object_or_404(
            klass=Product,
            uuid=product_uuid
        )

        for key in self.edit_fields:
            if key in request.data:
                setattr(product, key, request.data[key])

        product.save(
            update_fields=[
                key
                for key in self.edit_fields
                if key in request.data
            ]
        )

        return Response(
            data=serialize_product(product=product),
            status=status.HTTP_202_ACCEPTED
        )

    @transaction.atomic
    def delete(self, request: Request, product_uuid: UUID) -> Response:
        product = get_object_or_404(
            klass=Product,
            uuid=product_uuid
        )

        product.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


class ProductCommentListCreateAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (
        IsAuthenticatedOrReadOnly,
    )

    def get(
        self,
        request: Request,
        product_uuid: UUID,
    ) -> Response:
        product: Product = get_object_or_404(
            Product,
            uuid=product_uuid,
        )

        comments = (
            product.comments
            .all()
        )

        serializer = ProductCommentSerializer(
            comments,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def post(
        self,
        request: Request,
        product_uuid: UUID,
    ) -> Response:
        product = get_object_or_404(
            Product,
            uuid=product_uuid,
        )

        serializer = ProductCommentSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        serializer.save(
            product=product,
            author=request.user,
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )
        


        
