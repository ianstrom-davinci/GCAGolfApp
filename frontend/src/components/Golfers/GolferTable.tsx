// File: frontend/src/components/Golfers/GolferTable.tsx
// ----------------------------------------------------
import React from 'react';
import { Badge, Text, Group as MantineGroup, ActionIcon, Tooltip, Avatar } from '@mantine/core';
import { IconEye, IconMail, IconPhone, IconTrophy, IconUsers, IconTarget } from '@tabler/icons-react';
import { DataTable } from '../Common/DataTable';
import { Golfer } from '../../types';

interface GolferTableProps {
  golfers: Golfer[];
  loading?: boolean;
  selectedGolfers?: Golfer[];
  onSelectionChange?: (golfers: Golfer[]) => void;
  onEdit?: (golfer: Golfer) => void;
  onDelete?: (golfer: Golfer) => void;
  onBulkDelete?: (golfers: Golfer[]) => void;
  onCreate?: () => void;
  onRefresh?: () => void;
  onViewDetails?: (golfer: Golfer) => void;
  onViewShots?: (golfer: Golfer) => void;
}

export const GolferTable: React.FC<GolferTableProps> = ({
  golfers,
  loading = false,
  selectedGolfers = [],
  onSelectionChange,
  onEdit,
  onDelete,
  onBulkDelete,
  onCreate,
  onRefresh,
  onViewDetails,
  onViewShots,
}) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getSkillLevelColor = (skillLevel: string) => {
    switch (skillLevel) {
      case 'beginner': return 'green';
      case 'intermediate': return 'blue';
      case 'advanced': return 'orange';
      case 'professional': return 'red';
      default: return 'gray';
    }
  };

  const columns = [
    {
      key: 'full_name',
      label: 'Golfer',
      sortable: true,
      render: (golfer: Golfer) => (
        <MantineGroup gap="sm" wrap="nowrap">
          <Avatar
            size="sm"
            radius="xl"
            color="blue"
          >
            {getInitials(golfer.first_name, golfer.last_name)}
          </Avatar>
          <div>
            <Text fw="bold" size="sm">
              {golfer.full_name}
            </Text>
            <Text size="xs" c="dimmed">
              ID: {golfer.golfer_id}
            </Text>
          </div>
        </MantineGroup>
      ),
    },
    {
      key: 'email',
      label: 'Contact',
      sortable: true,
      render: (golfer: Golfer) => (
        <div>
          {golfer.email && (
            <MantineGroup gap="xs" wrap="nowrap" mb="xs">
              <IconMail size={14} />
              <Text size="sm">{golfer.email}</Text>
            </MantineGroup>
          )}
          {golfer.phone && (
            <MantineGroup gap="xs" wrap="nowrap">
              <IconPhone size={14} />
              <Text size="sm">{golfer.phone}</Text>
            </MantineGroup>
          )}
          {!golfer.email && !golfer.phone && (
            <Text size="sm" c="dimmed" fs="italic">
              No contact info
            </Text>
          )}
        </div>
      ),
    },
    {
      key: 'handicap',
      label: 'Golf Info',
      sortable: true,
      render: (golfer: Golfer) => (
        <div>
          <MantineGroup gap="xs" wrap="nowrap" mb="xs">
            <Badge
              size="sm"
              color={getSkillLevelColor(golfer.skill_level)}
              variant="light"
            >
              {golfer.skill_level}
            </Badge>
          </MantineGroup>
          {golfer.handicap !== null && golfer.handicap !== undefined && (
            <Text size="sm" c="dimmed">
              Handicap: {golfer.handicap}
            </Text>
          )}
          {golfer.age && (
            <Text size="xs" c="dimmed">
              Age: {golfer.age}
            </Text>
          )}
        </div>
      ),
    },
    {
      key: 'group_name',
      label: 'Assignment',
      sortable: true,
      render: (golfer: Golfer) => (
        <div>
          {golfer.group_name ? (
            <>
              <MantineGroup gap="xs" wrap="nowrap" mb="xs">
                <IconUsers size={14} />
                <Text size="sm">{golfer.group_name}</Text>
              </MantineGroup>
              {golfer.tournament_name && (
                <MantineGroup gap="xs" wrap="nowrap">
                  <IconTrophy size={14} />
                  <Text size="xs" c="dimmed">
                    {golfer.tournament_name}
                  </Text>
                </MantineGroup>
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
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (golfer: Golfer) => (
        <Badge
          color={golfer.is_active ? 'green' : 'gray'}
          variant="light"
        >
          {golfer.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const getActions = (golfer: Golfer) => (
    <>
      {onViewDetails && (
        <Tooltip label="View Details">
          <ActionIcon
            variant="subtle"
            color="green"
            size="sm"
            onClick={() => onViewDetails(golfer)}
          >
            <IconEye size={16} />
          </ActionIcon>
        </Tooltip>
      )}

      {onViewShots && (
        <Tooltip label="View Shots">
          <ActionIcon
            variant="subtle"
            color="blue"
            size="sm"
            onClick={() => onViewShots(golfer)}
          >
            <IconTarget size={16} />
          </ActionIcon>
        </Tooltip>
      )}
    </>
  );

  return (
    <DataTable
      data={golfers}
      columns={columns}
      loading={loading}
      selectable={true}
      selectedItems={selectedGolfers}
      onSelectionChange={onSelectionChange}
      onEdit={onEdit}
      onDelete={onDelete}
      onBulkDelete={onBulkDelete}
      onCreate={onCreate}
      onRefresh={onRefresh}
      searchPlaceholder="Search golfers..."
      title="Golfers"
      emptyMessage="No golfers found. Create your first golfer to get started."
      actions={getActions}
    />
  );
};