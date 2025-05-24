// File: frontend/src/components/Groups/GroupModal.tsx
// --------------------------------------------------
import React from 'react';
import { Modal } from '@mantine/core';
import { GroupForm } from './GroupForm';
import { Group, GroupCreate } from '../../types';

interface GroupModalProps {
  opened: boolean;
  onClose: () => void;
  group?: Group;
  onSubmit: (data: GroupCreate) => Promise<void>;
  loading?: boolean;
  preselectedTournament?: number;
}

export const GroupModal: React.FC<GroupModalProps> = ({
  opened,
  onClose,
  group,
  onSubmit,
  loading = false,
  preselectedTournament,
}) => {
  const isEdit = Boolean(group);
  const title = isEdit ? 'Edit Group' : 'Create New Group';

  const handleSubmit = async (data: GroupCreate) => {
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
      <GroupForm
        group={group}
        onSubmit={handleSubmit}
        onCancel={onClose}
        loading={loading}
        preselectedTournament={preselectedTournament}
      />
    </Modal>
  );
};