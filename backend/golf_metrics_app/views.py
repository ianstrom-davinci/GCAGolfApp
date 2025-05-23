from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import ShotData, Tournament, Group, Golfer
from .serializers import (
    ShotDataSerializer,
    TournamentSerializer,
    GroupSerializer,
    GolferSerializer
)


class TournamentViewSet(viewsets.ModelViewSet):
    """API endpoint for tournament management"""
    queryset = Tournament.objects.all().order_by('-date')
    serializer_class = TournamentSerializer


class GroupViewSet(viewsets.ModelViewSet):
    """API endpoint for group management"""
    queryset = Group.objects.all().order_by('tournament', 'name')
    serializer_class = GroupSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        tournament_id = self.request.query_params.get('tournament_id')

        if tournament_id:
            queryset = queryset.filter(tournament_id=tournament_id)

        return queryset


class GolferViewSet(viewsets.ModelViewSet):
    """API endpoint for golfer management with search"""
    queryset = Golfer.objects.all().order_by('name')
    serializer_class = GolferSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        tournament_id = self.request.query_params.get('tournament_id')
        group_id = self.request.query_params.get('group_id')
        search = self.request.query_params.get('search')

        if tournament_id:
            queryset = queryset.filter(group__tournament_id=tournament_id)

        if group_id:
            queryset = queryset.filter(group_id=group_id)

        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset


class ShotDataViewSet(viewsets.ModelViewSet):
    """API endpoint for shot data - tournament only"""
    queryset = ShotData.objects.all().order_by('-timestamp')
    serializer_class = ShotDataSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        tournament_id = self.request.query_params.get('tournament_id')
        group_id = self.request.query_params.get('group_id')
        golfer_id = self.request.query_params.get('golfer_id')

        if tournament_id:
            queryset = queryset.filter(golfer__group__tournament_id=tournament_id)
        if group_id:
            queryset = queryset.filter(golfer__group_id=group_id)
        if golfer_id:
            queryset = queryset.filter(golfer_id=golfer_id)

        return queryset