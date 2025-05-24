// File: frontend/src/components/Shots/ShotTable.tsx
// ------------------------------------------------
import React from 'react';
import { Badge, Text, Group as MantineGroup, ActionIcon, Tooltip, Stack, Progress } from '@mantine/core';
import { IconEye, IconUser, IconClock, IconTarget as IconTargetIcon, IconRuler } from '@tabler/icons-react';
import { DataTable } from '../Common/DataTable';
import { Shot } from '../../types';

interface ShotTableProps {
  shots: Shot[];
  loading?: boolean;
  selectedShots?: Shot[];
  onSelectionChange?: (shots: Shot[]) => void;
  onEdit?: (shot: Shot) => void;
  onDelete?: (shot: Shot) => void;
  onBulkDelete?: (shots: Shot[]) => void;
  onCreate?: () => void;
  onRefresh?: () => void;
  onViewDetails?: (shot: Shot) => void;
}

export const ShotTable: React.FC<ShotTableProps> = ({
  shots,
  loading = false,
  selectedShots = [],
  onSelectionChange,
  onEdit,
  onDelete,
  onBulkDelete,
  onCreate,
  onRefresh,
  onViewDetails,
}) => {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getShotTypeColor = (shotType: string) => {
    switch (shotType) {
      case 'drive': return 'blue';
      case 'approach': return 'green';
      case 'chip': return 'yellow';
      case 'putt': return 'orange';
      case 'bunker': return 'red';
      default: return 'gray';
    }
  };

  const getClubIcon = (club: string) => {
    if (club.includes('driver')) return '🏌️';
    if (club.includes('wood')) return '🪵';
    if (club.includes('iron')) return '⛳';
    if (club.includes('wedge')) return '🔺';
    if (club.includes('putter')) return '🎯';
    return '🏌️';
  };

  const calculateSmashFactor = (ballSpeed: number, clubSpeed: number) => {
    if (ballSpeed && clubSpeed && clubSpeed > 0) {
      return (ballSpeed / clubSpeed).toFixed(2);
    }
    return null;
  };

  const columns = [
    {
      key: 'shot_number',
      label: 'Shot',
      sortable: true,
      render: (shot: Shot) => (
        <div>
          <Text fw="bold" size="sm">
            Shot #{shot.shot_number}
          </Text>
          <Text size="xs" c="dimmed">
            {formatDate(shot.timestamp)}
          </Text>
        </div>
      ),
    },
    {
      key: 'golfer_name',
      label: 'Golfer',
      sortable: true,
      render: (shot: Shot) => (
        <div>
          {shot.golfer_name ? (
            <>
              <MantineGroup gap="xs" wrap="nowrap" mb="xs">
                <IconUser size={14} />
                <Text size="sm">{shot.golfer_name}</Text>
              </MantineGroup>
              {shot.group_name && (
                <Text size="xs" c="dimmed">
                  {shot.group_name}
                </Text>
              )}
            </>
          ) : (
            <Text size="sm" c="dimmed" fs="italic">
              Unassigned
            </Text>
          )}
        </div>
      ),
    },
    {
      key: 'shot_type',
      label: 'Shot Details',
      sortable: true,
      render: (shot: Shot) => (
        <div>
          <MantineGroup gap="xs" wrap="nowrap" mb="xs">
            <Badge
              color={getShotTypeColor(shot.shot_type)}
              variant="light"
              size="sm"
            >
              {shot.shot_type}
            </Badge>
            {shot.hole_number && (
              <Badge variant="outline" size="sm">
                Hole {shot.hole_number}
              </Badge>
            )}
          </MantineGroup>
          <MantineGroup gap="xs" wrap="nowrap">
            <Text size="xs">
              {getClubIcon(shot.club_used || '')} {shot.club_used || 'Unknown club'}
            </Text>
          </MantineGroup>
        </div>
      ),
    },
    {
      key: 'ball_speed',
      label: 'Speeds',
      sortable: true,
      render: (shot: Shot) => (
        <div>
          {shot.ball_speed && (
            <Text size="sm">
              Ball: {shot.ball_speed} mph
            </Text>
          )}
          {shot.club_head_speed && (
            <Text size="sm" c="dimmed">
              Club: {shot.club_head_speed} mph
            </Text>
          )}
          {shot.ball_speed && shot.club_head_speed && (
            <Text size="xs" c="blue">
              Smash: {calculateSmashFactor(shot.ball_speed, shot.club_head_speed)}
            </Text>
          )}
        </div>
      ),
    },
    {
      key: 'total_distance',
      label: 'Distance',
      sortable: true,
      render: (shot: Shot) => (
        <Stack gap="xs">
          {shot.total_distance && (
            <MantineGroup gap="xs" wrap="nowrap">
              <IconRuler size={14} />
              <Text size="sm" fw="bold">
                {shot.total_distance} yds
              </Text>
            </MantineGroup>
          )}
          {shot.carry_distance && (
            <Text size="xs" c="dimmed">
              Carry: {shot.carry_distance} yds
            </Text>
          )}
          {shot.launch_angle !== null && shot.launch_angle !== undefined && (
            <Text size="xs" c="dimmed">
              Launch: {shot.launch_angle}°
            </Text>
          )}
        </Stack>
      ),
    },
    {
      key: 'is_simulated',
      label: 'Type',
      sortable: true,
      render: (shot: Shot) => (
        <div>
          <Badge
            color={shot.is_simulated ? 'orange' : 'green'}
            variant="light"
          >
            {shot.is_simulated ? 'Simulator' : 'Real Course'}
          </Badge>
          {shot.launch_monitor_id && (
            <Text size="xs" c="dimmed" mt="xs">
              Monitor: {shot.launch_monitor_id}
            </Text>
          )}
        </div>
      ),
    },
  ];

  const getActions = (shot: Shot) => (
    <>
      {onViewDetails && (
        <Tooltip label="View Details">
          <ActionIcon
            variant="subtle"
            color="green"
            size="sm"
            onClick={() => onViewDetails(shot)}
          >
            <IconEye size={16} />
          </ActionIcon>
        </Tooltip>
      )}
    </>
  );

  return (
    <DataTable
      data={shots}
      columns={columns}
      loading={loading}
      selectable={true}
      selectedItems={selectedShots}
      onSelectionChange={onSelectionChange}
      onEdit={onEdit}
      onDelete={onDelete}
      onBulkDelete={onBulkDelete}
      onCreate={onCreate}
      onRefresh={onRefresh}
      searchPlaceholder="Search shots..."
      title="Shots"
      emptyMessage="No shots found. Record your first shot to get started."
      actions={getActions}
    />
  );
};