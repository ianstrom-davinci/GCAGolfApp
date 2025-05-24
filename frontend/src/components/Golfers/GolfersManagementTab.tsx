// File: frontend/src/components/Golfers/GolfersManagementTab.tsx
// -----------------------------------------------------------
import React, { useState } from 'react';
import { Stack, Select, Group as MantineGroup, Text, Badge } from '@mantine/core';
import { GolferTable } from './GolferTable';
import { GolferModal } from './GolferModal';
import { ConfirmationModal } from '../Common/ConfirmationModal';
import { useGolfers } from '../../hooks/useGolfers';
import { useGroups } from '../../hooks/useGroups';
import { useTournaments } from '../../hooks/useTournaments';
import { Golfer, GolferCreate } from '../../types';

export const GolfersManagementTab: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'tournament' | 'group' | 'unassigned'>('all');
  const [selectedTournament, setSelectedTournament] = useState<number | undefined>(undefined);
  const [selectedGroup, setSelectedGroup] = useState<number | undefined>(undefined);

  const { tournaments } = useTournaments();
  const { groups } = useGroups();

  const golferFilters = {
    tournamentId: filterType === 'tournament' ? selectedTournament : undefined,
    groupId: filterType === 'group' ? selectedGroup : undefined,
    unassigned: filterType === 'unassigned',
  };

  const {
    golfers,
    loading,
    createGolfer,
    updateGolfer,
    deleteGolfer,
    bulkDeleteGolfers,
    fetchGolfers,
  } = useGolfers(golferFilters);

  const [selectedGolfers, setSelectedGolfers] = useState<Golfer[]>([]);
  const [modalState, setModalState] = useState<{
    opened: boolean;
    golfer?: Golfer;
  }>({
    opened: false,
  });
  const [deleteModal, setDeleteModal] = useState<{
    opened: boolean;
    golfer?: Golfer;
    bulk?: boolean;
  }>({
    opened: false,
  });

  // Filter options - WITH ERROR HANDLING
  const tournamentOptions = (tournaments || []).map((tournament) => ({
    value: tournament.id.toString(),
    label: `${tournament.name} (${tournament.total_golfers} golfers)`,
  }));

  const groupOptions = (groups || []).map((group) => ({
    value: group.id.toString(),
    label: `${group.display_name}${group.tournament_name ? ` (${group.tournament_name})` : ''} - ${group.current_golfer_count}/${group.max_golfers}`,
  }));

  const handleFilterTypeChange = (value: string) => {
    setFilterType(value as 'all' | 'tournament' | 'group' | 'unassigned');
    setSelectedTournament(undefined);
    setSelectedGroup(undefined);
  };

  // Modal handlers
  const handleCreate = () => {
    setModalState({ opened: true });
  };

  const handleEdit = (golfer: Golfer) => {
    setModalState({ opened: true, golfer });
  };

  const handleModalClose = () => {
    setModalState({ opened: false });
  };

  const handleModalSubmit = async (data: GolferCreate) => {
    if (modalState.golfer) {
      await updateGolfer(modalState.golfer.id, data);
    } else {
      await createGolfer(data);
    }
  };

  // Delete handlers
  const handleDelete = (golfer: Golfer) => {
    setDeleteModal({ opened: true, golfer });
  };

  const handleBulkDelete = (golfers: Golfer[]) => {
    setSelectedGolfers(golfers);
    setDeleteModal({ opened: true, bulk: true });
  };

  const handleDeleteConfirm = async (deleteChildren: boolean) => {
    if (deleteModal.bulk) {
      await bulkDeleteGolfers({
        ids: selectedGolfers.map(g => g.id),
        delete_children: deleteChildren,
      });
      setSelectedGolfers([]);
    } else if (deleteModal.golfer) {
      await deleteGolfer(deleteModal.golfer.id);
    }
    setDeleteModal({ opened: false });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ opened: false });
  };

  // View handlers
  const handleViewDetails = (golfer: Golfer) => {
    console.log('View golfer details:', golfer);
    // TODO: Navigate to golfer detail view or open detail modal
  };

  const handleViewShots = (golfer: Golfer) => {
    console.log('View golfer shots:', golfer);
    // TODO: Navigate to shots view filtered by this golfer
  };

  const getDeleteMessage = () => {
    if (deleteModal.bulk) {
      return `Are you sure you want to delete ${selectedGolfers.length} golfers?`;
    } else if (deleteModal.golfer) {
      return `Are you sure you want to delete "${deleteModal.golfer.full_name}" (${deleteModal.golfer.golfer_id})?`;
    }
    return '';
  };

  const getDeleteTitle = () => {
    if (deleteModal.bulk) {
      return 'Delete Multiple Golfers';
    }
    return 'Delete Golfer';
  };

  const showChildrenOption = true; // Golfers can have shots

  const getFilterSummary = () => {
    switch (filterType) {
      case 'tournament':
        const tournament = (tournaments || []).find(t => t.id === selectedTournament);
        return tournament ? `Tournament: ${tournament.name}` : '';
      case 'group':
        const group = (groups || []).find(g => g.id === selectedGroup);
        return group ? `Group: ${group.display_name}` : '';
      case 'unassigned':
        return 'Unassigned golfers only';
      default:
        return 'All golfers';
    }
  };

  return (
    <Stack gap="md">
      {/* Filters */}
      <MantineGroup>
        <Select
          label="Filter by"
          data={[
            { value: 'all', label: 'All Golfers' },
            { value: 'tournament', label: 'By Tournament' },
            { value: 'group', label: 'By Group' },
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

        <div>
          <Text size="sm" c="dimmed">
            Showing: <Badge variant="light">{getFilterSummary()}</Badge>
          </Text>
          <Text size="xs" c="dimmed">
            {(golfers || []).length} golfers found
          </Text>
        </div>
      </MantineGroup>

      <GolferTable
        golfers={golfers || []}
        loading={loading}
        selectedGolfers={selectedGolfers}
        onSelectionChange={setSelectedGolfers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onCreate={handleCreate}
        onRefresh={fetchGolfers}
        onViewDetails={handleViewDetails}
        onViewShots={handleViewShots}
      />

      {/* Create/Edit Modal */}
      <GolferModal
        opened={modalState.opened}
        onClose={handleModalClose}
        golfer={modalState.golfer}
        onSubmit={handleModalSubmit}
        loading={loading}
        preselectedGroup={filterType === 'group' ? selectedGroup : undefined}
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
        showChildrenOption={showChildrenOption}
        childrenLabel="Also delete all shots taken by these golfers"
        itemCount={deleteModal.bulk ? selectedGolfers.length : 1}
      />
    </Stack>
  );
};