from django.http import HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
import json
import requests

allowed_hosts = set([
    "https://www.google.com/",
    "https://maps.googleapis.com/"
])

# Create your views here.
@csrf_exempt
def delegate(request):
    user_agent = request.META['HTTP_USER_AGENT']
    def access_parameter(key, default = None):
        if key in request.POST:
            return request.POST[key]
        if key in request.GET:
            return request.GET[key]
        return default
    try:
        cookies = access_parameter("cookies", "{}")
        host = access_parameter("host")
        path = access_parameter("path", "")
        query = access_parameter("query", "{}")
        data = access_parameter("data", "{}")
        method = access_parameter("method", "GET")
        method = method.upper()
        cookies = json.loads(cookies)
        query = json.loads(query)
        print host, path, query
        if host == None:
            return HttpResponseBadRequest("Invalid Request")
    except:
        return HttpResponseBadRequest("Invalid Request")

    if not host in allowed_hosts:
        HttpResponseBadRequest("Invalid Request")

    url = host + path
    if method == "GET":
        r = requests.get(url, params = query, headers = { "user-agent": user_agent }, cookies = cookies)
    elif method == "POST":
        r = requests.post(url, params = query, data = data, headers = { "user-agent": user_agent }, cookies = cookies)
    response = HttpResponse(r.content, content_type = r.headers['content-type'], status = r.status_code)
    return response
