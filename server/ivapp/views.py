from ivapp.models import Dataset, Visualization

from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from rest_framework.response import Response
from ivapp.serializers import DatasetSerializer, DatasetSerializer_List
from ivapp.serializers import VisualizationSerializer, VisualizationSerializer_List
from ivapp.serializers import UserSerializer

from django.contrib.auth import authenticate, login

class ListDetailViewSet(viewsets.ModelViewSet):
    def list(self, request):
        serializer = self.serializer_list_class(self.queryset, many=True)
        return Response(serializer.data)

class DatasetViewSet(ListDetailViewSet):
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
    serializer_list_class = DatasetSerializer_List

class VisualizationViewSet(ListDetailViewSet):
    queryset = Visualization.objects.all()
    serializer_class = VisualizationSerializer
    serializer_class_list = VisualizationSerializer_List

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

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
            return HttpResponse("Success.")
        else:
            return HttpResponse("Failed.")
    return HttpResponseForbidden()

@csrf_exempt
def logout_view(request):
    logout(request)

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
                    return HttpResponse("Login Success!")
                else:
                    return HttpResponseForbidden("User is no longer active.")
            else:
                return HttpResponseForbidden("Login failed.")
    return HttpResponseForbidden()
