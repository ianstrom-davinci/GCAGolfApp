// File: frontend/src/components/Groups/GroupTable.tsx
// --------------------------------------------------
import React from 'react';
import { Badge, Text, Group as MantineGroup, ActionIcon, Tooltip, Progress, Stack } from '@mantine/core';
import { IconEye, IconUsers, IconUserPlus, IconUserMinus, IconTrophy } from '@tabler/icons-react';
import { DataTable } from '../Common/DataTable';
import { Group } from '../../types';

interface GroupTableProps {
  groups: Group[];
  loading?: boolean;
  selectedGroups?: Group[];
  onSelectionChange?: (groups: Group[]) => void;
  onEdit?: (group: Group) => void;
  onDelete?: (group: Group) => void;
  onBulkDelete?: (groups: Group[]) => void;
  onCreate?: () => void;
  onRefresh?: () => void;
  onViewDetails?: (group: Group) => void;
  onManageGolfers?: (group: Group) => void;
}

export const GroupTable: React.FC<GroupTableProps> = ({
  groups,
  loading = false,
  selectedGroups = [],
  onSelectionChange,
  onEdit,
  onDelete,
  onBulkDelete,
  onCreate,
  onRefresh,
  onViewDetails,
  onManageGolfers,
}) => {
  const columns = [
    {
      key: 'display_name',
      label: 'Group',
      sortable: true,
      render: (group: Group) => (
        <div>
          <Text fw="bold" size="sm">
            {group.display_name}
          </Text>
          <Text size="xs" c="dimmed">
            Group #{group.group_number}
          </Text>
        </div>
      ),
    },
    {
      key: 'tournament_name',
      label: 'Tournament',
      sortable: true,
      render: (group: Group) => (
        <MantineGroup gap="xs" wrap="nowrap">
          {group.tournament_name ? (
            <>
              <IconTrophy size={16} />
              <Text size="sm">{group.tournament_name}</Text>
            </>
          ) : (
            <Text size="sm" c="dimmed" fs="italic">
              No tournament assigned
            </Text>
          )}
        </MantineGroup>
      ),
    },
    {
      key: 'current_golfer_count',
      label: 'Golfers',
      sortable: true,
      render: (group: Group) => {
        const percentage = group.max_golfers > 0
          ? (group.current_golfer_count / group.max_golfers) * 100
          : 0;

        return (
          <Stack gap="xs">
            <MantineGroup gap="xs" wrap="nowrap">
              <IconUsers size={16} />
              <Text size="sm">
                {group.current_golfer_count}/{group.max_golfers}
              </Text>
            </MantineGroup>
            <Progress
              value={percentage}
              size="sm"
              color={group.is_full ? 'red' : percentage > 75 ? 'orange' : 'blue'}
            />
          </Stack>
        );
      },
    },
    {
      key: 'is_full',
      label: 'Status',
      sortable: true,
      render: (group: Group) => (
        <Badge
          color={group.is_full ? 'red' : group.current_golfer_count === 0 ? 'gray' : 'green'}
          variant="light"
        >
          {group.is_full ? 'Full' : group.current_golfer_count === 0 ? 'Empty' : 'Available'}
        </Badge>
      ),
    },
    {
      key: 'available_spots',
      label: 'Available Spots',
      sortable: true,
      render: (group: Group) => {
        const available = group.max_golfers - group.current_golfer_count;
        return (
          <Text
            size="sm"
            c={available === 0 ? 'red' : available <= 1 ? 'orange' : 'green'}
            fw={available === 0 ? 'bold' : undefined}
          >
            {available} spots
          </Text>
        );
      },
    },
  ];

  const getActions = (group: Group) => (
    <>
      {onViewDetails && (
        <Tooltip label="View Details">
          <ActionIcon
            variant="subtle"
            color="green"
            size="sm"
            onClick={() => onViewDetails(group)}
          >
            <IconEye size={16} />
          </ActionIcon>
        </Tooltip>
      )}

      {onManageGolfers && (
        <Tooltip label="Manage Golfers">
          <ActionIcon
            variant="subtle"
            color="blue"
            size="sm"
            onClick={() => onManageGolfers(group)}
          >
            {group.current_golfer_count > 0 ? (
              <IconUserMinus size={16} />
            ) : (
              <IconUserPlus size={16} />
            )}
          </ActionIcon>
        </Tooltip>
      )}
    </>
  );

  return (
    <DataTable
      data={groups}
      columns={columns}
      loading={loading}
      selectable={true}
      selectedItems={selectedGroups}
      onSelectionChange={onSelectionChange}
      onEdit={onEdit}
      onDelete={onDelete}
      onBulkDelete={onBulkDelete}
      onCreate={onCreate}
      onRefresh={onRefresh}
      searchPlaceholder="Search groups..."
      title="Groups"
      emptyMessage="No groups found. Create your first group to get started."
      actions={getActions}
    />
  );
};