import React, { useState } from 'react';
import { Sparkles, X, ArrowRight, Loader2 } from 'lucide-react';

interface AiDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPrompt: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

const PRESETS = [
  'Draw a 3-room modern apartment floor plan with walls and labels',
  'Mechanical flange with central hole, bolt pitch circle and 6 bolt holes',
  'A standard office desk with computer monitor and chair layout',
  'Electrical circuit diagram with switches and resistors',
  'Precision spur gear with central bore and keyway',
];

export const AiDrawModal: React.FC<AiDrawModalProps> = ({
  isOpen,
  onClose,
  onSubmitPrompt,
  isLoading,
}) => {
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmitPrompt(prompt.trim());
  };

  const handleSelectPreset = (p: string) => {
    setPrompt(p);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1e23] border border-neutral-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden text-neutral-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#17181c] border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-400" />
            <span className="font-semibold text-sm text-neutral-100">AI CAD Drafting Assistant</span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-xs text-neutral-400 leading-relaxed">
            Describe the CAD geometry, floor plan, or mechanical part you want to draft. The AI model will translate your request into AutoCAD operations.
          </p>

          <textarea
            id="ai-draw-prompt-textarea"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Draw a 120x80 floor plan with two offices, a conference room, and text labels..."
            className="w-full bg-[#121316] border border-neutral-700/80 rounded-lg p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none font-sans"
            autoFocus
          />

          {/* Prompt Presets */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-medium text-neutral-400">Sample CAD Prompts:</div>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="text-[11px] bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 px-2.5 py-1 rounded-full border border-neutral-700/60 transition text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-ai-draw-btn"
              disabled={isLoading || !prompt.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-xs font-medium transition shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Drafting Geometry...</span>
                </>
              ) : (
                <>
                  <span>Generate Geometry</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
