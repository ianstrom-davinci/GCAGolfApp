// File: frontend/src/components/Shots/ShotsManagementTab.tsx
// --------------------------------------------------------
import React, { useState } from 'react';
import { Stack, Select, Group as MantineGroup, Text, Badge } from '@mantine/core';
import { ShotTable } from './ShotTable';
import { ShotModal } from './ShotModal';
import { ConfirmationModal } from '../Common/ConfirmationModal';
import { useShots } from '../../hooks/useShots';
import { useGolfers } from '../../hooks/useGolfers';
import { useGroups } from '../../hooks/useGroups';
import { useTournaments } from '../../hooks/useTournaments';
import { Shot, ShotCreate } from '../../types';

export const ShotsManagementTab: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'tournament' | 'group' | 'golfer' | 'unassigned'>('all');
  const [selectedTournament, setSelectedTournament] = useState<number | undefined>(undefined);
  const [selectedGroup, setSelectedGroup] = useState<number | undefined>(undefined);
  const [selectedGolferFilter, setSelectedGolferFilter] = useState<number | undefined>(undefined);

  const { tournaments } = useTournaments();
  const { groups } = useGroups();
  const { golfers } = useGolfers();

  const shotFilters = {
    tournamentId: filterType === 'tournament' ? selectedTournament : undefined,
    groupId: filterType === 'group' ? selectedGroup : undefined,
    golferId: filterType === 'golfer' ? selectedGolferFilter : undefined,
    unassigned: filterType === 'unassigned',
  };

  const {
    shots,
    loading,
    createShot,
    updateShot,
    deleteShot,
    bulkDeleteShots,
    fetchShots,
  } = useShots(shotFilters);

  const [selectedShots, setSelectedShots] = useState<Shot[]>([]);
  const [modalState, setModalState] = useState<{
    opened: boolean;
    shot?: Shot;
  }>({
    opened: false,
  });
  const [deleteModal, setDeleteModal] = useState<{
    opened: boolean;
    shot?: Shot;
    bulk?: boolean;
  }>({
    opened: false,
  });

  // Filter options
  const tournamentOptions = tournaments.map((tournament) => ({
    value: tournament.id.toString(),
    label: `${tournament.name} (${tournament.total_golfers} golfers)`,
  }));

  const groupOptions = groups.map((group) => ({
    value: group.id.toString(),
    label: `${group.display_name}${group.tournament_name ? ` (${group.tournament_name})` : ''} - ${group.current_golfer_count} golfers`,
  }));

  const golferOptions = golfers.map((golfer) => ({
    value: golfer.id.toString(),
    label: `${golfer.full_name} (${golfer.golfer_id})${golfer.group_name ? ` - ${golfer.group_name}` : ''}`,
  }));

  const handleFilterTypeChange = (value: string) => {
    setFilterType(value as 'all' | 'tournament' | 'group' | 'golfer' | 'unassigned');
    setSelectedTournament(undefined);
    setSelectedGroup(undefined);
    setSelectedGolferFilter(undefined);
  };

  // Modal handlers
  const handleCreate = () => {
    setModalState({ opened: true });
  };

  const handleEdit = (shot: Shot) => {
    setModalState({ opened: true, shot });
  };

  const handleModalClose = () => {
    setModalState({ opened: false });
  };

  const handleModalSubmit = async (data: ShotCreate) => {
    if (modalState.shot) {
      await updateShot(modalState.shot.id, data);
    } else {
      await createShot(data);
    }
  };

  // Delete handlers
  const handleDelete = (shot: Shot) => {
    setDeleteModal({ opened: true, shot });
  };

  const handleBulkDelete = (shots: Shot[]) => {
    setSelectedShots(shots);
    setDeleteModal({ opened: true, bulk: true });
  };

  const handleDeleteConfirm = async (deleteChildren: boolean) => {
    if (deleteModal.bulk) {
      await bulkDeleteShots({
        ids: selectedShots.map(s => s.id),
        delete_children: deleteChildren,
      });
      setSelectedShots([]);
    } else if (deleteModal.shot) {
      await deleteShot(deleteModal.shot.id);
    }
    setDeleteModal({ opened: false });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ opened: false });
  };

  // View handlers
  const handleViewDetails = (shot: Shot) => {
    console.log('View shot details:', shot);
    // TODO: Open detailed shot view with all metrics
  };

  const getDeleteMessage = () => {
    if (deleteModal.bulk) {
      return `Are you sure you want to delete ${selectedShots.length} shots?`;
    } else if (deleteModal.shot) {
      return `Are you sure you want to delete Shot #${deleteModal.shot.shot_number}${deleteModal.shot.golfer_name ? ` by ${deleteModal.shot.golfer_name}` : ''}?`;
    }
    return '';
  };

  const getDeleteTitle = () => {
    if (deleteModal.bulk) {
      return 'Delete Multiple Shots';
    }
    return 'Delete Shot';
  };

  const getFilterSummary = () => {
    switch (filterType) {
      case 'tournament':
        const tournament = tournaments.find(t => t.id === selectedTournament);
        return tournament ? `Tournament: ${tournament.name}` : '';
      case 'group':
        const group = groups.find(g => g.id === selectedGroup);
        return group ? `Group: ${group.display_name}` : '';
      case 'golfer':
        const golfer = golfers.find(g => g.id === selectedGolferFilter);
        return golfer ? `Golfer: ${golfer.full_name}` : '';
      case 'unassigned':
        return 'Unassigned shots only';
      default:
        return 'All shots';
    }
  };

  return (
    <Stack gap="md">
      {/* Filters */}
      <MantineGroup>
        <Select
          label="Filter by"
          data={[
            { value: 'all', label: 'All Shots' },
            { value: 'tournament', label: 'By Tournament' },
            { value: 'group', label: 'By Group' },
            { value: 'golfer', label: 'By Golfer' },
            { value: 'unassigned', label: 'Unassigned Only' },
          ]}
          value={filterType}
          onChange={(value) => handleFilterTypeChange(value || 'all')}
          style={{ minWidth: 150 }}
        />

        {filterType === 'tournament' && (
          <Select
            label="Tournament"
            placeholder="Select tournament"
            data={tournamentOptions}
            value={selectedTournament?.toString() || ''}
            onChange={(value) => setSelectedTournament(value ? parseInt(value) : undefined)}
            searchable
            clearable
            style={{ minWidth: 300 }}
          />
        )}

        {filterType === 'group' && (
          <Select
            label="Group"
            placeholder="Select group"
            data={groupOptions}
            value={selectedGroup?.toString() || ''}
            onChange={(value) => setSelectedGroup(value ? parseInt(value) : undefined)}
            searchable
            clearable
            style={{ minWidth: 300 }}
          />
        )}

        {filterType === 'golfer' && (
          <Select
            label="Golfer"
            placeholder="Select golfer"
            data={golferOptions}
            value={selectedGolferFilter?.toString() || ''}
            onChange={(value) => setSelectedGolferFilter(value ? parseInt(value) : undefined)}
            searchable
            clearable
            style={{ minWidth: 300 }}
          />
        )}

        <div>
          <Text size="sm" c="dimmed">
            Showing: <Badge variant="light">{getFilterSummary()}</Badge>
          </Text>
          <Text size="xs" c="dimmed">
            {shots.length} shots found
          </Text>
        </div>
      </MantineGroup>

      <ShotTable
        shots={shots}
        loading={loading}
        selectedShots={selectedShots}
        onSelectionChange={setSelectedShots}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onCreate={handleCreate}
        onRefresh={fetchShots}
        onViewDetails={handleViewDetails}
      />

      {/* Create/Edit Modal */}
      <ShotModal
        opened={modalState.opened}
        onClose={handleModalClose}
        shot={modalState.shot}
        onSubmit={handleModalSubmit}
        loading={loading}
        preselectedGolfer={filterType === 'golfer' ? selectedGolferFilter : undefined}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        opened={deleteModal.opened}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={getDeleteTitle()}
        message={getDeleteMessage()}
        confirmLabel="Delete"
        type="delete"
        loading={loading}
        showChildrenOption={false}
        itemCount={deleteModal.bulk ? selectedShots.length : 1}
      />
    </Stack>
  );
};