from django.contrib import admin
from django.utils.html import format_html
from .models import Tournament, Group, Golfer, Shot


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ['name', 'start_date', 'end_date', 'location', 'is_active', 'total_groups', 'total_golfers']
    list_filter = ['is_active', 'start_date', 'location']
    search_fields = ['name', 'location', 'description']
    readonly_fields = ['created_at', 'updated_at', 'total_groups', 'total_golfers']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'location', 'is_active')
        }),
        ('Tournament Dates', {
            'fields': ('start_date', 'end_date')
        }),
        ('Statistics', {
            'fields': ('total_groups', 'total_golfers'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'tournament', 'group_number', 'current_golfer_count', 'max_golfers', 'is_full']
    list_filter = ['tournament', 'max_golfers', 'created_at']
    search_fields = ['nickname', 'group_number', 'tournament__name']
    readonly_fields = ['created_at', 'updated_at', 'current_golfer_count', 'is_full', 'available_spots']
    raw_id_fields = ['tournament']

    fieldsets = (
        ('Basic Information', {
            'fields': ('tournament', 'group_number', 'nickname', 'max_golfers')
        }),
        ('Statistics', {
            'fields': ('current_golfer_count', 'is_full', 'available_spots'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def is_full(self, obj):
        return obj.is_full

    is_full.boolean = True
    is_full.short_description = 'Full'


@admin.register(Golfer)
class GolferAdmin(admin.ModelAdmin):
    list_display = ['golfer_id', 'full_name', 'email', 'handicap', 'skill_level', 'group', 'tournament', 'is_active']
    list_filter = ['skill_level', 'gender', 'is_active', 'group__tournament', 'preferred_tee']
    search_fields = ['golfer_id', 'first_name', 'last_name', 'email']
    readonly_fields = ['created_at', 'updated_at', 'age', 'tournament', 'full_name']
    raw_id_fields = ['group']

    fieldsets = (
        ('Personal Information', {
            'fields': ('golfer_id', 'first_name', 'last_name', 'full_name', 'email', 'phone', 'date_of_birth', 'age',
                       'gender')
        }),
        ('Golf Information', {
            'fields': ('handicap', 'skill_level', 'preferred_tee')
        }),
        ('Group Assignment', {
            'fields': ('group', 'tournament')
        }),
        ('Additional Information', {
            'fields': ('is_active', 'notes'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def tournament(self, obj):
        return obj.tournament.name if obj.tournament else 'Unassigned'

    tournament.short_description = 'Tournament'


@admin.register(Shot)
class ShotAdmin(admin.ModelAdmin):
    list_display = ['shot_number', 'golfer', 'shot_type', 'club_used', 'carry_distance', 'total_distance',
                    'is_simulated', 'timestamp']
    list_filter = ['shot_type', 'club_used', 'is_simulated', 'timestamp', 'golfer__group__tournament']
    search_fields = ['shot_number', 'golfer__first_name', 'golfer__last_name', 'golfer__golfer_id', 'notes']
    readonly_fields = ['created_at', 'updated_at', 'smash_factor', 'tournament', 'group']
    raw_id_fields = ['golfer']
    date_hierarchy = 'timestamp'

    fieldsets = (
        ('Basic Information', {
            'fields': ('golfer', 'shot_number', 'hole_number', 'shot_type', 'club_used', 'timestamp')
        }),
        ('Launch Monitor Data', {
            'fields': ('ball_speed', 'club_head_speed', 'launch_angle', 'spin_rate', 'carry_distance', 'total_distance',
                       'side_angle', 'smash_factor'),
            'classes': ('collapse',)
        }),
        ('Data Source', {
            'fields': ('is_simulated', 'launch_monitor_id')
        }),
        ('Relationships', {
            'fields': ('tournament', 'group'),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def tournament(self, obj):
        return obj.tournament.name if obj.tournament else 'Unassigned'

    tournament.short_description = 'Tournament'

    def group(self, obj):
        return obj.group.display_name if obj.group else 'Unassigned'

    group.short_description = 'Group'