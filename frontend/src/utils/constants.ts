// File: frontend/src/utils/constants.ts
// ------------------------------------
import {
  IconTrophy,
  IconUsers,
  IconUsersGroup,
  IconTarget,
  IconPlaystationCircle,
} from '@tabler/icons-react';

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
export const MPH_TO_KPH = 1.60934;

export const navigationItems = [
  { icon: IconTrophy, label: 'Tournament Management', value: 'tournaments' },
  { icon: IconUsersGroup, label: 'Groups', value: 'groups' },
  { icon: IconUsers, label: 'Golfers', value: 'golfers' },
  { icon: IconTarget, label: 'Shots', value: 'shots' },
  { icon: IconPlaystationCircle, label: 'Event Operations', value: 'operations' },
];

// Golf-specific constants
export const SHOT_TYPES = [
  { value: 'drive', label: 'Drive' },
  { value: 'approach', label: 'Approach' },
  { value: 'chip', label: 'Chip' },
  { value: 'putt', label: 'Putt' },
  { value: 'bunker', label: 'Bunker' },
  { value: 'other', label: 'Other' },
];

export const CLUBS = [
  { value: 'driver', label: 'Driver' },
  { value: '3wood', label: '3 Wood' },
  { value: '5wood', label: '5 Wood' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: '3iron', label: '3 Iron' },
  { value: '4iron', label: '4 Iron' },
  { value: '5iron', label: '5 Iron' },
  { value: '6iron', label: '6 Iron' },
  { value: '7iron', label: '7 Iron' },
  { value: '8iron', label: '8 Iron' },
  { value: '9iron', label: '9 Iron' },
  { value: 'pw', label: 'Pitching Wedge' },
  { value: 'sw', label: 'Sand Wedge' },
  { value: 'lw', label: 'Lob Wedge' },
  { value: 'putter', label: 'Putter' },
];

export const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'professional', label: 'Professional' },
];

export const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
];