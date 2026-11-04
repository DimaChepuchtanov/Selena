from django.contrib.auth import login
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.shortcuts import render
from rest_framework.views import APIView

from identity.forms import RegisterForm, LoginForm

from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.http import require_GET


@require_GET
def csrf_view(request):
    return JsonResponse({
        "csrfToken": get_token(request)
    })


class IdentityUser(APIView):
    def get(self, request, *args, **kwargs):
        form = RegisterForm()
        return render(request, "auth.html", {"form": form})


def context(login_form=None, register_form=None, initial_tab="login"):
    return {"login_form": login_form or LoginForm(), "register_form": register_form or RegisterForm(), "initial_tab": initial_tab}


@require_http_methods(["GET", "POST"])
def login_view(request):
    if request.method == "POST":
        form = LoginForm(request.POST, request=request)
        if form.is_valid():
            login(request, form.get_user())
            if not form.cleaned_data["remember"]:
                request.session.set_expiry(0)
            return redirect("/profile/")
        return render(request, "auth.html", context(login_form=form, initial_tab="login"), status=400)
    return render(request, "auth.html", context(initial_tab="login"))


@require_http_methods(["GET", "POST"])
def register_view(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            print("Form is valid", flush=True)
            user = form.save()
            login(request, user)
            return redirect("/profile/")
        return render(request, "auth.html", context(register_form=form, initial_tab="register"), status=400)
    return render(request, "auth.html", context(initial_tab="register"))