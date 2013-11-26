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
from server.config import HMAC_KEY
import hmac
import hashlib

import json

def MyResponse(s):
    return HttpResponse(json.dumps(s))

@api_view(['POST', 'GET'])
@permission_classes((AllowAny, ))
def current_user(request):
    if request.user.is_anonymous():
        return Response({"anonymous": "true"})
    else:
        return Response(UserSerializer(request.user).data)

@api_view(['POST', ])
@permission_classes((AllowAny, ))
def hmac_get_signature(request):
    info = request.POST['info']

    def hmac_sign(info):
        if HMAC_KEY == "":
            signature = "SIGNED"
        else:
            signature = hmac.new(HMAC_KEY, info, hashlib.sha1).hexdigest()
        return Response({ "status": "success", "signature": signature })

    # Check for permission.
    if request.user.is_anonymous():
        return hmac_sign(info)
    else:
        return hmac_sign(info)

    return Response({"status":"E_PERMISSION_DENIED"})

@api_view(['POST', ])
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
            return Response({"status":"success"})
        else:
            return Response({"status":"E_FAILED"})
    return Response({"status":"E_INVALID"})

@api_view(['POST', ])
@permission_classes((IsAuthenticated, ))
def logout_view(request):
    logout(request)
    return Response({"status":"success"})

@api_view(['POST', ])
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
                    return Response({"status":"success"})
                else:
                    return Response({"status":"E_INACTIVE"})
            else:
                return Response({"status":"E_DENIED"})
    return Response({"status":"E_INVALID"})
