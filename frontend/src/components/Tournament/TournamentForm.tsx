// File: frontend/src/components/Tournament/TournamentForm.tsx
// --------------------------------------------------------
import React from 'react';
import {
  Stack,
  TextInput,
  Textarea,
  Switch,
  Button,
  Group,
  Alert,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { DateValue } from '@mantine/dates';
import { IconAlertCircle } from '@tabler/icons-react';
import { Tournament, TournamentCreate } from '../../types';

interface TournamentFormProps {
  tournament?: Tournament;
  onSubmit: (data: TournamentCreate) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const TournamentForm: React.FC<TournamentFormProps> = ({
  tournament,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const isEdit = Boolean(tournament);

  const form = useForm<TournamentCreate>({
    initialValues: {
      name: tournament?.name || '',
      description: tournament?.description || '',
      start_date: tournament?.start_date || '',
      end_date: tournament?.end_date || '',
      location: tournament?.location || '',
      is_active: tournament?.is_active ?? true,
    },
    validate: {
      name: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Tournament name is required';
        }
        if (value.length > 200) {
          return 'Tournament name must be less than 200 characters';
        }
        return null;
      },
      start_date: (value) => {
        if (!value) {
          return 'Start date is required';
        }
        return null;
      },
      end_date: (value, values) => {
        if (!value) {
          return 'End date is required';
        }
        if (values.start_date && new Date(value) < new Date(values.start_date)) {
          return 'End date cannot be before start date';
        }
        return null;
      },
      location: (value) => {
        if (value && value.length > 200) {
          return 'Location must be less than 200 characters';
        }
        return null;
      },
    },
  });

  const handleSubmit = async (values: TournamentCreate) => {
    try {
      await onSubmit(values);
      if (!isEdit) {
        form.reset();
      }
    } catch (error) {
      // Error handling is done in the parent component via hooks
      console.error('Form submission error:', error);
    }
  };

  const handleStartDateChange = (date: DateValue) => {
  const dateString = date instanceof Date ? date.toISOString().split('T')[0] : '';
    form.setFieldValue('start_date', dateString);

    // If end date is before new start date, clear it
    if (form.values.end_date && dateString && new Date(form.values.end_date) < new Date(dateString)) {
      form.setFieldValue('end_date', '');
    }
  };

  const handleEndDateChange = (date: DateValue) => {
    const dateString = date instanceof Date ? date.toISOString().split('T')[0] : '';
    form.setFieldValue('end_date', dateString);
  };

  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        {isEdit && tournament && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="blue"
            variant="light"
          >
            Editing tournament: <strong>{tournament.name}</strong>
            {tournament.total_groups > 0 && (
              <div>
                This tournament has {tournament.total_groups} groups and {tournament.total_golfers} golfers.
              </div>
            )}
          </Alert>
        )}

        <TextInput
          label="Tournament Name"
          placeholder="Enter tournament name"
          required
          {...form.getInputProps('name')}
          disabled={loading}
        />

        <Textarea
          label="Description"
          placeholder="Enter tournament description (optional)"
          rows={3}
          {...form.getInputProps('description')}
          disabled={loading}
        />

        <Group grow>
          <DateInput
            label="Start Date"
            placeholder="Select start date"
            required
            value={parseDate(form.values.start_date || '')}
            onChange={handleStartDateChange}
            error={form.errors.start_date}
            disabled={loading}
            clearable
          />

          <DateInput
            label="End Date"
            placeholder="Select end date"
            required
            value={parseDate(form.values.end_date)}
            onChange={handleEndDateChange}
            error={form.errors.end_date}
            disabled={loading}
            clearable
            minDate={form.values.start_date ? parseDate(form.values.start_date) || undefined : undefined}
          />
        </Group>

        <TextInput
          label="Location"
          placeholder="Enter tournament location (optional)"
          {...form.getInputProps('location')}
          disabled={loading}
        />

        <Switch
          label="Active Tournament"
          description="Whether this tournament is currently active"
          {...form.getInputProps('is_active', { type: 'checkbox' })}
          disabled={loading}
        />

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
            {isEdit ? 'Update Tournament' : 'Create Tournament'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};