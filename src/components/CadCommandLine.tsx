import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, ChevronUp, ChevronDown } from 'lucide-react';

interface CadCommandLineProps {
  onExecuteCommand: (command: string) => void;
  logs: string[];
}

export const CadCommandLine: React.FC<CadCommandLineProps> = ({
  onExecuteCommand,
  logs,
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [expanded, setExpanded] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setHistory((prev) => [trimmed, ...prev.slice(0, 49)]);
    setHistoryIndex(-1);
    onExecuteCommand(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div
      className={`bg-[#151619] border-t border-neutral-800 text-neutral-300 font-mono text-xs transition-all duration-150 flex flex-col ${
        expanded ? 'h-52' : 'h-24'
      }`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#1c1e22] border-b border-neutral-800/80 text-[11px] text-neutral-400">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-cyan-400" />
          <span className="font-semibold text-neutral-300">AutoCAD Command Window</span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-500">AutoLISP & Commands supported</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="toggle-cmd-height-btn"
            onClick={() => setExpanded(!expanded)}
            className="text-neutral-400 hover:text-neutral-200 p-0.5 rounded transition"
            title={expanded ? 'Minimize' : 'Expand'}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Output log area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5 text-neutral-300 text-[11px] font-mono leading-relaxed"
      >
        {logs.length === 0 ? (
          <div className="text-neutral-500 italic">
            AutoCAD 2027 Command Prompt ready. Try commands like: CIRCLE 50,30 20 or (command "_CIRCLE" "50,30" "20")
          </div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="whitespace-pre-wrap break-all">
              {log.startsWith('Command:') ? (
                <span className="text-cyan-400 font-semibold">{log}</span>
              ) : log.startsWith('Error:') ? (
                <span className="text-red-400">{log}</span>
              ) : (
                <span className="text-neutral-300">{log}</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input prompt form */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#121316] border-t border-neutral-800"
      >
        <span className="text-cyan-400 font-bold select-none text-xs">Command:</span>
        <input
          ref={inputRef}
          id="cad-command-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type command or AutoLISP expression and press Enter..."
          className="flex-1 bg-transparent text-neutral-100 placeholder-neutral-600 outline-none text-xs font-mono"
          autoComplete="off"
          spellCheck="false"
        />
        <button
          type="submit"
          id="cad-command-submit-btn"
          className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-cyan-300 transition"
          title="Send Command"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
};
