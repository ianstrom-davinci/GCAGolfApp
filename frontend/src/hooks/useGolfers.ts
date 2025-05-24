// File: frontend/src/hooks/useGolfers.ts
// --------------------------------------
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { Golfer, GolferCreate, BulkDeleteRequest } from '../types';
import { notifications } from '@mantine/notifications';

interface UseGolfersOptions {
  groupId?: number;
  tournamentId?: number;
  unassigned?: boolean;
}

export const useGolfers = (options?: UseGolfersOptions) => {
  const [golfers, setGolfers] = useState<Golfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGolfers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        group: options?.groupId,
        tournament: options?.tournamentId,
        unassigned: options?.unassigned,
      };
      const data = await apiService.getGolfers(filters);
      setGolfers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch golfers';
      setError(errorMessage);
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [options?.groupId, options?.tournamentId, options?.unassigned]);

  const createGolfer = useCallback(async (data: GolferCreate): Promise<Golfer | null> => {
    setLoading(true);
    setError(null);
    try {
      const newGolfer = await apiService.createGolfer(data);
      setGolfers(prev => [newGolfer, ...prev]);
      notifications.show({
        title: 'Success',
        message: 'Golfer created successfully',
        color: 'green',
      });
      return newGolfer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create golfer';
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

  const updateGolfer = useCallback(async (id: number, data: Partial<GolferCreate>): Promise<Golfer | null> => {
    setLoading(true);
    setError(null);
    try {
      const updatedGolfer = await apiService.updateGolfer(id, data);
      setGolfers(prev => prev.map(g => g.id === id ? updatedGolfer : g));
      notifications.show({
        title: 'Success',
        message: 'Golfer updated successfully',
        color: 'green',
      });
      return updatedGolfer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update golfer';
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

  const deleteGolfer = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteGolfer(id);
      setGolfers(prev => prev.filter(g => g.id !== id));
      notifications.show({
        title: 'Success',
        message: 'Golfer deleted successfully',
        color: 'green',
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete golfer';
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

  const bulkDeleteGolfers = useCallback(async (data: BulkDeleteRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.bulkDeleteGolfers(data);
      setGolfers(prev => prev.filter(g => !data.ids.includes(g.id)));
      notifications.show({
        title: 'Success',
        message: response.message,
        color: 'green',
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete golfers';
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
    fetchGolfers();
  }, [fetchGolfers]);

  return {
    golfers,
    loading,
    error,
    fetchGolfers,
    createGolfer,
    updateGolfer,
    deleteGolfer,
    bulkDeleteGolfers,
  };
};