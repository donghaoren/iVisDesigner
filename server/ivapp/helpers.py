from rest_framework import viewsets
from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
import base64

class ListDetailViewSet(viewsets.ModelViewSet):
    def list(self, request, *args, **kwargs):
        self.object_list = self.filter_queryset(self.get_queryset())
        # Switch between paginated or standard style responses
        page = self.paginate_queryset(self.object_list)
        if page is not None:
            serializer = self.get_pagination_serializer(page)
        else:
            serializer = self.get_serializer(self.object_list, many=True, is_list=True)

        return Response(serializer.data)

    def get_pagination_serializer(self, page):
        """
        Return a serializer instance to use with paginated data.
        """
        class SerializerClass(self.pagination_serializer_class):
            class Meta:
                object_serializer_class = self.serializer_list_class

        pagination_serializer_class = SerializerClass
        context = self.get_serializer_context()
        return pagination_serializer_class(instance=page, context=context)

    def get_serializer(self, instance=None, data=None,
                       files=None, many=False, partial=False, is_list=False):
        """
        Return the serializer instance that should be used for validating and
        deserializing input, and for serializing output.
        """
        serializer_class = self.get_serializer_class()
        if is_list: serializer_class = self.serializer_list_class
        context = self.get_serializer_context()
        return serializer_class(instance, data=data, files=files,
                                many=many, partial=partial, context=context)

class IsAdminUserOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.user.is_staff: return True

        if request.method in permissions.SAFE_METHODS:
            return True

        return False

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.user.is_staff: return True

        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the snippet
        return obj.user == request.user

#@api_view(['POST', ])
#@permission_classes((AllowAny, ))
@csrf_exempt
def download(request):
    content = request.POST['content']
    mimetype = request.POST['mimetype']
    filename = request.POST['filename']
    encoding = request.POST['encoding']
    if encoding == "base64":
        content = base64.b64decode(content)
    response = HttpResponse(content, content_type = mimetype)
    response['Content-Disposition'] = 'attachment; filename="%s"' % filename
    return response
