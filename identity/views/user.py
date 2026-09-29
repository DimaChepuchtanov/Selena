from rest_framework import viewsets
from identity.models import User
from identity.serializers import UserSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
