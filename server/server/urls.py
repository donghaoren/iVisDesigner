from django.conf.urls import patterns, include, url
from rest_framework import routers
from ivapp import views

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
    url(r'^api/account', views.current_user),
    url(r'^api/', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^accounts/login$', views.login_view, name='login'),
    url(r'^accounts/logout$', views.logout_view, name='logout'),
    url(r'^accounts/register$', views.register_view, name='register'),
    url(r'^admin/', include(admin.site.urls)),
)
