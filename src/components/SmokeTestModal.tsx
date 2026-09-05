import React from 'react';
import { SmokeTestStepResult } from '../types.js';
import { CheckCircle2, XCircle, Play, X } from 'lucide-react';

interface SmokeTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: SmokeTestStepResult[];
  isRunning: boolean;
  onReRun: () => void;
}

export const SmokeTestModal: React.FC<SmokeTestModalProps> = ({
  isOpen,
  onClose,
  steps,
  isRunning,
  onReRun,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1e23] border border-neutral-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden text-neutral-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#16171b] border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Play size={15} className="text-emerald-400" />
            <span className="font-semibold text-sm text-neutral-100">
              AutoCAD Smoke Test Suite (test_draw.py)
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
          <div className="text-[11px] text-neutral-400 mb-3 font-sans">
            Executes the complete 11-step diagnostic suite validating the AutoCAD COM bridge and MCP drafting primitives.
          </div>

          {steps.map((step) => (
            <div
              key={step.step}
              className="flex items-start gap-2.5 bg-neutral-900/80 border border-neutral-800 rounded p-2.5"
            >
              <div className="mt-0.5">
                {step.status === 'ok' ? (
                  <CheckCircle2 size={15} className="text-emerald-400" />
                ) : (
                  <XCircle size={15} className="text-red-400" />
                )}
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-200">
                    Step {step.step}: {step.label}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-sans uppercase font-bold ${
                      step.status === 'ok'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        : 'bg-red-950 text-red-300 border border-red-800/60'
                    }`}
                  >
                    {step.status}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 break-all">{step.result}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#16171b] border-t border-neutral-800">
          <div className="text-xs text-neutral-400">
            {steps.filter((s) => s.status === 'ok').length} / {steps.length} steps passed
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onReRun}
              disabled={isRunning}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-medium transition disabled:opacity-50"
            >
              {isRunning ? 'Running...' : 'Re-run Test Suite'}
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
