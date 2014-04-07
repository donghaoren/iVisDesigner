from django.conf.urls import patterns, include, url
from rest_framework import routers
from ivapp import views, auth, helpers
from django.conf.urls.static import static
import config

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

router = routers.DefaultRouter()
router.register(r'datasets', views.DatasetViewSet)
router.register(r'visualizations', views.VisualizationViewSet)
router.register(r'users', views.UserViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browseable API.
urlpatterns = patterns('',
    url(r'^api/', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^accounts/login$', auth.login_view, name = "login"),
    url(r'^accounts/logout$', auth.logout_view, name = "logout"),
    url(r'^accounts/register$', auth.register_view, name = "register"),
    url(r'^accounts/get$', auth.current_user, name = "getuser"),
    url(r'^accounts/fineid$', auth.Fineid, name = "fineid"),
    url(r'^accounts/fineid_test$', auth.FineidTest, name = "fineid_test"),
    url(r'^accounts/hmac_signature$', auth.hmac_get_signature, name = "hmac_signature"),
    url(r'^download$', helpers.download, name = "download"),
    url(r'^admin/', include(admin.site.urls))
)

if config.DEBUG:
    urlpatterns += static("static/", view='django.contrib.staticfiles.views.serve')
