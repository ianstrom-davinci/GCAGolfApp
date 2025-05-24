// File: frontend/src/hooks/useGroups.ts
// -------------------------------------
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { Group, GroupCreate, GroupWithGolfers, BulkDeleteRequest } from '../types';
import { notifications } from '@mantine/notifications';

export const useGroups = (tournamentId?: number) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getGroups(tournamentId);
      setGroups(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch groups';
      setError(errorMessage);
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  const getGroupWithGolfers = useCallback(async (id: number): Promise<GroupWithGolfers | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getGroupWithGolfers(id);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch group details';
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

  const createGroup = useCallback(async (data: GroupCreate): Promise<Group | null> => {
    setLoading(true);
    setError(null);
    try {
      const newGroup = await apiService.createGroup(data);
      setGroups(prev => [newGroup, ...prev]);
      notifications.show({
        title: 'Success',
        message: 'Group created successfully',
        color: 'green',
      });
      return newGroup;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create group';
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

  const updateGroup = useCallback(async (id: number, data: Partial<GroupCreate>): Promise<Group | null> => {
    setLoading(true);
    setError(null);
    try {
      const updatedGroup = await apiService.updateGroup(id, data);
      setGroups(prev => prev.map(g => g.id === id ? updatedGroup : g));
      notifications.show({
        title: 'Success',
        message: 'Group updated successfully',
        color: 'green',
      });
      return updatedGroup;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update group';
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

  const deleteGroup = useCallback(async (id: number, deleteChildren: boolean = false): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      if (deleteChildren) {
        // Use bulk delete for single group when deleting children
        const response = await apiService.bulkDeleteGroups({
          ids: [id],
          delete_children: deleteChildren,
        });
        setGroups(prev => prev.filter(g => g.id !== id));
        notifications.show({
          title: 'Success',
          message: response.message,
          color: 'green',
        });
      } else {
        // Use regular delete when not deleting children
        await apiService.deleteGroup(id);
        setGroups(prev => prev.filter(g => g.id !== id));
        notifications.show({
          title: 'Success',
          message: 'Group deleted successfully',
          color: 'green',
        });
      }
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete group';
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

  const bulkDeleteGroups = useCallback(async (data: BulkDeleteRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.bulkDeleteGroups(data);
      setGroups(prev => prev.filter(g => !data.ids.includes(g.id)));
      notifications.show({
        title: 'Success',
        message: response.message,
        color: 'green',
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete groups';
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

  const assignGolfers = useCallback(async (groupId: number, golferIds: number[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.assignGolfersToGroup(groupId, golferIds);
      await fetchGroups(); // Refresh groups to update counts
      notifications.show({
        title: 'Success',
        message: response.message,
        color: 'green',
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign golfers';
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
  }, [fetchGroups]);

  const removeGolfers = useCallback(async (groupId: number, golferIds: number[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.removeGolfersFromGroup(groupId, golferIds);
      await fetchGroups(); // Refresh groups to update counts
      notifications.show({
        title: 'Success',
        message: response.message,
        color: 'green',
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove golfers';
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
  }, [fetchGroups]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return {
    groups,
    loading,
    error,
    fetchGroups,
    getGroupWithGolfers,
    createGroup,
    updateGroup,
    deleteGroup,
    bulkDeleteGroups,
    assignGolfers,
    removeGolfers,
  };
};