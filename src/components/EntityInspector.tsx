import React, { useState } from 'react';
import { CadEntity, CadLayer } from '../types.js';
import { colorIndexToHex } from '../cadEngine.js';
import { Trash2, Info, Layers, Plus, Check } from 'lucide-react';

interface EntityInspectorProps {
  selectedEntity: CadEntity | null;
  layers: CadLayer[];
  currentLayer: string;
  onSelectLayer: (name: string) => void;
  onCreateLayer: (name: string, color: string) => void;
  onEraseEntity: (handle: string) => void;
  onClose: () => void;
}

export const EntityInspector: React.FC<EntityInspectorProps> = ({
  selectedEntity,
  layers,
  currentLayer,
  onSelectLayer,
  onCreateLayer,
  onEraseEntity,
  onClose,
}) => {
  const [newLayerName, setNewLayerName] = useState('');
  const [newLayerColor, setNewLayerColor] = useState('cyan');
  const [showAddLayer, setShowAddLayer] = useState(false);

  const handleAddLayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLayerName.trim()) return;
    onCreateLayer(newLayerName.trim(), newLayerColor);
    setNewLayerName('');
    setShowAddLayer(false);
  };

  return (
    <div className="w-80 bg-[#1a1c20] border-l border-neutral-700/80 flex flex-col h-full z-10 text-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#17181c] border-b border-neutral-800 text-xs">
        <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
          <Info size={13} className="text-cyan-400" />
          Properties & Layers
        </span>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-200 px-1 py-0.5 rounded hover:bg-neutral-800"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
        {/* Selected Entity Section */}
        {selectedEntity ? (
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-200 text-sm">
                {selectedEntity.type.replace('AcDb', '')}
              </span>
              <span className="font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/60 text-[11px]">
                Handle: {selectedEntity.handle}
              </span>
            </div>

            <div className="space-y-1.5 text-neutral-400 font-mono text-[11px]">
              <div className="flex justify-between border-b border-neutral-800/60 pb-1">
                <span>Layer:</span>
                <span className="text-neutral-200">{selectedEntity.layer}</span>
              </div>

              {selectedEntity.radius !== undefined && (
                <div className="flex justify-between border-b border-neutral-800/60 pb-1">
                  <span>Radius:</span>
                  <span className="text-neutral-200">{selectedEntity.radius.toFixed(2)} mm</span>
                </div>
              )}

              {selectedEntity.x1 !== undefined && selectedEntity.x2 !== undefined && (
                <div className="flex justify-between border-b border-neutral-800/60 pb-1">
                  <span>Start / End:</span>
                  <span className="text-neutral-200">
                    ({selectedEntity.x1.toFixed(1)}, {selectedEntity.y1?.toFixed(1)}) → (
                    {selectedEntity.x2.toFixed(1)}, {selectedEntity.y2?.toFixed(1)})
                  </span>
                </div>
              )}

              {selectedEntity.points && (
                <div className="flex justify-between border-b border-neutral-800/60 pb-1">
                  <span>Vertices:</span>
                  <span className="text-neutral-200">
                    {selectedEntity.points.length} points ({selectedEntity.closed ? 'closed' : 'open'})
                  </span>
                </div>
              )}

              {selectedEntity.text && (
                <div className="flex justify-between border-b border-neutral-800/60 pb-1">
                  <span>Text:</span>
                  <span className="text-neutral-200 truncate max-w-[150px]">{selectedEntity.text}</span>
                </div>
              )}

              {selectedEntity.measured_value !== undefined && (
                <div className="flex justify-between border-b border-neutral-800/60 pb-1">
                  <span>Dimension:</span>
                  <span className="text-cyan-400 font-bold">{selectedEntity.measured_value.toFixed(2)}</span>
                </div>
              )}
            </div>

            <button
              id="erase-selected-entity-btn"
              onClick={() => onEraseEntity(selectedEntity.handle)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800/80 rounded transition text-xs font-medium"
            >
              <Trash2 size={13} />
              <span>Erase Entity</span>
            </button>
          </div>
        ) : (
          <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-lg p-3 text-neutral-500 text-center italic text-[11px]">
            No entity selected. Click any entity on the canvas to inspect its parameters.
          </div>
        )}

        {/* Layers Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <Layers size={13} className="text-cyan-400" />
              Drawing Layers ({layers.length})
            </span>
            <button
              id="show-add-layer-btn"
              onClick={() => setShowAddLayer(!showAddLayer)}
              className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition"
              title="Add New Layer"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Add Layer Form */}
          {showAddLayer && (
            <form
              onSubmit={handleAddLayerSubmit}
              className="bg-neutral-900 border border-neutral-700/80 rounded-lg p-2.5 space-y-2"
            >
              <div className="text-[11px] font-medium text-neutral-300">Create New Layer</div>
              <input
                id="new-layer-name-input"
                type="text"
                value={newLayerName}
                onChange={(e) => setNewLayerName(e.target.value)}
                placeholder="Layer name (e.g. WALLS)"
                className="w-full bg-black/50 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-100 outline-none"
              />
              <div className="flex items-center gap-2">
                <select
                  id="new-layer-color-select"
                  value={newLayerColor}
                  onChange={(e) => setNewLayerColor(e.target.value)}
                  className="bg-black/50 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-100 outline-none flex-1"
                >
                  <option value="red">Red</option>
                  <option value="yellow">Yellow</option>
                  <option value="green">Green</option>
                  <option value="cyan">Cyan</option>
                  <option value="blue">Blue</option>
                  <option value="magenta">Magenta</option>
                  <option value="white">White</option>
                  <option value="grey">Grey</option>
                </select>
                <button
                  type="submit"
                  id="create-layer-submit-btn"
                  className="px-2.5 py-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-xs transition"
                >
                  Add
                </button>
              </div>
            </form>
          )}

          {/* Layers List */}
          <div className="space-y-1">
            {layers.map((layer) => {
              const isCurrent = layer.name === currentLayer;
              return (
                <div
                  key={layer.name}
                  onClick={() => onSelectLayer(layer.name)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition border text-xs ${
                    isCurrent
                      ? 'bg-neutral-800 border-cyan-500/50 text-neutral-100'
                      : 'bg-neutral-900/40 border-neutral-800/80 text-neutral-400 hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/40"
                      style={{ backgroundColor: colorIndexToHex(layer.colorIndex) }}
                    />
                    <span className="font-mono">{layer.name}</span>
                  </div>
                  {isCurrent && <span className="text-[10px] text-cyan-400 font-sans">Current</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
