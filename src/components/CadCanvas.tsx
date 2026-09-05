import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CadEntity, CadLayer } from '../types.js';
import { colorIndexToHex } from '../cadEngine.js';
import { ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';

interface CadCanvasProps {
  entities: CadEntity[];
  layers: CadLayer[];
  selectedHandle: string | null;
  onSelectEntity: (handle: string | null) => void;
}

export const CadCanvas: React.FC<CadCanvasProps> = ({
  entities,
  selectedHandle,
  onSelectEntity,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // View transform state: CAD units to canvas pixels
  const [scale, setScale] = useState<number>(3.5); // pixels per CAD unit
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 120, y: 120 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mouseCadCoord, setMouseCadCoord] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({
    width: 800,
    height: 600,
  });

  // Convert CAD coordinate to Canvas pixel coordinate
  const cadToCanvas = useCallback(
    (cadX: number, cadY: number) => {
      const cx = offset.x + cadX * scale;
      const cy = canvasSize.height - (offset.y + cadY * scale);
      return { x: cx, y: cy };
    },
    [offset, scale, canvasSize.height]
  );

  // Convert Canvas pixel coordinate to CAD coordinate
  const canvasToCad = useCallback(
    (canvasX: number, canvasY: number) => {
      const cadX = (canvasX - offset.x) / scale;
      const cadY = (canvasSize.height - canvasY - offset.y) / scale;
      return { x: cadX, y: cadY };
    },
    [offset, scale, canvasSize.height]
  );

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };
    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Zoom to Extents function
  const zoomExtents = useCallback(() => {
    if (entities.length === 0) {
      setScale(3.5);
      setOffset({ x: 120, y: 120 });
      return;
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    entities.forEach((e) => {
      if (e.x1 !== undefined && e.y1 !== undefined) {
        minX = Math.min(minX, e.x1, e.x2 ?? e.x1);
        minY = Math.min(minY, e.y1, e.y2 ?? e.y1);
        maxX = Math.max(maxX, e.x1, e.x2 ?? e.x1);
        maxY = Math.max(maxY, e.y1, e.y2 ?? e.y1);
      }
      if (e.x !== undefined && e.y !== undefined) {
        const r = e.radius || 0;
        minX = Math.min(minX, e.x - r);
        minY = Math.min(minY, e.y - r);
        maxX = Math.max(maxX, e.x + r + (e.width || 0));
        maxY = Math.max(maxY, e.y + r + (e.height || 0));
      }
      if (e.points) {
        e.points.forEach((p) => {
          minX = Math.min(minX, p[0]);
          minY = Math.min(minY, p[1]);
          maxX = Math.max(maxX, p[0]);
          maxY = Math.max(maxY, p[1]);
        });
      }
    });

    if (!isFinite(minX)) {
      minX = 0;
      minY = 0;
      maxX = 100;
      maxY = 60;
    }

    const cadW = Math.max(20, maxX - minX);
    const cadH = Math.max(20, maxY - minY);
    const padding = 60;
    const availableW = Math.max(100, canvasSize.width - padding * 2);
    const availableH = Math.max(100, canvasSize.height - padding * 2);

    const fitScale = Math.min(availableW / cadW, availableH / cadH);
    const clampedScale = Math.max(0.01, Math.min(50, fitScale));

    const midCadX = (minX + maxX) / 2;
    const midCadY = (minY + maxY) / 2;

    setScale(clampedScale);
    setOffset({
      x: canvasSize.width / 2 - midCadX * clampedScale,
      y: canvasSize.height / 2 - midCadY * clampedScale,
    });
  }, [entities, canvasSize]);

  // Initial fit when entities load first time
  useEffect(() => {
    if (entities.length > 0) {
      zoomExtents();
    }
  }, [entities.length === 0]); // eslint-disable-line react-hooks/exhaustive-deps

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;
    ctx.scale(dpr, dpr);

    // Background: AutoCAD classic charcoal / model space
    ctx.fillStyle = '#212428';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw Grid
    const origin = cadToCanvas(0, 0);

    // Minor / Major grid spacing calculation
    let gridCadStep = 10;
    if (scale > 15) gridCadStep = 2;
    else if (scale > 8) gridCadStep = 5;
    else if (scale > 2) gridCadStep = 10;
    else if (scale > 0.8) gridCadStep = 50;
    else if (scale > 0.3) gridCadStep = 100;
    else if (scale > 0.08) gridCadStep = 500;
    else if (scale > 0.03) gridCadStep = 1000;
    else gridCadStep = 2000;

    const startCad = canvasToCad(0, canvasSize.height);
    const endCad = canvasToCad(canvasSize.width, 0);

    const minGridX = Math.floor(startCad.x / gridCadStep) * gridCadStep;
    const maxGridX = Math.ceil(endCad.x / gridCadStep) * gridCadStep;
    const minGridY = Math.floor(startCad.y / gridCadStep) * gridCadStep;
    const maxGridY = Math.ceil(endCad.y / gridCadStep) * gridCadStep;

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#2b2f35';
    ctx.beginPath();
    for (let gx = minGridX; gx <= maxGridX; gx += gridCadStep) {
      const p1 = cadToCanvas(gx, startCad.y);
      const p2 = cadToCanvas(gx, endCad.y);
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }
    for (let gy = minGridY; gy <= maxGridY; gy += gridCadStep) {
      const p1 = cadToCanvas(startCad.x, gy);
      const p2 = cadToCanvas(endCad.x, gy);
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();

    // Axes: X (Red), Y (Green) at origin
    ctx.lineWidth = 1.5;
    // X Axis
    ctx.strokeStyle = '#6b3232';
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(canvasSize.width, origin.y);
    ctx.stroke();
    // Y Axis
    ctx.strokeStyle = '#2d5c34';
    ctx.beginPath();
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, canvasSize.height);
    ctx.stroke();

    // Render Entities
    entities.forEach((entity) => {
      const isSelected = selectedHandle === entity.handle;
      const baseColor = colorIndexToHex(entity.colorIndex);
      ctx.strokeStyle = isSelected ? '#ff0077' : baseColor;
      ctx.fillStyle = isSelected ? '#ff0077' : baseColor;
      ctx.lineWidth = isSelected ? 2.5 : 1.5;

      // Line
      if (
        entity.type === 'AcDbLine' &&
        entity.x1 !== undefined &&
        entity.y1 !== undefined &&
        entity.x2 !== undefined &&
        entity.y2 !== undefined
      ) {
        const p1 = cadToCanvas(entity.x1, entity.y1);
        const p2 = cadToCanvas(entity.x2, entity.y2);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Polyline & Rectangle
      else if (entity.type === 'AcDbPolyline' && entity.points && entity.points.length > 0) {
        ctx.beginPath();
        entity.points.forEach((pt, idx) => {
          const cp = cadToCanvas(pt[0], pt[1]);
          if (idx === 0) ctx.moveTo(cp.x, cp.y);
          else ctx.lineTo(cp.x, cp.y);
        });
        if (entity.closed) ctx.closePath();
        ctx.stroke();
      }

      // Circle
      else if (entity.type === 'AcDbCircle' && entity.x !== undefined && entity.y !== undefined && entity.radius) {
        const center = cadToCanvas(entity.x, entity.y);
        const rPx = entity.radius * scale;
        ctx.beginPath();
        ctx.arc(center.x, center.y, rPx, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Arc
      else if (
        entity.type === 'AcDbArc' &&
        entity.x !== undefined &&
        entity.y !== undefined &&
        entity.radius &&
        entity.start_angle !== undefined &&
        entity.end_angle !== undefined
      ) {
        const center = cadToCanvas(entity.x, entity.y);
        const rPx = entity.radius * scale;
        // AutoCAD angles are counter-clockwise from East. In inverted canvas coordinates:
        const startRad = (-entity.end_angle * Math.PI) / 180;
        const endRad = (-entity.start_angle * Math.PI) / 180;
        ctx.beginPath();
        ctx.arc(center.x, center.y, rPx, startRad, endRad);
        ctx.stroke();
      }

      // Text / MText
      else if ((entity.type === 'AcDbText' || entity.type === 'AcDbMText') && entity.x !== undefined && entity.y !== undefined) {
        const pos = cadToCanvas(entity.x, entity.y);
        const fontSize = Math.max(10, (entity.height || 3) * scale);
        ctx.save();
        ctx.translate(pos.x, pos.y);
        if (entity.rotation) {
          ctx.rotate((-entity.rotation * Math.PI) / 180);
        }
        ctx.font = `${fontSize}px "Courier New", monospace`;
        ctx.fillText(entity.text || '', 0, 0);
        ctx.restore();
      }

      // Hatch
      else if (entity.type === 'AcDbHatch') {
        if (entity.radius && entity.x !== undefined && entity.y !== undefined) {
          const center = cadToCanvas(entity.x, entity.y);
          const rPx = entity.radius * scale;
          ctx.save();
          ctx.beginPath();
          ctx.arc(center.x, center.y, rPx, 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? 'rgba(255, 0, 119, 0.25)' : 'rgba(0, 229, 255, 0.2)';
          ctx.fill();
          ctx.strokeStyle = isSelected ? '#ff0077' : baseColor;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.restore();
        } else if (entity.points && entity.points.length > 0) {
          ctx.save();
          ctx.beginPath();
          entity.points.forEach((pt, idx) => {
            const cp = cadToCanvas(pt[0], pt[1]);
            if (idx === 0) ctx.moveTo(cp.x, cp.y);
            else ctx.lineTo(cp.x, cp.y);
          });
          ctx.closePath();
          ctx.fillStyle = isSelected ? 'rgba(255, 0, 119, 0.25)' : 'rgba(0, 229, 255, 0.2)';
          ctx.fill();
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Dimensions
      else if (
        (entity.type === 'AcDbRotatedDimension' || entity.type === 'AcDbAlignedDimension') &&
        entity.x1 !== undefined &&
        entity.y1 !== undefined &&
        entity.x2 !== undefined &&
        entity.y2 !== undefined
      ) {
        const p1 = cadToCanvas(entity.x1, entity.y1);
        const p2 = cadToCanvas(entity.x2, entity.y2);
        const textPos = cadToCanvas(
          entity.text_x || (entity.x1 + entity.x2) / 2,
          entity.text_y || (entity.y1 + entity.y2) / 2
        );

        ctx.save();
        ctx.strokeStyle = '#00e5ff';
        ctx.fillStyle = '#00e5ff';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);

        // Extension lines & dimension line
        if (entity.vertical) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(textPos.x, p1.y);
          ctx.moveTo(p2.x, p2.y);
          ctx.lineTo(textPos.x, p2.y);
          ctx.stroke();

          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(textPos.x, p1.y);
          ctx.lineTo(textPos.x, p2.y);
          ctx.stroke();

          // Measurement Text (vertical)
          ctx.save();
          ctx.translate(textPos.x, textPos.y);
          ctx.rotate(-Math.PI / 2);
          ctx.font = '11px "Courier New", monospace';
          const label = `${entity.measured_value?.toFixed(0) || ''}`;
          const metrics = ctx.measureText(label);
          ctx.fillStyle = '#212428';
          ctx.fillRect(-metrics.width / 2 - 4, -7, metrics.width + 8, 14);
          ctx.fillStyle = '#00e5ff';
          ctx.fillText(label, -metrics.width / 2, 4);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p1.x, textPos.y);
          ctx.moveTo(p2.x, p2.y);
          ctx.lineTo(p2.x, textPos.y);
          ctx.stroke();

          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(p1.x, textPos.y);
          ctx.lineTo(p2.x, textPos.y);
          ctx.stroke();

          // Measurement Text
          ctx.font = '11px "Courier New", monospace';
          const label = `${entity.measured_value?.toFixed(0) || ''}`;
          const metrics = ctx.measureText(label);
          ctx.fillStyle = '#212428';
          ctx.fillRect(textPos.x - metrics.width / 2 - 4, textPos.y - 7, metrics.width + 8, 14);
          ctx.fillStyle = '#00e5ff';
          ctx.fillText(label, textPos.x - metrics.width / 2, textPos.y + 4);
        }

        ctx.restore();
      }

      // Point
      else if (entity.type === 'AcDbPoint' && entity.x !== undefined && entity.y !== undefined) {
        const p = cadToCanvas(entity.x, entity.y);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw UCS Icon (AutoCAD standard bottom-left UCS)
    const ucsX = 40;
    const ucsY = canvasSize.height - 40;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ff4d4d'; // Red X
    ctx.beginPath();
    ctx.moveTo(ucsX, ucsY);
    ctx.lineTo(ucsX + 24, ucsY);
    ctx.stroke();

    ctx.strokeStyle = '#4dff4d'; // Green Y
    ctx.beginPath();
    ctx.moveTo(ucsX, ucsY);
    ctx.lineTo(ucsX, ucsY - 24);
    ctx.stroke();

    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#ff4d4d';
    ctx.fillText('X', ucsX + 28, ucsY + 3);
    ctx.fillStyle = '#4dff4d';
    ctx.fillText('Y', ucsX - 3, ucsY - 28);
    ctx.fillStyle = '#888888';
    ctx.beginPath();
    ctx.arc(ucsX, ucsY, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }, [entities, selectedHandle, scale, offset, canvasSize, cadToCanvas, canvasToCad]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Zoom centered on mouse
    const newScale = Math.max(0.005, Math.min(100, scale * zoomFactor));
    const newOffsetX = mouseX - (mouseX - offset.x) * (newScale / scale);
    const newOffsetY = canvasSize.height - mouseY - (canvasSize.height - mouseY - offset.y) * (newScale / scale);

    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || e.button === 0) {
      // Middle click or Left click drag pan
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const cadCoord = canvasToCad(mouseX, mouseY);
    setMouseCadCoord({
      x: Math.round(cadCoord.x * 100) / 100,
      y: Math.round(cadCoord.y * 100) / 100,
    });

    if (isPanning) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y - dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
    }
    // Check if clicked to select entity
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const cadPt = canvasToCad(mouseX, mouseY);

    // Find closest entity
    let foundHandle: string | null = null;
    let minDistance = 8 / scale; // click tolerance in CAD units

    for (const entity of entities) {
      if (entity.x !== undefined && entity.y !== undefined && entity.radius) {
        const d = Math.abs(Math.hypot(cadPt.x - entity.x, cadPt.y - entity.y) - entity.radius);
        if (d < minDistance) {
          foundHandle = entity.handle;
          break;
        }
      } else if (entity.x1 !== undefined && entity.y1 !== undefined && entity.x2 !== undefined && entity.y2 !== undefined) {
        // Distance to line segment
        const dist = distToSegment(cadPt.x, cadPt.y, entity.x1, entity.y1, entity.x2, entity.y2);
        if (dist < minDistance) {
          foundHandle = entity.handle;
          break;
        }
      }
    }
    if (foundHandle !== undefined) {
      onSelectEntity(foundHandle);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#212428] overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair block"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {/* Floating Canvas Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#1a1c20]/90 backdrop-blur border border-neutral-700/80 rounded-md p-1 shadow-lg text-neutral-300">
        <button
          id="zoom-in-btn"
          onClick={() => setScale((s) => Math.min(50, s * 1.25))}
          title="Zoom In"
          className="p-1.5 hover:bg-neutral-700/70 rounded transition text-neutral-300 hover:text-white"
        >
          <ZoomIn size={16} />
        </button>
        <button
          id="zoom-out-btn"
          onClick={() => setScale((s) => Math.max(0.2, s * 0.8))}
          title="Zoom Out"
          className="p-1.5 hover:bg-neutral-700/70 rounded transition text-neutral-300 hover:text-white"
        >
          <ZoomOut size={16} />
        </button>
        <button
          id="zoom-extents-btn"
          onClick={zoomExtents}
          title="Zoom Extents (Fit All)"
          className="p-1.5 hover:bg-neutral-700/70 rounded transition text-neutral-300 hover:text-white"
        >
          <Maximize2 size={16} />
        </button>
        <div className="w-[1px] h-4 bg-neutral-700 mx-0.5" />
        <span className="text-[11px] font-mono px-2 text-neutral-400">
          {(scale * 10).toFixed(0)}%
        </span>
      </div>

      {/* Coordinate & Model Space Status Bar (bottom left) */}
      <div className="absolute bottom-2 left-2 flex items-center gap-4 bg-[#181a1d]/85 backdrop-blur border border-neutral-800 rounded px-2.5 py-1 text-[11px] font-mono text-neutral-400 shadow-md">
        <span className="flex items-center gap-1">
          <span className="text-neutral-500">X:</span>
          <span className="text-neutral-200">{mouseCadCoord.x.toFixed(2)}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-neutral-500">Y:</span>
          <span className="text-neutral-200">{mouseCadCoord.y.toFixed(2)}</span>
        </span>
        <span className="text-neutral-500">Z: 0.00</span>
        <span className="text-neutral-600">|</span>
        <span className="text-cyan-400">MODEL</span>
        <span className="text-neutral-600">|</span>
        <span className="text-neutral-300">{entities.length} Objects</span>
      </div>

      {/* Drag Pan Helper Notice */}
      <div className="absolute bottom-2 right-2 text-[10px] text-neutral-500 flex items-center gap-1">
        <Move size={12} /> Drag to Pan • Wheel to Zoom
      </div>
    </div>
  );
};

// Geometry helper for point-to-line-segment distance
function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}
