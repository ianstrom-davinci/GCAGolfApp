// File: frontend/src/components/Groups/GroupsManagementTab.tsx
// -----------------------------------------------------------
import React, { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Button,
  Table,
  Group,
  Stack,
  Modal,
  TextInput,
  Select,
  ActionIcon,
  Badge,
  Text,
  Alert,
  Loader
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertTriangle,
  IconClock,
  IconCheck,
  IconX
} from '@tabler/icons-react';

interface Tournament {
  id: number;
  name: string;
  is_active: boolean;
}

interface GroupData {
  id: number;
  tournament: number;
  tournament_name: string;
  nickname: string | null;
  group_number: number;
  current_golfer_count: number;
  max_golfers: number;
  display_name: string;
}

export const GroupsManagementTab: React.FC = () => {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);
  const [tournamentsLoading, setTournamentsLoading] = useState(true);

  // Modal states
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    tournament: '',
    nickname: '',
    max_golfers: '4'
  });

  // Filters
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (!tournamentsLoading) {
      fetchGroups();
    }
  }, [selectedTournament, tournamentsLoading]);

  const fetchTournaments = async () => {
    setTournamentsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/tournaments/');
      const data = await response.json();
      console.log('Tournaments API response:', data); // Debug log
      setTournaments(data.results || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      setTournaments([]);
      notifications.show({
        title: 'Error',
        message: 'Failed to load tournaments',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setTournamentsLoading(false);
    }
  };

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const url = new URL('http://localhost:8000/api/groups/');
      if (selectedTournament) {
        url.searchParams.append('tournament_id', selectedTournament);
      }

      const response = await fetch(url.toString());
      const data = await response.json();
      setGroups(data.results || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
      notifications.show({
        title: 'Error',
        message: 'Failed to load groups',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    setLoading(true);
    try {
      const groupData = {
        tournament: parseInt(formData.tournament),
        nickname: formData.nickname || null,
        max_golfers: parseInt(formData.max_golfers)
      };

      const response = await fetch('http://localhost:8000/api/groups/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      });

      if (response.ok) {
        // Close modal and reset form
        setCreateModal(false);
        resetForm();

        // Refresh groups list
        await fetchGroups();

        // Show success notification
        notifications.show({
          title: 'Success',
          message: 'Group created successfully!',
          color: 'green',
          icon: <IconCheck size={16} />,
          autoClose: 3000,
        });
      } else {
        const errorData = await response.json();
        notifications.show({
          title: 'Error',
          message: `Failed to create group: ${JSON.stringify(errorData)}`,
          color: 'red',
          icon: <IconX size={16} />,
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error('Error creating group:', error);
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred while creating the group',
        color: 'red',
        icon: <IconX size={16} />,
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = async () => {
    if (!selectedGroup) return;

    setLoading(true);
    try {
      const groupData = {
        tournament: parseInt(formData.tournament),
        nickname: formData.nickname || null,
        max_golfers: parseInt(formData.max_golfers)
      };

      const response = await fetch(`http://localhost:8000/api/groups/${selectedGroup.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      });

      if (response.ok) {
        // Close modal and reset form
        setEditModal(false);
        setSelectedGroup(null);
        resetForm();

        // Refresh groups list
        await fetchGroups();

        // Show success notification
        notifications.show({
          title: 'Success',
          message: 'Group updated successfully!',
          color: 'green',
          icon: <IconCheck size={16} />,
          autoClose: 3000,
        });
      } else {
        const errorData = await response.json();
        notifications.show({
          title: 'Error',
          message: `Failed to update group: ${JSON.stringify(errorData)}`,
          color: 'red',
          icon: <IconX size={16} />,
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error('Error updating group:', error);
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred while updating the group',
        color: 'red',
        icon: <IconX size={16} />,
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async () => {
    if (!selectedGroup) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/groups/${selectedGroup.id}/`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Close modal
        setDeleteModal(false);
        setSelectedGroup(null);

        // Refresh groups list
        await fetchGroups();

        // Show success notification
        notifications.show({
          title: 'Success',
          message: 'Group deleted successfully!',
          color: 'green',
          icon: <IconCheck size={16} />,
          autoClose: 3000,
        });
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete group',
          color: 'red',
          icon: <IconX size={16} />,
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred while deleting the group',
        color: 'red',
        icon: <IconX size={16} />,
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tournament: '',
      nickname: '',
      max_golfers: '4'
    });
  };

  const openEditModal = (group: GroupData) => {
    setSelectedGroup(group);
    setFormData({
      tournament: group.tournament.toString(),
      nickname: group.nickname || '',
      max_golfers: group.max_golfers.toString()
    });
    setEditModal(true);
  };

  const openDeleteModal = (group: GroupData) => {
    setSelectedGroup(group);
    setDeleteModal(true);
  };

  const tournamentOptions = tournaments.map(t => ({
    value: t.id.toString(),
    label: t.name
  }));

  const filterOptions = [
    { value: '', label: 'All Tournaments' },
    ...tournamentOptions
  ];

  const maxGolfersOptions = [
    { value: '1', label: '1 Golfer' },
    { value: '2', label: '2 Golfers (Twosome)' },
    { value: '3', label: '3 Golfers (Threesome)' },
    { value: '4', label: '4 Golfers (Foursome)' },
    { value: '5', label: '5 Golfers' },
    { value: '6', label: '6 Golfers' },
    { value: '7', label: '7 Golfers' },
    { value: '8', label: '8 Golfers' },
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
          onClick={() => setCreateModal(true)}
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
              value={selectedTournament}
              onChange={setSelectedTournament}
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
                <Table.Td>{group.tournament_name}</Table.Td>
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
                      onClick={() => openEditModal(group)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => openDeleteModal(group)}
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
      </Card>

      {/* Create Group Modal */}
      <Modal
        opened={createModal}
        onClose={() => {
          setCreateModal(false);
          resetForm();
        }}
        title="Create New Group"
        size="md"
      >
        <Stack gap="md">
          <Select
            label="Tournament"
            placeholder="Select tournament"
            data={tournamentOptions}
            value={formData.tournament}
            onChange={(value) => setFormData({...formData, tournament: value || ''})}
            required
          />
          <TextInput
            label="Group Nickname (Optional)"
            placeholder="e.g., Smith Foursome, Morning Group"
            value={formData.nickname}
            onChange={(e) => setFormData({...formData, nickname: e.target.value})}
          />
          <Select
            label="Maximum Golfers"
            data={maxGolfersOptions}
            value={formData.max_golfers}
            onChange={(value) => setFormData({...formData, max_golfers: value || '4'})}
            required
          />
          <Group justify="flex-end" gap="md">
            <Button
              variant="outline"
              onClick={() => setCreateModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={createGroup}
              disabled={!formData.tournament || loading}
              loading={loading}
            >
              Create Group
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Group Modal */}
      <Modal
        opened={editModal}
        onClose={() => {
          setEditModal(false);
          setSelectedGroup(null);
          resetForm();
        }}
        title="Edit Group"
        size="md"
      >
        <Stack gap="md">
          <Select
            label="Tournament"
            data={tournamentOptions}
            value={formData.tournament}
            onChange={(value) => setFormData({...formData, tournament: value || ''})}
            required
          />
          <TextInput
            label="Group Nickname (Optional)"
            placeholder="e.g., Smith Foursome, Morning Group"
            value={formData.nickname}
            onChange={(e) => setFormData({...formData, nickname: e.target.value})}
          />
          <Select
            label="Maximum Golfers"
            data={maxGolfersOptions}
            value={formData.max_golfers}
            onChange={(value) => setFormData({...formData, max_golfers: value || '4'})}
            required
          />
          <Group justify="flex-end" gap="md">
            <Button
              variant="outline"
              onClick={() => setEditModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={updateGroup}
              disabled={loading}
              loading={loading}
            >
              Update Group
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setSelectedGroup(null);
        }}
        title="Delete Group"
        size="md"
      >
        <Stack gap="md">
          <Group gap="md">
            <IconAlertTriangle size={24} color="red" />
            <div>
              <Text fw={500}>Are you sure you want to delete this group?</Text>
              <Text size="sm" c="dimmed">
                This will permanently delete "{selectedGroup?.display_name}" and all associated golfers and shot data.
              </Text>
            </div>
          </Group>

          <Group justify="flex-end" gap="md">
            <Button
              variant="outline"
              onClick={() => setDeleteModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={deleteGroup}
              disabled={loading}
              loading={loading}
            >
              Delete Group
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};