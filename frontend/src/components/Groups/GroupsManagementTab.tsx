// File: frontend/src/components/Groups/GroupsManagementTab.tsx
// -----------------------------------------------------------
import React, { useState } from 'react';
import {
  Card,
  Title,
  Button,
  Table,
  Group,
  Stack,
  ActionIcon,
  Badge,
  Text,
  Alert,
  Loader,
  Select,
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { GroupModal } from './GroupModal';
import { ConfirmationModal } from '../Common/ConfirmationModal';
import { useGroups } from '../../hooks/useGroups';
import { useTournaments } from '../../hooks/useTournaments';
import { Group as GroupType, GroupCreate } from '../../types';

export const GroupsManagementTab: React.FC = () => {
  const { tournaments, loading: tournamentsLoading } = useTournaments();
  const [selectedTournament, setSelectedTournament] = useState<number | undefined>(undefined);
  const {
    groups,
    loading,
    createGroup,
    updateGroup,
    deleteGroup,
    bulkDeleteGroups,
    fetchGroups,
  } = useGroups(selectedTournament);

  const [selectedGroups, setSelectedGroups] = useState<GroupType[]>([]);
  const [modalState, setModalState] = useState<{
    opened: boolean;
    group?: GroupType;
  }>({
    opened: false,
  });
  const [deleteModal, setDeleteModal] = useState<{
    opened: boolean;
    group?: GroupType;
    bulk?: boolean;
  }>({
    opened: false,
  });

  // Modal handlers
  const handleCreate = () => {
    setModalState({ opened: true });
  };

  const handleEdit = (group: GroupType) => {
    setModalState({ opened: true, group });
  };

  const handleModalClose = () => {
    setModalState({ opened: false });
  };

  const handleModalSubmit = async (data: GroupCreate) => {
    if (modalState.group) {
      await updateGroup(modalState.group.id, data);
    } else {
      await createGroup(data);
    }
  };

  // Delete handlers
  const handleDelete = (group: GroupType) => {
    setDeleteModal({ opened: true, group });
  };

  const handleBulkDelete = (groups: GroupType[]) => {
    setSelectedGroups(groups);
    setDeleteModal({ opened: true, bulk: true });
  };

  const handleDeleteConfirm = async (deleteChildren: boolean) => {
    if (deleteModal.bulk) {
      await bulkDeleteGroups({
        ids: selectedGroups.map(g => g.id),
        delete_children: deleteChildren,
      });
      setSelectedGroups([]);
    } else if (deleteModal.group) {
      await deleteGroup(deleteModal.group.id, deleteChildren);
    }
    setDeleteModal({ opened: false });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ opened: false });
  };

  const getDeleteMessage = () => {
    if (deleteModal.bulk) {
      return `Are you sure you want to delete ${selectedGroups.length} groups?`;
    } else if (deleteModal.group) {
      return `Are you sure you want to delete "${deleteModal.group.display_name}"?`;
    }
    return '';
  };

  const getDeleteTitle = () => {
    if (deleteModal.bulk) {
      return 'Delete Multiple Groups';
    }
    return 'Delete Group';
  };

  const showChildrenOption = deleteModal.group
    ? deleteModal.group.current_golfer_count > 0
    : selectedGroups.some(g => g.current_golfer_count > 0);

  // Tournament filter options
  const tournamentOptions = tournaments.map(t => ({
    value: t.id.toString(),
    label: t.name,
  }));

  const filterOptions = [
    { value: '', label: 'All Tournaments' },
    ...tournamentOptions,
  ];

  // Show loading state while fetching tournaments
  if (tournamentsLoading) {
    return (
      <Stack gap="lg" align="center" justify="center" style={{ minHeight: 200 }}>
        <Loader size="lg" />
        <Text>Loading tournaments...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between">
        <Title order={2}>Groups Management</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={handleCreate}
          disabled={tournaments.length === 0}
        >
          Create Group
        </Button>
      </Group>

      {tournaments.length === 0 && (
        <Alert color="yellow" icon={<IconAlertTriangle size={16} />}>
          You need to create at least one tournament before you can create groups.
        </Alert>
      )}

      {/* Filter */}
      {tournaments.length > 0 && (
        <Card shadow="sm" p="md">
          <Group>
            <Text fw={500}>Filter by Tournament:</Text>
            <Select
              placeholder="All Tournaments"
              data={filterOptions}
              value={selectedTournament?.toString() || ''}
              onChange={(value) => setSelectedTournament(value ? parseInt(value) : undefined)}
              style={{ minWidth: 200 }}
            />
          </Group>
        </Card>
      )}

      {/* Groups Table */}
      <Card shadow="sm" p="lg">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Group</Table.Th>
              <Table.Th>Tournament</Table.Th>
              <Table.Th>Max Golfers</Table.Th>
              <Table.Th>Current Golfers</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {groups.map((group) => (
              <Table.Tr key={group.id}>
                <Table.Td>
                  <Text fw={500}>{group.display_name}</Text>
                </Table.Td>
                <Table.Td>{group.tournament_name || 'Unassigned'}</Table.Td>
                <Table.Td>
                  <Badge variant="outline" color="blue">
                    {group.max_golfers} max
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant="light"
                    color={group.current_golfer_count === group.max_golfers ? 'red' : 'green'}
                  >
                    {group.current_golfer_count}/{group.max_golfers}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => handleEdit(group)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleDelete(group)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {groups.length === 0 && !loading && tournaments.length > 0 && (
          <Text ta="center" c="dimmed" py="xl">
            No groups found. Create your first group!
          </Text>
        )}

        {loading && (
          <Stack align="center" py="xl">
            <Loader size="sm" />
            <Text size="sm" c="dimmed">Loading groups...</Text>
          </Stack>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <GroupModal
        opened={modalState.opened}
        onClose={handleModalClose}
        group={modalState.group}
        onSubmit={handleModalSubmit}
        loading={loading}
        preselectedTournament={selectedTournament}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        opened={deleteModal.opened}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={getDeleteTitle()}
        message={getDeleteMessage()}
        confirmLabel="Delete"
        type="delete"
        loading={loading}
        showChildrenOption={showChildrenOption}
        childrenLabel="Also delete all golfers and shots in these groups"
        itemCount={deleteModal.bulk ? selectedGroups.length : 1}
      />
    </Stack>
  );
};