from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'tournaments', views.TournamentViewSet, basename='tournament')
router.register(r'groups', views.GroupViewSet, basename='group')
router.register(r'golfers', views.GolferViewSet, basename='golfer')
router.register(r'shots', views.ShotViewSet, basename='shot')

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('api/', include(router.urls)),
]