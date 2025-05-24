// File: frontend/src/components/Tournament/tabs/TournamentManagementTab.tsx
// ------------------------------------------------------------------------
import React, { useState } from 'react';
import { Stack } from '@mantine/core';
import { TournamentTable } from '../TournamentTable';
import { TournamentModal } from '../TournamentModal';
import { ConfirmationModal } from '../../Common/ConfirmationModal';
import { useTournaments } from '../../../hooks/useTournaments';
import { Tournament, TournamentCreate } from '../../../types';

export const TournamentManagementTab: React.FC = () => {
  const {
    tournaments,
    loading,
    createTournament,
    updateTournament,
    deleteTournament,
    bulkDeleteTournaments,
    fetchTournaments,
  } = useTournaments();

  const [selectedTournaments, setSelectedTournaments] = useState<Tournament[]>([]);
  const [modalState, setModalState] = useState<{
    opened: boolean;
    tournament?: Tournament;
  }>({
    opened: false,
  });
  const [deleteModal, setDeleteModal] = useState<{
    opened: boolean;
    tournament?: Tournament;
    bulk?: boolean;
  }>({
    opened: false,
  });

  // Modal handlers
  const handleCreate = () => {
    setModalState({ opened: true });
  };

  const handleEdit = (tournament: Tournament) => {
    setModalState({ opened: true, tournament });
  };

  const handleModalClose = () => {
    setModalState({ opened: false });
  };

  const handleModalSubmit = async (data: TournamentCreate) => {
    if (modalState.tournament) {
      await updateTournament(modalState.tournament.id, data);
    } else {
      await createTournament(data);
    }
  };

  // Delete handlers
  const handleDelete = (tournament: Tournament) => {
    setDeleteModal({ opened: true, tournament });
  };

  const handleBulkDelete = (tournaments: Tournament[]) => {
    setSelectedTournaments(tournaments);
    setDeleteModal({ opened: true, bulk: true });
  };

  const handleDeleteConfirm = async (deleteChildren: boolean) => {
    if (deleteModal.bulk) {
      await bulkDeleteTournaments({
        ids: selectedTournaments.map(t => t.id),
        delete_children: deleteChildren,
      });
      setSelectedTournaments([]);
    } else if (deleteModal.tournament) {
      await deleteTournament(deleteModal.tournament.id);
    }
    setDeleteModal({ opened: false });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ opened: false });
  };

  // View details handler (can be extended later)
  const handleViewDetails = (tournament: Tournament) => {
    // TODO: Navigate to tournament detail view or open detail modal
    console.log('View tournament details:', tournament);
  };

  const getDeleteMessage = () => {
    if (deleteModal.bulk) {
      return `Are you sure you want to delete ${selectedTournaments.length} tournaments?`;
    } else if (deleteModal.tournament) {
      return `Are you sure you want to delete "${deleteModal.tournament.name}"?`;
    }
    return '';
  };

  const getDeleteTitle = () => {
    if (deleteModal.bulk) {
      return 'Delete Multiple Tournaments';
    }
    return 'Delete Tournament';
  };

  const showChildrenOption = deleteModal.tournament
    ? deleteModal.tournament.total_groups > 0
    : selectedTournaments.some(t => t.total_groups > 0);

  return (
    <Stack gap="md">
      <TournamentTable
        tournaments={tournaments}
        loading={loading}
        selectedTournaments={selectedTournaments}
        onSelectionChange={setSelectedTournaments}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onCreate={handleCreate}
        onRefresh={fetchTournaments}
        onViewDetails={handleViewDetails}
      />

      {/* Create/Edit Modal */}
      <TournamentModal
        opened={modalState.opened}
        onClose={handleModalClose}
        tournament={modalState.tournament}
        onSubmit={handleModalSubmit}
        loading={loading}
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
        childrenLabel="Also delete all groups and golfers in these tournaments"
        itemCount={deleteModal.bulk ? selectedTournaments.length : 1}
      />
    </Stack>
  );
};