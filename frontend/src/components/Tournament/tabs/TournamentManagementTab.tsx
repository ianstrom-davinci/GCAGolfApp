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
  NumberInput,
  Switch,
  ActionIcon,
  Badge,
  Text
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertTriangle
} from '@tabler/icons-react';

interface Tournament {
  id: number;
  name: string;
  date: string;
  description: string;
  hole_number: number;
  is_active: boolean;
  group_count: number;
  golfer_count: number;
}

export const TournamentManagementTab: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    hole_number: 7,
    is_active: true
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/golf/tournaments/');
      const data = await response.json();
      setTournaments(data.results || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTournament = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/golf/tournaments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setCreateModal(false);
        resetForm();
        fetchTournaments();
        alert('Tournament created successfully!');
      } else {
        alert('Error creating tournament');
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert('Error creating tournament');
    }
  };

  const updateTournament = async () => {
    if (!selectedTournament) return;

    try {
      const response = await fetch(`http://localhost:8000/api/golf/tournaments/${selectedTournament.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setEditModal(false);
        setSelectedTournament(null);
        resetForm();
        fetchTournaments();
        alert('Tournament updated successfully!');
      } else {
        alert('Error updating tournament');
      }
    } catch (error) {
      console.error('Error updating tournament:', error);
      alert('Error updating tournament');
    }
  };

  const deleteTournament = async () => {
    if (!selectedTournament) return;

    try {
      const response = await fetch(`http://localhost:8000/api/golf/tournaments/${selectedTournament.id}/`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDeleteModal(false);
        setSelectedTournament(null);
        fetchTournaments();
        alert('Tournament deleted successfully!');
      } else {
        alert('Error deleting tournament');
      }
    } catch (error) {
      console.error('Error deleting tournament:', error);
      alert('Error deleting tournament');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      description: '',
      hole_number: 7,
      is_active: true
    });
  };

  const openEditModal = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setFormData({
      name: tournament.name,
      date: tournament.date,
      description: tournament.description || '',
      hole_number: tournament.hole_number,
      is_active: tournament.is_active
    });
    setEditModal(true);
  };

  const openDeleteModal = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setDeleteModal(true);
  };

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between">
        <Title order={2}>Tournament Management</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setCreateModal(true)}
        >
          Create Tournament
        </Button>
      </Group>

      {/* Tournaments Table */}
      <Card shadow="sm" p="lg">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Hole</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Groups</Table.Th>
              <Table.Th>Golfers</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tournaments.map((tournament) => (
              <Table.Tr key={tournament.id}>
                <Table.Td>
                  <Text fw={500}>{tournament.name}</Text>
                  {tournament.description && (
                    <Text size="sm" c="dimmed">{tournament.description}</Text>
                  )}
                </Table.Td>
                <Table.Td>{new Date(tournament.date).toLocaleDateString()}</Table.Td>
                <Table.Td>{tournament.hole_number}</Table.Td>
                <Table.Td>
                  <Badge color={tournament.is_active ? 'green' : 'gray'}>
                    {tournament.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </Table.Td>
                <Table.Td>{tournament.group_count}</Table.Td>
                <Table.Td>{tournament.golfer_count}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => openEditModal(tournament)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => openDeleteModal(tournament)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {tournaments.length === 0 && !loading && (
          <Text ta="center" c="dimmed" py="xl">
            No tournaments found. Create your first tournament!
          </Text>
        )}
      </Card>

      {/* Create Tournament Modal */}
      <Modal
        opened={createModal}
        onClose={() => {
          setCreateModal(false);
          resetForm();
        }}
        title="Create New Tournament"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Tournament Name"
            placeholder="e.g., Charity Golf Tournament 2024"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <TextInput
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
          <NumberInput
            label="Hole Number"
            description="Which hole is the launch monitor setup on?"
            value={formData.hole_number}
            onChange={(val) => setFormData({...formData, hole_number: val as number})}
            min={1}
            max={18}
            required
          />
          <TextInput
            label="Description (Optional)"
            placeholder="Brief description of the tournament"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <Switch
            label="Active Tournament"
            description="Active tournaments appear in Event Operations"
            checked={formData.is_active}
            onChange={(e) => setFormData({...formData, is_active: e.currentTarget.checked})}
          />
          <Group justify="flex-end" gap="md">
            <Button variant="outline" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={createTournament}>
              Create Tournament
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Tournament Modal */}
      <Modal
        opened={editModal}
        onClose={() => {
          setEditModal(false);
          setSelectedTournament(null);
          resetForm();
        }}
        title="Edit Tournament"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Tournament Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <TextInput
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
          <NumberInput
            label="Hole Number"
            value={formData.hole_number}
            onChange={(val) => setFormData({...formData, hole_number: val as number})}
            min={1}
            max={18}
            required
          />
          <TextInput
            label="Description (Optional)"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <Switch
            label="Active Tournament"
            checked={formData.is_active}
            onChange={(e) => setFormData({...formData, is_active: e.currentTarget.checked})}
          />
          <Group justify="flex-end" gap="md">
            <Button variant="outline" onClick={() => setEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={updateTournament}>
              Update Tournament
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setSelectedTournament(null);
        }}
        title="Delete Tournament"
        size="md"
      >
        <Stack gap="md">
          <Group gap="md">
            <IconAlertTriangle size={24} color="red" />
            <div>
              <Text fw={500}>Are you sure you want to delete this tournament?</Text>
              <Text size="sm" c="dimmed">
                This will permanently delete "{selectedTournament?.name}" and all associated groups, golfers, and shot data.
              </Text>
            </div>
          </Group>

          <Group justify="flex-end" gap="md">
            <Button variant="outline" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={deleteTournament}>
              Delete Tournament
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};