// File: frontend/src/components/Sessions/DeleteSessionModal.tsx
// -----------------------------------------------------------
import React from 'react';
import { Modal, Stack, Text, Group, Button, Alert } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { GolfSession } from '../../types/golf';

interface DeleteSessionModalProps {
  opened: boolean;
  onClose: () => void;
  sessionToDelete: GolfSession | null;
  onConfirmDelete: () => void;
  loading?: boolean;
}

export function DeleteSessionModal({
  opened,
  onClose,
  sessionToDelete,
  onConfirmDelete,
  loading = false,
}: DeleteSessionModalProps) {
  if (!sessionToDelete) return null;

  const sessionName = sessionToDelete.session_name || `Session ID ${sessionToDelete.id}`;
  const sessionDate = sessionToDelete.start_time
    ? new Date(sessionToDelete.start_time).toLocaleString()
    : 'Unknown Date';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Delete Golf Session"
      centered
      size="md"
    >
      <Stack gap="md">
        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="Warning"
          color="red"
          variant="light"
        >
          This action cannot be undone. All shots associated with this session will also be permanently deleted.
        </Alert>

        <Stack gap="xs">
          <Text size="sm" c="dimmed">You are about to delete:</Text>
          <Text fw="bold" size="lg">
            {sessionName}
          </Text>
          <Text size="sm" c="dimmed">
            Created: {sessionDate}
          </Text>
        </Stack>

        <Text size="sm">
          Are you sure you want to delete this session and all its associated shot data?
        </Text>

        <Group justify="flex-end" gap="sm">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={onConfirmDelete}
            loading={loading}
            leftSection={<IconAlertTriangle size={16} />}
          >
            Delete Session
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}