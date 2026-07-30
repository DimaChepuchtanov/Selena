from django.forms import ModelForm, TextInput, PasswordInput, EmailInput, EmailField
from django.contrib.auth.forms import UserCreationForm

from .models import User


class UserForm(ModelForm):
    class Meta:
        model = User

        fields = (
            "email",
            "password",
        )

        widgets = {
            "email": TextInput(
                attrs={
                    "placeholder": "Почта",
                },
            ),
            "password": PasswordInput(
                attrs={
                    "placeholder": "Пароль",
                },
            )
        }


class CreateUserForm(UserCreationForm):
    email: str = EmailField(required=True)

    USERNAME_FIELD = 'email'

    class Meta:
        model = User
        fields = ('email', 'password1', 'password2')