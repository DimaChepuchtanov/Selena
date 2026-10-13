from rest_framework import serializers

from identity.models import User


class UserSerializer(serializers.Serializer):
    login = serializers.EmailField(max_length=250)
    password = serializers.CharField(max_length=250)
    