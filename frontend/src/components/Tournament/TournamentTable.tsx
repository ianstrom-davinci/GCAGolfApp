// File: frontend/src/components/Tournament/TournamentTable.tsx
// ----------------------------------------------------------
import React from 'react';
import { Badge, Text, Group, ActionIcon, Tooltip } from '@mantine/core';
import { IconEye, IconUsers, IconCalendar } from '@tabler/icons-react';
import { DataTable } from '../Common/DataTable';
import { Tournament } from '../../types';

interface TournamentTableProps {
  tournaments: Tournament[];
  loading?: boolean;
  selectedTournaments?: Tournament[];
  onSelectionChange?: (tournaments: Tournament[]) => void;
  onEdit?: (tournament: Tournament) => void;
  onDelete?: (tournament: Tournament) => void;
  onBulkDelete?: (tournaments: Tournament[]) => void;
  onCreate?: () => void;
  onRefresh?: () => void;
  onViewDetails?: (tournament: Tournament) => void;
}

export const TournamentTable: React.FC<TournamentTableProps> = ({
  tournaments,
  loading = false,
  selectedTournaments = [],
  onSelectionChange,
  onEdit,
  onDelete,
  onBulkDelete,
  onCreate,
  onRefresh,
  onViewDetails,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns = [
    {
      key: 'name',
      label: 'Tournament Name',
      sortable: true,
      render: (tournament: Tournament) => (
        <div>
          <Text fw="bold" size="sm">
            {tournament.name}
          </Text>
          {tournament.description && (
            <Text size="xs" c="dimmed" lineClamp={2}>
              {tournament.description}
            </Text>
          )}
        </div>
      ),
    },
    {
      key: 'start_date',
      label: 'Dates',
      sortable: true,
      render: (tournament: Tournament) => (
        <Group gap="xs" wrap="nowrap">
          <IconCalendar size={16} />
          <div>
            <Text size="sm">
              {formatDate(tournament.start_date)}
            </Text>
            <Text size="xs" c="dimmed">
              to {formatDate(tournament.end_date)}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      render: (tournament: Tournament) => (
        <Text size="sm" c={tournament.location ? undefined : 'dimmed'}>
          {tournament.location || 'No location set'}
        </Text>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (tournament: Tournament) => (
        <Badge
          color={tournament.is_active ? 'green' : 'gray'}
          variant="light"
        >
          {tournament.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'total_groups',
      label: 'Groups & Golfers',
      sortable: true,
      render: (tournament: Tournament) => (
        <Group gap="xs" wrap="nowrap">
          <IconUsers size={16} />
          <div>
            <Text size="sm">
              {tournament.total_groups} groups
            </Text>
            <Text size="xs" c="dimmed">
              {tournament.total_golfers} golfers
            </Text>
          </div>
        </Group>
      ),
    },
  ];

  const getActions = (tournament: Tournament) => (
    <>
      {onViewDetails && (
        <Tooltip label="View Details">
          <ActionIcon
            variant="subtle"
            color="green"
            size="sm"
            onClick={() => onViewDetails(tournament)}
          >
            <IconEye size={16} />
          </ActionIcon>
        </Tooltip>
      )}
    </>
  );

  return (
    <DataTable
      data={tournaments}
      columns={columns}
      loading={loading}
      selectable={true}
      selectedItems={selectedTournaments}
      onSelectionChange={onSelectionChange}
      onEdit={onEdit}
      onDelete={onDelete}
      onBulkDelete={onBulkDelete}
      onCreate={onCreate}
      onRefresh={onRefresh}
      searchPlaceholder="Search tournaments..."
      title="Tournaments"
      emptyMessage="No tournaments found. Create your first tournament to get started."
      actions={getActions}
    />
  );
};