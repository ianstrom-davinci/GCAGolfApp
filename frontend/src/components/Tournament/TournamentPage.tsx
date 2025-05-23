import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Card,
  Text,
  Select,
  TextInput,
  Button,
  Group,
  Stack,
  Badge,
  Alert,
  SimpleGrid,
  Modal,
  NumberInput,
  Tabs,
  ActionIcon,
  Table
} from '@mantine/core';
import {
  IconSearch,
  IconGolf,
  IconTrophy,
  IconPlus,
  IconTrash,
  IconUserPlus,
  IconSettings
} from '@tabler/icons-react';

interface Tournament {
  id: number;
  name: string;
  date: string;
  golfer_count: number;
  hole_number: number;
}

interface Golfer {
  id: number;
  name: string;
  handicap: number | null;
  shot_count: number;
}

interface ShotData {
  id: number;
  golfer_name: string;
  timestamp: string;
  ball_speed: number | null;
  carry_distance: number | null;
  total_distance: number | null;
}

export const TournamentPage: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [golfers, setGolfers] = useState<Golfer[]>([]);
  const [recentShots, setRecentShots] = useState<ShotData[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [selectedGolfer, setSelectedGolfer] = useState<Golfer | null>(null);
  const [golferSearch, setGolferSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal states
  const [createTournamentModal, setCreateTournamentModal] = useState(false);
  const [addGolferModal, setAddGolferModal] = useState(false);

  // Form states
  const [newTournament, setNewTournament] = useState({
    name: '',
    date: '',
    hole_number: 7,
    description: ''
  });
  const [newGolfer, setNewGolfer] = useState({
    name: '',
    handicap: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchGolfers(selectedTournament);
      fetchRecentShots(selectedTournament);
    }
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

  const fetchGolfers = async (tournamentId: string, search = '') => {
    try {
      const url = new URL('http://localhost:8000/api/golf/golfers/');
      url.searchParams.append('tournament_id', tournamentId);
      if (search) url.searchParams.append('search', search);

      const response = await fetch(url.toString());
      const data = await response.json();
      setGolfers(data.results || []);
    } catch (error) {
      console.error('Error fetching golfers:', error);
    }
  };

  const fetchRecentShots = async (tournamentId: string) => {
    try {
      const url = new URL('http://localhost:8000/api/golf/shots/');
      url.searchParams.append('tournament_id', tournamentId);

      const response = await fetch(url.toString());
      const data = await response.json();
      setRecentShots((data.results || []).slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent shots:', error);
    }
  };

  const createTournament = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/golf/tournaments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTournament)
      });

      if (response.ok) {
        setCreateTournamentModal(false);
        setNewTournament({ name: '', date: '', hole_number: 7, description: '' });
        fetchTournaments();
        alert('Tournament created successfully!');
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert('Error creating tournament');
    }
  };

  const addGolfer = async () => {
    if (!selectedTournament) return;

    try {
      const golferData = {
        tournament: parseInt(selectedTournament),
        name: newGolfer.name,
        handicap: newGolfer.handicap ? parseInt(newGolfer.handicap) : null,
        email: newGolfer.email || null,
        phone: newGolfer.phone || null
      };

      const response = await fetch('http://localhost:8000/api/golf/golfers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(golferData)
      });

      if (response.ok) {
        setAddGolferModal(false);
        setNewGolfer({ name: '', handicap: '', email: '', phone: '' });
        fetchGolfers(selectedTournament);
        fetchTournaments(); // Refresh to update golfer count
        alert('Golfer added successfully!');
      }
    } catch (error) {
      console.error('Error adding golfer:', error);
      alert('Error adding golfer');
    }
  };

  const deleteGolfer = async (golferId: number) => {
    if (!window.confirm('Are you sure you want to delete this golfer?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/golf/golfers/${golferId}/`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchGolfers(selectedTournament!);
        fetchTournaments();
        if (selectedGolfer?.id === golferId) {
          setSelectedGolfer(null);
          setGolferSearch('');
        }
        alert('Golfer deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting golfer:', error);
      alert('Error deleting golfer');
    }
  };

  const handleGolferSearch = (search: string) => {
    setGolferSearch(search);
    if (selectedTournament) {
      fetchGolfers(selectedTournament, search);
    }
  };

  const selectGolfer = (golfer: Golfer) => {
    setSelectedGolfer(golfer);
    setGolferSearch(golfer.name);
  };

  const simulateRecordShot = async () => {
    if (!selectedGolfer || !selectedTournament) return;

    setLoading(true);

    const shotData = {
      tournament: parseInt(selectedTournament),
      golfer: selectedGolfer.id,
      ball_speed: 140 + Math.random() * 30,
      club_head_speed: 90 + Math.random() * 20,
      carry_distance: 200 + Math.random() * 100,
      total_distance: 220 + Math.random() * 120,
      smash_factor: 1.3 + Math.random() * 0.4
    };

    try {
      const response = await fetch('http://localhost:8000/api/golf/shots/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shotData),
      });

      if (response.ok) {
        fetchGolfers(selectedTournament);
        fetchRecentShots(selectedTournament);
        alert('Shot recorded successfully!');
      }
    } catch (error) {
      console.error('Error recording shot:', error);
      alert('Error recording shot');
    } finally {
      setLoading(false);
    }
  };

  const tournamentOptions = tournaments.map(t => ({
    value: t.id.toString(),
    label: `${t.name} (${t.golfer_count} golfers)`
  }));

  return (
    <Container size="lg">
      <Group justify="space-between" mb="xl">
        <Title order={1}>
          <IconTrophy size={32} style={{ marginRight: 8 }} />
          Tournament Mode
        </Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setCreateTournamentModal(true)}
        >
          Create Tournament
        </Button>
      </Group>

      {/* Tournament Selection */}
      <Card shadow="sm" p="lg" mb="xl">
        <Group justify="space-between" mb="md">
          <Title order={3}>Select Tournament</Title>
        </Group>
        <Select
          placeholder="Choose active tournament"
          data={tournamentOptions}
          value={selectedTournament}
          onChange={setSelectedTournament}
          size="lg"
        />
      </Card>

      {selectedTournament && (
        <Tabs defaultValue="operate">
          <Tabs.List>
            <Tabs.Tab value="operate" leftSection={<IconGolf size={16} />}>
              Tournament Operation
            </Tabs.Tab>
            <Tabs.Tab value="manage" leftSection={<IconSettings size={16} />}>
              Manage Golfers
            </Tabs.Tab>
          </Tabs.List>

          {/* Tournament Operation Tab */}
          <Tabs.Panel value="operate" pt="lg">
            {/* Golfer Selection */}
            <Card shadow="sm" p="lg" mb="xl">
              <Title order={3} mb="md">Find Golfer</Title>
              <TextInput
                placeholder="Search golfer name..."
                value={golferSearch}
                onChange={(e) => handleGolferSearch(e.target.value)}
                leftSection={<IconSearch size={16} />}
                size="lg"
                mb="md"
              />

              {golfers.length > 0 && (
                <SimpleGrid cols={2} spacing="sm">
                  {golfers.map(golfer => (
                    <Card
                      key={golfer.id}
                      p="sm"
                      withBorder
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedGolfer?.id === golfer.id ? '#e3f2fd' : 'white'
                      }}
                      onClick={() => selectGolfer(golfer)}
                    >
                      <Text fw={500}>{golfer.name}</Text>
                      <Group justify="apart">
                        <Text size="sm" c="dimmed">
                          Handicap: {golfer.handicap || 'N/A'}
                        </Text>
                        <Badge size="sm" color="blue">
                          {golfer.shot_count} shots
                        </Badge>
                      </Group>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </Card>

            {/* Current Golfer & Shot Recording */}
            {selectedGolfer && (
              <Card shadow="sm" p="lg" mb="xl">
                <Title order={3} mb="md">Current Golfer</Title>
                <Alert color="blue" mb="md">
                  <Text fw={500} size="lg">{selectedGolfer.name}</Text>
                  <Text size="sm">Shots recorded today: {selectedGolfer.shot_count}</Text>
                </Alert>

                <Button
                  size="xl"
                  fullWidth
                  leftSection={<IconGolf size={20} />}
                  onClick={simulateRecordShot}
                  loading={loading}
                >
                  Record Shot (Simulate)
                </Button>
              </Card>
            )}

            {/* Recent Shots */}
            {recentShots.length > 0 && (
              <Card shadow="sm" p="lg">
                <Title order={3} mb="md">Recent Shots</Title>
                <Stack gap="xs">
                  {recentShots.map(shot => (
                    <Group key={shot.id} justify="apart" p="sm" style={{ borderLeft: '3px solid #1c7ed6' }}>
                      <div>
                        <Text fw={500}>{shot.golfer_name}</Text>
                        <Text size="sm" c="dimmed">
                          {new Date(shot.timestamp).toLocaleTimeString()}
                        </Text>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Text fw={500}>
                          {shot.carry_distance?.toFixed(0) || 'N/A'} yds carry
                        </Text>
                        <Text size="sm" c="dimmed">
                          {shot.total_distance?.toFixed(0) || 'N/A'} yds total
                        </Text>
                      </div>
                    </Group>
                  ))}
                </Stack>
              </Card>
            )}
          </Tabs.Panel>

          {/* Manage Golfers Tab */}
          <Tabs.Panel value="manage" pt="lg">
            <Card shadow="sm" p="lg">
              <Group justify="space-between" mb="md">
                <Title order={3}>Tournament Golfers</Title>
                <Button
                  leftSection={<IconUserPlus size={16} />}
                  onClick={() => setAddGolferModal(true)}
                >
                  Add Golfer
                </Button>
              </Group>

              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Handicap</Table.Th>
                    <Table.Th>Shots</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {golfers.map(golfer => (
                    <Table.Tr key={golfer.id}>
                      <Table.Td>{golfer.name}</Table.Td>
                      <Table.Td>{golfer.handicap || 'N/A'}</Table.Td>
                      <Table.Td>{golfer.shot_count}</Table.Td>
                      <Table.Td>
                        <ActionIcon
                          color="red"
                          onClick={() => deleteGolfer(golfer.id)}
                          size="sm"
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          </Tabs.Panel>
        </Tabs>
      )}

      {/* Create Tournament Modal */}
      <Modal
        opened={createTournamentModal}
        onClose={() => setCreateTournamentModal(false)}
        title="Create New Tournament"
      >
        <Stack gap="md">
          <TextInput
            label="Tournament Name"
            placeholder="e.g., Charity Golf Tournament 2024"
            value={newTournament.name}
            onChange={(e) => setNewTournament({...newTournament, name: e.target.value})}
          />
          <TextInput
            label="Date"
            type="date"
            value={newTournament.date}
            onChange={(e) => setNewTournament({...newTournament, date: e.target.value})}
          />
          <NumberInput
            label="Hole Number"
            value={newTournament.hole_number}
            onChange={(val) => setNewTournament({...newTournament, hole_number: val as number})}
            min={1}
            max={18}
          />
          <TextInput
            label="Description (Optional)"
            value={newTournament.description}
            onChange={(e) => setNewTournament({...newTournament, description: e.target.value})}
          />
          <Button onClick={createTournament} fullWidth>
            Create Tournament
          </Button>
        </Stack>
      </Modal>

      {/* Add Golfer Modal */}
      <Modal
        opened={addGolferModal}
        onClose={() => setAddGolferModal(false)}
        title="Add New Golfer"
      >
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="e.g., John Smith"
            value={newGolfer.name}
            onChange={(e) => setNewGolfer({...newGolfer, name: e.target.value})}
          />
          <NumberInput
            label="Handicap (Optional)"
            value={newGolfer.handicap}
            onChange={(val) => setNewGolfer({...newGolfer, handicap: val?.toString() || ''})}
            min={0}
            max={54}
          />
          <TextInput
            label="Email (Optional)"
            value={newGolfer.email}
            onChange={(e) => setNewGolfer({...newGolfer, email: e.target.value})}
          />
          <TextInput
            label="Phone (Optional)"
            value={newGolfer.phone}
            onChange={(e) => setNewGolfer({...newGolfer, phone: e.target.value})}
          />
          <Button onClick={addGolfer} fullWidth>
            Add Golfer
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
};