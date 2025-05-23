# File: backend/golf_metrics_app/admin.py
# ----------------------------------------
from django.contrib import admin
from .models import ShotData, Tournament, Group, Golfer


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ('name', 'date', 'hole_number', 'is_active', 'group_count', 'golfer_count')
    list_filter = ('is_active', 'date')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at',)

    def group_count(self, obj):
        return obj.groups.count()

    group_count.short_description = 'Groups'

    def golfer_count(self, obj):
        return sum(group.golfers.count() for group in obj.groups.all())

    golfer_count.short_description = 'Golfers'


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'tournament', 'tee_time', 'golfer_count', 'created_at')
    list_filter = ('tournament', 'tee_time')
    search_fields = ('name', 'tournament__name')

    def golfer_count(self, obj):
        return obj.golfers.count()

    golfer_count.short_description = 'Golfers'


@admin.register(Golfer)
class GolferAdmin(admin.ModelAdmin):
    list_display = ('name', 'group', 'tournament_name', 'handicap', 'shot_count')
    list_filter = ('group__tournament', 'group')
    search_fields = ('name', 'email', 'phone', 'group__name')

    def tournament_name(self, obj):
        return obj.tournament.name

    tournament_name.short_description = 'Tournament'

    def shot_count(self, obj):
        return obj.shots.count()

    shot_count.short_description = 'Shots'


@admin.register(ShotData)
class ShotDataAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'timestamp', 'golfer_name', 'group_name', 'tournament_name',
        'ball_speed', 'carry_distance', 'total_distance'
    )
    list_filter = ('golfer__group__tournament', 'golfer__group', 'golfer', 'timestamp')
    search_fields = ('golfer__name', 'golfer__group__name')
    ordering = ('-timestamp',)
    readonly_fields = ('id', 'created_at', 'updated_at')

    def golfer_name(self, obj):
        return obj.golfer.name if obj.golfer else 'N/A'

    golfer_name.short_description = 'Golfer'

    def group_name(self, obj):
        return obj.group.name if obj.group else 'N/A'

    group_name.short_description = 'Group'

    def tournament_name(self, obj):
        return obj.tournament.name if obj.tournament else 'N/A'

    tournament_name.short_description = 'Tournament'

# ----------------------------------------
# END File: backend/golf_metrics_app/admin.py