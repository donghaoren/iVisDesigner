from rest_framework import viewsets
from rest_framework.response import Response

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
