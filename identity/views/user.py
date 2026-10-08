from uuid import UUID

from rest_framework.views import APIView, Response

from identity.serializers import UserSerializer
from rest_framework.permissions import AllowAny
from identity.models import User


class UserResponse(APIView):
    serializer_class = UserSerializer

    def get(self, request, *args, **kwargs):

        uuid = UUID(self.kwargs['uuid'])

        user = User.objects.get_user(uuid=uuid)

        return Response(data=UserSerializer(user).data)

