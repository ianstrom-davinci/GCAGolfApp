# File: backend/golf_metrics_app/models.py
# -----------------------------------------
from django.db import models
from django.utils import timezone


class Tournament(models.Model):
    """Tournament events"""
    name = models.CharField(max_length=200)
    date = models.DateField()
    description = models.TextField(blank=True, null=True)
    hole_number = models.IntegerField(help_text="Which hole is the launch monitor setup on")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.date}"


class Group(models.Model):
    """Groups/Foursomes within tournaments"""
    tournament = models.ForeignKey(Tournament, related_name='groups', on_delete=models.CASCADE)
    name = models.CharField(max_length=100, help_text="e.g., 'Group 1' or 'Smith Foursome'")
    tee_time = models.TimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['tournament', 'name']  # No duplicate group names in same tournament

    def __str__(self):
        return f"{self.name} ({self.tournament.name})"


class Golfer(models.Model):
    """Tournament participants - each golfer belongs to one group"""
    group = models.ForeignKey(Group, related_name='golfers', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    handicap = models.IntegerField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)

    # Convenience property to get tournament
    @property
    def tournament(self):
        return self.group.tournament

    def __str__(self):
        return f"{self.name} ({self.group.name})"


class ShotData(models.Model):
    """Shot data - only for tournament golfers"""

    # Tournament fields - all linked through golfer
    golfer = models.ForeignKey(Golfer, related_name='shots', on_delete=models.CASCADE)

    # Basic shot info
    timestamp = models.DateTimeField(default=timezone.now)

    # Launch monitor data
    ball_speed = models.FloatField(null=True, blank=True, help_text="mph")
    club_head_speed = models.FloatField(null=True, blank=True, help_text="mph")
    launch_angle = models.FloatField(null=True, blank=True, help_text="degrees")
    spin_rate = models.FloatField(null=True, blank=True, help_text="rpm (backspin)")
    side_spin_rate = models.FloatField(null=True, blank=True, help_text="rpm")
    carry_distance = models.FloatField(null=True, blank=True, help_text="yards")
    total_distance = models.FloatField(null=True, blank=True, help_text="yards")
    smash_factor = models.FloatField(null=True, blank=True)
    apex_height = models.FloatField(null=True, blank=True, help_text="feet")
    lateral_deviation = models.FloatField(null=True, blank=True, help_text="yards")
    attack_angle = models.FloatField(null=True, blank=True, help_text="degrees")
    club_path = models.FloatField(null=True, blank=True, help_text="degrees")
    face_angle = models.FloatField(null=True, blank=True, help_text="degrees")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Convenience properties
    @property
    def tournament(self):
        return self.golfer.group.tournament

    @property
    def group(self):
        return self.golfer.group

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = "Shot Data"

    def __str__(self):
        return f"{self.golfer.name} - {self.timestamp.strftime('%H:%M:%S')}"

# -----------------------------------------
# END File: backend/golf_metrics_app/models.py