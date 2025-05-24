from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Avg, Max, Min
from django.db import transaction
from .models import Tournament, Group, Golfer, Shot
from .serializers import (
    TournamentSerializer, TournamentWithGroupsSerializer,
    GroupSerializer, GroupWithGolfersSerializer,
    GolferSerializer, GolferWithShotsSerializer,
    ShotSerializer, BulkDeleteSerializer, GroupAssignmentSerializer
)


class TournamentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Tournament CRUD operations
    """
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

    def get_queryset(self):
        """Filter tournaments based on query parameters"""
        queryset = Tournament.objects.all()

        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        # Search by name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset.order_by('-start_date', 'name')

    @action(detail=True, methods=['get'])
    def retrieve_with_groups(self, request, pk=None):
        """Retrieve tournament with all its groups"""
        tournament = self.get_object()
        serializer = TournamentWithGroupsSerializer(tournament)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Bulk delete tournaments"""
        serializer = BulkDeleteSerializer(data=request.data)
        if serializer.is_valid():
            ids = serializer.validated_data['ids']
            delete_children = serializer.validated_data.get('delete_children', False)

            try:
                with transaction.atomic():
                    tournaments = Tournament.objects.filter(id__in=ids)
                    deleted_count = tournaments.count()

                    if delete_children:
                        # Delete all related data
                        for tournament in tournaments:
                            # Delete shots first
                            Shot.objects.filter(golfer__group__tournament=tournament).delete()
                            # Delete golfers
                            Golfer.objects.filter(group__tournament=tournament).delete()
                            # Delete groups
                            Group.objects.filter(tournament=tournament).delete()

                    tournaments.delete()

                return Response({
                    'success': True,
                    'deleted_count': deleted_count,
                    'message': f'Successfully deleted {deleted_count} tournaments'
                })
            except Exception as e:
                return Response({
                    'success': False,
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Group CRUD operations
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

    def get_queryset(self):
        """Filter groups based on query parameters"""
        queryset = Group.objects.select_related('tournament').prefetch_related('golfers')

        # Filter by tournament
        tournament_id = self.request.query_params.get('tournament_id') or self.request.query_params.get('tournament')
        if tournament_id:
            queryset = queryset.filter(tournament_id=tournament_id)

        # Filter by unassigned (no tournament)
        unassigned = self.request.query_params.get('unassigned')
        if unassigned and unassigned.lower() == 'true':
            queryset = queryset.filter(tournament__isnull=True)

        # Search by name/nickname
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(nickname__icontains=search) |
                Q(group_number__icontains=search)
            )

        return queryset.order_by('tournament__name', 'group_number')

    @action(detail=True, methods=['get'])
    def retrieve_with_golfers(self, request, pk=None):
        """Retrieve group with all its golfers"""
        group = self.get_object()
        serializer = GroupWithGolfersSerializer(group)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def assign_golfers(self, request, pk=None):
        """Assign golfers to this group"""
        group = self.get_object()
        serializer = GroupAssignmentSerializer(data=request.data)

        if serializer.is_valid():
            golfer_ids = serializer.validated_data['golfer_ids']

            try:
                with transaction.atomic():
                    golfers = Golfer.objects.filter(id__in=golfer_ids)
                    assigned_count = 0

                    for golfer in golfers:
                        if group.available_spots > 0:
                            golfer.group = group
                            golfer.save()
                            assigned_count += 1
                        else:
                            break

                return Response({
                    'success': True,
                    'assigned_count': assigned_count,
                    'message': f'Successfully assigned {assigned_count} golfers to {group.display_name}'
                })
            except Exception as e:
                return Response({
                    'success': False,
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def remove_golfers(self, request, pk=None):
        """Remove golfers from this group"""
        group = self.get_object()
        golfer_ids = request.data.get('golfer_ids', [])

        try:
            with transaction.atomic():
                golfers = Golfer.objects.filter(id__in=golfer_ids, group=group)
                removed_count = golfers.count()
                golfers.update(group=None)

            return Response({
                'success': True,
                'removed_count': removed_count,
                'message': f'Successfully removed {removed_count} golfers from {group.display_name}'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Bulk delete groups"""
        serializer = BulkDeleteSerializer(data=request.data)
        if serializer.is_valid():
            ids = serializer.validated_data['ids']
            delete_children = serializer.validated_data.get('delete_children', False)

            try:
                with transaction.atomic():
                    groups = Group.objects.filter(id__in=ids)
                    deleted_count = groups.count()

                    if delete_children:
                        # Delete all shots for golfers in these groups
                        Shot.objects.filter(golfer__group__in=groups).delete()
                        # Delete all golfers in these groups
                        Golfer.objects.filter(group__in=groups).delete()
                    else:
                        # Just unassign golfers from groups
                        Golfer.objects.filter(group__in=groups).update(group=None)

                    groups.delete()

                return Response({
                    'success': True,
                    'deleted_count': deleted_count,
                    'message': f'Successfully deleted {deleted_count} groups'
                })
            except Exception as e:
                return Response({
                    'success': False,
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GolferViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Golfer CRUD operations
    """
    queryset = Golfer.objects.all()
    serializer_class = GolferSerializer

    def get_queryset(self):
        """Filter golfers based on query parameters"""
        queryset = Golfer.objects.select_related('group__tournament').prefetch_related('shots')

        # Filter by group
        group_id = self.request.query_params.get('group_id') or self.request.query_params.get('group')
        if group_id:
            queryset = queryset.filter(group_id=group_id)

        # Filter by tournament
        tournament_id = self.request.query_params.get('tournament_id') or self.request.query_params.get('tournament')
        if tournament_id:
            queryset = queryset.filter(group__tournament_id=tournament_id)

        # Filter by unassigned (no group)
        unassigned = self.request.query_params.get('unassigned')
        if unassigned and unassigned.lower() == 'true':
            queryset = queryset.filter(group__isnull=True)

        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        # Search by name or golfer_id
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(golfer_id__icontains=search) |
                Q(email__icontains=search)
            )

        return queryset.order_by('last_name', 'first_name')

    @action(detail=True, methods=['get'])
    def retrieve_with_shots(self, request, pk=None):
        """Retrieve golfer with all their shots"""
        golfer = self.get_object()
        serializer = GolferWithShotsSerializer(golfer)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def unassigned(self, request):
        """Get all unassigned golfers"""
        queryset = self.get_queryset().filter(group__isnull=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Bulk delete golfers"""
        serializer = BulkDeleteSerializer(data=request.data)
        if serializer.is_valid():
            ids = serializer.validated_data['ids']
            delete_children = serializer.validated_data.get('delete_children', False)

            try:
                with transaction.atomic():
                    golfers = Golfer.objects.filter(id__in=ids)
                    deleted_count = golfers.count()

                    if delete_children:
                        # Delete all shots for these golfers
                        Shot.objects.filter(golfer__in=golfers).delete()

                    golfers.delete()

                return Response({
                    'success': True,
                    'deleted_count': deleted_count,
                    'message': f'Successfully deleted {deleted_count} golfers'
                })
            except Exception as e:
                return Response({
                    'success': False,
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ShotViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Shot CRUD operations
    """
    queryset = Shot.objects.all()
    serializer_class = ShotSerializer

    def get_queryset(self):
        """Filter shots based on query parameters"""
        queryset = Shot.objects.select_related('golfer__group__tournament')

        # Filter by golfer
        golfer_id = self.request.query_params.get('golfer_id') or self.request.query_params.get('golfer')
        if golfer_id:
            queryset = queryset.filter(golfer_id=golfer_id)

        # Filter by group
        group_id = self.request.query_params.get('group_id') or self.request.query_params.get('group')
        if group_id:
            queryset = queryset.filter(golfer__group_id=group_id)

        # Filter by tournament
        tournament_id = self.request.query_params.get('tournament_id') or self.request.query_params.get('tournament')
        if tournament_id:
            queryset = queryset.filter(golfer__group__tournament_id=tournament_id)

        # Filter by unassigned (no golfer)
        unassigned = self.request.query_params.get('unassigned')
        if unassigned and unassigned.lower() == 'true':
            queryset = queryset.filter(golfer__isnull=True)

        # Filter by shot type
        shot_type = self.request.query_params.get('shot_type')
        if shot_type:
            queryset = queryset.filter(shot_type=shot_type)

        # Filter by club
        club_used = self.request.query_params.get('club_used')
        if club_used:
            queryset = queryset.filter(club_used=club_used)

        # Filter by hole number
        hole_number = self.request.query_params.get('hole_number')
        if hole_number:
            queryset = queryset.filter(hole_number=hole_number)

        return queryset.order_by('-timestamp', 'shot_number')

    @action(detail=False, methods=['get'])
    def unassigned(self, request):
        """Get all unassigned shots"""
        queryset = self.get_queryset().filter(golfer__isnull=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get shot statistics"""
        queryset = self.get_queryset()

        # Apply same filters as main queryset
        golfer_id = self.request.query_params.get('golfer_id')
        if golfer_id:
            queryset = queryset.filter(golfer_id=golfer_id)

        group_id = self.request.query_params.get('group_id')
        if group_id:
            queryset = queryset.filter(golfer__group_id=group_id)

        tournament_id = self.request.query_params.get('tournament_id')
        if tournament_id:
            queryset = queryset.filter(golfer__group__tournament_id=tournament_id)

        # Calculate statistics
        stats = queryset.aggregate(
            total_shots=Count('id'),
            avg_ball_speed=Avg('ball_speed'),
            avg_club_head_speed=Avg('club_head_speed'),
            avg_launch_angle=Avg('launch_angle'),
            avg_spin_rate=Avg('spin_rate'),
            avg_carry_distance=Avg('carry_distance'),
            avg_total_distance=Avg('total_distance'),
            max_ball_speed=Max('ball_speed'),
            max_carry_distance=Max('carry_distance'),
            max_total_distance=Max('total_distance'),
            min_ball_speed=Min('ball_speed'),
            min_carry_distance=Min('carry_distance'),
            min_total_distance=Min('total_distance'),
        )

        # Add shot type breakdown
        shot_type_breakdown = list(
            queryset.values('shot_type')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Add club breakdown
        club_breakdown = list(
            queryset.exclude(club_used__isnull=True)
            .values('club_used')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        return Response({
            'statistics': stats,
            'shot_type_breakdown': shot_type_breakdown,
            'club_breakdown': club_breakdown
        })

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Bulk delete shots"""
        serializer = BulkDeleteSerializer(data=request.data)
        if serializer.is_valid():
            ids = serializer.validated_data['ids']

            try:
                with transaction.atomic():
                    shots = Shot.objects.filter(id__in=ids)
                    deleted_count = shots.count()
                    shots.delete()

                return Response({
                    'success': True,
                    'deleted_count': deleted_count,
                    'message': f'Successfully deleted {deleted_count} shots'
                })
            except Exception as e:
                return Response({
                    'success': False,
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)