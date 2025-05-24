from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Tournament(models.Model):
    """Tournament model for managing golf tournaments"""
    name = models.CharField(max_length=200, help_text="Tournament name")
    description = models.TextField(blank=True, null=True, help_text="Tournament description")
    start_date = models.DateField(help_text="Tournament start date")
    end_date = models.DateField(help_text="Tournament end date")
    location = models.CharField(max_length=200, blank=True, null=True, help_text="Tournament location")
    is_active = models.BooleanField(default=True, help_text="Whether tournament is currently active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date', 'name']
        verbose_name = "Tournament"
        verbose_name_plural = "Tournaments"

    def __str__(self):
        return f"{self.name} ({self.start_date})"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError("End date cannot be before start date.")

    @property
    def total_groups(self):
        return self.groups.count()

    @property
    def total_golfers(self):
        return sum(group.golfers.count() for group in self.groups.all())


class Group(models.Model):
    """Group model for managing golfer groups (2somes, 4somes, etc.)"""
    tournament = models.ForeignKey(
        Tournament,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='groups',
        help_text="Tournament this group belongs to (optional)"
    )
    group_number = models.PositiveIntegerField(help_text="Auto-generated group number")
    nickname = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Optional display name for the group"
    )
    max_golfers = models.PositiveIntegerField(
        default=4,
        validators=[MinValueValidator(1), MaxValueValidator(8)],
        help_text="Maximum number of golfers allowed in this group"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['group_number']
        verbose_name = "Group"
        verbose_name_plural = "Groups"
        unique_together = ['tournament', 'group_number']  # Unique group numbers per tournament

    def save(self, *args, **kwargs):
        # Auto-generate group_number if not set
        if not self.group_number:
            if self.tournament:
                # Get the highest group number for this tournament
                max_group = Group.objects.filter(tournament=self.tournament).aggregate(
                    max_num=models.Max('group_number')
                )['max_num']
                self.group_number = (max_group or 0) + 1
            else:
                # For unassigned groups, get the highest group number overall
                max_group = Group.objects.aggregate(
                    max_num=models.Max('group_number')
                )['max_num']
                self.group_number = (max_group or 0) + 1

        super().save(*args, **kwargs)

    def __str__(self):
        display_name = self.nickname if self.nickname else f"Group {self.group_number}"
        tournament_info = f" ({self.tournament.name})" if self.tournament else " (Unassigned)"
        return display_name + tournament_info

    @property
    def display_name(self):
        return self.nickname if self.nickname else f"Group {self.group_number}"

    @property
    def current_golfer_count(self):
        return self.golfers.count()

    @property
    def is_full(self):
        return self.current_golfer_count >= self.max_golfers

    @property
    def available_spots(self):
        return max(0, self.max_golfers - self.current_golfer_count)


class Golfer(models.Model):
    """Golfer model for managing individual golfers"""
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    SKILL_LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('professional', 'Professional'),
    ]

    # Personal Information
    golfer_id = models.CharField(
        max_length=20,
        unique=True,
        help_text="Unique golfer identifier"
    )
    first_name = models.CharField(max_length=100, help_text="First name")
    last_name = models.CharField(max_length=100, help_text="Last name")
    email = models.EmailField(blank=True, null=True, help_text="Email address")
    phone = models.CharField(max_length=20, blank=True, null=True, help_text="Phone number")
    date_of_birth = models.DateField(blank=True, null=True, help_text="Date of birth")
    gender = models.CharField(
        max_length=1,
        choices=GENDER_CHOICES,
        blank=True,
        null=True,
        help_text="Gender"
    )

    # Golf Information
    handicap = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        blank=True,
        null=True,
        validators=[MinValueValidator(-10), MaxValueValidator(54)],
        help_text="Golf handicap (-10 to 54)"
    )
    skill_level = models.CharField(
        max_length=20,
        choices=SKILL_LEVEL_CHOICES,
        default='intermediate',
        help_text="Skill level"
    )
    preferred_tee = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Preferred tee (e.g., Championship, Men's, Women's)"
    )

    # Group Assignment
    group = models.ForeignKey(
        Group,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='golfers',
        help_text="Group this golfer belongs to (optional)"
    )

    # Metadata
    is_active = models.BooleanField(default=True, help_text="Whether golfer is currently active")
    notes = models.TextField(blank=True, null=True, help_text="Additional notes about the golfer")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['last_name', 'first_name']
        verbose_name = "Golfer"
        verbose_name_plural = "Golfers"

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.golfer_id})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def age(self):
        if self.date_of_birth:
            today = timezone.now().date()
            return today.year - self.date_of_birth.year - (
                    (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return None

    @property
    def tournament(self):
        return self.group.tournament if self.group else None


class Shot(models.Model):
    """Shot model for managing individual golf shots"""
    SHOT_TYPE_CHOICES = [
        ('drive', 'Drive'),
        ('approach', 'Approach'),
        ('chip', 'Chip'),
        ('putt', 'Putt'),
        ('bunker', 'Bunker'),
        ('other', 'Other'),
    ]

    CLUB_CHOICES = [
        ('driver', 'Driver'),
        ('3wood', '3 Wood'),
        ('5wood', '5 Wood'),
        ('hybrid', 'Hybrid'),
        ('3iron', '3 Iron'),
        ('4iron', '4 Iron'),
        ('5iron', '5 Iron'),
        ('6iron', '6 Iron'),
        ('7iron', '7 Iron'),
        ('8iron', '8 Iron'),
        ('9iron', '9 Iron'),
        ('pw', 'Pitching Wedge'),
        ('sw', 'Sand Wedge'),
        ('lw', 'Lob Wedge'),
        ('putter', 'Putter'),
    ]

    # Basic Information
    golfer = models.ForeignKey(
        Golfer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='shots',
        help_text="Golfer who took this shot (optional)"
    )
    shot_number = models.PositiveIntegerField(help_text="Sequential shot number")
    hole_number = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(18)],
        blank=True,
        null=True,
        help_text="Hole number (1-18)"
    )
    shot_type = models.CharField(
        max_length=20,
        choices=SHOT_TYPE_CHOICES,
        default='drive',
        help_text="Type of shot"
    )
    club_used = models.CharField(
        max_length=20,
        choices=CLUB_CHOICES,
        blank=True,
        null=True,
        help_text="Club used for the shot"
    )

    # Launch Monitor Data
    ball_speed = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Ball speed in mph"
    )
    club_head_speed = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Club head speed in mph"
    )
    launch_angle = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Launch angle in degrees"
    )
    spin_rate = models.PositiveIntegerField(
        blank=True,
        null=True,
        help_text="Spin rate in RPM"
    )
    carry_distance = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Carry distance in yards"
    )
    total_distance = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Total distance in yards"
    )
    side_angle = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Side angle in degrees"
    )

    # Data Source
    is_simulated = models.BooleanField(
        default=False,
        help_text="Whether this shot is simulated or from launch monitor"
    )
    launch_monitor_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Launch monitor device identifier"
    )

    # Metadata
    notes = models.TextField(blank=True, null=True, help_text="Additional notes about the shot")
    timestamp = models.DateTimeField(default=timezone.now, help_text="When the shot was taken")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-timestamp', 'shot_number']
        verbose_name = "Shot"
        verbose_name_plural = "Shots"

    def __str__(self):
        golfer_info = f"{self.golfer.full_name}" if self.golfer else "Unassigned"
        club_info = f" with {self.get_club_used_display()}" if self.club_used else ""
        return f"Shot {self.shot_number} - {golfer_info}{club_info}"

    @property
    def tournament(self):
        return self.golfer.tournament if self.golfer and self.golfer.group else None

    @property
    def group(self):
        return self.golfer.group if self.golfer else None

    @property
    def smash_factor(self):
        """Calculate smash factor (ball speed / club head speed)"""
        if self.ball_speed and self.club_head_speed and self.club_head_speed > 0:
            return round(float(self.ball_speed) / float(self.club_head_speed), 2)
        return None