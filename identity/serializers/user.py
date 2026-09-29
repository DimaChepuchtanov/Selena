from rest_framework import serializers

from identity.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('uuid', 'login', 'is_active')
