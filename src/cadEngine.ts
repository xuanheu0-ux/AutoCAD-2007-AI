import { CadEntity, CadLayer, DrawingInfo, ToolCallLog, SmokeTestStepResult } from './types.js';
import { buildAluminumGateDrawing } from './gateDrawing.js';
import { buildControlRoomDoorDrawing } from './controlRoomDoorDrawing.js';

export const COLORS: Record<string, number> = {
  red: 1,
  yellow: 2,
  green: 3,
  cyan: 4,
  blue: 5,
  magenta: 6,
  white: 7,
  black: 7,
  grey: 8,
  gray: 8,
  lightgrey: 9,
  lightgray: 9,
};

export const COLOR_HEX: Record<number, string> = {
  1: '#ff0000', // red
  2: '#ffff00', // yellow
  3: '#00ff00', // green
  4: '#00ffff', // cyan
  5: '#0055ff', // blue
  6: '#ff00ff', // magenta
  7: '#ffffff', // white / black
  8: '#888888', // gray
  9: '#cccccc', // lightgray
};

export function colorIndexToHex(index: number = 7): string {
  return COLOR_HEX[index] || '#00e5ff';
}

export function parseColorIndex(color: string | number | undefined): number {
  if (color === undefined || color === null || color === '') return 7;
  if (typeof color === 'number') return Math.max(1, Math.min(255, Math.floor(color)));
  const str = String(color).trim().toLowerCase();
  const num = parseInt(str, 10);
  if (!isNaN(num)) return Math.max(1, Math.min(255, num));
  if (COLORS[str] !== undefined) return COLORS[str];
  return 7;
}

export function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

export class CadEngine {
  private handleCounter = 40; // Starts at 0x28 (hex)
  public entities: CadEntity[] = [];
  public layers: CadLayer[] = [
    { name: '0', color: 'white', colorIndex: 7, on: true, current: true },
  ];
  public activeLayerName = '0';
  public drawingName = 'Drawing1.dwg';
  public drawingPath = '';
  public units = 'millimetres';
  public insunits = 4;
  public saved = true;
  public auditLogs: ToolCallLog[] = [];
  public isRunning = true;
  public version = 'AutoCAD 2027 (R26.0)';

  private nextHandle(): string {
    this.handleCounter += 1;
    return this.handleCounter.toString(16).toUpperCase();
  }

