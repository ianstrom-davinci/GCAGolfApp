// File: frontend/src/hooks/useShots.ts
// ------------------------------------
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { Shot, ShotCreate, BulkDeleteRequest } from '../types';
import { notifications } from '@mantine/notifications';

interface UseShotsOptions {
  golferId?: number;
  groupId?: number;
  tournamentId?: number;
  unassigned?: boolean;
}

export const useShots = (options?: UseShotsOptions) => {
  const [shots, setShots] = useState<Shot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        golfer: options?.golferId,
        group: options?.groupId,
        tournament: options?.tournamentId,
        unassigned: options?.unassigned,
      };
      const data = await apiService.getShots(filters);
      setShots(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch shots';
      setError(errorMessage);
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [options?.golferId, options?.groupId, options?.tournamentId, options?.unassigned]);

  const createShot = useCallback(async (data: ShotCreate): Promise<Shot | null> => {
    setLoading(true);
    setError(null);
    try {
      const newShot = await apiService.createShot(data);
      setShots(prev => [newShot, ...prev]);
      notifications.show({
        title: 'Success',
        message: 'Shot created successfully',
        color: 'green',
      });
      return newShot;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create shot';
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

  const updateShot = useCallback(async (id: number, data: Partial<ShotCreate>): Promise<Shot | null> => {
    setLoading(true);
    setError(null);
    try {
      const updatedShot = await apiService.updateShot(id, data);
      setShots(prev => prev.map(s => s.id === id ? updatedShot : s));
      notifications.show({
        title: 'Success',
        message: 'Shot updated successfully',
        color: 'green',
      });
      return updatedShot;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update shot';
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

  const deleteShot = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteShot(id);
      setShots(prev => prev.filter(s => s.id !== id));
      notifications.show({
        title: 'Success',
        message: 'Shot deleted successfully',
        color: 'green',
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete shot';
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

  const bulkDeleteShots = useCallback(async (data: BulkDeleteRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.bulkDeleteShots(data);
      setShots(prev => prev.filter(s => !data.ids.includes(s.id)));
      notifications.show({
        title: 'Success',
        message: response.message,
        color: 'green',
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete shots';
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
    fetchShots();
  }, [fetchShots]);

  return {
    shots,
    loading,
    error,
    fetchShots,
    createShot,
    updateShot,
    deleteShot,
    bulkDeleteShots,
  };
};