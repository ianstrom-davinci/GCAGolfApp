// File: frontend/src/components/Tournament/TournamentModal.tsx
// ---------------------------------------------------------
import React from 'react';
import { Modal } from '@mantine/core';
import { TournamentForm } from './TournamentForm';
import { Tournament, TournamentCreate } from '../../types';

interface TournamentModalProps {
  opened: boolean;
  onClose: () => void;
  tournament?: Tournament;
  onSubmit: (data: TournamentCreate) => Promise<void>;
  loading?: boolean;
}

export const TournamentModal: React.FC<TournamentModalProps> = ({
  opened,
  onClose,
  tournament,
  onSubmit,
  loading = false,
}) => {
  const isEdit = Boolean(tournament);
  const title = isEdit ? 'Edit Tournament' : 'Create New Tournament';

  const handleSubmit = async (data: TournamentCreate) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="lg"
      centered
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
    >
      <TournamentForm
        tournament={tournament}
        onSubmit={handleSubmit}
        onCancel={onClose}
        loading={loading}
      />
    </Modal>
  );
};