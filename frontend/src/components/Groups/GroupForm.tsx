// File: frontend/src/components/Groups/GroupForm.tsx
// ------------------------------------------------
import React, { useEffect } from 'react';
import {
  Stack,
  TextInput,
  NumberInput,
  Select,
  Button,
  Group,
  Alert,
  Text,
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconUsers } from '@tabler/icons-react';
import { Group as GroupType, GroupCreate, Tournament } from '../../types';
import { useTournaments } from '../../hooks/useTournaments';

interface GroupFormProps {
  group?: GroupType;
  onSubmit: (data: GroupCreate) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  preselectedTournament?: number;
}

export const GroupForm: React.FC<GroupFormProps> = ({
  group,
  onSubmit,
  onCancel,
  loading = false,
  preselectedTournament,
}) => {
  const isEdit = Boolean(group);
  const { tournaments } = useTournaments();

  const form = useForm<GroupCreate>({
    initialValues: {
      tournament: group?.tournament || preselectedTournament || undefined,
      nickname: group?.nickname || '',
      max_golfers: group?.max_golfers || 4,
    },
    validate: {
      max_golfers: (value) => {
        if (!value || value < 1) {
          return 'Maximum golfers must be at least 1';
        }
        if (value > 8) {
          return 'Maximum golfers cannot exceed 8';
        }
        return null;
      },
      nickname: (value) => {
        if (value && value.length > 100) {
          return 'Nickname must be less than 100 characters';
        }
        return null;
      },
    },
  });

  // Update form when preselectedTournament changes
  useEffect(() => {
    if (preselectedTournament && !isEdit) {
      form.setFieldValue('tournament', preselectedTournament);
    }
  }, [preselectedTournament, isEdit]);

  const handleSubmit = async (values: GroupCreate) => {
    try {
      await onSubmit(values);
      if (!isEdit) {
        form.reset();
        // Keep tournament selection if it was preselected
        if (preselectedTournament) {
          form.setFieldValue('tournament', preselectedTournament);
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const tournamentOptions = tournaments.map((tournament) => ({
    value: tournament.id.toString(),
    label: `${tournament.name} (${tournament.start_date})`,
  }));

  const selectedTournament = tournaments.find(
    t => t.id === form.values.tournament
  );

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        {isEdit && group && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="blue"
            variant="light"
          >
            <Group justify="space-between">
              <div>
                Editing group: <strong>{group.display_name}</strong>
              </div>
              <Badge variant="light" leftSection={<IconUsers size={14} />}>
                {group.current_golfer_count}/{group.max_golfers} golfers
              </Badge>
            </Group>
            {group.current_golfer_count > 0 && (
              <Text size="sm" mt="xs">
                This group currently has {group.current_golfer_count} golfers assigned.
              </Text>
            )}
          </Alert>
        )}

        <Select
          label="Tournament"
          placeholder="Select a tournament (optional)"
          data={[
            { value: '', label: 'No tournament (standalone group)' },
            ...tournamentOptions,
          ]}
          value={form.values.tournament?.toString() || ''}
          onChange={(value) => {
            form.setFieldValue('tournament', value ? parseInt(value) : undefined);
          }}
          disabled={loading}
          searchable
          clearable
        />

        {selectedTournament && (
          <Alert color="green" variant="light">
            <Text size="sm">
              <strong>{selectedTournament.name}</strong>
            </Text>
            <Text size="xs" c="dimmed">
              {selectedTournament.start_date} to {selectedTournament.end_date}
            </Text>
            <Text size="xs" c="dimmed">
              Currently has {selectedTournament.total_groups} groups and {selectedTournament.total_golfers} golfers
            </Text>
          </Alert>
        )}

        <TextInput
          label="Group Nickname"
          placeholder="Enter a nickname for this group (optional)"
          description="If no nickname is provided, the group will be numbered automatically"
          {...form.getInputProps('nickname')}
          disabled={loading}
        />

        <NumberInput
          label="Maximum Golfers"
          placeholder="4"
          min={1}
          max={8}
          description="Maximum number of golfers that can be assigned to this group"
          {...form.getInputProps('max_golfers')}
          disabled={loading}
        />

        {isEdit && group && form.values.max_golfers && form.values.max_golfers < group.current_golfer_count && (
          <Alert color="orange" variant="light">
            <Text size="sm">
              Warning: You're setting the maximum below the current golfer count ({group.current_golfer_count}).
              This may cause issues with golfer assignments.
            </Text>
          </Alert>
        )}

        <Group justify="flex-end" gap="sm" mt="xl">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {isEdit ? 'Update Group' : 'Create Group'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};