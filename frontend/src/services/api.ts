// File: frontend/src/services/api.ts
// ----------------------------------
import { API_BASE_URL } from '../utils/constants';
import {
  Tournament,
  TournamentCreate,
  Group,
  GroupCreate,
  GroupWithGolfers,
  Golfer,
  GolferCreate,
  Shot,
  ShotCreate,
  ApiResponse,
  BulkDeleteRequest,
  BulkDeleteResponse,
  GroupAssignmentRequest,
  GroupAssignmentResponse,
} from '../types';

// Add this interface for paginated responses
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

class ApiService {
  private baseUrl = API_BASE_URL;

  private async fetchWithError<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      // Check if response has content to parse
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');

      // If it's a DELETE request or empty response, don't try to parse JSON
      if (
        response.status === 204 || // No Content
        contentLength === '0' ||
        (!contentType?.includes('application/json'))
      ) {
        return {} as T; // Return empty object for void responses
      }

      // Check if response body is empty
      const text = await response.text();
      if (!text.trim()) {
        return {} as T; // Return empty object for empty responses
      }

      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.warn('Failed to parse JSON response:', text);
        return {} as T; // Return empty object if JSON parsing fails
      }
    } catch (error) {
      console.error(`API Error for ${url}:`, error);
      throw error;
    }
  }

  // Helper method to extract results from paginated response
  private async fetchPaginatedData<T>(url: string, options?: RequestInit): Promise<T[]> {
    const response = await this.fetchWithError<PaginatedResponse<T>>(url, options);
    return response.results || [];
  }

  // Tournament API Methods
  async getTournaments(): Promise<Tournament[]> {
    return this.fetchPaginatedData<Tournament>('/tournaments/');
  }

  async getTournament(id: number): Promise<Tournament> {
    return this.fetchWithError<Tournament>(`/tournaments/${id}/`);
  }

  async getTournamentWithGroups(id: number): Promise<any> {
    return this.fetchWithError(`/tournaments/${id}/retrieve_with_groups/`);
  }

  async createTournament(data: TournamentCreate): Promise<Tournament> {
    return this.fetchWithError<Tournament>('/tournaments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTournament(id: number, data: Partial<TournamentCreate>): Promise<Tournament> {
    return this.fetchWithError<Tournament>(`/tournaments/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTournament(id: number): Promise<void> {
    await this.fetchWithError<void>(`/tournaments/${id}/`, {
      method: 'DELETE',
    });
  }

  async bulkDeleteTournaments(data: BulkDeleteRequest): Promise<BulkDeleteResponse> {
    return this.fetchWithError<BulkDeleteResponse>('/tournaments/bulk_delete/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Group API Methods
  async getGroups(tournamentId?: number): Promise<Group[]> {
    const url = tournamentId ? `/groups/?tournament=${tournamentId}` : '/groups/';
    return this.fetchPaginatedData<Group>(url);
  }

  async getGroup(id: number): Promise<Group> {
    return this.fetchWithError<Group>(`/groups/${id}/`);
  }

  async getGroupWithGolfers(id: number): Promise<GroupWithGolfers> {
    return this.fetchWithError<GroupWithGolfers>(`/groups/${id}/retrieve_with_golfers/`);
  }

  async createGroup(data: GroupCreate): Promise<Group> {
    return this.fetchWithError<Group>('/groups/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGroup(id: number, data: Partial<GroupCreate>): Promise<Group> {
    return this.fetchWithError<Group>(`/groups/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGroup(id: number): Promise<void> {
    await this.fetchWithError<void>(`/groups/${id}/`, {
      method: 'DELETE',
    });
  }

  async bulkDeleteGroups(data: BulkDeleteRequest): Promise<BulkDeleteResponse> {
    return this.fetchWithError<BulkDeleteResponse>('/groups/bulk_delete/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async assignGolfersToGroup(groupId: number, golferIds: number[]): Promise<GroupAssignmentResponse> {
    return this.fetchWithError<GroupAssignmentResponse>(`/groups/${groupId}/assign_golfers/`, {
      method: 'POST',
      body: JSON.stringify({ golfer_ids: golferIds, group_id: groupId }),
    });
  }

  async removeGolfersFromGroup(groupId: number, golferIds: number[]): Promise<GroupAssignmentResponse> {
    return this.fetchWithError<GroupAssignmentResponse>(`/groups/${groupId}/remove_golfers/`, {
      method: 'POST',
      body: JSON.stringify({ golfer_ids: golferIds }),
    });
  }

  // Golfer API Methods
  async getGolfers(filters?: { group?: number; tournament?: number; unassigned?: boolean }): Promise<Golfer[]> {
    let url = '/golfers/';
    const params = new URLSearchParams();

    if (filters?.group) params.append('group', filters.group.toString());
    if (filters?.tournament) params.append('tournament', filters.tournament.toString());
    if (filters?.unassigned) params.append('unassigned', 'true');

    if (params.toString()) url += `?${params.toString()}`;

    return this.fetchPaginatedData<Golfer>(url);
  }

  async getGolfer(id: number): Promise<Golfer> {
    return this.fetchWithError<Golfer>(`/golfers/${id}/`);
  }

  async getUnassignedGolfers(): Promise<Golfer[]> {
    return this.fetchPaginatedData<Golfer>('/golfers/unassigned/');
  }

  async createGolfer(data: GolferCreate): Promise<Golfer> {
    return this.fetchWithError<Golfer>('/golfers/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGolfer(id: number, data: Partial<GolferCreate>): Promise<Golfer> {
    return this.fetchWithError<Golfer>(`/golfers/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGolfer(id: number): Promise<void> {
    await this.fetchWithError<void>(`/golfers/${id}/`, {
      method: 'DELETE',
    });
  }

  async bulkDeleteGolfers(data: BulkDeleteRequest): Promise<BulkDeleteResponse> {
    return this.fetchWithError<BulkDeleteResponse>('/golfers/bulk_delete/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Shot API Methods
  async getShots(filters?: { golfer?: number; group?: number; tournament?: number; unassigned?: boolean }): Promise<Shot[]> {
    let url = '/shots/';
    const params = new URLSearchParams();

    if (filters?.golfer) params.append('golfer', filters.golfer.toString());
    if (filters?.group) params.append('group', filters.group.toString());
    if (filters?.tournament) params.append('tournament', filters.tournament.toString());
    if (filters?.unassigned) params.append('unassigned', 'true');

    if (params.toString()) url += `?${params.toString()}`;

    return this.fetchPaginatedData<Shot>(url);
  }

  async getShot(id: number): Promise<Shot> {
    return this.fetchWithError<Shot>(`/shots/${id}/`);
  }

  async getUnassignedShots(): Promise<Shot[]> {
    return this.fetchPaginatedData<Shot>('/shots/unassigned/');
  }

  async createShot(data: ShotCreate): Promise<Shot> {
    return this.fetchWithError<Shot>('/shots/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateShot(id: number, data: Partial<ShotCreate>): Promise<Shot> {
    return this.fetchWithError<Shot>(`/shots/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteShot(id: number): Promise<void> {
    await this.fetchWithError<void>(`/shots/${id}/`, {
      method: 'DELETE',
    });
  }

  async bulkDeleteShots(data: BulkDeleteRequest): Promise<BulkDeleteResponse> {
    return this.fetchWithError<BulkDeleteResponse>('/shots/bulk_delete/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getShotStatistics(): Promise<any> {
    return this.fetchWithError('/shots/statistics/');
  }
}

export const apiService = new ApiService();