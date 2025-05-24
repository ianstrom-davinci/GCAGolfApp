// File: frontend/src/components/Golfers/GolferForm.tsx
// ---------------------------------------------------
import React, { useEffect, useState } from 'react';
import {
  Stack,
  TextInput,
  Select,
  NumberInput,
  Textarea,
  Button,
  Group,
  Switch,
  Alert,
  Text,
  Divider,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { DateValue } from '@mantine/dates';
import { IconAlertCircle, IconUser, IconGolf } from '@tabler/icons-react';
import { Golfer, GolferCreate } from '../../types';
import { useGroups } from '../../hooks/useGroups';
import { useTournaments } from '../../hooks/useTournaments';

interface GolferFormProps {
  golfer?: Golfer;
  onSubmit: (data: GolferCreate) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  preselectedGroup?: number;
}

interface FormValues {
  golfer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: DateValue;
  gender: 'M' | 'F' | 'O' | '';
  handicap: number | '';
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  preferred_tee: string;
  group: string;
  is_active: boolean;
  notes: string;
}

export function GolferForm({
  golfer,
  onSubmit,
  onCancel,
  loading = false,
  preselectedGroup
}: GolferFormProps) {
  const { groups } = useGroups();
  const { tournaments } = useTournaments();
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);

  const form = useForm<FormValues>({
    initialValues: {
      golfer_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: null,
      gender: '',
      handicap: '',
      skill_level: 'intermediate',
      preferred_tee: '',
      group: preselectedGroup ? preselectedGroup.toString() : '',
      is_active: true,
      notes: '',
    },
    validate: {
      // Only validate required fields: first_name and last_name
      first_name: (value: string) => {
        if (!value || value.trim().length === 0) {
          return 'First name is required';
        }
        if (value.length > 100) {
          return 'First name must be less than 100 characters';
        }
        return null;
      },
      last_name: (value: string) => {
        if (!value || value.trim().length === 0) {
          return 'Last name is required';
        }
        if (value.length > 100) {
          return 'Last name must be less than 100 characters';
        }
        return null;
      },
      // Optional field validations
      golfer_id: (value: string) => {
        if (value && value.length > 20) {
          return 'Golfer ID must be less than 20 characters';
        }
        return null;
      },
      email: (value: string) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return null;
      },
      phone: (value: string) => {
        if (value && value.length > 20) {
          return 'Phone number must be less than 20 characters';
        }
        return null;
      },
      handicap: (value: number | string) => {
        if (value !== '' && value !== undefined && value !== null) {
          const numValue = typeof value === 'string' ? parseFloat(value) : value;
          if (numValue < -10 || numValue > 54) {
            return 'Handicap must be between -10 and 54';
          }
        }
        return null;
      },
      preferred_tee: (value: string) => {
        if (value && value.length > 20) {
          return 'Preferred tee must be less than 20 characters';
        }
        return null;
      },
    },
  });

  // Update available groups when groups change
  useEffect(() => {
    const groupOptions = groups
      .filter(group => !group.is_full || (golfer && golfer.group === group.id))
      .map(group => ({
        value: group.id.toString(),
        label: `${group.display_name} - ${group.current_golfer_count}/${group.max_golfers} golfers`,
        disabled: group.is_full && (!golfer || golfer.group !== group.id)
      }));

    setAvailableGroups([
      { value: '', label: 'No group assigned' },
      ...groupOptions
    ]);
  }, [groups, golfer]);

  // Set form values when editing
  useEffect(() => {
    if (golfer) {
      form.setValues({
        golfer_id: golfer.golfer_id || '',
        first_name: golfer.first_name || '',
        last_name: golfer.last_name || '',
        email: golfer.email || '',
        phone: golfer.phone || '',
        date_of_birth: golfer.date_of_birth ? new Date(golfer.date_of_birth) : null,
        gender: (golfer.gender as 'M' | 'F' | 'O') || '',
        handicap: golfer.handicap || '',
        skill_level: golfer.skill_level || 'intermediate',
        preferred_tee: golfer.preferred_tee || '',
        group: golfer.group ? golfer.group.toString() : '',
        is_active: golfer.is_active !== false,
        notes: golfer.notes || '',
      });
    } else if (preselectedGroup) {
      form.setFieldValue('group', preselectedGroup.toString());
    }
  }, [golfer, preselectedGroup, form]);

  // Auto-generate golfer ID function
  const generateGolferId = (firstName: string, lastName: string) => {
    const firstInitial = firstName.substring(0, 1).toUpperCase();
    const lastNamePart = lastName.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `${firstInitial}${lastNamePart}${timestamp}`;
  };

  const handleSubmit = async (values: FormValues) => {
    // Auto-generate golfer_id if empty
    const finalGolferId = values.golfer_id || generateGolferId(values.first_name, values.last_name);

    const submitData: GolferCreate = {
      golfer_id: finalGolferId,
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email || undefined,
      phone: values.phone || undefined,
      date_of_birth: values.date_of_birth ?
        new Date(values.date_of_birth).toISOString().split('T')[0] : undefined,
      gender: values.gender || undefined,
      handicap: values.handicap ? (typeof values.handicap === 'string' ? parseFloat(values.handicap) : values.handicap) : undefined,
      skill_level: values.skill_level,
      preferred_tee: values.preferred_tee || undefined,
      group: values.group ? parseInt(values.group) : undefined,
      is_active: values.is_active,
      notes: values.notes || undefined,
    };

    try {
      await onSubmit(submitData);
      form.reset();
    } catch (error) {
      // Error handling is done by the parent component
      console.error('Error submitting golfer:', error);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        {/* Personal Information Section */}
        <div>
          <Group gap="sm" mb="md">
            <IconUser size={16} />
            <Text fw={500} size="sm" c="dimmed">Personal Information</Text>
          </Group>

          <Stack gap="md">
            <TextInput
              label="Golfer ID"
              placeholder="Leave blank to auto-generate (e.g., JDOE1234)"
              description="Unique identifier for this golfer (optional - will auto-generate if empty)"
              {...form.getInputProps('golfer_id')}
            />

            <Select
              label="Gender"
              placeholder="Select gender"
              data={[
                { value: '', label: 'Prefer not to say' },
                { value: 'M', label: 'Male' },
                { value: 'F', label: 'Female' },
                { value: 'O', label: 'Other' },
              ]}
              {...form.getInputProps('gender')}
            />

            <Group grow>
              <TextInput
                label="First Name"
                placeholder="Enter first name"
                required
                {...form.getInputProps('first_name')}
              />
              <TextInput
                label="Last Name"
                placeholder="Enter last name"
                required
                {...form.getInputProps('last_name')}
              />
            </Group>

            <Group grow>
              <TextInput
                label="Email"
                placeholder="Enter email address"
                type="email"
                {...form.getInputProps('email')}
              />
              <TextInput
                label="Phone"
                placeholder="Enter phone number"
                {...form.getInputProps('phone')}
              />
            </Group>

            <DateInput
              label="Date of Birth"
              placeholder="Select date of birth"
              value={form.values.date_of_birth}
              onChange={(value) => form.setFieldValue('date_of_birth', value)}
              maxDate={new Date()}
              error={form.errors.date_of_birth}
            />
          </Stack>
        </div>

        <Divider />

        {/* Golf Information Section */}
        <div>
          <Group gap="sm" mb="md">
            <IconGolf size={16} />
            <Text fw={500} size="sm" c="dimmed">Golf Information</Text>
          </Group>

          <Stack gap="md">
            <NumberInput
              label="Handicap"
              placeholder="e.g., 12.5"
              description="Golf handicap (-10 to 54)"
              min={-10}
              max={54}
              decimalScale={1}
              {...form.getInputProps('handicap')}
            />

            <Select
              label="Skill Level"
              data={[
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' },
                { value: 'professional', label: 'Professional' },
              ]}
              {...form.getInputProps('skill_level')}
            />

            <TextInput
              label="Preferred Tee"
              placeholder="e.g., Championship, Men's"
              {...form.getInputProps('preferred_tee')}
            />
          </Stack>
        </div>

        <Divider />

        {/* Group Assignment Section */}
        <div>
          <Text fw={500} size="sm" c="dimmed" mb="md">Group Assignment</Text>

          <Select
            label="Group"
            placeholder="No group assigned"
            data={availableGroups}
            {...form.getInputProps('group')}
          />

          {availableGroups.length <= 1 && (
            <Alert color="yellow" icon={<IconAlertCircle size={16} />} mt="xs">
              No groups available. Create groups first in the Groups tab.
            </Alert>
          )}
        </div>

        <Divider />

        {/* Additional Information */}
        <div>
          <Switch
            label="Active Golfer"
            description="Whether this golfer is currently active in the system"
            {...form.getInputProps('is_active', { type: 'checkbox' })}
          />

          <Textarea
            label="Notes"
            placeholder="Additional notes about this golfer (optional)"
            rows={3}
            mt="md"
            {...form.getInputProps('notes')}
          />
        </div>

        {/* Form Actions */}
        <Group justify="flex-end" gap="md" pt="md">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {golfer ? 'Update Golfer' : 'Create Golfer'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}