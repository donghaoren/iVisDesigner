from ivapp.models import Dataset, Visualization

from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissionsOrAnonReadOnly
from ivapp.serializers import DatasetSerializer, DatasetSerializer_List
from ivapp.serializers import VisualizationSerializer, VisualizationSerializer_List
from ivapp.serializers import UserSerializer

from django.contrib.auth import authenticate, login, logout

from helpers import ListDetailViewSet

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.user.is_superuser: return True

        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the snippet
        return obj.user == request.user

class DatasetViewSet(ListDetailViewSet):
    permission_classes = (DjangoModelPermissionsOrAnonReadOnly, )
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
    serializer_list_class = DatasetSerializer_List

class VisualizationViewSet(ListDetailViewSet):
    permission_classes = (IsOwnerOrReadOnly, )
    queryset = Visualization.objects.all()
    serializer_class = VisualizationSerializer
    serializer_list_class = VisualizationSerializer_List

class UserViewSet(viewsets.ModelViewSet):
    permission_classes = (DjangoModelPermissionsOrAnonReadOnly, )
    queryset = User.objects.all()
    serializer_class = UserSerializer

from rest_framework.decorators import api_view, permission_classes


@api_view(['GET'])
@permission_classes((IsAuthenticated, ))
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

from django.http import HttpResponseForbidden, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.forms import UserCreationForm

@csrf_exempt
def register_view(request):
    if request.method == 'POST':
        fm = UserCreationForm(request.POST)
        if fm.is_valid():
            user = fm.save()
            g = Group.objects.get(name = 'normal')
            g.user_set.add(user)
            return HttpResponse('{"status":"success"}')
        else:
            return HttpResponse('{"status":"E_FAILED"}')
    return HttpResponseForbidden()

@csrf_exempt
def logout_view(request):
    logout(request)
    return HttpResponse('{"status":"success"}')

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        if 'username' in request.POST and 'password' in request.POST:
            username = request.POST['username']
            password = request.POST['password']
            user = authenticate(username = username, password = password)
            if user is not None:
                if user.is_active:
                    login(request, user)
                    return HttpResponse('{"status":"success"}')
                else:
                    return HttpResponse('{"status":"E_INACTIVE"}')
            else:
                return HttpResponse('{"status":"E_DENIED"}')
    return HttpResponseForbidden()
