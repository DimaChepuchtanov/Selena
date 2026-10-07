from django.shortcuts import render

# Create your views here.
def main_page(request):
    return render(request, "main_page.html")

def about_drawer(request):
    pass

def delivery_page(request):
    pass