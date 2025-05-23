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
  Alert
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertTriangle,
  IconClock
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
  name: string;
  tee_time: string | null;
  golfer_count: number;
}

export const GroupsManagementTab: React.FC = () => {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    tournament: '',
    name: '',
    tee_time: ''
  });

  // Filters
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);

  useEffect(() => {
    fetchTournaments();
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [selectedTournament]);

  const fetchTournaments = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/golf/tournaments/');
      const data = await response.json();
      setTournaments(data.results || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const url = new URL('http://localhost:8000/api/golf/groups/');
      if (selectedTournament) {
        url.searchParams.append('tournament_id', selectedTournament);
      }

      const response = await fetch(url.toString());
      const data = await response.json();
      setGroups(data.results || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    try {
      const groupData = {
        tournament: parseInt(formData.tournament),
        name: formData.name,
        tee_time: formData.tee_time || null
      };

      const response = await fetch('http://localhost:8000/api/golf/groups/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      });

      if (response.ok) {
        setCreateModal(false);
        resetForm();
        fetchGroups();
        alert('Group created successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error creating group: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Error creating group');
    }
  };

  const updateGroup = async () => {
    if (!selectedGroup) return;

    try {
      const groupData = {
        tournament: parseInt(formData.tournament),
        name: formData.name,
        tee_time: formData.tee_time || null
      };

      const response = await fetch(`http://localhost:8000/api/golf/groups/${selectedGroup.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      });

      if (response.ok) {
        setEditModal(false);
        setSelectedGroup(null);
        resetForm();
        fetchGroups();
        alert('Group updated successfully!');
      } else {
        alert('Error updating group');
      }
    } catch (error) {
      console.error('Error updating group:', error);
      alert('Error updating group');
    }
  };

  const deleteGroup = async () => {
    if (!selectedGroup) return;

    try {
      const response = await fetch(`http://localhost:8000/api/golf/groups/${selectedGroup.id}/`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDeleteModal(false);
        setSelectedGroup(null);
        fetchGroups();
        alert('Group deleted successfully!');
      } else {
        alert('Error deleting group');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Error deleting group');
    }
  };

  const resetForm = () => {
    setFormData({
      tournament: '',
      name: '',
      tee_time: ''
    });
  };

  const openEditModal = (group: GroupData) => {
    setSelectedGroup(group);
    setFormData({
      tournament: group.tournament.toString(),
      name: group.name,
      tee_time: group.tee_time || ''
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
              <Table.Th>Group Name</Table.Th>
              <Table.Th>Tournament</Table.Th>
              <Table.Th>Tee Time</Table.Th>
              <Table.Th>Golfers</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {groups.map((group) => (
              <Table.Tr key={group.id}>
                <Table.Td>
                  <Text fw={500}>{group.name}</Text>
                </Table.Td>
                <Table.Td>{group.tournament_name}</Table.Td>
                <Table.Td>
                  {group.tee_time ? (
                    <Group gap="xs">
                      <IconClock size={14} />
                      <Text size="sm">{group.tee_time}</Text>
                    </Group>
                  ) : (
                    <Text size="sm" c="dimmed">No tee time</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color="blue">
                    {group.golfer_count} golfers
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
            label="Group Name"
            placeholder="e.g., Group 1, Smith Foursome"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <TextInput
            label="Tee Time (Optional)"
            type="time"
            value={formData.tee_time}
            onChange={(e) => setFormData({...formData, tee_time: e.target.value})}
          />
          <Group justify="flex-end" gap="md">
            <Button variant="outline" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={createGroup} disabled={!formData.tournament || !formData.name}>
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
            label="Group Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <TextInput
            label="Tee Time (Optional)"
            type="time"
            value={formData.tee_time}
            onChange={(e) => setFormData({...formData, tee_time: e.target.value})}
          />
          <Group justify="flex-end" gap="md">
            <Button variant="outline" onClick={() => setEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={updateGroup}>
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
                This will permanently delete "{selectedGroup?.name}" and all associated golfers and shot data.
              </Text>
            </div>
          </Group>

          <Group justify="flex-end" gap="md">
            <Button variant="outline" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={deleteGroup}>
              Delete Group
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};