import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { cadEngine } from './src/cadEngine.js';
import {
  SECRET_PATH,
  MCP_PATH,
  MCP_TOOLS_LIST,
  executeMcpTool,
} from './src/mcpTools.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const HOST = '0.0.0.0';

let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      geminiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // --- Health check endpoints ---
  app.get([`/${SECRET_PATH}/health`, '/health', '/api/health'], (req, res) => {
    res.json({
      status: 'ok',
      server: 'autocad-mcp',
      tools: MCP_TOOLS_LIST.length,
      mcp_endpoint: MCP_PATH,
      secret_path: SECRET_PATH,
    });
  });

  // --- MCP JSON-RPC protocol handler ---
  const handleMcpRpc = async (req: express.Request, res: express.Response) => {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null });
    }

    const { id, method, params } = body;

    // Handle initialize
    if (method === 'initialize') {
      return res.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {
              listChanged: false,
            },
          },
          serverInfo: {
            name: 'AutoCAD',
            version: '1.0.0',
          },
          instructions:
            'Controls AutoCAD 2027 running on this machine for 2D drafting. Coordinates are drawing units with origin at (0, 0). Work in this loop: draw, look, correct.',
        },
      });
    }

    // Handle notifications/initialized
    if (method === 'notifications/initialized') {
      return res.json({ jsonrpc: '2.0', id: id ?? null, result: {} });
    }

    // Handle ping
    if (method === 'ping') {
      return res.json({ jsonrpc: '2.0', id, result: {} });
    }

    // Handle tools/list
    if (method === 'tools/list') {
      return res.json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: MCP_TOOLS_LIST,
        },
      });
    }

    // Handle tools/call
    if (method === 'tools/call') {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      if (!toolName) {
        return res.status(400).json({
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: 'Missing tool name' },
        });
      }

      const result = await executeMcpTool(toolName, toolArgs);
      return res.json({
        jsonrpc: '2.0',
        id,
        result,
      });
    }

    return res.status(404).json({
      jsonrpc: '2.0',
      id: id ?? null,
      error: { code: -32601, message: `Method '${method}' not found` },
    });
  };

  // Mount MCP routes (both under secret path and direct /mcp)
  app.post(`/${SECRET_PATH}/mcp`, handleMcpRpc);
  app.post('/mcp', handleMcpRpc);

  app.get([`/${SECRET_PATH}/mcp`, '/mcp'], (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write(`event: endpoint\ndata: ${MCP_PATH}\n\n`);
  });

  // --- REST API for Web UI ---
  app.get('/api/cad/state', (req, res) => {
    res.json({
      entities: cadEngine.entities,
      layers: cadEngine.layers,
      drawingInfo: cadEngine.getDrawingInfo(),
      status: cadEngine.autocadStatus(),
      auditLogs: cadEngine.auditLogs.slice(0, 50),
      secretPath: SECRET_PATH,
      mcpPath: MCP_PATH,
      tools: MCP_TOOLS_LIST.map((t) => ({ name: t.name, description: t.description })),
    });
  });

  app.post('/api/cad/tool', async (req, res) => {
    const { name, args } = req.body;
    if (!name) return res.status(400).json({ error: 'Tool name required' });
    const result = await executeMcpTool(name, args || {});
    res.json({
      result,
      state: {
        entities: cadEngine.entities,
        layers: cadEngine.layers,
        drawingInfo: cadEngine.getDrawingInfo(),
        auditLogs: cadEngine.auditLogs.slice(0, 50),
      },
    });
  });

  app.post('/api/cad/smoke-test', (req, res) => {
    const steps = cadEngine.runSmokeTest();
    res.json({
      steps,
      state: {
        entities: cadEngine.entities,
        layers: cadEngine.layers,
        drawingInfo: cadEngine.getDrawingInfo(),
        auditLogs: cadEngine.auditLogs.slice(0, 50),
      },
    });
  });

  app.post('/api/cad/command', (req, res) => {
    const { command } = req.body;
    if (!command) return res.status(400).json({ error: 'Command required' });
    try {
      const output = cadEngine.runCommand(command);
      res.json({
        output,
        state: {
          entities: cadEngine.entities,
          layers: cadEngine.layers,
          drawingInfo: cadEngine.getDrawingInfo(),
          auditLogs: cadEngine.auditLogs.slice(0, 50),
        },
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/cad/clear', (req, res) => {
    cadEngine.newDrawing();
    res.json({ success: true, drawingInfo: cadEngine.getDrawingInfo() });
  });

  app.get('/api/cad/export/dxf', (req, res) => {
    const dxf = cadEngine.exportDxf();
    res.setHeader('Content-Type', 'application/dxf');
    res.setHeader('Content-Disposition', `attachment; filename="${cadEngine.drawingName.replace('.dwg', '.dxf')}"`);
    res.send(dxf);
  });

  app.get('/api/cad/export/svg', (req, res) => {
    const svg = cadEngine.captureViewSvg(true);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', 'attachment; filename="cad-drawing.svg"');
    res.send(svg);
  });

  // Dedicated endpoint to load the 4-leaf aluminum gate technical drawing
  app.post('/api/cad/gate-drawing', (req, res) => {
    const count = cadEngine.drawMainGate4Leaves();
    res.json({
      summary: `Đã nạp bản vẽ kỹ thuật Cổng chính khung nhôm hộp 4 cánh pano nhôm tấm (4000x3400mm, mở ngoài) với ${count} thực thể CAD.`,
      handles: cadEngine.entities.map((e) => e.handle),
      state: {
        entities: cadEngine.entities,
        layers: cadEngine.layers,
        drawingInfo: cadEngine.getDrawingInfo(),
        auditLogs: cadEngine.auditLogs.slice(0, 50),
      },
    });
  });

  // --- AI Drawing Assistant (Gemini) ---
  app.post('/api/cad/ai-draw', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const lower = prompt.toLowerCase();
    // Check if user is requesting gate drawing
    if (
      lower.includes('cổng') ||
      lower.includes('gate') ||
      lower.includes('4 cánh') ||
      lower.includes('nhôm tấm') ||
      lower.includes('nhôm hộp') ||
      lower.includes('gập mở')
    ) {
      const count = cadEngine.drawMainGate4Leaves();
      return res.json({
        summary: `Đã vẽ bản vẽ kỹ thuật chi tiết: Cổng chính loại khung nhôm hộp 4 cánh pano nhôm tấm (Rộng 4m x Cao 3.4m, mở ngoài) gồm mặt đứng, mặt bằng quỹ đạo mở, mặt cắt A-A và bảng vật tư (${count} thực thể CAD).`,
        handles: cadEngine.entities.map((e) => e.handle),
        state: {
          entities: cadEngine.entities,
          layers: cadEngine.layers,
          drawingInfo: cadEngine.getDrawingInfo(),
          auditLogs: cadEngine.auditLogs.slice(0, 50),
        },
      });
    }

    const ai = getGemini();
    if (!ai) {
      // Offline fallback: provide helpful template / mock geometric construct
      let createdHandles: string[] = [];
      let templateName = 'Sample Geometry';

      if (lower.includes('house') || lower.includes('room') || lower.includes('floor')) {
        templateName = 'Floor Plan Draft';
        createdHandles = cadEngine.drawBatch([
          { type: 'layer', name: 'WALLS', color: 'red' },
          { type: 'rectangle', x: 0, y: 0, width: 120, height: 80 },
          { type: 'line', x1: 50, y1: 0, x2: 50, y2: 80 },
          { type: 'layer', name: 'DOORS', color: 'cyan' },
          { type: 'arc', x: 50, y: 20, radius: 10, start_angle: 0, end_angle: 90 },
          { type: 'layer', name: 'TEXT', color: 'yellow' },
          { type: 'text', text: 'LIVING ROOM', x: 10, y: 40, height: 4 },
          { type: 'text', text: 'BEDROOM', x: 60, y: 40, height: 4 },
        ]);
      } else if (lower.includes('gear') || lower.includes('mechanical')) {
        templateName = 'Mechanical Gear Part';
        createdHandles = cadEngine.drawBatch([
          { type: 'layer', name: 'MECHANICAL', color: 'blue' },
          { type: 'circle', x: 60, y: 60, radius: 40 },
          { type: 'circle', x: 60, y: 60, radius: 25 },
          { type: 'circle', x: 60, y: 60, radius: 10 },
          { type: 'line', x1: 15, y1: 60, x2: 105, y2: 60 },
          { type: 'line', x1: 60, y1: 15, x2: 60, y2: 105 },
          { type: 'text', text: 'GEAR DIA 80mm', x: 30, y: 110, height: 4 },
        ]);
      } else {
        templateName = 'Geometric CAD Layout';
        createdHandles = cadEngine.drawBatch([
          { type: 'layer', name: 'GEOMETRY', color: 'green' },
          { type: 'rectangle', x: 10, y: 10, width: 80, height: 50 },
          { type: 'circle', x: 50, y: 35, radius: 15 },
          { type: 'text', text: prompt.toUpperCase().slice(0, 20), x: 15, y: 65, height: 3.5 },
        ]);
      }

      return res.json({
        summary: `Created ${templateName} with ${createdHandles.length} CAD entities. (Configure GEMINI_API_KEY for dynamic AI generation)`,
        handles: createdHandles,
        state: {
          entities: cadEngine.entities,
          layers: cadEngine.layers,
          drawingInfo: cadEngine.getDrawingInfo(),
          auditLogs: cadEngine.auditLogs.slice(0, 50),
        },
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are an expert AutoCAD drafting AI. Translate the user's drafting request into an array of 2D CAD operations for draw_batch.
User request: "${prompt}"

Current drawing layers: ${cadEngine.layers.map((l) => l.name).join(', ')}.
Units: ${cadEngine.units}.

Coordinates are drawing units. Z is always 0.
Supported operation types:
- {"type": "layer", "name": "...", "color": "red"|"yellow"|"green"|"cyan"|"blue"|"magenta"|"white"}
- {"type": "line", "x1": num, "y1": num, "x2": num, "y2": num}
- {"type": "polyline", "points": [[x, y], ...], "closed": boolean}
- {"type": "rectangle", "x": num, "y": num, "width": num, "height": num}
- {"type": "circle", "x": num, "y": num, "radius": num}
- {"type": "arc", "x": num, "y": num, "radius": num, "start_angle": deg, "end_angle": deg}
- {"type": "point", "x": num, "y": num}
- {"type": "text", "text": "...", "x": num, "y": num, "height": num, "rotation": deg}

Output MUST be a JSON object with this exact shape:
{
  "summary": "Brief 1-sentence description of what was drawn",
  "operations": [ ...list of operations... ]
}
Do not enclose in markdown blocks other than pure json if needed.`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      const ops = parsed.operations || [];
      const handles = cadEngine.drawBatch(ops);

      res.json({
        summary: parsed.summary || `Drew ${handles.length} CAD elements.`,
        handles,
        state: {
          entities: cadEngine.entities,
          layers: cadEngine.layers,
          drawingInfo: cadEngine.getDrawingInfo(),
          auditLogs: cadEngine.auditLogs.slice(0, 50),
        },
      });
    } catch (err: any) {
      console.error('AI draw error:', err);
      res.status(500).json({ error: `AI Drawing failed: ${err.message}` });
    }
  });

  // --- Vite dev or static production files ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`AutoCAD 2007 AI server running on http://${HOST}:${PORT}`);
    console.log(`MCP Endpoint: http://${HOST}:${PORT}${MCP_PATH}`);
    console.log(`Health Check: http://${HOST}:${PORT}/${SECRET_PATH}/health`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
