from django.contrib.auth import login, logout
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import redirect, render
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from identity.forms import LoginForm, RegisterForm


def accepts_json(request):
    return "application/json" in request.headers.get("Accept", "")


@require_GET
def csrf_view(request):
    return JsonResponse({"csrfToken": get_token(request)})


@require_GET
def current_user_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Authentication required."}, status=401)

    user = request.user
    return JsonResponse({
        "uuid": str(user.pk),
        "login": user.login,
        "email": user.login,
        "role": user.role.role,
    })


def page_context(login_form=None, register_form=None, initial_tab="login"):
    return {
        "login_form": login_form if login_form is not None else LoginForm(),
        "register_form": register_form if register_form is not None else RegisterForm(),
        "initial_tab": initial_tab,
    }


@require_http_methods(["GET", "POST"])
def login_view(request):
    if request.method == "GET":
        return render(request, "auth.html", page_context(initial_tab="login"))

    form = LoginForm(request.POST, request=request)
    if form.is_valid():
        login(request, form.get_user())
        if not form.cleaned_data["remember"]:
            request.session.set_expiry(0)
        if accepts_json(request):
            return JsonResponse({"ok": True})
        return redirect("/profile/")

    if accepts_json(request):
        return JsonResponse({"ok": False, "errors": form.errors.get_json_data()}, status=400)
    return render(request, "auth.html", page_context(login_form=form), status=400)


@require_http_methods(["GET", "POST"])
def register_view(request):
    if request.method == "GET":
        return render(request, "auth.html", page_context(initial_tab="register"))

    form = RegisterForm(request.POST)
    if form.is_valid():
        user = form.save()
        login(request, user)
        if accepts_json(request):
            return JsonResponse({"ok": True})
        return redirect("/profile/")

    if accepts_json(request):
        return JsonResponse({"ok": False, "errors": form.errors.get_json_data()}, status=400)
    return render(request, "auth.html", page_context(register_form=form, initial_tab="register"), status=400)


@require_POST
def logout_view(request):
    logout(request)
    if accepts_json(request):
        return JsonResponse({"ok": True})
    return redirect("/user/auth/")
