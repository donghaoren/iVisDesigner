from ivapp.models import Dataset, Visualization

from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import filters
from rest_framework import permissions
from rest_framework.permissions import IsAuthenticated, IsAdminUser, DjangoModelPermissionsOrAnonReadOnly
from ivapp.serializers import DatasetSerializer, DatasetSerializer_List
from ivapp.serializers import VisualizationSerializer, VisualizationSerializer_List
from ivapp.serializers import UserSerializer

from django.contrib.auth import authenticate, login, logout

from helpers import ListDetailViewSet, IsAdminUserOrReadOnly, IsOwnerOrReadOnly

class DatasetViewSet(ListDetailViewSet):
    permission_classes = (IsAdminUserOrReadOnly, )
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
    serializer_list_class = DatasetSerializer_List

class VisualizationViewSet(ListDetailViewSet):
    permission_classes = (IsOwnerOrReadOnly, )
    queryset = Visualization.objects.all()
    serializer_class = VisualizationSerializer
    serializer_list_class = VisualizationSerializer_List
    filter_backends = (filters.DjangoFilterBackend, filters.OrderingFilter)
    filter_fields = ('user', 'dataset')
    ordering = "-created_at"

class UserViewSet(viewsets.ModelViewSet):
    permission_classes = (DjangoModelPermissionsOrAnonReadOnly, )
    queryset = User.objects.all()
    serializer_class = UserSerializer
