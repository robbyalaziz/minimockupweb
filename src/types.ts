export type ToolType =
  | 'select'
  | 'hand'
  | 'frame'
  | 'rect'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'text'
  | 'star'
  | 'image';

export type ShapeType =
  | 'frame'
  | 'group'
  | 'rect'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'text'
  | 'star'
  | 'image';

export interface CanvasShape {
  id: string;
  name: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  parentId?: string | null;

  // Image properties
  imageUrl?: string;
  imageFit?: 'cover' | 'contain' | 'fill';

  // Typography
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontFamily?: string;

  // Effects
  hasShadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowX?: number;
  shadowY?: number;

  // Auto Layout
  autoLayout?: 'none' | 'horizontal' | 'vertical';
  gap?: number;
  padding?: number;

  // Frame clipping
  clipContent?: boolean;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export interface Point {
  x: number;
  y: number;
}

export interface MarqueeSelection {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export interface SnapGuide {
  orientation: 'h' | 'v';
  coord: number;
}

// Multi-Project Architecture
export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  category?: 'mobile' | 'web' | 'dashboard' | 'custom';
  shapes: CanvasShape[];
  viewport: Viewport;
}

export interface ScreenPreset {
  id: string;
  category: 'Phone' | 'Tablet' | 'Desktop' | 'Social';
  name: string;
  width: number;
  height: number;
  badge?: string;
}
