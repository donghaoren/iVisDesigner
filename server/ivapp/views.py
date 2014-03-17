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

from django.db.models import Q

from helpers import ListDetailViewSet, IsAdminUserOrReadOnly, IsOwnerOrReadOnly

class DatasetPermissionClass(permissions.BasePermission):
    """
    Permission class for the datasets.
    Objects: Allow everything for users in the group, if present.
             Allow only safe methods if there no group.
    Normal: Allow only safe methods, except admin.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff: return True
        if obj.group == None:
            return request.method in permissions.SAFE_METHODS
        else:
            return request.user.groups.filter(id = obj.group.id).exists() and request.method in permissions.SAFE_METHODS

    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.user.is_staff: return True

        if request.method in permissions.SAFE_METHODS:
            return True

        return False

class VisualizationPermissionClass(permissions.BasePermission):
    """
    Permission class for the visualizations.
    Objects: Allow everything for users in the group, if present.
             Allow only safe methods if there no group.
    Normal: Allow only safe methods, except admin.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff: return True
        if obj.dataset.group != None:
            if not request.user.groups.filter(id = obj.dataset.group.id).exists():
                return False

        if request.method in permissions.SAFE_METHODS:
            return True

        return obj.user == request.user

    def has_permission(self, request, view):
        if request.user.is_staff:
            return True

        if request.method in permissions.SAFE_METHODS:
            return True

        if request.method == "POST" and not request.user.is_anonymous():
            return True

        if request.method == "DELETE" and not request.user.is_anonymous():
            return True

        return False

class DatasetViewSet(ListDetailViewSet):
    permission_classes = (DatasetPermissionClass, )
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
    serializer_list_class = DatasetSerializer_List
    def filter_queryset(self, queryset):
        # Only show data of which the user has permission.
        if self.request.user.is_staff: return queryset.order_by("-created_at")
        groups = self.request.user.groups.all()
        return queryset.filter(Q(group = None) | Q(group__in = groups)).order_by("-created_at")
    ordering = "-created_at"

class VisualizationViewSet(ListDetailViewSet):
    permission_classes = (VisualizationPermissionClass, )
    queryset = Visualization.objects.all()
    def filter_queryset(self, queryset):
        # Only show visualization with datasets that are visible to the user.
        qs = queryset
        if not self.request.user.is_staff:
            groups = self.request.user.groups.all()
            qs = queryset.filter(Q(dataset__group = None) | Q(dataset__group__in = groups))
            qs = qs.filter(Q(is_private = False) | Q(user = self.request.user))
        return ListDetailViewSet.filter_queryset(self, qs) # User superclass's filter.
    serializer_class = VisualizationSerializer
    serializer_list_class = VisualizationSerializer_List
    filter_backends = (filters.DjangoFilterBackend, filters.OrderingFilter)
    filter_fields = ('user', 'dataset', 'is_autosave')
    ordering = "-created_at"

class UserViewSet(viewsets.ModelViewSet):
    permission_classes = (DjangoModelPermissionsOrAnonReadOnly, )
    queryset = User.objects.all()
    serializer_class = UserSerializer
