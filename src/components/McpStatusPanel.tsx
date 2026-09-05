import React, { useState } from 'react';
import { ToolCallLog } from '../types.js';
import { Copy, Check, Server, Shield, ExternalLink, Activity, Terminal, Layers } from 'lucide-react';

interface McpStatusPanelProps {
  secretPath: string;
  mcpPath: string;
  auditLogs: ToolCallLog[];
  onClose: () => void;
  tools: { name: string; description: string }[];
}

export const McpStatusPanel: React.FC<McpStatusPanelProps> = ({
  secretPath,
  mcpPath,
  auditLogs,
  onClose,
  tools,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedClaude, setCopiedClaude] = useState(false);
  const [activeTab, setActiveTab] = useState<'connector' | 'logs' | 'tools'>('connector');

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const fullMcpUrl = `${origin}${mcpPath}`;
  const healthUrl = `${origin}/${secretPath}/health`;

  const copyToClipboard = (text: string, setFn: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  const claudeConfig = JSON.stringify(
    {
      mcpServers: {
        autocad: {
          type: 'http',
          url: fullMcpUrl,
        },
      },
    },
    null,
    2
  );

  return (
    <div className="w-96 bg-[#1b1d22] border-l border-neutral-700/80 flex flex-col h-full z-20 shadow-2xl text-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#181a1e] border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Server size={15} className="text-cyan-400" />
          <span className="font-semibold text-xs tracking-wide text-neutral-100">
            AutoCAD MCP Integration
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-200 text-xs px-1.5 py-0.5 rounded hover:bg-neutral-800"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-neutral-800 bg-[#16171b] text-xs">
        <button
          onClick={() => setActiveTab('connector')}
          className={`flex-1 py-2 font-medium text-center border-b-2 transition ${
            activeTab === 'connector'
              ? 'border-cyan-400 text-cyan-300 bg-neutral-800/40'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Connector
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2 font-medium text-center border-b-2 transition ${
            activeTab === 'logs'
              ? 'border-cyan-400 text-cyan-300 bg-neutral-800/40'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Audit Logs ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex-1 py-2 font-medium text-center border-b-2 transition ${
            activeTab === 'tools'
              ? 'border-cyan-400 text-cyan-300 bg-neutral-800/40'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Tools ({tools.length})
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 text-xs space-y-3 font-sans">
        {activeTab === 'connector' && (
          <div className="space-y-3.5">
            {/* Secret Endpoint URL */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span className="font-medium text-cyan-400 flex items-center gap-1">
                  <Shield size={12} /> MCP Streamable HTTP Endpoint
                </span>
                <span className="text-neutral-500 font-mono text-[10px]">Secret Auth</span>
              </div>
              <div className="flex items-center gap-1 bg-black/60 border border-neutral-800 rounded p-1.5 font-mono text-[11px] text-neutral-300 break-all">
                <span className="truncate flex-1">{fullMcpUrl}</span>
                <button
                  onClick={() => copyToClipboard(fullMcpUrl, setCopiedUrl)}
                  className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition flex-shrink-0"
                  title="Copy URL"
                >
                  {copiedUrl ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            {/* ChatGPT Instructions */}
            <div className="bg-neutral-800/40 border border-neutral-800 rounded-lg p-3 space-y-1.5">
              <h4 className="font-semibold text-neutral-200 flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Connecting to ChatGPT
              </h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                1. Go to <b>Settings → Apps & Connectors → Advanced</b> → Enable Developer mode.
                <br />
                2. Add custom connector with the URL above.
                <br />
                3. Set Authentication to <b>No authentication</b> (the secret is embedded in the URL).
              </p>
            </div>

            {/* Claude Code / Desktop JSON */}
            <div className="bg-neutral-800/40 border border-neutral-800 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-neutral-200 flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  Claude Code / Cursor
                </h4>
                <button
                  onClick={() => copyToClipboard(claudeConfig, setCopiedClaude)}
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
                >
                  {copiedClaude ? 'Copied!' : 'Copy JSON'}
                </button>
              </div>
              <pre className="bg-black/60 p-2 rounded text-[10px] font-mono text-neutral-300 overflow-x-auto">
                {claudeConfig}
              </pre>
            </div>

            {/* Health check test link */}
            <div className="pt-1 flex items-center justify-between text-[11px] text-neutral-400 px-1">
              <span>Health Endpoint:</span>
              <a
                href={healthUrl}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[10px]"
              >
                /{secretPath}/health <ExternalLink size={10} />
              </a>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
              <span>Tool Call Audit Trail</span>
              <span className="text-[10px] font-mono">logs/toolcalls.jsonl</span>
            </div>
            {auditLogs.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 italic text-[11px]">
                No tool calls recorded yet. Execute drawing actions or smoke test to see live logs.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-neutral-900/80 border border-neutral-800/80 rounded p-2 text-[11px] font-mono space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">{log.tool}</span>
                    <span
                      className={`text-[10px] px-1 rounded ${
                        log.outcome === 'ok'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : 'bg-red-950 text-red-400 border border-red-800/50'
                      }`}
                    >
                      {log.outcome}
                    </span>
                  </div>
                  <div className="text-neutral-400 text-[10px] truncate">
                    {JSON.stringify(log.args)}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-0.5 border-t border-neutral-800/50">
                    <span>{new Date(log.at).toLocaleTimeString()}</span>
                    <span>{log.seconds.toFixed(3)}s</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-2">
            <div className="text-[11px] text-neutral-400 mb-1">
              Available 2D Drafting Tools ({tools.length})
            </div>
            {tools.map((t) => (
              <div key={t.name} className="bg-neutral-900/60 border border-neutral-800 rounded p-2 text-[11px] space-y-1">
                <div className="font-mono font-semibold text-cyan-300">{t.name}</div>
                <p className="text-neutral-400 text-[11px] leading-snug">{t.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
