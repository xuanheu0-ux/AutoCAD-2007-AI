import React, { useState, useEffect, useCallback } from 'react';
import { CadEntity, CadLayer, DrawingInfo, ToolCallLog, SmokeTestStepResult } from './types.js';
import { CadCanvas } from './components/CadCanvas.js';
import { CadToolbar } from './components/CadToolbar.js';
import { CadCommandLine } from './components/CadCommandLine.js';
import { McpStatusPanel } from './components/McpStatusPanel.js';
import { EntityInspector } from './components/EntityInspector.js';
import { AiDrawModal } from './components/AiDrawModal.js';
import { SmokeTestModal } from './components/SmokeTestModal.js';
import { CaptureModal } from './components/CaptureModal.js';

export function App() {
  const [entities, setEntities] = useState<CadEntity[]>([]);
  const [layers, setLayers] = useState<CadLayer[]>([
    { name: '0', color: 'white', colorIndex: 7, on: true, current: true },
  ]);
  const [drawingInfo, setDrawingInfo] = useState<DrawingInfo>({
    drawing: 'Drawing1.dwg',
    path: '',
    units: 'millimetres',
    entities_in_model_space: 0,
    current_layer: '0',
    layers: ['0 (colour 7, current)'],
    unsaved_changes: false,
  });
  const [currentLayer, setCurrentLayer] = useState<string>('0');
  const [selectedHandle, setSelectedHandle] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<ToolCallLog[]>([]);
  const [commandLogs, setCommandLogs] = useState<string[]>([
    'AutoCAD 2027 (R26.0) Initialized.',
    'Model space ready. Coordinates: mm (origin 0,0).',
    'MCP Server listening for external AI clients and drafting requests.',
  ]);
  const [secretPath, setSecretPath] = useState<string>('');
  const [mcpPath, setMcpPath] = useState<string>('/mcp');
  const [tools, setTools] = useState<{ name: string; description: string }[]>([]);

  // UI Modals & Panels
  const [showMcpPanel, setShowMcpPanel] = useState<boolean>(false);
  const [showInspector, setShowInspector] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [showSmokeModal, setShowSmokeModal] = useState<boolean>(false);
  const [showCaptureModal, setShowCaptureModal] = useState<boolean>(false);
  const [capturedSvg, setCapturedSvg] = useState<string>('');

  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [smokeTestRunning, setSmokeTestRunning] = useState<boolean>(false);
  const [smokeTestSteps, setSmokeTestSteps] = useState<SmokeTestStepResult[]>([]);
  const [isTextRotated180, setIsTextRotated180] = useState<boolean>(false);

  // Fetch CAD state from server
  const refreshState = useCallback(async () => {
    try {
      const res = await fetch('/api/cad/state');
      if (res.ok) {
        const data = await res.json();
        setEntities(data.entities || []);
        setLayers(data.layers || []);
        if (data.drawingInfo) {
          setDrawingInfo(data.drawingInfo);
          setCurrentLayer(data.drawingInfo.current_layer || '0');
        }
        if (data.auditLogs) setAuditLogs(data.auditLogs);
        if (data.secretPath) setSecretPath(data.secretPath);
        if (data.mcpPath) setMcpPath(data.mcpPath);
        if (data.tools) setTools(data.tools);
      }
    } catch (err) {
      console.error('Failed to fetch CAD state:', err);
    }
  }, []);

  useEffect(() => {
    refreshState();
    // Periodic refresh to sync external MCP client activity (ChatGPT, Claude, etc.)
    const interval = setInterval(refreshState, 3500);
    return () => clearInterval(interval);
  }, [refreshState]);

  // Execute AutoCAD Command (LISP or command line)
  const handleExecuteCommand = async (cmd: string) => {
    setCommandLogs((prev) => [...prev, `Command: ${cmd}`]);
    try {
      const res = await fetch('/api/cad/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCommandLogs((prev) => [...prev, `Error: ${data.error || 'Command failed'}`]);
      } else {
        setCommandLogs((prev) => [...prev, data.output]);
        if (data.state) {
          setEntities(data.state.entities || []);
          setLayers(data.state.layers || []);
          if (data.state.drawingInfo) setDrawingInfo(data.state.drawingInfo);
          if (data.state.auditLogs) setAuditLogs(data.state.auditLogs);
        }
      }
    } catch (err: any) {
      setCommandLogs((prev) => [...prev, `Error: ${err.message}`]);
    }
  };

  // Run Smoke Test (test_draw.py suite)
  const handleRunSmokeTest = async () => {
    setSmokeTestRunning(true);
    setShowSmokeModal(true);
    setCommandLogs((prev) => [...prev, 'Running AutoCAD Smoke Test suite (test_draw.py)...']);
    try {
      const res = await fetch('/api/cad/smoke-test', {
        method: 'POST',
      });
      const data = await res.json();
      setSmokeTestSteps(data.steps || []);
      if (data.state) {
        setEntities(data.state.entities || []);
        setLayers(data.state.layers || []);
        if (data.state.drawingInfo) setDrawingInfo(data.state.drawingInfo);
        if (data.state.auditLogs) setAuditLogs(data.state.auditLogs);
      }
      setCommandLogs((prev) => [
        ...prev,
        `Smoke test completed: ${data.steps?.length || 0} steps executed successfully.`,
      ]);
    } catch (err: any) {
      setCommandLogs((prev) => [...prev, `Smoke test error: ${err.message}`]);
    } finally {
      setSmokeTestRunning(false);
    }
  };

  // Quick Draw action helpers
  const handleQuickDraw = async (type: string) => {
    let toolName = '';
    let toolArgs: Record<string, any> = {};

    switch (type) {
      case 'line':
        toolName = 'draw_line';
        toolArgs = {
          x1: 0,
          y1: 0,
          x2: Math.floor(Math.random() * 80 + 20),
          y2: Math.floor(Math.random() * 80 + 20),
        };
        break;
      case 'rectangle':
        toolName = 'draw_rectangle';
        toolArgs = {
          x: Math.floor(Math.random() * 40),
          y: Math.floor(Math.random() * 40),
          width: 80,
          height: 50,
        };
        break;
      case 'circle':
        toolName = 'draw_circle';
        toolArgs = {
          x: Math.floor(Math.random() * 60 + 20),
          y: Math.floor(Math.random() * 60 + 20),
          radius: 25,
        };
        break;
      case 'text':
        toolName = 'draw_text';
        toolArgs = {
          text: 'LABEL ' + Math.floor(Math.random() * 100),
          x: Math.floor(Math.random() * 60 + 10),
          y: Math.floor(Math.random() * 60 + 10),
          height: 4.5,
        };
        break;
      case 'dimension':
        toolName = 'dim_linear';
        toolArgs = {
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 0,
          text_x: 50,
          text_y: -15,
          vertical: false,
        };
        break;
    }

    try {
      const res = await fetch('/api/cad/tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: toolName, args: toolArgs }),
      });
      const data = await res.json();
      const txt = data.result?.content?.[0]?.text || 'Done';
      setCommandLogs((prev) => [...prev, txt]);
      if (data.state) {
        setEntities(data.state.entities || []);
        setLayers(data.state.layers || []);
        if (data.state.drawingInfo) setDrawingInfo(data.state.drawingInfo);
        if (data.state.auditLogs) setAuditLogs(data.state.auditLogs);
      }
    } catch (err: any) {
      setCommandLogs((prev) => [...prev, `Tool error: ${err.message}`]);
    }
  };

  // Submit AI Prompt (Gemini API)
  const handleSubmitAiPrompt = async (prompt: string) => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/cad/ai-draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCommandLogs((prev) => [...prev, `AI Error: ${data.error || 'Generation failed'}`]);
      } else {
        setCommandLogs((prev) => [...prev, `AI: ${data.summary}`]);
        if (data.state) {
          setEntities(data.state.entities || []);
          setLayers(data.state.layers || []);
          if (data.state.drawingInfo) setDrawingInfo(data.state.drawingInfo);
          if (data.state.auditLogs) setAuditLogs(data.state.auditLogs);
        }
        setShowAiModal(false);
      }
    } catch (err: any) {
      setCommandLogs((prev) => [...prev, `AI request error: ${err.message}`]);
    } finally {
      setAiLoading(false);
    }
  };

  // Capture View Snapshot
  const handleCaptureView = async () => {
    try {
      const res = await fetch('/api/cad/export/svg');
      const svg = await res.text();
      setCapturedSvg(svg);
      setShowCaptureModal(true);
      setCommandLogs((prev) => [...prev, 'View captured successfully.']);
    } catch (err: any) {
      setCommandLogs((prev) => [...prev, `Capture error: ${err.message}`]);
    }
  };

  // New Drawing
  const handleNewDrawing = async () => {
    if (confirm('Start a fresh drawing? Current unsaved entities will be cleared.')) {
      try {
        const res = await fetch('/api/cad/clear', { method: 'POST' });
        const data = await res.json();
        setEntities([]);
        setSelectedHandle(null);
        if (data.drawingInfo) setDrawingInfo(data.drawingInfo);
        setCommandLogs((prev) => [...prev, 'New drawing started. Model space cleared.']);
      } catch (err: any) {
        console.error('Clear error:', err);
      }
    }
  };

  // Load 4-leaf aluminum gate drawing
  const handleLoadGateDrawing = async () => {
    setCommandLogs((prev) => [...prev, 'Loading: Bản vẽ Cổng chính khung nhôm hộp 4 cánh pano nhôm tấm (4000x3400mm)...']);
    try {
      const res = await fetch('/api/cad/gate-drawing', { method: 'POST' });
      const data = await res.json();
      if (data.state) {
        setEntities(data.state.entities || []);
        setLayers(data.state.layers || []);
        if (data.state.drawingInfo) setDrawingInfo(data.state.drawingInfo);
        if (data.state.auditLogs) setAuditLogs(data.state.auditLogs);
      }
      setSelectedHandle(null);
      setCommandLogs((prev) => [...prev, data.summary || 'Gate drawing loaded successfully.']);
    } catch (err: any) {
      console.error('Gate load error:', err);
    }
  };

  // Load 2-leaf electrical control room door drawing
  const handleLoadDoorDrawing = async () => {
    setCommandLogs((prev) => [...prev, 'Loading: Bản vẽ Cửa đi lại nhà vận hành bảng điện 2 cánh mở trong (1700x2500mm)...']);
    try {
      const res = await fetch('/api/cad/door-drawing', { method: 'POST' });
      const data = await res.json();
      if (data.state) {
        setEntities(data.state.entities || []);
        setLayers(data.state.layers || []);
        if (data.state.drawingInfo) setDrawingInfo(data.state.drawingInfo);
        if (data.state.auditLogs) setAuditLogs(data.state.auditLogs);
      }
      setSelectedHandle(null);
      setIsTextRotated180(false);
      setCommandLogs((prev) => [...prev, data.summary || 'Door drawing loaded successfully.']);
    } catch (err: any) {
      console.error('Door load error:', err);
    }
  };

  // Load wiring diagram + cost estimate sheet
  const handleLoadWiringDrawing = async () => {
    setCommandLogs((prev) => [
      ...prev,
      'Loading: Sơ đồ đi dây & Dự toán công trình (sơ đồ 1 tuyến + mặt bằng đi dây + bảng dự toán tóm tắt)...',
    ]);
    try {
      const res = await fetch('/api/cad/wiring-drawing', { method: 'POST' });
      const data = await res.json();
      if (data.state) {
        setEntities(data.state.entities || []);
        setLayers(data.state.layers || []);
        if (data.state.drawingInfo) setDrawingInfo(data.state.drawingInfo);
        if (data.state.auditLogs) setAuditLogs(data.state.auditLogs);
      }
      setSelectedHandle(null);
      setIsTextRotated180(false);
      setCommandLogs((prev) => [...prev, data.summary || 'Wiring diagram & estimate loaded successfully.']);
    } catch (err: any) {
      console.error('Wiring load error:', err);
      setCommandLogs((prev) => [...prev, `Wiring load error: ${err.message}`]);
    }
  };

  // Rotate text and dimension numbers 180 degrees
  const handleRotateText = async () => {
    try {
      const angle = 180;
      const res = await fetch('/api/cad/rotate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ angle }),
      });
      const data = await res.json();
      if (data.state) {
        setEntities(data.state.entities || []);
        if (data.state.auditLogs) setAuditLogs(data.state.auditLogs);
      }
      setIsTextRotated180((prev) => !prev);
      setCommandLogs((prev) => [
        ...prev,
        data.summary || `Đã chỉnh lại chữ và số đo quay ${angle}°.`,
      ]);
    } catch (err: any) {
      console.error('Rotate text error:', err);
    }
  };

  // Layer Operations
  const handleSelectLayer = async (name: string) => {
    try {
      const res = await fetch('/api/cad/tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'set_current_layer', args: { name } }),
      });
      const data = await res.json();
      setCurrentLayer(name);
      setCommandLogs((prev) => [...prev, `Current layer is now '${name}'.`]);
      if (data.state) setLayers(data.state.layers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLayer = async (name: string, color: string) => {
    try {
      const res = await fetch('/api/cad/tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'create_layer', args: { name, color, make_current: true } }),
      });
      const data = await res.json();
      setCurrentLayer(name);
      setCommandLogs((prev) => [...prev, `Layer '${name}' created in ${color} and made current.`]);
      if (data.state) {
        setLayers(data.state.layers || []);
        if (data.state.drawingInfo) setDrawingInfo(data.state.drawingInfo);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEraseEntity = async (handle: string) => {
    try {
      const res = await fetch('/api/cad/tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'erase_entity', args: { handle } }),
      });
      const data = await res.json();
      setSelectedHandle(null);
      setCommandLogs((prev) => [...prev, `Erased entity ${handle}.`]);
      if (data.state) {
        setEntities(data.state.entities || []);
        if (data.state.drawingInfo) setDrawingInfo(data.state.drawingInfo);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectedEntity = entities.find((e) => e.handle === selectedHandle) || null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#181a1e] text-neutral-200 overflow-hidden font-sans">
      {/* Top Application Ribbon */}
      <CadToolbar
        drawingName={drawingInfo.drawing}
        units={drawingInfo.units}
        layers={layers}
        currentLayer={currentLayer}
        onSelectLayer={handleSelectLayer}
        onRunSmokeTest={handleRunSmokeTest}
        onOpenAiDraw={() => setShowAiModal(true)}
        onLoadGateDrawing={handleLoadGateDrawing}
        onLoadDoorDrawing={handleLoadDoorDrawing}
        onLoadWiringDrawing={handleLoadWiringDrawing}
        onRotateText={handleRotateText}
        isTextRotated180={isTextRotated180}
        onNewDrawing={handleNewDrawing}
        onCaptureView={handleCaptureView}
        onQuickDraw={handleQuickDraw}
        onExportDxf={() => window.open('/api/cad/export/dxf', '_blank')}
        onExportSvg={() => window.open('/api/cad/export/svg', '_blank')}
        onDownloadEstimate={() => window.open('/api/estimate/export', '_blank')}
        onToggleMcpPanel={() => setShowMcpPanel(!showMcpPanel)}
        showMcpPanel={showMcpPanel}
        smokeTestRunning={smokeTestRunning}
      />

      {/* Main Workspace: Center Viewport + Collapsible Panels */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* CAD Graphics Canvas */}
        <div className="flex-1 h-full relative">
          <CadCanvas
            entities={entities}
            layers={layers}
            selectedHandle={selectedHandle}
            onSelectEntity={(h) => {
              setSelectedHandle(h);
              if (h) setShowInspector(true);
            }}
          />
        </div>

        {/* Entity Inspector & Layers (Right Panel 1) */}
        {showInspector && (
          <EntityInspector
            selectedEntity={selectedEntity}
            layers={layers}
            currentLayer={currentLayer}
            onSelectLayer={handleSelectLayer}
            onCreateLayer={handleCreateLayer}
            onEraseEntity={handleEraseEntity}
            onClose={() => setShowInspector(false)}
          />
        )}

        {/* MCP Server & Connection Info (Right Panel 2) */}
        {showMcpPanel && (
          <McpStatusPanel
            secretPath={secretPath}
            mcpPath={mcpPath}
            auditLogs={auditLogs}
            onClose={() => setShowMcpPanel(false)}
            tools={tools}
          />
        )}
      </div>

      {/* AutoCAD Classic Command Window (Bottom) */}
      <CadCommandLine
        onExecuteCommand={handleExecuteCommand}
        logs={commandLogs}
      />

      {/* Modals */}
      <AiDrawModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onSubmitPrompt={handleSubmitAiPrompt}
        isLoading={aiLoading}
      />

      <SmokeTestModal
        isOpen={showSmokeModal}
        onClose={() => setShowSmokeModal(false)}
        steps={smokeTestSteps}
        isRunning={smokeTestRunning}
        onReRun={handleRunSmokeTest}
      />

      <CaptureModal
        isOpen={showCaptureModal}
        onClose={() => setShowCaptureModal(false)}
        svgContent={capturedSvg}
      />
    </div>
  );
}

export default App;
