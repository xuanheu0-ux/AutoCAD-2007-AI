export interface CadPoint {
  x: number;
  y: number;
  z?: number;
}

export interface CadLayer {
  name: string;
  color: string;
  colorIndex: number;
  on: boolean;
  current: boolean;
}

export type CadEntityType =
  | 'AcDbLine'
  | 'AcDbPolyline'
  | 'AcDbCircle'
  | 'AcDbArc'
  | 'AcDbText'
  | 'AcDbMText'
  | 'AcDbRotatedDimension'
  | 'AcDbAlignedDimension'
  | 'AcDbHatch'
  | 'AcDbPoint';

export interface CadEntity {
  handle: string;
  type: CadEntityType;
  layer: string;
  color?: string;
  colorIndex?: number;
  // Geometry
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  points?: [number, number][];
  closed?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  start_angle?: number;
  end_angle?: number;
  text?: string;
  rotation?: number;
  boundary_handle?: string;
  pattern?: string;
  scale?: number;
  text_x?: number;
  text_y?: number;
  vertical?: boolean;
  measured_value?: number;
  createdAt: number;
}

export interface DrawingInfo {
  drawing: string;
  path: string;
  units: string;
  entities_in_model_space: number;
  current_layer: string;
  layers: string[];
  unsaved_changes: boolean;
}

export interface ToolCallLog {
  id: string;
  at: string;
  tool: string;
  args: Record<string, unknown>;
  outcome: string;
  seconds: number;
}

export interface SmokeTestStepResult {
  step: number;
  label: string;
  status: 'ok' | 'fail';
  result?: string;
  error?: string;
}
