// File: frontend/src/hooks/useTournaments.ts
// -----------------------------------------
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { Tournament, TournamentCreate, BulkDeleteRequest } from '../types';
import { notifications } from '@mantine/notifications';

export const useTournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getTournaments();
      setTournaments(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tournaments';
      setError(errorMessage);
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const createTournament = useCallback(async (data: TournamentCreate): Promise<Tournament | null> => {
    setLoading(true);
    setError(null);
    try {
      const newTournament = await apiService.createTournament(data);
      setTournaments(prev => [newTournament, ...prev]);
      notifications.show({
        title: 'Success',
        message: 'Tournament created successfully',
        color: 'green',
      });
      return newTournament;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create tournament';
      setError(errorMessage);
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTournament = useCallback(async (id: number, data: Partial<TournamentCreate>): Promise<Tournament | null> => {
    setLoading(true);
    setError(null);
    try {
      const updatedTournament = await apiService.updateTournament(id, data);
      setTournaments(prev => prev.map(t => t.id === id ? updatedTournament : t));
      notifications.show({
        title: 'Success',
        message: 'Tournament updated successfully',
        color: 'green',
      });
      return updatedTournament;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update tournament';
      setError(errorMessage);
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTournament = useCallback(async (id: number, deleteChildren: boolean = false): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      if (deleteChildren) {
        // Use bulk delete for single tournament when deleting children
        const response = await apiService.bulkDeleteTournaments({
          ids: [id],
          delete_children: deleteChildren,
        });
        setTournaments(prev => prev.filter(t => t.id !== id));
        notifications.show({
          title: 'Success',
          message: response.message,
          color: 'green',
        });
      } else {
        // Use regular delete when not deleting children
        await apiService.deleteTournament(id);
        setTournaments(prev => prev.filter(t => t.id !== id));
        notifications.show({
          title: 'Success',
          message: 'Tournament deleted successfully',
          color: 'green',
        });
      }
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete tournament';
      setError(errorMessage);
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkDeleteTournaments = useCallback(async (data: BulkDeleteRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.bulkDeleteTournaments(data);
      setTournaments(prev => prev.filter(t => !data.ids.includes(t.id)));
      notifications.show({
        title: 'Success',
        message: response.message,
        color: 'green',
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete tournaments';
      setError(errorMessage);
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  return {
    tournaments,
    loading,
    error,
    fetchTournaments,
    createTournament,
    updateTournament,
    deleteTournament,
    bulkDeleteTournaments,
  };
};