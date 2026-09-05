import React, { useState } from 'react';
import { CadLayer } from '../types.js';
import { colorIndexToHex } from '../cadEngine.js';
import {
  Layers,
  Sparkles,
  Play,
  Download,
  FilePlus,
  Camera,
  Server,
  Terminal,
  Square,
  Circle,
  Type,
  Maximize,
  HelpCircle,
  Columns3,
} from 'lucide-react';

interface CadToolbarProps {
  drawingName: string;
  units: string;
  layers: CadLayer[];
  currentLayer: string;
  onSelectLayer: (name: string) => void;
  onRunSmokeTest: () => void;
  onOpenAiDraw: () => void;
  onLoadGateDrawing?: () => void;
  onNewDrawing: () => void;
  onCaptureView: () => void;
  onQuickDraw: (type: string) => void;
  onExportDxf: () => void;
  onExportSvg: () => void;
  onToggleMcpPanel: () => void;
  showMcpPanel: boolean;
  smokeTestRunning: boolean;
}

export const CadToolbar: React.FC<CadToolbarProps> = ({
  drawingName,
  units,
  layers,
  currentLayer,
  onSelectLayer,
  onRunSmokeTest,
  onOpenAiDraw,
  onLoadGateDrawing,
  onNewDrawing,
  onCaptureView,
  onQuickDraw,
  onExportDxf,
  onExportSvg,
  onToggleMcpPanel,
  showMcpPanel,
  smokeTestRunning,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const activeLayerObj = layers.find((l) => l.name === currentLayer) || layers[0];

  return (
    <header className="bg-[#1e2024] border-b border-neutral-700/80 text-neutral-200 select-none">
      {/* Top Title & Metadata Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-neutral-800/80 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded bg-red-600 flex items-center justify-center font-bold text-[11px] text-white shadow-sm">
            A
          </div>
          <span className="font-semibold text-neutral-100 tracking-wide text-[13px]">
            AutoCAD 2007 AI
          </span>
          <span className="text-neutral-500">|</span>
          <span className="text-neutral-300 font-mono bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-700/50">
            {drawingName}
          </span>
          <span className="text-[11px] text-neutral-400 font-mono">({units})</span>
        </div>

        <div className="flex items-center gap-2">
          {/* MCP Server connection badge */}
          <button
            id="mcp-status-toggle-btn"
            onClick={onToggleMcpPanel}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition border ${
              showMcpPanel
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-750'
            }`}
          >
            <Server size={13} className="text-cyan-400" />
            <span>MCP Server Active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
          </button>
        </div>
      </div>

      {/* Main Tool Palette / Action Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 gap-2 overflow-x-auto">
        {/* Left: Quick Draw Actions */}
        <div className="flex items-center gap-1">
          {/* Layer Selector */}
          <div className="flex items-center gap-1.5 bg-neutral-800/90 border border-neutral-700/80 rounded px-2 py-1 text-xs mr-2">
            <Layers size={14} className="text-neutral-400" />
            <span
              className="w-2.5 h-2.5 rounded-full border border-black/40 inline-block"
              style={{ backgroundColor: colorIndexToHex(activeLayerObj?.colorIndex) }}
            />
            <select
              id="layer-select"
              value={currentLayer}
              onChange={(e) => onSelectLayer(e.target.value)}
              className="bg-transparent text-xs text-neutral-200 outline-none cursor-pointer"
            >
              {layers.map((l) => (
                <option key={l.name} value={l.name} className="bg-neutral-900 text-neutral-200">
                  {l.name} ({l.color})
                </option>
              ))}
            </select>
          </div>

          <div className="h-5 w-[1px] bg-neutral-700 mx-1" />

          {/* Quick Shape Buttons */}
          <button
            id="quick-line-btn"
            onClick={() => onQuickDraw('line')}
            title="Draw Line"
            className="flex items-center gap-1 px-2 py-1 bg-neutral-800/80 hover:bg-neutral-700 rounded text-xs text-neutral-300 hover:text-white border border-neutral-700/50 transition"
          >
            <span className="font-mono text-[11px] font-bold">/</span> Line
          </button>
          <button
            id="quick-rect-btn"
            onClick={() => onQuickDraw('rectangle')}
            title="Draw Rectangle"
            className="flex items-center gap-1 px-2 py-1 bg-neutral-800/80 hover:bg-neutral-700 rounded text-xs text-neutral-300 hover:text-white border border-neutral-700/50 transition"
          >
            <Square size={13} /> Rect
          </button>
          <button
            id="quick-circle-btn"
            onClick={() => onQuickDraw('circle')}
            title="Draw Circle"
            className="flex items-center gap-1 px-2 py-1 bg-neutral-800/80 hover:bg-neutral-700 rounded text-xs text-neutral-300 hover:text-white border border-neutral-700/50 transition"
          >
            <Circle size={13} /> Circle
          </button>
          <button
            id="quick-text-btn"
            onClick={() => onQuickDraw('text')}
            title="Add Text Label"
            className="flex items-center gap-1 px-2 py-1 bg-neutral-800/80 hover:bg-neutral-700 rounded text-xs text-neutral-300 hover:text-white border border-neutral-700/50 transition"
          >
            <Type size={13} /> Text
          </button>
          <button
            id="quick-dim-btn"
            onClick={() => onQuickDraw('dimension')}
            title="Add Linear Dimension"
            className="flex items-center gap-1 px-2 py-1 bg-neutral-800/80 hover:bg-neutral-700 rounded text-xs text-neutral-300 hover:text-white border border-neutral-700/50 transition"
          >
            <Maximize size={13} /> Dim
          </button>
        </div>

        {/* Right: Key Operations (Smoke Test, AI Draw, Export, New) */}
        <div className="flex items-center gap-2">
          {/* Run Smoke Test Button */}
          <button
            id="run-smoke-test-btn"
            onClick={onRunSmokeTest}
            disabled={smokeTestRunning}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium border shadow-sm transition ${
              smokeTestRunning
                ? 'bg-amber-900/60 text-amber-200 border-amber-600 animate-pulse cursor-wait'
                : 'bg-emerald-700/80 hover:bg-emerald-600 text-white border-emerald-500'
            }`}
          >
            <Play size={13} fill="currentColor" />
            <span>{smokeTestRunning ? 'Testing...' : 'Run Smoke Test (test_draw.py)'}</span>
          </button>

          {/* Cổng 4 cánh button */}
          {onLoadGateDrawing && (
            <button
              id="load-gate-drawing-btn"
              onClick={onLoadGateDrawing}
              title="Tải bản vẽ kỹ thuật Cổng chính nhôm hộp 4 cánh pano nhôm tấm (4000x3400mm, mở ngoài)"
              className="flex items-center gap-1.5 px-3 py-1 bg-cyan-800 hover:bg-cyan-700 text-cyan-100 hover:text-white rounded text-xs font-medium border border-cyan-600 shadow-sm transition"
            >
              <Columns3 size={13} className="text-cyan-300" />
              <span>Cổng 4 cánh (4x3.4m)</span>
            </button>
          )}

          {/* AI Assistant Button */}
          <button
            id="ai-draw-btn"
            onClick={onOpenAiDraw}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium border border-indigo-400 shadow-sm transition"
          >
            <Sparkles size={13} className="text-yellow-300" />
            <span>Draw with AI</span>
          </button>

          {/* Capture View Button */}
          <button
            id="capture-view-btn"
            onClick={onCaptureView}
            title="Render View Snapshot"
            className="flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded text-xs border border-neutral-700 transition"
          >
            <Camera size={13} />
            <span>Capture</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              id="export-dropdown-btn"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded text-xs border border-neutral-700 transition"
            >
              <Download size={13} />
              <span>Export</span>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-[#25282d] border border-neutral-700 rounded-md shadow-xl py-1 z-30">
                <button
                  id="export-dxf-btn"
                  onClick={() => {
                    setShowExportMenu(false);
                    onExportDxf();
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-700 transition"
                >
                  Download .DXF
                </button>
                <button
                  id="export-svg-btn"
                  onClick={() => {
                    setShowExportMenu(false);
                    onExportSvg();
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-700 transition"
                >
                  Download .SVG
                </button>
              </div>
            )}
          </div>

          {/* New / Clear Button */}
          <button
            id="new-drawing-btn"
            onClick={onNewDrawing}
            title="Start New Drawing"
            className="flex items-center gap-1 px-2 py-1 bg-neutral-800 hover:bg-red-950/70 text-neutral-400 hover:text-red-300 rounded text-xs border border-neutral-700 hover:border-red-800/80 transition"
          >
            <FilePlus size={13} />
            <span>New</span>
          </button>
        </div>
      </div>
    </header>
  );
};
