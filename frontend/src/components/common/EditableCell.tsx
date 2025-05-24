// File: frontend/src/components/common/EditableCell.tsx
// ----------------------------------------------------
import React, { useState } from 'react';
import { Group, Text, NumberInput, ActionIcon } from '@mantine/core';
import { IconEdit, IconCheck, IconX } from '@tabler/icons-react';
import { EditableCellProps } from '../../types/golf';

export function EditableCell({ value, onSave, suffix = '' }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<number | string>(value || 0);

  const handleSave = () => {
    const numValue = typeof editValue === 'string' ? parseFloat(editValue) : editValue;
    if (!isNaN(numValue)) {
      onSave(numValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || 0);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Group gap={4}>
        <NumberInput
          size="xs"
          value={editValue}
          onChange={(val) => setEditValue(val || 0)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          w={80}
          decimalScale={1}
          fixedDecimalScale
        />
        <ActionIcon size="xs" color="green" onClick={handleSave}>
          <IconCheck size={12} />
        </ActionIcon>
        <ActionIcon size="xs" color="red" onClick={handleCancel}>
          <IconX size={12} />
        </ActionIcon>
      </Group>
    );
  }

  return (
    <Group gap={4} style={{ cursor: 'pointer' }} onClick={() => setIsEditing(true)}>
      <Text size="sm">
        {value != null ? `${value.toFixed(1)}${suffix}` : 'N/A'}
      </Text>
      <IconEdit size={12} style={{ opacity: 0.5 }} />
    </Group>
  );
}