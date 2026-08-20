from __future__ import annotations

from typing import Any

from rest_framework import serializers
from .models import Product, Comment


def serialize_product_list(product: Product) -> dict[str, Any]:
    return {
        "uuid": str(product.uuid),
        "title": product.title,
        "description": product.description[:250] + '...',
        "rating": product.rating,
        "price": str(product.price),
        "stock_quantity": product.stock_quantity,
        "created_at": product.created_at.isoformat(),
    }


def serialize_product(product: Product) -> dict[str, Any]:
    return {
            "uuid": str(product.uuid),
            "title": product.title,
            "description": product.description,
            "rating": product.rating,
            "price": str(product.price),
            "stock_quantity": product.stock_quantity,
            "created_at": product.created_at.isoformat(),
        }


class ProductCommentSerializer(
    serializers.ModelSerializer,
):
    author = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = (
            "author",
            "text",
            "rating",
            "created_at",
        )

        read_only_fields = (
            "author",
            "created_at",
        )

    def get_author(
        self,
        obj: Comment,
    ) -> str:
        full_name = obj.author.email

        if full_name:
            return full_name

        return obj.author.get_username()

    def validate_text(
        self,
        value: str,
    ) -> str:
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Комментарий не может быть пустым."
            )

        return value