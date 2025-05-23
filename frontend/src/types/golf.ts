// File: frontend/src/types/golf.ts
// ---------------------------------
import { components } from '../api-client/gcagolfapp';

export type GolfSession = components['schemas']['GolfSession'];
export type GolfSessionCreate = components['schemas']['GolfSessionCreate'];
export type ShotData = components['schemas']['ShotData'];

export interface NavigationItem {
  icon: React.ComponentType<{ size?: string | number }>;
  label: string;
  value: string;
}

export interface EditableCellProps {
  value: number | null | undefined;
  onSave: (newValue: number) => void;
  suffix?: string;
}