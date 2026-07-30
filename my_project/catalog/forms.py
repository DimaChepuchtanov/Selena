from django.forms import ModelForm, NumberInput, TextInput, Textarea

from .models import Product


class ProductForm(ModelForm):
    class Meta:
        model = Product

        fields = (
            "title",
            "description",
            "price",
            "stock_quantity",
        )

        widgets = {
            "title": TextInput(
                attrs={
                    "placeholder": "Название товара",
                },
            ),
            "description": Textarea(
                attrs={
                    "placeholder": "Описание товара",
                    "rows": 5,
                },
            ),
            "price": NumberInput(
                attrs={
                    "min": 0,
                    "step": 0.01,
                },
            ),
            "stock_quantity": NumberInput(
                attrs={
                    "min": 0,
                },
            ),
        }

