// File: frontend/src/components/Shots/ShotForm.tsx
// -----------------------------------------------
import React, { useEffect } from 'react';
import {
  Stack,
  TextInput,
  NumberInput,
  Select,
  Switch,
  Button,
  Group,
  Alert,
  Text,
  Textarea,
  Grid,
  Divider,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconTarget, IconClock, IconRuler } from '@tabler/icons-react';
import { Shot, ShotCreate } from '../../types';
import { useGolfers } from '../../hooks/useGolfers';
import { SHOT_TYPES, CLUBS } from '../../utils/constants';

interface ShotFormProps {
  shot?: Shot;
  onSubmit: (data: ShotCreate) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  preselectedGolfer?: number;
}

export const ShotForm: React.FC<ShotFormProps> = ({
  shot,
  onSubmit,
  onCancel,
  loading = false,
  preselectedGolfer,
}) => {
  const isEdit = Boolean(shot);
  const { golfers } = useGolfers();

  const form = useForm<ShotCreate>({
    initialValues: {
      golfer: shot?.golfer || preselectedGolfer || undefined,
      hole_number: shot?.hole_number || undefined,
      shot_type: shot?.shot_type || 'drive',
      club_used: shot?.club_used || '',
      ball_speed: shot?.ball_speed || undefined,
      club_head_speed: shot?.club_head_speed || undefined,
      launch_angle: shot?.launch_angle || undefined,
      spin_rate: shot?.spin_rate || undefined,
      carry_distance: shot?.carry_distance || undefined,
      total_distance: shot?.total_distance || undefined,
      side_angle: shot?.side_angle || undefined,
      is_simulated: shot?.is_simulated ?? false,
      launch_monitor_id: shot?.launch_monitor_id || '',
      notes: shot?.notes || '',
      timestamp: shot?.timestamp || new Date().toISOString(),
    },
    validate: {
      golfer: (value) => {
        if (!value) {
          return 'Please select a golfer';
        }
        return null;
      },
      hole_number: (value) => {
        if (value !== undefined && value !== null) {
          if (value < 1 || value > 18) {
            return 'Hole number must be between 1 and 18';
          }
        }
        return null;
      },
      ball_speed: (value) => {
        if (value !== undefined && value !== null) {
          if (value < 0 || value > 250) {
            return 'Ball speed must be between 0 and 250 mph';
          }
        }
        return null;
      },
      club_head_speed: (value) => {
        if (value !== undefined && value !== null) {
          if (value < 0 || value > 200) {
            return 'Club head speed must be between 0 and 200 mph';
          }
        }
        return null;
      },
      launch_angle: (value) => {
        if (value !== undefined && value !== null) {
          if (value < -20 || value > 60) {
            return 'Launch angle must be between -20 and 60 degrees';
          }
        }
        return null;
      },
      spin_rate: (value) => {
        if (value !== undefined && value !== null) {
          if (value < 0 || value > 10000) {
            return 'Spin rate must be between 0 and 10,000 rpm';
          }
        }
        return null;
      },
      carry_distance: (value) => {
        if (value !== undefined && value !== null) {
          if (value < 0 || value > 400) {
            return 'Carry distance must be between 0 and 400 yards';
          }
        }
        return null;
      },
      total_distance: (value) => {
        if (value !== undefined && value !== null) {
          if (value < 0 || value > 500) {
            return 'Total distance must be between 0 and 500 yards';
          }
        }
        return null;
      },
      side_angle: (value) => {
        if (value !== undefined && value !== null) {
          if (value < -45 || value > 45) {
            return 'Side angle must be between -45 and 45 degrees';
          }
        }
        return null;
      },
    },
  });

  // Update form when preselectedGolfer changes
  useEffect(() => {
    if (preselectedGolfer && !isEdit) {
      form.setFieldValue('golfer', preselectedGolfer);
    }
  }, [preselectedGolfer, isEdit, form]);

  const handleSubmit = async (values: ShotCreate) => {
    try {
      await onSubmit(values);
      if (!isEdit) {
        form.reset();
        // Keep golfer selection if it was preselected
        if (preselectedGolfer) {
          form.setFieldValue('golfer', preselectedGolfer);
        }
        form.setFieldValue('shot_type', 'drive');
        form.setFieldValue('is_simulated', false);
        form.setFieldValue('timestamp', new Date().toISOString());
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Golfer options with group info
  const golferOptions = golfers.map((golfer) => ({
    value: golfer.id.toString(),
    label: `${golfer.full_name} (${golfer.golfer_id})${golfer.group_name ? ` - ${golfer.group_name}` : ''}`,
  }));

  const selectedGolfer = golfers.find(g => g.id === form.values.golfer);

  // Calculate smash factor if both speeds are available
  const calculateSmashFactor = () => {
    const { ball_speed, club_head_speed } = form.values;
    if (ball_speed && club_head_speed && club_head_speed > 0) {
      return (ball_speed / club_head_speed).toFixed(2);
    }
    return null;
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        {isEdit && shot && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="blue"
            variant="light"
          >
            <Group justify="space-between">
              <div>
                Editing shot: <strong>Shot #{shot.shot_number}</strong>
                {shot.golfer_name && ` by ${shot.golfer_name}`}
              </div>
            </Group>
            <Text size="sm" mt="xs">
              {shot.shot_type} with {shot.club_used || 'unknown club'}
              {shot.total_distance && ` - ${shot.total_distance} yards`}
            </Text>
          </Alert>
        )}

        {/* Basic Shot Information */}
        <div>
          <Group gap="xs" mb="sm">
            <IconTarget size={20} />
            <Text fw="bold">Shot Information</Text>
          </Group>

          <Grid>
            <Grid.Col span={6}>
              <Select
                label="Golfer"
                placeholder="Select a golfer"
                data={golferOptions}
                value={form.values.golfer?.toString() || ''}
                onChange={(value) => {
                  form.setFieldValue('golfer', value ? parseInt(value) : undefined);
                }}
                disabled={loading}
                searchable
                required
                error={form.errors.golfer}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <NumberInput
                label="Hole Number"
                placeholder="1-18"
                min={1}
                max={18}
                {...form.getInputProps('hole_number')}
                disabled={loading}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <DateTimePicker
                label="Timestamp"
                placeholder="Select date and time"
                value={form.values.timestamp ? new Date(form.values.timestamp) : new Date()}
                onChange={(date) => {
                  const timestamp = new Date(date || new Date()).toISOString();
                  form.setFieldValue('timestamp', timestamp);
                }}
                disabled={loading}
                withSeconds
              />
            </Grid.Col>
          </Grid>

          {selectedGolfer && (
            <Alert color="green" variant="light" mt="xs">
              <Text size="sm">
                <strong>{selectedGolfer.full_name}</strong> ({selectedGolfer.golfer_id})
              </Text>
              {selectedGolfer.group_name && (
                <Text size="xs" c="dimmed">
                  Group: {selectedGolfer.group_name}
                  {selectedGolfer.tournament_name && ` in ${selectedGolfer.tournament_name}`}
                </Text>
              )}
              {selectedGolfer.handicap !== null && selectedGolfer.handicap !== undefined && (
                <Text size="xs" c="dimmed">
                  Handicap: {selectedGolfer.handicap}
                </Text>
              )}
            </Alert>
          )}

          <Grid mt="md">
            <Grid.Col span={6}>
              <Select
                label="Shot Type"
                placeholder="Select shot type"
                data={SHOT_TYPES}
                {...form.getInputProps('shot_type')}
                disabled={loading}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Club Used"
                placeholder="Select club"
                data={CLUBS}
                value={form.values.club_used}
                onChange={(value) => form.setFieldValue('club_used', value || '')}
                disabled={loading}
                searchable
                clearable
              />
            </Grid.Col>
          </Grid>
        </div>

        <Divider />

        {/* Launch Monitor Data */}
        <div>
          <Group gap="xs" mb="sm">
            <IconRuler size={20} />
            <Text fw="bold">Launch Monitor Data</Text>
          </Group>

          <Grid>
            <Grid.Col span={4}>
              <NumberInput
                label="Ball Speed (mph)"
                placeholder="e.g., 165.3"
                min={0}
                max={250}
                decimalScale={1}
                step={0.1}
                {...form.getInputProps('ball_speed')}
                disabled={loading}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Club Head Speed (mph)"
                placeholder="e.g., 110.5"
                min={0}
                max={200}
                decimalScale={1}
                step={0.1}
                {...form.getInputProps('club_head_speed')}
                disabled={loading}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Launch Angle (°)"
                placeholder="e.g., 12.5"
                min={-20}
                max={60}
                decimalScale={1}
                step={0.1}
                {...form.getInputProps('launch_angle')}
                disabled={loading}
              />
            </Grid.Col>

            <Grid.Col span={4}>
              <NumberInput
                label="Spin Rate (rpm)"
                placeholder="e.g., 2500"
                min={0}
                max={10000}
                step={10}
                {...form.getInputProps('spin_rate')}
                disabled={loading}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Side Angle (°)"
                placeholder="e.g., -2.5"
                min={-45}
                max={45}
                decimalScale={1}
                step={0.1}
                {...form.getInputProps('side_angle')}
                disabled={loading}
                description="Negative = left, Positive = right"
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput
                label="Launch Monitor ID"
                placeholder="e.g., TM001, GC-1"
                {...form.getInputProps('launch_monitor_id')}
                disabled={loading}
              />
            </Grid.Col>
          </Grid>

          {calculateSmashFactor() && (
            <Alert color="blue" variant="light" mt="xs">
              <Text size="sm">
                <strong>Calculated Smash Factor:</strong> {calculateSmashFactor()}
              </Text>
              <Text size="xs" c="dimmed">
                Ball Speed ÷ Club Head Speed = {form.values.ball_speed} ÷ {form.values.club_head_speed}
              </Text>
            </Alert>
          )}
        </div>

        <Divider />

        {/* Distance Data */}
        <div>
          <Group gap="xs" mb="sm">
            <IconClock size={20} />
            <Text fw="bold">Distance Data</Text>
          </Group>

          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="Carry Distance (yards)"
                placeholder="e.g., 275.5"
                min={0}
                max={400}
                decimalScale={1}
                step={0.1}
                {...form.getInputProps('carry_distance')}
                disabled={loading}
                description="Distance ball travels in the air"
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Total Distance (yards)"
                placeholder="e.g., 285.2"
                min={0}
                max={500}
                decimalScale={1}
                step={0.1}
                {...form.getInputProps('total_distance')}
                disabled={loading}
                description="Total distance including roll"
              />
            </Grid.Col>
          </Grid>
        </div>

        <Switch
          label="Simulated Shot"
          description="Whether this shot was taken on a simulator vs. real course"
          {...form.getInputProps('is_simulated', { type: 'checkbox' })}
          disabled={loading}
        />

        <Textarea
          label="Notes"
          placeholder="Additional notes about this shot (optional)"
          rows={3}
          {...form.getInputProps('notes')}
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
            {isEdit ? 'Update Shot' : 'Record Shot'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};