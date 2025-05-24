// File: frontend/src/components/Golfers/GolferModal.tsx
// ----------------------------------------------------
import React from 'react';
import { Modal, Group, Text } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { GolferForm } from './GolferForm';
import { Golfer, GolferCreate } from '../../types';

interface GolferModalProps {
  opened: boolean;
  onClose: () => void;
  golfer?: Golfer;
  onSubmit: (data: GolferCreate) => Promise<void>;
  loading?: boolean;
  preselectedGroup?: number;
}

export const GolferModal: React.FC<GolferModalProps> = ({
  opened,
  onClose,
  golfer,
  onSubmit,
  loading = false,
  preselectedGroup,
}) => {
  const isEdit = Boolean(golfer);
  const title = isEdit ? 'Edit Golfer' : 'Create New Golfer';

  const handleSubmit = async (data: GolferCreate) => {
    try {
      await onSubmit(data);
      onClose(); // Close modal on successful submission
    } catch (error) {
      // Error handling is done by the parent component
      // Modal stays open so user can fix errors
      console.error('Error in GolferModal:', error);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconUser size={20} />
          <Text fw={600}>{title}</Text>
        </Group>
      }
      size="lg"
      centered
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
    >
      <GolferForm
        golfer={golfer}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        preselectedGroup={preselectedGroup}
      />
    </Modal>
  );
};