// File: frontend/src/components/Sessions/CreateSessionModal.tsx
// -----------------------------------------------------------
import React from 'react';
import { Modal, Stack, TextInput, Group, Button } from '@mantine/core';

interface CreateSessionModalProps {
  opened: boolean;
  onClose: () => void;
  newSessionName: string;
  setNewSessionName: (name: string) => void;
  onCreateSession: () => void;
}

export function CreateSessionModal({
  opened,
  onClose,
  newSessionName,
  setNewSessionName,
  onCreateSession,
}: CreateSessionModalProps) {
  const handleClose = () => {
    onClose();
    setNewSessionName('');
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Create New Golf Session"
      centered
    >
      <Stack gap="md">
        <TextInput
          label="Session Name (Optional)"
          placeholder="e.g., Morning Practice, Driver Work, etc."
          value={newSessionName}
          onChange={(e) => setNewSessionName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCreateSession();
          }}
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={onCreateSession}>
            Create Session
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}