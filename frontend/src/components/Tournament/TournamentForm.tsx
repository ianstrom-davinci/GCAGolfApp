// File: frontend/src/components/Tournament/TournamentForm.tsx
// --------------------------------------------------------
import React, { useEffect } from 'react';
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

interface FormValues {
  name: string;
  description: string;
  start_date: DateValue;
  end_date: DateValue;
  location: string;
  is_active: boolean;
}

export const TournamentForm: React.FC<TournamentFormProps> = ({
  tournament,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const isEdit = Boolean(tournament);

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      description: '',
      start_date: null,
      end_date: null,
      location: '',
      is_active: true,
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

  // Set form values when editing
  useEffect(() => {
    if (tournament) {
      form.setValues({
        name: tournament.name || '',
        description: tournament.description || '',
        start_date: tournament.start_date ? new Date(tournament.start_date) : null,
        end_date: tournament.end_date ? new Date(tournament.end_date) : null,
        location: tournament.location || '',
        is_active: tournament.is_active !== false,
      });
    } else {
      // Reset form for create mode
      form.setValues({
        name: '',
        description: '',
        start_date: null,
        end_date: null,
        location: '',
        is_active: true,
      });
    }
  }, [tournament]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values: FormValues) => {
    try {
      const submitData: TournamentCreate = {
        name: values.name,
        description: values.description || undefined,
        start_date: values.start_date ?
          new Date(values.start_date).toISOString().split('T')[0] : '',
        end_date: values.end_date ?
          new Date(values.end_date).toISOString().split('T')[0] : '',
        location: values.location || undefined,
        is_active: values.is_active,
      };

      await onSubmit(submitData);

      if (!isEdit) {
        form.reset();
      }
    } catch (error) {
      // Error handling is done in the parent component via hooks
      console.error('Form submission error:', error);
    }
  };

  const handleStartDateChange = (date: DateValue) => {
    form.setFieldValue('start_date', date);

    // If end date is before new start date, clear it
    if (form.values.end_date && date && new Date(form.values.end_date) < new Date(date)) {
      form.setFieldValue('end_date', null);
    }
  };

  const handleEndDateChange = (date: DateValue) => {
    form.setFieldValue('end_date', date);
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
            value={form.values.start_date}
            onChange={handleStartDateChange}
            error={form.errors.start_date}
            disabled={loading}
            clearable
          />

          <DateInput
            label="End Date"
            placeholder="Select end date"
            required
            value={form.values.end_date}
            onChange={handleEndDateChange}
            error={form.errors.end_date}
            disabled={loading}
            clearable
            minDate={form.values.start_date ? new Date(form.values.start_date) : undefined}
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