from django import forms
from django.db.models import Q
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError

from identity.models.user import User


class RegisterForm(forms.Form):
    email = forms.EmailField(label='Электронная почта', max_length=100, required=True)
    password = forms.CharField(label='Пароль', widget=forms.PasswordInput, required=True)
    password_confirm = forms.CharField(label='Повторите пароль', widget=forms.PasswordInput, required=True)
    agreement = forms.BooleanField(label="Согласие на обработку персональных данных", required=True)

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()

        if User.objects.filter(
            Q(login__iexact=email)
        ).exists():
            raise forms.ValidationError(
                "Пользователь с таким email уже существует."
            )

        return email

    def clean(self):
        cleaned_data = super().clean()

        password = cleaned_data.get("password")
        password_confirm = cleaned_data.get("password_confirm")

        if password and password_confirm:
            if password != password_confirm:
                self.add_error(
                    "password_confirm",
                    "Пароли не совпадают."
                )

        if password:
            user = User(
                login=cleaned_data.get("email", ""),
            )

            try:
                validate_password(password, user=user)
            except ValidationError as error:
                self.add_error("password", error)

        return cleaned_data

    def save(self):
        if not self.is_valid():
            raise ValueError("Форма содержит ошибки.")

        data = self.cleaned_data

        return User.objects.create_user(
            login=data["email"],
            password=data["password"],
        )


class LoginForm(forms.Form):
    email = forms.EmailField(label="Email")
    password = forms.CharField(widget=forms.PasswordInput, label="Пароль")
    remember = forms.BooleanField(required=False, label="Запомнить меня")

    def __init__(self, *args, request=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.request = request
        self.user = None

    def clean(self):
        data = super().clean()
        if data.get("email") and data.get("password"):
            self.user = authenticate(request=self.request, login=data["email"].strip().lower(), password=data["password"])
            if self.user is None:
                raise forms.ValidationError("Неверный email или пароль")
        return data

    def get_user(self):
        return self.user