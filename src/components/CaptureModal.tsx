import React from 'react';
import { Camera, Download, X } from 'lucide-react';

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  svgContent: string;
}

export const CaptureModal: React.FC<CaptureModalProps> = ({ isOpen, onClose, svgContent }) => {
  if (!isOpen) return null;

  const handleDownloadSvg = () => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'autocad-capture.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1e23] border border-neutral-700 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden text-neutral-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#16171b] border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Camera size={15} className="text-cyan-400" />
            <span className="font-semibold text-sm text-neutral-100">
              Captured View Snapshot (capture_view)
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Viewport */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#181a1e]">
          <div
            className="border border-neutral-700/80 rounded-lg shadow-inner max-w-full overflow-hidden flex items-center justify-center bg-[#212428]"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#16171b] border-t border-neutral-800">
          <span className="text-xs text-neutral-400">
            Vector snapshot generated directly by CAD Model Space.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSvg}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-xs font-medium transition"
            >
              <Download size={14} />
              <span>Download SVG</span>
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
