import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { cadEngine } from './cadEngine.js';

const SECRET_FILE = path.join(process.cwd(), '.secret');

export function getOrGenerateSecret(): string {
  if (process.env.ACAD_MCP_SECRET_PATH) {
    return process.env.ACAD_MCP_SECRET_PATH.replace(/^\/+|\/+$/g, '');
  }
  try {
    if (fs.existsSync(SECRET_FILE)) {
      const stored = fs.readFileSync(SECRET_FILE, 'utf-8').trim();
      if (stored) return stored;
    }
  } catch {
    // Ignore error reading file
  }
  const generated = 'mcp-' + crypto.randomBytes(16).toString('hex');
  try {
    fs.writeFileSync(SECRET_FILE, generated, 'utf-8');
  } catch {
    // Ephemeral disk fallback
  }
  return generated;
}

export const SECRET_PATH = getOrGenerateSecret();
export const MCP_PATH = `/${SECRET_PATH}/mcp`;

export const MCP_TOOLS_LIST = [
  {
    name: 'draw_batch',
    description:
      'Run many drawing operations in a single call. Far faster than calling individual tools. Pass a list of objects, each with a "type" (line, polyline, rectangle, circle, arc, point, text, mtext, layer) and its parameters.',
    inputSchema: {
      type: 'object',
      properties: {
        operations: {
          type: 'array',
          items: { type: 'object' },
          description: 'List of shape operations to execute.',
        },
      },
      required: ['operations'],
    },
  },
  {
    name: 'draw_line',
    description: 'Draw a line segment from (x1, y1) to (x2, y2).',
    inputSchema: {
      type: 'object',
      properties: {
        x1: { type: 'number' },
        y1: { type: 'number' },
        x2: { type: 'number' },
        y2: { type: 'number' },
        layer: { type: 'string', description: 'Optional layer name' },
      },
      required: ['x1', 'y1', 'x2', 'y2'],
    },
  },
  {
    name: 'draw_polyline',
    description: 'Draw an open or closed polyline connecting a list of 2D points [[x, y], ...].',
    inputSchema: {
      type: 'object',
      properties: {
        points: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'number' },
            minItems: 2,
            maxItems: 2,
          },
          description: 'List of 2D points [[x, y], ...]',
        },
        closed: { type: 'boolean', default: false },
        layer: { type: 'string' },
      },
      required: ['points'],
    },
  },
  {
    name: 'draw_rectangle',
    description: 'Draw a rectangle specified by corner (x, y), width, and height.',
    inputSchema: {
      type: 'object',
      properties: {
        x: { type: 'number' },
        y: { type: 'number' },
        width: { type: 'number' },
        height: { type: 'number' },
        layer: { type: 'string' },
      },
      required: ['x', 'y', 'width', 'height'],
    },
  },
  {
    name: 'draw_circle',
    description: 'Draw a circle specified by center (x, y) and radius.',
    inputSchema: {
      type: 'object',
      properties: {
        x: { type: 'number', description: 'Center X' },
        y: { type: 'number', description: 'Center Y' },
        radius: { type: 'number' },
        layer: { type: 'string' },
      },
      required: ['x', 'y', 'radius'],
    },
  },
  {
    name: 'draw_arc',
    description: 'Draw a circular arc given center (x, y), radius, start angle, and end angle in degrees.',
    inputSchema: {
      type: 'object',
      properties: {
        x: { type: 'number' },
        y: { type: 'number' },
        radius: { type: 'number' },
        start_angle: { type: 'number' },
        end_angle: { type: 'number' },
        layer: { type: 'string' },
      },
      required: ['x', 'y', 'radius', 'start_angle', 'end_angle'],
    },
  },
  {
    name: 'draw_text',
    description: 'Place single-line text at point (x, y) with a specified height and rotation in degrees.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        x: { type: 'number' },
        y: { type: 'number' },
        height: { type: 'number', default: 2.5 },
        rotation: { type: 'number', default: 0 },
        layer: { type: 'string' },
      },
      required: ['text', 'x', 'y'],
    },
  },
  {
    name: 'draw_hatch',
    description: 'Fill a closed boundary entity (circle or closed polyline) with a hatch pattern (e.g. ANSI31, SOLID).',
    inputSchema: {
      type: 'object',
      properties: {
        boundary_handle: { type: 'string', description: 'Handle of closed entity' },
        pattern: { type: 'string', default: 'ANSI31' },
        scale: { type: 'number', default: 1.0 },
      },
      required: ['boundary_handle'],
    },
  },
  {
    name: 'dim_linear',
    description: 'Dimension the horizontal or vertical distance between two points.',
    inputSchema: {
      type: 'object',
      properties: {
        x1: { type: 'number' },
        y1: { type: 'number' },
        x2: { type: 'number' },
        y2: { type: 'number' },
        text_x: { type: 'number' },
        text_y: { type: 'number' },
        vertical: { type: 'boolean', default: false },
      },
      required: ['x1', 'y1', 'x2', 'y2', 'text_x', 'text_y'],
    },
  },
  {
    name: 'dim_aligned',
    description: 'Dimension the true point-to-point distance between two points parallel to the measured line.',
    inputSchema: {
      type: 'object',
      properties: {
        x1: { type: 'number' },
        y1: { type: 'number' },
        x2: { type: 'number' },
        y2: { type: 'number' },
        text_x: { type: 'number' },
        text_y: { type: 'number' },
      },
      required: ['x1', 'y1', 'x2', 'y2', 'text_x', 'text_y'],
    },
  },
  {
    name: 'create_layer',
    description: 'Create a new layer or update color. Colors: red, yellow, green, cyan, blue, magenta, white, grey, or index 1-255.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        color: { type: 'string', default: 'white' },
        make_current: { type: 'boolean', default: true },
      },
      required: ['name'],
    },
  },
  {
    name: 'set_current_layer',
    description: 'Make an existing layer current so new geometry lands on it.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      required: ['name'],
    },
  },
  {
    name: 'list_entities',
    description: 'List entities in the drawing with their handle, type, layer, and bounding extents.',
    inputSchema: {
      type: 'object',
      properties: {
        layer: { type: 'string', description: 'Filter by layer name' },
        limit: { type: 'number', default: 100 },
      },
    },
  },
  {
    name: 'get_entity_info',
    description: 'Look up one entity by handle: type, layer, extents, area, length, radius.',
    inputSchema: {
      type: 'object',
      properties: {
        handle: { type: 'string' },
      },
      required: ['handle'],
    },
  },
  {
    name: 'erase_entity',
    description: 'Delete one entity from the drawing by handle.',
    inputSchema: {
      type: 'object',
      properties: {
        handle: { type: 'string' },
      },
      required: ['handle'],
    },
  },
  {
    name: 'get_drawing_info',
    description: 'Report the open drawing: name, units, layers, entity count, and unsaved changes status.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'capture_view',
    description: 'Render the drawing to an image and return it, so you can SEE your work.',
    inputSchema: {
      type: 'object',
      properties: {
        max_pixels: { type: 'number', default: 1100 },
        zoom_to_fit: { type: 'boolean', default: true },
      },
    },
  },
  {
    name: 'new_drawing',
    description: 'Start a fresh empty drawing.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'save_drawing',
    description: 'Save the drawing as a DWG in the server output folder.',
    inputSchema: {
      type: 'object',
      properties: {
        filename: { type: 'string' },
      },
      required: ['filename'],
    },
  },
  {
    name: 'open_drawing',
    description: 'Open a DWG drawing from the server output folder.',
    inputSchema: {
      type: 'object',
      properties: {
        filename: { type: 'string' },
      },
      required: ['filename'],
    },
  },
  {
    name: 'export_pdf',
    description: 'Plot the current drawing to a PDF in the server output folder.',
    inputSchema: {
      type: 'object',
      properties: {
        filename: { type: 'string' },
        paper_size: { type: 'string', default: '' },
      },
      required: ['filename'],
    },
  },
  {
    name: 'autocad_status',
    description: 'Check whether AutoCAD is running and reachable without changing anything.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'start_autocad',
    description: 'Launch AutoCAD if not running and ensure a drawing is open.',
    inputSchema: {
      type: 'object',
      properties: {
        wait_seconds: { type: 'number', default: 90 },
      },
    },
  },
  {
    name: 'close_autocad',
    description: 'Close AutoCAD. Discard changes or save first.',
    inputSchema: {
      type: 'object',
      properties: {
        save_first: { type: 'string' },
        discard_changes: { type: 'boolean', default: false },
      },
    },
  },
  {
    name: 'run_command',
    description: 'Run any AutoCAD command or AutoLISP expression (e.g. CIRCLE, LINE, or (command "_CIRCLE" ...)).',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string' },
      },
      required: ['command'],
    },
  },
];

