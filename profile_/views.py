from django.conf import settings
from django.shortcuts import redirect


def profile_page(request):
    # Legacy Django URL; the actual profile page is rendered by React.
    target = "/profile" if request.user.is_authenticated else "/auth?next=%2Fprofile"
    return redirect(settings.FRONTEND_ORIGIN.rstrip("/") + target)
