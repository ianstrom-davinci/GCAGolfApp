# File: backend/golf_metrics_app/serializers.py
# ----------------------------------------------
from rest_framework import serializers
from .models import ShotData, Tournament, Group, Golfer


class TournamentSerializer(serializers.ModelSerializer):
    group_count = serializers.SerializerMethodField()
    golfer_count = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = ('id', 'name', 'date', 'description', 'hole_number', 'is_active', 'created_at', 'group_count',
                  'golfer_count')
        read_only_fields = ('id', 'created_at', 'group_count', 'golfer_count')

    def get_group_count(self, obj):
        return obj.groups.count()

    def get_golfer_count(self, obj):
        return sum(group.golfers.count() for group in obj.groups.all())


class GroupSerializer(serializers.ModelSerializer):
    tournament_name = serializers.CharField(source='tournament.name', read_only=True)
    golfer_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ('id', 'tournament', 'tournament_name', 'name', 'tee_time', 'created_at', 'golfer_count')
        read_only_fields = ('id', 'created_at', 'tournament_name', 'golfer_count')

    def get_golfer_count(self, obj):
        return obj.golfers.count()


class GolferSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source='group.name', read_only=True)
    tournament_name = serializers.CharField(source='group.tournament.name', read_only=True)
    shot_count = serializers.SerializerMethodField()

    class Meta:
        model = Golfer
        fields = ('id', 'group', 'group_name', 'tournament_name', 'name', 'handicap', 'email', 'phone', 'shot_count')
        read_only_fields = ('id', 'group_name', 'tournament_name', 'shot_count')

    def get_shot_count(self, obj):
        return obj.shots.count()


class ShotDataSerializer(serializers.ModelSerializer):
    golfer_name = serializers.CharField(source='golfer.name', read_only=True)
    group_name = serializers.CharField(source='golfer.group.name', read_only=True)
    tournament_name = serializers.CharField(source='golfer.group.tournament.name', read_only=True)

    class Meta:
        model = ShotData
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'golfer_name', 'group_name', 'tournament_name')

# ----------------------------------------------
# END File: backend/golf_metrics_app/serializers.py