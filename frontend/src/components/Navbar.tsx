import React from 'react';
import { Shield, ShieldAlert, Zap, Download, Activity } from 'lucide-react';

interface Props {
  selectedModel: string;
  onModelChange: (model: string) => void;
  hitlMode: string;
  onHitlModeChange: (mode: string) => void;
  availableModels: string[];
  onToggleTelemetry: () => void;
  telemetryOpen: boolean;
  onExportChat: () => void;
  hasMessages: boolean;
}

export const Navbar: React.FC<Props> = ({
  selectedModel,
  onModelChange,
  hitlMode,
  onHitlModeChange,
  availableModels,
  onToggleTelemetry,
  telemetryOpen,
  onExportChat,
  hasMessages,
}) => {
  return (
    <header className="h-14 border-b border-borderDark bg-surface/80 backdrop-blur-md px-4 flex items-center justify-between select-none z-10">
      <div className="flex items-center gap-3">
        {/* Model Selector */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 font-medium">Model:</span>
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="bg-transparent text-white font-mono font-medium focus:outline-none cursor-pointer"
          >
            {availableModels.map((m) => (
              <option key={m} value={m} className="bg-slate-900 text-white">
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* HITL Guardrail Mode Selector */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
          {hitlMode === 'auto' && <Shield className="w-3.5 h-3.5 text-emerald-400" />}
          {hitlMode === 'sensitive_only' && <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
          {hitlMode === 'always_ask' && <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
          <span className="text-slate-400 font-medium">HITL:</span>
          <select
            value={hitlMode}
            onChange={(e) => onHitlModeChange(e.target.value)}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="auto" className="bg-slate-900 text-white">🚀 Auto-Pilot</option>
            <option value="sensitive_only" className="bg-slate-900 text-white">🛡️ Guarded</option>
            <option value="always_ask" className="bg-slate-900 text-white">🔒 Strict HITL</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Export Button */}
        {hasMessages && (
          <button
            onClick={onExportChat}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Export conversation history"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        )}

        {/* Telemetry Drawer Toggle */}
        <button
          onClick={onToggleTelemetry}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
            telemetryOpen
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Telemetry & Tools</span>
        </button>
      </div>
    </header>
  );
};
