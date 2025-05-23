// File: frontend/src/services/apiClient.ts
// ----------------------------------------
import { API_BASE_URL } from '../utils/constants';
import { GolfSession, GolfSessionCreate, ShotData } from '../types/golf';

export interface ApiClient {
  getGolfSessions: () => Promise<GolfSession[] | undefined>;
  createGolfSession: (data: GolfSessionCreate) => Promise<GolfSession | undefined>;
  deleteGolfSession: (sessionId: number) => Promise<boolean>;
  getShotData: (sessionId?: number) => Promise<ShotData[] | undefined>;
  createShotData: (data: Omit<ShotData, 'id' | 'created_at' | 'updated_at' | 'timestamp'> & { timestamp?: string }) => Promise<ShotData | undefined>;
  updateShotData: (shotId: number, data: Partial<ShotData>) => Promise<ShotData | undefined>;
  deleteShotData: (shotId: number) => Promise<boolean>;
}

export const apiClient: ApiClient = {
  getGolfSessions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/golf/sessions/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json() as { results: GolfSession[] };
      return data.results;
    } catch (error) {
      console.error("Failed to fetch golf sessions:", error);
      return undefined;
    }
  },

  createGolfSession: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/golf/sessions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json() as GolfSession;
    } catch (error) {
      console.error("Failed to create golf session:", error);
      return undefined;
    }
  },

  deleteGolfSession: async (sessionId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/golf/sessions/${sessionId}/`, {
        method: 'DELETE',
      });
      if (response.status === 204) return true;
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error(`Failed to delete golf session ${sessionId}:`, error);
      return false;
    }
  },

  getShotData: async (sessionId?: number) => {
    try {
      const url = sessionId ? `${API_BASE_URL}/golf/shots/?session_id=${sessionId}` : `${API_BASE_URL}/golf/shots/`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json() as { results: ShotData[] };
      return data.results;
    } catch (error) {
      console.error("Failed to fetch shot data:", error);
      return undefined;
    }
  },

  createShotData: async (data) => {
     try {
      const payload = {
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
      };
      const response = await fetch(`${API_BASE_URL}/golf/shots/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json() as ShotData;
    } catch (error) {
      console.error("Failed to create shot data:", error);
      return undefined;
    }
  },

  updateShotData: async (shotId: number, data: Partial<ShotData>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/golf/shots/${shotId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json() as ShotData;
    } catch (error) {
      console.error("Failed to update shot data:", error);
      return undefined;
    }
  },

  deleteShotData: async (shotId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/golf/shots/${shotId}/`, {
        method: 'DELETE',
      });
      if (response.status === 204) return true;
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error(`Failed to delete shot ${shotId}:`, error);
      return false;
    }
  },
};