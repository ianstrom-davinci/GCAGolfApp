// File: frontend/src/components/Common/ConfirmationModal.tsx
// --------------------------------------------------------
import React from 'react';
import {
  Modal,
  Text,
  Group,
  Button,
  Stack,
  Alert,
  Checkbox,
  Divider,
} from '@mantine/core';
import { IconAlertTriangle, IconTrash } from '@tabler/icons-react';

interface ConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: (deleteChildren: boolean) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'delete' | 'warning' | 'info';
  loading?: boolean;
  showChildrenOption?: boolean;
  childrenLabel?: string;
  itemCount?: number;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'warning',
  loading = false,
  showChildrenOption = false,
  childrenLabel = 'Also delete related items',
  itemCount = 1,
}) => {
  const [deleteChildren, setDeleteChildren] = React.useState(false);

  const getColor = () => {
    switch (type) {
      case 'delete':
        return 'red';
      case 'warning':
        return 'orange';
      default:
        return 'blue';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <IconTrash size={20} />;
      default:
        return <IconAlertTriangle size={20} />;
    }
  };

  const handleConfirm = () => {
    onConfirm(deleteChildren);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      size="md"
    >
      <Stack gap="md">
        <Alert
          icon={getIcon()}
          color={getColor()}
          variant="light"
        >
          <Text size="sm">{message}</Text>
          {itemCount > 1 && (
            <Text size="sm" mt="xs" fw="bold">
              {itemCount} items will be affected.
            </Text>
          )}
        </Alert>

        {showChildrenOption && (
          <>
            <Divider />
            <Checkbox
              checked={deleteChildren}
              onChange={(event) => setDeleteChildren(event.currentTarget.checked)}
              label={childrenLabel}
              description="If unchecked, related items will be unassociated but not deleted"
            />
          </>
        )}

        <Group justify="flex-end" gap="sm">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            color={getColor()}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};