  public recordLog(tool: string, args: Record<string, unknown>, outcome: string, seconds: number) {
    const logEntry: ToolCallLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      at: new Date().toISOString(),
      tool,
      args,
      outcome,
      seconds: Math.round(seconds * 1000) / 1000,
    };
    this.auditLogs.unshift(logEntry);
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
  }

  // --- Layer operations ---
  public createLayer(name: string, color: string = 'white', makeCurrent: boolean = true): string {
    const colorIndex = parseColorIndex(color);
    const existing = this.layers.find((l) => l.name.toLowerCase() === name.trim().toLowerCase());
    if (existing) {
      existing.color = color;
      existing.colorIndex = colorIndex;
      if (makeCurrent) {
        this.layers.forEach((l) => (l.current = false));
        existing.current = true;
        this.activeLayerName = existing.name;
      }
      return existing.name;
    }
    if (makeCurrent) {
      this.layers.forEach((l) => (l.current = false));
    }
    const newLayer: CadLayer = {
      name: name.trim(),
      color,
      colorIndex,
      on: true,
      current: makeCurrent,
    };
    this.layers.push(newLayer);
    if (makeCurrent) {
      this.activeLayerName = newLayer.name;
    }
    return newLayer.name;
  }

  public setCurrentLayer(name: string): string {
    const layer = this.layers.find((l) => l.name.toLowerCase() === name.trim().toLowerCase());
    if (!layer) {
      const names = this.layers.map((l) => l.name).sort().join(', ');
      throw new Error(`No layer called '${name}'. This drawing has: ${names}. Use create_layer to make a new one.`);
    }
    this.layers.forEach((l) => (l.current = false));
    layer.current = true;
    this.activeLayerName = layer.name;
    return layer.name;
  }

  public getActiveLayer(): CadLayer {
    return this.layers.find((l) => l.name === this.activeLayerName) || this.layers[0];
  }

  // --- Primitive drawing tools ---
  public drawLine(x1: number, y1: number, x2: number, y2: number, layerName?: string): string {
    const layer = layerName || this.activeLayerName;
    const lObj = this.layers.find((l) => l.name === layer) || this.getActiveLayer();
    const handle = this.nextHandle();
    const entity: CadEntity = {
      handle,
      type: 'AcDbLine',
      layer: lObj.name,
      colorIndex: lObj.colorIndex,
      x1,
      y1,
      x2,
      y2,
      createdAt: Date.now(),
    };
    this.entities.push(entity);
    this.saved = false;
    return handle;
  }

  public drawPolyline(points: [number, number][], closed: boolean = false, layerName?: string): string {
    if (points.length < 2) {
      throw new Error('Polyline needs at least 2 points.');
    }
    const layer = layerName || this.activeLayerName;
    const lObj = this.layers.find((l) => l.name === layer) || this.getActiveLayer();
    const handle = this.nextHandle();
    const entity: CadEntity = {
      handle,
      type: 'AcDbPolyline',
      layer: lObj.name,
      colorIndex: lObj.colorIndex,
      points,
      closed,
      createdAt: Date.now(),
    };
    this.entities.push(entity);
    this.saved = false;
    return handle;
  }

  public drawRectangle(x: number, y: number, width: number, height: number, layerName?: string): string {
    const corners: [number, number][] = [
      [x, y],
      [x + width, y],
      [x + width, y + height],
      [x, y + height],
    ];
    return this.drawPolyline(corners, true, layerName);
  }

  public drawCircle(x: number, y: number, radius: number, layerName?: string): string {
    if (radius <= 0) {
      throw new Error('Circle radius must be positive.');
    }
    const layer = layerName || this.activeLayerName;
    const lObj = this.layers.find((l) => l.name === layer) || this.getActiveLayer();
    const handle = this.nextHandle();
    const entity: CadEntity = {
      handle,
      type: 'AcDbCircle',
      layer: lObj.name,
      colorIndex: lObj.colorIndex,
      x,
      y,
      radius,
      createdAt: Date.now(),
    };
    this.entities.push(entity);
    this.saved = false;
    return handle;
  }

  public drawArc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    layerName?: string
  ): string {
    if (radius <= 0) {
      throw new Error('Arc radius must be positive.');
    }
    const layer = layerName || this.activeLayerName;
    const lObj = this.layers.find((l) => l.name === layer) || this.getActiveLayer();
    const handle = this.nextHandle();
    const entity: CadEntity = {
      handle,
      type: 'AcDbArc',
      layer: lObj.name,
      colorIndex: lObj.colorIndex,
      x,
      y,
      radius,
      start_angle: startAngle,
      end_angle: endAngle,
      createdAt: Date.now(),
    };
    this.entities.push(entity);
    this.saved = false;
    return handle;
  }

  public drawText(
    text: string,
    x: number,
    y: number,
    height: number = 2.5,
    rotation: number = 0,
    layerName?: string
  ): string {
    const layer = layerName || this.activeLayerName;
    const lObj = this.layers.find((l) => l.name === layer) || this.getActiveLayer();
    const handle = this.nextHandle();
    const entity: CadEntity = {
      handle,
      type: 'AcDbText',
      layer: lObj.name,
      colorIndex: lObj.colorIndex,
      text: String(text),
      x,
      y,
      height,
      rotation,
      createdAt: Date.now(),
    };
    this.entities.push(entity);
    this.saved = false;
    return handle;
  }

  public drawMText(
    text: string,
    x: number,
    y: number,
    width: number = 100,
    height: number = 2.5,
    layerName?: string
  ): string {
    const layer = layerName || this.activeLayerName;
    const lObj = this.layers.find((l) => l.name === layer) || this.getActiveLayer();
    const handle = this.nextHandle();
    const entity: CadEntity = {
      handle,
      type: 'AcDbMText',
      layer: lObj.name,
      colorIndex: lObj.colorIndex,
      text: String(text),
      x,
      y,
      width,
      height,
      createdAt: Date.now(),
    };
    this.entities.push(entity);
    this.saved = false;
    return handle;
  }

  public drawPoint(x: number, y: number, layerName?: string): string {
    const layer = layerName || this.activeLayerName;
    const lObj = this.layers.find((l) => l.name === layer) || this.getActiveLayer();
    const handle = this.nextHandle();
    const entity: CadEntity = {
      handle,
      type: 'AcDbPoint',
      layer: lObj.name,
      colorIndex: lObj.colorIndex,
      x,
      y,
      createdAt: Date.now(),
    };
    this.entities.push(entity);
    this.saved = false;
    return handle;
  }

  public drawHatch(boundaryHandle: string, pattern: string = 'ANSI31', scale: number = 1.0): string {
    const boundary = this.entities.find((e) => e.handle.toLowerCase() === boundaryHandle.toLowerCase());
    if (!boundary) {
      throw new Error(`Boundary entity '${boundaryHandle}' not found.`);
    }
    const isClosed =
      boundary.type === 'AcDbCircle' ||
      (boundary.type === 'AcDbPolyline' && boundary.closed);
    if (!isClosed) {
      throw new Error(
        `Entity ${boundaryHandle} is not a closed boundary. Hatching needs a closed boundary (closed polyline or circle).`
      );
    }
    const lObj = this.getActiveLayer();
    const handle = this.nextHandle();
    const entity: CadEntity = {
      handle,
      type: 'AcDbHatch',
      layer: lObj.name,
      colorIndex: lObj.colorIndex,
      boundary_handle: boundary.handle,
      pattern: pattern.toUpperCase(),
      scale,
      x: boundary.x,
      y: boundary.y,
      radius: boundary.radius,
      points: boundary.points,
      createdAt: Date.now(),
    };
    this.entities.push(entity);
    this.saved = false;
    return handle;
  }

  public dimLinear(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    textX: number,
    textY: number,
    vertical: boolean = false
  ): string {
    const lObj = this.getActiveLayer();
    const handle = this.nextHandle();
    const measuredValue = vertical ? Math.abs(y2 - y1) : Math.abs(x2 - x1);
    const entity: CadEntity = {
      handle,
      type: 'AcDbRotatedDimension',
      layer: lObj.name,
      colorIndex: lObj.colorIndex,
      x1,
      y1,
      x2,
      y2,
      text_x: textX,
      text_y: textY,
      vertical,
      measured_value: Math.round(measuredValue * 100) / 100,
      createdAt: Date.now(),
    };
    this.entities.push(entity);
    this.saved = false;
    return handle;
  }

  public dimAligned(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    textX: number,
    textY: number
  ): string {
    const lObj = this.getActiveLayer();
    const handle = this.nextHandle();
    const distance = Math.hypot(x2 - x1, y2 - y1);
    const entity: CadEntity = {
      handle,
      type: 'AcDbAlignedDimension',
      layer: lObj.name,
      colorIndex: lObj.colorIndex,
      x1,
      y1,
      x2,
      y2,
      text_x: textX,
      text_y: textY,
      measured_value: Math.round(distance * 100) / 100,
      createdAt: Date.now(),
    };
    this.entities.push(entity);
    this.saved = false;
    return handle;
  }

  // --- Batch operations ---
  public drawBatch(operations: any[]): string[] {
    const handles: string[] = [];
    for (let i = 0; i < operations.length; i++) {
      const op = operations[i];
      if (!op || typeof op !== 'object') {
        throw new Error(`Operation ${i + 1} is not an object.`);
      }
      const kind = String(op.type || '').trim().toLowerCase();
      let handle = '';
      switch (kind) {
        case 'line':
          handle = this.drawLine(Number(op.x1), Number(op.y1), Number(op.x2), Number(op.y2));
          break;
        case 'polyline':
        case 'pline': {
          const rawPts = Array.isArray(op.points) ? op.points : JSON.parse(op.points);
          handle = this.drawPolyline(rawPts, Boolean(op.closed));
          break;
        }
        case 'rectangle':
        case 'rect':
          handle = this.drawRectangle(
            Number(op.x),
            Number(op.y),
            Number(op.width),
            Number(op.height)
          );
          break;
        case 'circle':
          handle = this.drawCircle(Number(op.x), Number(op.y), Number(op.radius));
          break;
        case 'arc':
          handle = this.drawArc(
            Number(op.x),
            Number(op.y),
            Number(op.radius),
            Number(op.start_angle),
            Number(op.end_angle)
          );
          break;
        case 'point':
          handle = this.drawPoint(Number(op.x), Number(op.y));
          break;
        case 'text':
          handle = this.drawText(
            String(op.text || ''),
            Number(op.x),
            Number(op.y),
            Number(op.height || 2.5),
            Number(op.rotation || 0)
          );
          break;
        case 'mtext':
          handle = this.drawMText(
            String(op.text || ''),
            Number(op.x),
            Number(op.y),
            Number(op.width || 100),
            Number(op.height || 2.5)
          );
          break;
        case 'layer':
          this.createLayer(String(op.name || '0'), String(op.color || 'white'), true);
          break;
        default:
          throw new Error(
            `Unknown operation type '${kind}'. Supported: line, polyline, rectangle, circle, arc, point, text, mtext, layer.`
          );
      }
      if (handle) handles.push(handle);
    }
    return handles;
  }

  // --- Entity queries and editing ---
  public listEntities(layerFilter?: string, limit: number = 100): { total: number; rows: string[] } {
    const wanted = layerFilter ? layerFilter.trim().toLowerCase() : '';
    const filtered = this.entities.filter((e) => {
      if (!wanted) return true;
      return e.layer.toLowerCase() === wanted;
    });
    const rows = filtered.slice(0, Math.min(limit, 500)).map((e) => {
      const bounds = this.getEntityBounds(e);
      const ext = bounds ? ` [(${bounds.minX.toFixed(1)}, ${bounds.minY.toFixed(1)}) to (${bounds.maxX.toFixed(1)}, ${bounds.maxY.toFixed(1)})]` : '';
      return `  ${e.handle}  ${e.type.replace('AcDb', '')}  on ${e.layer}${ext}`;
    });
    return { total: this.entities.length, rows };
  }

  public getEntityBounds(e: CadEntity): { minX: number; minY: number; maxX: number; maxY: number } | null {
    if (e.type === 'AcDbLine' && e.x1 !== undefined && e.y1 !== undefined && e.x2 !== undefined && e.y2 !== undefined) {
      return {
        minX: Math.min(e.x1, e.x2),
        minY: Math.min(e.y1, e.y2),
        maxX: Math.max(e.x1, e.x2),
        maxY: Math.max(e.y1, e.y2),
      };
    }
    if (e.type === 'AcDbPolyline' && e.points && e.points.length > 0) {
      const xs = e.points.map((p) => p[0]);
      const ys = e.points.map((p) => p[1]);
      return {
        minX: Math.min(...xs),
        minY: Math.min(...ys),
        maxX: Math.max(...xs),
        maxY: Math.max(...ys),
      };
    }
    if ((e.type === 'AcDbCircle' || e.type === 'AcDbArc') && e.x !== undefined && e.y !== undefined && e.radius !== undefined) {
      return {
        minX: e.x - e.radius,
        minY: e.y - e.radius,
        maxX: e.x + e.radius,
        maxY: e.y + e.radius,
      };
    }
    if (e.type === 'AcDbText' && e.x !== undefined && e.y !== undefined) {
      const h = e.height || 2.5;
      const w = (e.text?.length || 4) * h * 0.7;
      return { minX: e.x, minY: e.y, maxX: e.x + w, maxY: e.y + h };
    }
    if (e.type === 'AcDbPoint' && e.x !== undefined && e.y !== undefined) {
      return { minX: e.x - 1, minY: e.y - 1, maxX: e.x + 1, maxY: e.y + 1 };
    }
    if ((e.type === 'AcDbRotatedDimension' || e.type === 'AcDbAlignedDimension') && e.x1 !== undefined && e.y1 !== undefined) {
      const ptsX = [e.x1, e.x2 || 0, e.text_x || 0];
      const ptsY = [e.y1, e.y2 || 0, e.text_y || 0];
      return {
        minX: Math.min(...ptsX),
        minY: Math.min(...ptsY),
        maxX: Math.max(...ptsX),
        maxY: Math.max(...ptsY),
      };
    }
    return null;
  }

  public getEntityInfo(handle: string): Record<string, unknown> {
    const e = this.entities.find((item) => item.handle.toLowerCase() === handle.toLowerCase());
    if (!e) {
      throw new Error(`No entity found with handle '${handle}'.`);
    }
    const bounds = this.getEntityBounds(e);
    return {
      handle: e.handle,
      type: e.type,
      layer: e.layer,
      bounds: bounds
        ? {
            min: `(${bounds.minX.toFixed(2)}, ${bounds.minY.toFixed(2)})`,
            max: `(${bounds.maxX.toFixed(2)}, ${bounds.maxY.toFixed(2)})`,
          }
        : undefined,
      radius: e.radius,
      length: e.type === 'AcDbLine' && e.x1 !== undefined && e.x2 !== undefined
        ? Math.hypot(e.x2 - e.x1, (e.y2 || 0) - (e.y1 || 0))
        : undefined,
      area: e.type === 'AcDbCircle' && e.radius !== undefined
        ? Math.PI * e.radius * e.radius
        : undefined,
      text: e.text,
      closed: e.closed,
    };
  }

  public eraseEntity(handle: string): string {
    const index = this.entities.findIndex((e) => e.handle.toLowerCase() === handle.toLowerCase());
    if (index === -1) {
      throw new Error(`No entity with handle '${handle}' found to erase.`);
    }
    const removed = this.entities.splice(index, 1)[0];
    this.saved = false;
    return removed.type.replace('AcDb', '');
  }

  // --- Document lifecycle ---
  public getDrawingInfo(): DrawingInfo {
    const layersList = this.layers.map((l) => {
      let str = `${l.name} (colour ${l.colorIndex}`;
      if (!l.on) str += ', off';
      if (l.name === this.activeLayerName) str += ', current';
      return str + ')';
    });
    return {
      drawing: this.drawingName,
      path: this.drawingPath || '(never saved to disk)',
      units: this.units,
      entities_in_model_space: this.entities.length,
      current_layer: this.activeLayerName,
      layers: layersList,
      unsaved_changes: !this.saved,
    };
  }

  public newDrawing(): string {
    this.entities = [];
    this.layers = [{ name: '0', color: 'white', colorIndex: 7, on: true, current: true }];
    this.activeLayerName = '0';
    this.drawingName = 'Drawing' + Math.floor(Math.random() * 100 + 1) + '.dwg';
    this.drawingPath = '';
    this.saved = true;
    return this.drawingName;
  }

  // Rotate all text and dimension entities by a specified angle (e.g. 180 degrees)
  public rotateAllText(angle: number = 180): { textCount: number; dimCount: number; totalCount: number } {
    let textCount = 0;
    let dimCount = 0;
    for (const e of this.entities) {
      if (e.type === 'AcDbText' || e.type === 'AcDbMText') {
        e.rotation = (((e.rotation || 0) + angle) % 360 + 360) % 360;
        textCount++;
      } else if (e.type === 'AcDbRotatedDimension' || e.type === 'AcDbAlignedDimension') {
        e.rotation = (((e.rotation || 0) + angle) % 360 + 360) % 360;
        dimCount++;
      }
    }
    this.saved = false;
    this.recordLog('rotate_all_text', { angle }, `Rotated ${textCount} text and ${dimCount} dimension labels by ${angle}°`, 0.005);
    return { textCount, dimCount, totalCount: textCount + dimCount };
  }

  public saveDrawing(filename: string): string {
    const clean = filename.replace(/[^a-zA-Z0-9_.-]/g, '');
    const finalName = clean.endsWith('.dwg') ? clean : clean + '.dwg';
    this.drawingName = finalName;
    this.drawingPath = `/output/${finalName}`;
    this.saved = true;
    return this.drawingPath;
  }

  public openDrawing(filename: string): string {
    this.drawingName = filename.endsWith('.dwg') ? filename : filename + '.dwg';
    this.drawingPath = `/output/${this.drawingName}`;
    this.saved = true;
    return this.drawingName;
  }

  public autocadStatus() {
    return {
      running: this.isRunning,
      version: this.version,
      open_drawings: [this.drawingName],
    };
  }

  public startAutocad(): string {
    this.isRunning = true;
    return `${this.version}, drawing '${this.drawingName}'`;
  }

  public closeAutocad(saveFirst?: string, discardChanges: boolean = false): string {
    if (!this.saved && !discardChanges && !saveFirst) {
      throw new Error(
        `Not closing: drawing '${this.drawingName}' has unsaved changes. Pass save_first with a filename or set discard_changes=True.`
      );
    }
    if (saveFirst) {
      this.saveDrawing(saveFirst);
    }
    this.isRunning = false;
    return saveFirst ? `AutoCAD closed after saving to ${this.drawingPath}.` : 'AutoCAD closed.';
  }

  // --- Capture view: generates SVG snapshot ---
  public captureViewSvg(zoomToFit: boolean = true): string {
    if (this.entities.length === 0) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" style="background:#1e1e1e">
        <text x="400" y="300" fill="#666666" font-family="monospace" font-size="16" text-anchor="middle">Empty Model Space (0 entities)</text>
      </svg>`;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const e of this.entities) {
      const b = this.getEntityBounds(e);
      if (b) {
        if (b.minX < minX) minX = b.minX;
        if (b.minY < minY) minY = b.minY;
        if (b.maxX > maxX) maxX = b.maxX;
        if (b.maxY > maxY) maxY = b.maxY;
      }
    }

    if (!isFinite(minX)) {
      minX = 0;
      minY = 0;
      maxX = 200;
      maxY = 150;
    }

    const padding = Math.max(10, Math.max(maxX - minX, maxY - minY) * 0.1);
    const boxX = minX - padding;
    const boxY = minY - padding;
    const boxW = Math.max(10, maxX - minX + padding * 2);
    const boxH = Math.max(10, maxY - minY + padding * 2);

    let svgElements = '';
    for (const e of this.entities) {
      const color = colorIndexToHex(e.colorIndex);
      if (e.type === 'AcDbLine' && e.x1 !== undefined && e.y1 !== undefined && e.x2 !== undefined && e.y2 !== undefined) {
        svgElements += `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${color}" stroke-width="1.5" />`;
      } else if (e.type === 'AcDbPolyline' && e.points && e.points.length > 0) {
        const d = e.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + (e.closed ? ' Z' : '');
        svgElements += `<path d="${d}" stroke="${color}" fill="none" stroke-width="1.5" />`;
      } else if (e.type === 'AcDbCircle' && e.x !== undefined && e.y !== undefined && e.radius !== undefined) {
        svgElements += `<circle cx="${e.x}" cy="${e.y}" r="${e.radius}" stroke="${color}" fill="none" stroke-width="1.5" />`;
      } else if (e.type === 'AcDbArc' && e.x !== undefined && e.y !== undefined && e.radius !== undefined) {
        const startRad = ((e.start_angle || 0) * Math.PI) / 180;
        const endRad = ((e.end_angle || 0) * Math.PI) / 180;
        const sx = e.x + e.radius * Math.cos(startRad);
        const sy = e.y + e.radius * Math.sin(startRad);
        const ex = e.x + e.radius * Math.cos(endRad);
        const ey = e.y + e.radius * Math.sin(endRad);
        const diff = (e.end_angle || 0) - (e.start_angle || 0);
        const largeArc = Math.abs(diff) > 180 ? 1 : 0;
        svgElements += `<path d="M ${sx} ${sy} A ${e.radius} ${e.radius} 0 ${largeArc} 1 ${ex} ${ey}" stroke="${color}" fill="none" stroke-width="1.5" />`;
      } else if (e.type === 'AcDbText' && e.x !== undefined && e.y !== undefined) {
        const rot = e.rotation || 0;
        const safeText = escapeXml(e.text || '');
        svgElements += `<g transform="translate(${e.x}, ${e.y}) scale(1, -1) rotate(${-rot})">
          <text x="0" y="0" fill="${color}" font-family="monospace" font-size="${e.height || 4}">${safeText}</text>
        </g>`;
      } else if (e.type === 'AcDbHatch') {
        if (e.radius && e.x !== undefined && e.y !== undefined) {
          svgElements += `<circle cx="${e.x}" cy="${e.y}" r="${e.radius}" fill="${color}" fill-opacity="0.35" stroke="${color}" stroke-dasharray="2,2" />`;
        } else if (e.points && e.points.length > 0) {
          const d = e.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';
          svgElements += `<path d="${d}" fill="${color}" fill-opacity="0.35" stroke="${color}" stroke-dasharray="2,2" />`;
        }
      } else if (e.type === 'AcDbRotatedDimension' || e.type === 'AcDbAlignedDimension') {
        if (e.x1 !== undefined && e.y1 !== undefined && e.x2 !== undefined && e.y2 !== undefined) {
          const tx = e.text_x || (e.x1 + e.x2) / 2;
          const ty = e.text_y || (e.y1 + e.y2) / 2;
          const rot = e.rotation || 0;
          const safeVal = escapeXml(e.measured_value?.toFixed(1) || '');
          svgElements += `<g opacity="0.85">
            <line x1="${e.x1}" y1="${e.y1}" x2="${tx}" y2="${ty}" stroke="#00e5ff" stroke-width="0.75" stroke-dasharray="2,2" />
            <line x1="${e.x2}" y1="${e.y2}" x2="${tx}" y2="${ty}" stroke="#00e5ff" stroke-width="0.75" stroke-dasharray="2,2" />
            <g transform="translate(${tx}, ${ty}) scale(1, -1) rotate(${-rot})">
              <text x="0" y="0" fill="#00e5ff" font-family="monospace" font-size="3.5" text-anchor="middle" dominant-baseline="middle">${safeVal}</text>
            </g>
          </g>`;
        }
      }
    }

    // Invert Y axis for CAD standard coordinates (Y is up in CAD, down in SVG)
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${boxX} ${boxY} ${boxW} ${boxH}" width="1100" height="${Math.round((boxH / boxW) * 1100)}" style="background:#1e1e1e">
      <g transform="scale(1, -1) translate(0, ${-(boxY * 2 + boxH)})">
        ${svgElements}
      </g>
    </svg>`;
  }

  // --- Run Smoke Test (matching test_draw.py) ---
  public runSmokeTest(): SmokeTestStepResult[] {
    const steps: SmokeTestStepResult[] = [];
    let stepNum = 1;

    // Step 1: Connect to AutoCAD
    steps.push({
      step: stepNum++,
      label: 'connect to AutoCAD',
      status: 'ok',
      result: `${this.version}, drawing '${this.drawingName}'`,
    });

    // Step 2: Create + activate a layer
    const lName = this.createLayer('MCP-TEST', 'green', true);
    steps.push({
      step: stepNum++,
      label: 'create + activate a layer',
      status: 'ok',
      result: `layer ${lName} is current`,
    });

    // Step 3: Draw a closed rectangle (0,0 to 100,60)
    const rectHandle = this.drawRectangle(0, 0, 100, 60);
    steps.push({
      step: stepNum++,
      label: 'draw a closed rectangle (VARIANT polyline)',
      status: 'ok',
      result: `rectangle handle ${rectHandle}`,
    });

    // Step 4: Draw a circle (50, 30, r=20)
    const circHandle = this.drawCircle(50, 30, 20);
    steps.push({
      step: stepNum++,
      label: 'draw a circle',
      status: 'ok',
      result: `circle handle ${circHandle}`,
    });

    // Step 5: Draw an arc (50, 30, r=28, 0 to 180 deg)
    const arcHandle = this.drawArc(50, 30, 28, 0, 180);
    steps.push({
      step: stepNum++,
      label: 'draw an arc',
      status: 'ok',
      result: `arc handle ${arcHandle}`,
    });

    // Step 6: Add text ("MCP TEST" at 10, 70, h=6)
    const textHandle = this.drawText('MCP TEST', 10, 70, 6.0);
    steps.push({
      step: stepNum++,
      label: 'add text',
      status: 'ok',
      result: `text handle ${textHandle}`,
    });

    // Step 7: Add a linear dimension
    const dimHandle = this.dimLinear(0, 0, 100, 0, 50, -15, false);
    steps.push({
      step: stepNum++,
      label: 'add a linear dimension',
      status: 'ok',
      result: `dimension handle ${dimHandle}`,
    });

    // Step 8: Hatch a closed boundary (circle at 150, 30, r=15)
    const hatchBoundary = this.drawCircle(150, 30, 15);
    const hatchHandle = this.drawHatch(hatchBoundary, 'ANSI31', 1.0);
    steps.push({
      step: stepNum++,
      label: 'hatch a closed boundary (VT_DISPATCH array)',
      status: 'ok',
      result: `hatch handle ${hatchHandle}`,
    });

    // Step 9: Zoom extents
    steps.push({
      step: stepNum++,
      label: 'zoom extents',
      status: 'ok',
      result: 'zoomed to extents',
    });

    // Step 10: Count entities
    steps.push({
      step: stepNum++,
      label: 'count entities',
      status: 'ok',
      result: `${this.entities.length} entities in model space`,
    });

    // Step 11: Look rectangle up by its handle
    const summary = this.getEntityInfo(rectHandle);
    steps.push({
      step: stepNum++,
      label: 'look the rectangle up by its handle',
      status: 'ok',
      result: JSON.stringify(summary),
    });

    return steps;
  }

  // --- Run Command / AutoLISP parser ---
  public runCommand(cmd: string): string {
    const trimmed = cmd.trim();
    if (!trimmed) throw new Error('No command given.');
    const beforeCount = this.entities.length;

    // Handle AutoLISP expression like (command "_CIRCLE" "50,30" "20")
    if (trimmed.startsWith('(')) {
      const matchCircle = trimmed.match(/_?CIRCLE"?\s+"?([-\d.]+),([-\d.]+)"?\s+"?([-\d.]+)/i);
      if (matchCircle) {
        const x = parseFloat(matchCircle[1]);
        const y = parseFloat(matchCircle[2]);
        const r = parseFloat(matchCircle[3]);
        const handle = this.drawCircle(x, y, r);
        return `Ran: ${trimmed}\nreturned T\n1 new object(s) (${beforeCount} -> ${this.entities.length}). handles=${handle}`;
      }
      const matchLine = trimmed.match(/_?LINE"?\s+"?([-\d.]+),([-\d.]+)"?\s+"?([-\d.]+),([-\d.]+)/i);
      if (matchLine) {
        const x1 = parseFloat(matchLine[1]);
        const y1 = parseFloat(matchLine[2]);
        const x2 = parseFloat(matchLine[3]);
        const y2 = parseFloat(matchLine[4]);
        const handle = this.drawLine(x1, y1, x2, y2);
        return `Ran: ${trimmed}\nreturned T\n1 new object(s) (${beforeCount} -> ${this.entities.length}). handles=${handle}`;
      }
      return `Ran: ${trimmed}\nreturned T\nNo new objects (${this.entities.length} in model space).`;
    }

    // Handle plain CLI commands: e.g. CIRCLE 50,30 20
    const parts = trimmed.split(/\s+/);
    const verb = parts[0].toUpperCase();

    if (verb === 'CIRCLE') {
      const pt = (parts[1] || '0,0').split(',');
      const x = parseFloat(pt[0]) || 0;
      const y = parseFloat(pt[1]) || 0;
      const r = parseFloat(parts[2]) || 10;
      const handle = this.drawCircle(x, y, r);
      return `Command: CIRCLE\n1 new object created. handle=${handle}`;
    }

    if (verb === 'LINE') {
      const p1 = (parts[1] || '0,0').split(',');
      const p2 = (parts[2] || '10,10').split(',');
      const handle = this.drawLine(
        parseFloat(p1[0]) || 0,
        parseFloat(p1[1]) || 0,
        parseFloat(p2[0]) || 10,
        parseFloat(p2[1]) || 10
      );
      return `Command: LINE\n1 new object created. handle=${handle}`;
    }

    if (verb === 'RECTANGLE' || verb === 'RECT') {
      const p1 = (parts[1] || '0,0').split(',');
      const p2 = (parts[2] || '50,30').split(',');
      const w = parseFloat(p2[0]) || 50;
      const h = parseFloat(p2[1]) || 30;
      const handle = this.drawRectangle(parseFloat(p1[0]) || 0, parseFloat(p1[1]) || 0, w, h);
      return `Command: RECTANGLE\n1 new object created. handle=${handle}`;
    }

    if (verb === 'ERASE') {
      const handle = parts[1];
      if (!handle) throw new Error('Specify handle to erase, e.g. ERASE 2A');
      const kind = this.eraseEntity(handle);
      return `Command: ERASE\nDeleted ${kind} ${handle}.`;
    }

    if (verb === 'ZOOM') {
      return `Command: ZOOM EXTENTS\nRegenerating model... done.`;
    }

    if (verb === 'GATE' || verb === 'CONG' || verb === 'CONG4CANH' || verb === 'MAIN_GATE') {
      const count = this.drawMainGate4Leaves();
      return `Command: ${verb}\nGenerated main gate drawing (Khung nhôm hộp 4 cánh gập mở ngoài 4000x3400mm) with ${count} entities. Units: mm.`;
    }

    if (
      verb === 'DOOR' ||
      verb === 'CUA' ||
      verb === 'CUADI' ||
      verb === 'CUANHAVANHANH' ||
      verb === 'CUABANGDIEN' ||
      verb === 'CONTROL_DOOR'
    ) {
      const count = this.drawControlRoomDoor();
      return `Command: ${verb}\nGenerated electrical control room door drawing (Cửa đi nhà vận hành bảng điện 2 cánh mở trong 1700x2500mm) with ${count} entities. Units: mm.`;
    }

    if (
      verb === 'ROTATE_TEXT' ||
      verb === 'ROTATETEXT' ||
      verb === 'TEXT180' ||
      verb === 'XOAYCHU' ||
      verb === 'XOAY180'
    ) {
      const angle = parts[1] ? parseFloat(parts[1]) : 180;
      const res = this.rotateAllText(angle);
      return `Command: ${verb}\nĐã chỉnh lại chữ và số đo quay ${angle}° (${res.textCount} chữ viết và ${res.dimCount} nhãn kích thước).`;
    }

    if (verb === 'STATUS') {
      return JSON.stringify(this.getDrawingInfo(), null, 2);
    }

    return `Command '${verb}' executed. (No geometric changes).`;
  }

  public drawMainGate4Leaves(): number {
    return buildAluminumGateDrawing(this);
  }

  public drawControlRoomDoor(): number {
    return buildControlRoomDoorDrawing(this);
  }

  // --- Export DXF format text ---
  public exportDxf(): string {
    let dxf = `0\nSECTION\n2\nHEADER\n9\n$INSUNITS\n70\n${this.insunits}\n0\nENDSEC\n`;
    dxf += `0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n${this.layers.length}\n`;
    for (const l of this.layers) {
      dxf += `0\nLAYER\n2\n${l.name}\n70\n0\n62\n${l.colorIndex}\n6\nCONTINUOUS\n`;
    }
    dxf += `0\nENDTAB\n0\nENDSEC\n`;
    dxf += `0\nSECTION\n2\nENTITIES\n`;

    for (const e of this.entities) {
      if (e.type === 'AcDbLine') {
        dxf += `0\nLINE\n5\n${e.handle}\n8\n${e.layer}\n10\n${e.x1}\n20\n${e.y1}\n30\n0.0\n11\n${e.x2}\n21\n${e.y2}\n31\n0.0\n`;
      } else if (e.type === 'AcDbCircle') {
        dxf += `0\nCIRCLE\n5\n${e.handle}\n8\n${e.layer}\n10\n${e.x}\n20\n${e.y}\n30\n0.0\n40\n${e.radius}\n`;
      } else if (e.type === 'AcDbArc') {
        dxf += `0\nARC\n5\n${e.handle}\n8\n${e.layer}\n10\n${e.x}\n20\n${e.y}\n30\n0.0\n40\n${e.radius}\n50\n${e.start_angle}\n51\n${e.end_angle}\n`;
      } else if (e.type === 'AcDbPolyline' && e.points) {
        dxf += `0\nLWPOLYLINE\n5\n${e.handle}\n8\n${e.layer}\n90\n${e.points.length}\n70\n${e.closed ? 1 : 0}\n`;
        for (const pt of e.points) {
          dxf += `10\n${pt[0]}\n20\n${pt[1]}\n`;
        }
      } else if (e.type === 'AcDbText') {
        dxf += `0\nTEXT\n5\n${e.handle}\n8\n${e.layer}\n10\n${e.x}\n20\n${e.y}\n30\n0.0\n40\n${e.height || 2.5}\n1\n${e.text || ''}\n50\n${e.rotation || 0}\n`;
      }
    }

    dxf += `0\nENDSEC\n0\nEOF\n`;
    return dxf;
  }
}

export const cadEngine = new CadEngine();
// Initialize drawing with requested 2-leaf electrical control room door (1700x2500mm inward opening)
cadEngine.drawControlRoomDoor();
