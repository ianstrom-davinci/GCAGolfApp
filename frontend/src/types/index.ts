// File: frontend/src/types/index.ts
// --------------------------------

export interface Tournament {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  is_active: boolean;
  total_groups: number;
  total_golfers: number;
  created_at: string;
  updated_at: string;
}

export interface TournamentCreate {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  is_active?: boolean;
}

export interface Group {
  id: number;
  tournament?: number;
  tournament_name?: string;
  group_number: number;
  nickname?: string;
  display_name: string;
  max_golfers: number;
  current_golfer_count: number;
  is_full: boolean;
  available_spots?: number;
  created_at: string;
  updated_at: string;
}

export interface GroupCreate {
  tournament?: number;
  nickname?: string;
  max_golfers?: number;
}

export interface GroupWithGolfers extends Group {
  golfers: GolferNested[];
}

export interface Golfer {
  id: number;
  golfer_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'O';
  handicap?: number;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  preferred_tee?: string;
  group?: number;
  group_name?: string;
  tournament_name?: string;
  tournament?: string;
  is_active: boolean;
  notes?: string;
  age?: number;
  created_at: string;
  updated_at: string;
}

export interface GolferCreate {
  golfer_id?: string;  // Changed from required to optional
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'O';
  handicap?: number;
  skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  preferred_tee?: string;
  group?: number;
  is_active?: boolean;
  notes?: string;
}

export interface GolferNested {
  id: number;
  golfer_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  handicap?: number;
  skill_level: string;
  age?: number;
  is_active: boolean;
}

export interface Shot {
  id: number;
  golfer?: number;
  golfer_name?: string;
  group_name?: string;
  tournament_name?: string;
  shot_number: number;
  hole_number?: number;
  shot_type: 'drive' | 'approach' | 'chip' | 'putt' | 'bunker' | 'other';
  club_used?: string;
  ball_speed?: number;
  club_head_speed?: number;
  launch_angle?: number;
  spin_rate?: number;
  carry_distance?: number;
  total_distance?: number;
  side_angle?: number;
  smash_factor?: number;
  is_simulated: boolean;
  launch_monitor_id?: string;
  notes?: string;
  timestamp: string;
  created_at: string;
  updated_at: string;
}

export interface ShotCreate {
  golfer?: number;
  hole_number?: number;
  shot_type?: 'drive' | 'approach' | 'chip' | 'putt' | 'bunker' | 'other';
  club_used?: string;
  ball_speed?: number;
  club_head_speed?: number;
  launch_angle?: number;
  spin_rate?: number;
  carry_distance?: number;
  total_distance?: number;
  side_angle?: number;
  is_simulated?: boolean;
  launch_monitor_id?: string;
  notes?: string;
  timestamp?: string;
}

// API Response Types
export interface ApiResponse<T> {
  results?: T[];
  count?: number;
  next?: string;
  previous?: string;
}

export interface BulkDeleteRequest {
  ids: number[];
  delete_children?: boolean;
}

export interface BulkDeleteResponse {
  message: string;
  deleted_count: number;
  children_deleted: boolean;
}

export interface GroupAssignmentRequest {
  golfer_ids: number[];
  group_id: number;
}

export interface GroupAssignmentResponse {
  message: string;
  assigned_count: number;
}

// UI State Types
export interface LoadingState {
  loading: boolean;
  error?: string;
}

export interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'delete';
  item?: any;
}

export interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

// Filter and Search Types
export interface TournamentFilters {
  is_active?: boolean;
  search?: string;
}

export interface GroupFilters {
  tournament?: number;
  is_full?: boolean;
  search?: string;
}

export interface GolferFilters {
  group?: number;
  tournament?: number;
  skill_level?: string;
  is_active?: boolean;
  unassigned?: boolean;
  search?: string;
}

export interface ShotFilters {
  golfer?: number;
  group?: number;
  tournament?: number;
  shot_type?: string;
  is_simulated?: boolean;
  unassigned?: boolean;
  search?: string;
}