from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShotDataViewSet, TournamentViewSet, GroupViewSet, GolferViewSet

router = DefaultRouter()
router.register(r'shots', ShotDataViewSet, basename='shotdata')
router.register(r'tournaments', TournamentViewSet, basename='tournament')
router.register(r'groups', GroupViewSet, basename='group')
router.register(r'golfers', GolferViewSet, basename='golfer')

urlpatterns = [
    path('', include(router.urls)),
]