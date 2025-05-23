// File: frontend/src/components/Sessions/SessionsPage.tsx
// ------------------------------------------------------
import React, { useEffect, useState } from 'react';
import {
  Stack,
  Title,
  Group,
  Button,
  Select,
  Text,
  Alert,
  Loader,
  Center,
} from '@mantine/core';
import { IconPlus, IconTrash, IconGolf } from '@tabler/icons-react';
import { GolfSession, GolfSessionCreate, ShotData } from '../../types/golf';
import { apiClient } from '../../services/apiClient';
import { ShotTable } from './ShotTable';
import { CreateSessionModal } from './CreateSessionModal';
import { DeleteSessionModal } from './DeleteSessionModal';

export function SessionsPage() {
  const [sessions, setSessions] = useState<GolfSession[]>([]);
  const [shots, setShots] = useState<ShotData[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [createSessionModalOpen, setCreateSessionModalOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [deleteSessionModalOpen, setDeleteSessionModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<GolfSession | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);


  // Load sessions on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const fetchedSessions = await apiClient.getGolfSessions();
      if (fetchedSessions) {
        setSessions(fetchedSessions);
        if (fetchedSessions.length > 0 && fetchedSessions[0].id != null) {
          setSelectedSessionId(fetchedSessions[0].id);
        } else {
          setSelectedSessionId(null);
          setShots([]);
        }
      } else {
        setError("Failed to load sessions.");
        setSessions([]);
        setShots([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Load shots when session changes
  useEffect(() => {
    if (selectedSessionId !== null) {
      const fetchShotsForSession = async () => {
        setLoading(true);
        setError(null);
        const fetchedShots = await apiClient.getShotData(selectedSessionId);
        if (fetchedShots) {
          setShots(fetchedShots);
        } else {
          setError("Failed to load shots for the selected session.");
          setShots([]);
        }
        setLoading(false);
      };
      fetchShotsForSession();
    } else {
      setShots([]);
    }
  }, [selectedSessionId]);

  // Update shot data
  const updateShot = async (shotId: number, field: string, value: number) => {
    const updateData = { [field]: value };
    const updatedShot = await apiClient.updateShotData(shotId, updateData);
    if (updatedShot) {
      setShots(prev => prev.map(shot =>
        shot.id === shotId ? { ...shot, [field]: value } : shot
      ));
    }
  };

  // Delete shot
  const deleteShot = async (shotId: number) => {
    const success = await apiClient.deleteShotData(shotId);
    if (success) {
      setShots(prev => prev.filter(shot => shot.id !== shotId));
    } else {
      alert("Failed to delete shot.");
    }
  };

  // Create session
  const handleCreateSession = async () => {
    const sessionName = newSessionName.trim() || `Session @ ${new Date().toLocaleTimeString()}`;

    const newSessionData: GolfSessionCreate = {
      session_name: sessionName,
      start_time: new Date().toISOString(),
    };

    const newSession = await apiClient.createGolfSession(newSessionData);
    if (newSession && newSession.id != null) {
      setSessions(prev => [newSession, ...prev]);
      setSelectedSessionId(newSession.id);
      setCreateSessionModalOpen(false);
      setNewSessionName('');
    } else {
      alert("Failed to create session.");
    }
  };

  // Delete session
  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;

    setDeleteLoading(true);
    const success = await apiClient.deleteGolfSession(sessionToDelete.id!);

    if (success) {
      const remainingSessions = sessions.filter(session => session.id !== sessionToDelete.id);
      setSessions(remainingSessions);
      if (remainingSessions.length > 0 && remainingSessions[0].id != null) {
        setSelectedSessionId(remainingSessions[0].id);
      } else {
        setSelectedSessionId(null);
        setShots([]);
      }
      setDeleteSessionModalOpen(false);
      setSessionToDelete(null);
    } else {
      alert("Failed to delete session.");
    }

    setDeleteLoading(false);
  };

  // New function to open delete modal
  const openDeleteModal = () => {
    if (selectedSessionId === null) {
      alert("No session selected to delete.");
      return;
    }
    const currentSession = sessions.find(s => s.id === selectedSessionId);
    if (!currentSession) {
      alert("Selected session not found.");
      return;
    }
    setSessionToDelete(currentSession);
    setDeleteSessionModalOpen(true);
  };

  // Add dummy shot
  const handleAddShot = async () => {
    if (selectedSessionId === null) {
      alert("Please select or create a session first.");
      return;
    }
    const newShotData: Parameters<typeof apiClient.createShotData>[0] = {
      session: selectedSessionId,
      ball_speed: parseFloat((Math.random() * 50 + 120).toFixed(1)),
      club_head_speed: parseFloat((Math.random() * 30 + 90).toFixed(1)),
      launch_angle: parseFloat((Math.random() * 10 + 8).toFixed(1)),
      apex_height: parseFloat((Math.random() * 60 + 80).toFixed(0)),
      spin_rate: parseFloat((Math.random() * 1500 + 2000).toFixed(0)),
      side_spin_rate: parseFloat((Math.random() * 1000 - 500).toFixed(0)),
      carry_distance: parseFloat((Math.random() * 100 + 150).toFixed(0)),
      total_distance: parseFloat((Math.random() * 100 + 170).toFixed(0)),
      smash_factor: 1.45,
      lateral_deviation: parseFloat((Math.random() * 40 - 20).toFixed(1)),
      attack_angle: parseFloat((Math.random() * 8 - 4).toFixed(1)),
      club_path: parseFloat((Math.random() * 10 - 5).toFixed(1)),
      face_angle: parseFloat((Math.random() * 6 - 3).toFixed(1)),
    };

    const createdShot = await apiClient.createShotData(newShotData);
    if (createdShot) {
      setShots(prev => [createdShot, ...prev]);
    } else {
      alert("Failed to add shot.");
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Session Management</Title>
        <Group>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateSessionModalOpen(true)}
            disabled={loading}
          >
            Create Session
          </Button>
          {selectedSessionId !== null && sessions.some(s => s.id === selectedSessionId) && (
          <Button
            leftSection={<IconTrash size={16} />}
            color="red"
            onClick={openDeleteModal}  // ← Changed from handleDeleteSession
            disabled={loading}
          >
            Delete Session
          </Button>
        )}
        </Group>
      </Group>

      {sessions.length > 0 && (
        <Group>
          <Text fw="bold">Active Session:</Text>
          <Select
            placeholder="Select a session"
            value={selectedSessionId?.toString() || ''}
            onChange={(value) => setSelectedSessionId(value ? parseInt(value) : null)}
            data={sessions.map((session) => ({
              value: session.id!.toString(),
              label: session.session_name || `Session started at ${session.start_time ? new Date(session.start_time).toLocaleString() : 'Unknown Time'}`,
            }))}
            disabled={loading}
            w={400}
          />
        </Group>
      )}

      {selectedSessionId !== null && sessions.some(s => s.id === selectedSessionId) && (
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={3}>
              Shots for: {sessions.find(s => s.id === selectedSessionId)?.session_name || `Session ${selectedSessionId}`}
            </Title>
            <Button
              leftSection={<IconGolf size={16} />}
              onClick={handleAddShot}
              disabled={loading}
              variant="light"
            >
              Add Shot
            </Button>
          </Group>

          {loading && shots.length === 0 && (
            <Center h={200}>
              <Stack align="center">
                <Loader />
                <Text>Loading shots...</Text>
              </Stack>
            </Center>
          )}

          {error && shots.length === 0 && (
            <Alert color="red" title="Error">
              {error}
            </Alert>
          )}

          {shots.length > 0 && (
            <ShotTable
              shots={shots}
              onUpdateShot={updateShot}
              onDeleteShot={deleteShot}
            />
          )}

          {!loading && !error && shots.length === 0 && (
            <Text ta="center" c="dimmed">
              No shots recorded for this session yet.
            </Text>
          )}
        </Stack>
      )}

      <CreateSessionModal
        opened={createSessionModalOpen}
        onClose={() => setCreateSessionModalOpen(false)}
        newSessionName={newSessionName}
        setNewSessionName={setNewSessionName}
        onCreateSession={handleCreateSession}
      />

      <DeleteSessionModal
        opened={deleteSessionModalOpen}
        onClose={() => {
          setDeleteSessionModalOpen(false);
          setSessionToDelete(null);
        }}
        sessionToDelete={sessionToDelete}
        onConfirmDelete={handleDeleteSession}
        loading={deleteLoading}
      />
    </Stack>
  );
}