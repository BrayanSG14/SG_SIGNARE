export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Rotation3D {
  x: number;
  y: number;
  z: number;
}

export interface DecalItem {
  id: string;
  type: 'image' | 'text';
  content: string;
  position: Position3D;
  rotation: Rotation3D;
  scale: number;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
}

export interface ShirtState {
  color: string;
  background: 'light' | 'dark' | 'gradient';
  decals: DecalItem[];
  selectedDecalId: string | null;
}

export interface EditorTab {
  name: string;
  label: string;
  icon: React.ReactNode;
}

export interface ColorOption {
  value: string;
  name: string;
}

export interface BackgroundOption {
  value: 'light' | 'dark' | 'gradient';
  label: string;
  icon: React.ReactNode;
}

export const SHIRT_POSITIONS = {
  FRONT_CENTER: { x: 0, y: 0.04, z: 0.15 },
  FRONT_LEFT: { x: -0.1, y: 0.04, z: 0.15 },
  FRONT_RIGHT: { x: 0.1, y: 0.04, z: 0.15 },
  BACK_CENTER: { x: 0, y: 0.04, z: -0.15 },
  BACK_LEFT: { x: -0.1, y: 0.04, z: -0.15 },
  BACK_RIGHT: { x: 0.1, y: 0.04, z: -0.15 },
} as const;

export const DEFAULT_SCALES = {
  SMALL_LOGO: 0.08,
  MEDIUM_LOGO: 0.15,
  LARGE_LOGO: 0.25,
  TEXT_SMALL: 0.1,
  TEXT_MEDIUM: 0.2,
  TEXT_LARGE: 0.3,
} as const;

export const validateDecalPosition = (position: Position3D): boolean => {
  return (
    position.x >= -0.3 && position.x <= 0.3 &&
    position.y >= -0.3 && position.y <= 0.5 &&
    position.z >= -0.2 && position.z <= 0.2
  );
};

export const validateDecalScale = (scale: number): boolean => {
  return scale >= 0.05 && scale <= 0.4;
};