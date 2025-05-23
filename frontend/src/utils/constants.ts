// File: frontend/src/utils/constants.ts
// ------------------------------------
import {
  IconTrophy,
  IconUsers,
  IconUsersGroup,
  IconTarget,
  IconPlaystationCircle,
} from '@tabler/icons-react';

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/api';
export const MPH_TO_KPH = 1.60934;

export const navigationItems = [
  { icon: IconTrophy, label: 'Tournament Management', value: 'tournaments' },
  { icon: IconUsers, label: 'Golfers', value: 'golfers' },
  { icon: IconUsersGroup, label: 'Groups', value: 'groups' },
  { icon: IconTarget, label: 'Shots', value: 'shots' },
  { icon: IconPlaystationCircle, label: 'Event Operations', value: 'operations' },
];