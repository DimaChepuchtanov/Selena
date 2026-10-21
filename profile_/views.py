from django.shortcuts import render, redirect

# Create your views here.
def profile_page(request):
    if request.user.is_authenticated:
        return render(request, "profile.html")
    return redirect('/user/auth')