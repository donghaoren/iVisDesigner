from django.contrib.auth.models import User, Group
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from ivapp.serializers import UserSerializer

from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view, permission_classes
from django.utils.decorators import method_decorator
from django.http import HttpResponseForbidden, HttpResponse
from django.contrib.auth.forms import UserCreationForm
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie

import json

@api_view(['POST', 'GET'])
@permission_classes((AllowAny, ))
def current_user(request):
    if request.user.is_anonymous():
        return Response({"anonymous": "true"})
    else:
        return Response(UserSerializer(request.user).data)

def MyResponse(s):
    return HttpResponse(json.dumps(s))

@permission_classes((AllowAny, ))
@csrf_exempt
@ensure_csrf_cookie
def register_view(request):
    if request.method == 'POST':
        fm = UserCreationForm(request.POST)
        if fm.is_valid():
            user = fm.save()
            g = Group.objects.get(name = 'normal')
            g.user_set.add(user)
            return MyResponse({"status":"success"})
        else:
            return MyResponse({"status":"E_FAILED"})
    return MyResponse({"status":"E_INVALID"})

@permission_classes((IsAuthenticated, ))
def logout_view(request):
    logout(request)
    return MyResponse({"status":"success"})

@csrf_exempt
@ensure_csrf_cookie
@permission_classes((AllowAny, ))
def login_view(request):
    if request.method == 'POST':
        if 'username' in request.POST and 'password' in request.POST:
            username = request.POST['username']
            password = request.POST['password']
            user = authenticate(username = username, password = password)
            if user is not None:
                if user.is_active:
                    login(request, user)
                    return MyResponse({"status":"success"})
                else:
                    return MyResponse({"status":"E_INACTIVE"})
            else:
                return MyResponse({"status":"E_DENIED"})
    return MyResponse({"status":"E_INVALID"})