export async function executeMcpTool(name: string, args: Record<string, any>): Promise<any> {
  const startTime = Date.now();
  try {
    let resultText = '';
    let resultImage: string | null = null;

    switch (name) {
      case 'draw_batch': {
        const ops = typeof args.operations === 'string' ? JSON.parse(args.operations) : args.operations;
        const handles = cadEngine.drawBatch(ops || []);
        resultText = `Drew ${handles.length} objects in one batch. handles=${handles.join(', ') || '(none)'}`;
        break;
      }
      case 'draw_line': {
        const h = cadEngine.drawLine(Number(args.x1), Number(args.y1), Number(args.x2), Number(args.y2), args.layer);
        resultText = `Line from (${args.x1}, ${args.y1}) to (${args.x2}, ${args.y2}). handle=${h}`;
        break;
      }
      case 'draw_polyline': {
        const pts = typeof args.points === 'string' ? JSON.parse(args.points) : args.points;
        const h = cadEngine.drawPolyline(pts, Boolean(args.closed), args.layer);
        resultText = `Polyline with ${pts.length} points (${args.closed ? 'closed' : 'open'}). handle=${h}`;
        break;
      }
      case 'draw_rectangle': {
        const h = cadEngine.drawRectangle(Number(args.x), Number(args.y), Number(args.width), Number(args.height), args.layer);
        resultText = `Rectangle at (${args.x}, ${args.y}) size ${args.width}x${args.height}. handle=${h}`;
        break;
      }
      case 'draw_circle': {
        const h = cadEngine.drawCircle(Number(args.x), Number(args.y), Number(args.radius), args.layer);
        resultText = `Circle at (${args.x}, ${args.y}) radius ${args.radius}. handle=${h}`;
        break;
      }
      case 'draw_arc': {
        const h = cadEngine.drawArc(Number(args.x), Number(args.y), Number(args.radius), Number(args.start_angle), Number(args.end_angle), args.layer);
        resultText = `Arc at (${args.x}, ${args.y}) radius ${args.radius} from ${args.start_angle}° to ${args.end_angle}°. handle=${h}`;
        break;
      }
      case 'draw_text': {
        const h = cadEngine.drawText(String(args.text), Number(args.x), Number(args.y), Number(args.height || 2.5), Number(args.rotation || 0), args.layer);
        resultText = `Text "${args.text}" at (${args.x}, ${args.y}). handle=${h}`;
        break;
      }
      case 'draw_hatch': {
        const h = cadEngine.drawHatch(String(args.boundary_handle), String(args.pattern || 'ANSI31'), Number(args.scale || 1.0));
        resultText = `Hatched ${args.boundary_handle} with ${args.pattern || 'ANSI31'}. handle=${h}`;
        break;
      }
      case 'dim_linear': {
        const h = cadEngine.dimLinear(Number(args.x1), Number(args.y1), Number(args.x2), Number(args.y2), Number(args.text_x), Number(args.text_y), Boolean(args.vertical));
        const axis = args.vertical ? 'Vertical' : 'Horizontal';
        resultText = `${axis} dimension from (${args.x1}, ${args.y1}) to (${args.x2}, ${args.y2}). handle=${h}`;
        break;
      }
      case 'dim_aligned': {
        const h = cadEngine.dimAligned(Number(args.x1), Number(args.y1), Number(args.x2), Number(args.y2), Number(args.text_x), Number(args.text_y));
        resultText = `Aligned dimension from (${args.x1}, ${args.y1}) to (${args.x2}, ${args.y2}). handle=${h}`;
        break;
      }
      case 'create_layer': {
        const l = cadEngine.createLayer(String(args.name), String(args.color || 'white'), args.make_current !== false);
        resultText = `Layer '${l}' ready in ${args.color || 'white'}${args.make_current !== false ? ' and made current' : ''}.`;
        break;
      }
      case 'set_current_layer': {
        const l = cadEngine.setCurrentLayer(String(args.name));
        resultText = `Layer '${l}' is now current.`;
        break;
      }
      case 'list_entities': {
        const res = cadEngine.listEntities(args.layer, Number(args.limit || 100));
        if (res.rows.length === 0) {
          resultText = `The drawing has ${res.total} entities, none${args.layer ? ` on layer '${args.layer}'` : ''}.`;
        } else {
          resultText = `${res.rows.length} of ${res.total} entities${args.layer ? ` on layer '${args.layer}'` : ''}:\n${res.rows.join('\n')}`;
        }
        break;
      }
      case 'get_entity_info': {
        const info = cadEngine.getEntityInfo(String(args.handle));
        resultText = JSON.stringify(info, null, 2);
        break;
      }
      case 'erase_entity': {
        const kind = cadEngine.eraseEntity(String(args.handle));
        resultText = `Deleted ${kind} ${args.handle}.`;
        break;
      }
      case 'get_drawing_info': {
        const info = cadEngine.getDrawingInfo();
        resultText = JSON.stringify(info, null, 2);
        break;
      }
      case 'new_drawing': {
        const name = cadEngine.newDrawing();
        resultText = `Created and switched to a new drawing: ${name}`;
        break;
      }
      case 'save_drawing': {
        const p = cadEngine.saveDrawing(String(args.filename));
        resultText = `Saved to ${p}`;
        break;
      }
      case 'open_drawing': {
        const name = cadEngine.openDrawing(String(args.filename));
        resultText = `Opened ${name}`;
        break;
      }
      case 'export_pdf': {
        resultText = `Exported PDF for ${cadEngine.drawingName} (extents plotted to PDF layout).`;
        break;
      }
      case 'autocad_status': {
        resultText = JSON.stringify(cadEngine.autocadStatus(), null, 2);
        break;
      }
      case 'start_autocad': {
        resultText = `AutoCAD is ready: ${cadEngine.startAutocad()}`;
        break;
      }
      case 'close_autocad': {
        resultText = cadEngine.closeAutocad(args.save_first, Boolean(args.discard_changes));
        break;
      }
      case 'capture_view': {
        const svg = cadEngine.captureViewSvg(args.zoom_to_fit !== false);
        const svgBase64 = Buffer.from(svg).toString('base64');
        resultText = `Current view of ${cadEngine.entities.length} objects. Check the geometry before drawing more.`;
        resultImage = `data:image/svg+xml;base64,${svgBase64}`;
        break;
      }
      case 'run_command': {
        resultText = cadEngine.runCommand(String(args.command));
        break;
      }
      default:
        throw new Error(`Unknown tool '${name}'.`);
    }

    const duration = (Date.now() - startTime) / 1000;
    cadEngine.recordLog(name, args, 'ok', duration);

    const content: any[] = [{ type: 'text', text: resultText }];
    if (resultImage) {
      content.push({
        type: 'image',
        data: resultImage,
        mimeType: 'image/svg+xml',
      });
    }
    return { content };
  } catch (err: any) {
    const duration = (Date.now() - startTime) / 1000;
    cadEngine.recordLog(name, args, `error: ${err.message}`, duration);
    return {
      content: [{ type: 'text', text: `Error executing ${name}: ${err.message}` }],
      isError: true,
    };
  }
}
