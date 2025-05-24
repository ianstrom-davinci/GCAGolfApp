// File: frontend/src/components/Shots/ShotModal.tsx
// ------------------------------------------------
import React from 'react';
import { Modal } from '@mantine/core';
import { ShotForm } from './ShotForm';
import { Shot, ShotCreate } from '../../types';

interface ShotModalProps {
  opened: boolean;
  onClose: () => void;
  shot?: Shot;
  onSubmit: (data: ShotCreate) => Promise<void>;
  loading?: boolean;
  preselectedGolfer?: number;
}

export const ShotModal: React.FC<ShotModalProps> = ({
  opened,
  onClose,
  shot,
  onSubmit,
  loading = false,
  preselectedGolfer,
}) => {
  const isEdit = Boolean(shot);
  const title = isEdit ? 'Edit Shot' : 'Record New Shot';

  const handleSubmit = async (data: ShotCreate) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="xl"
      centered
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
    >
      <ShotForm
        shot={shot}
        onSubmit={handleSubmit}
        onCancel={onClose}
        loading={loading}
        preselectedGolfer={preselectedGolfer}
      />
    </Modal>
  );
};