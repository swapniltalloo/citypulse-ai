import React from 'react';
import { X, Wrench, Terminal, Layers, Info } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tools: any[];
}

export const TelemetryDrawer: React.FC<Props> = ({ isOpen, onClose, tools }) => {
  if (!isOpen) return null;

  return (
    <aside className="w-80 bg-surface border-l border-borderDark flex flex-col h-full shadow-2xl z-20 select-none">
      {/* Drawer Header */}
      <div className="p-4 border-b border-borderDark flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Agent Tool Registry
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tools List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="font-semibold text-cyan-300 flex items-center gap-1.5 mb-1">
            <Info className="w-3.5 h-3.5 text-cyan-400" /> Production Architecture
          </div>
          Every user prompt is processed by the <strong>LangChain / LangGraph</strong> runtime. Tools are bound via function signatures and executed dynamically with typed input validation.
        </div>

        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pt-2">
          Registered Capabilities ({tools.length})
        </div>

        {tools.map((t) => (
          <div
            key={t.name}
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-cyan-400" /> {t.name}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              {t.description}
            </p>
          </div>
        ))}

        {/* Resume Highlights / Tech Stack Badge */}
        <div className="pt-4 border-t border-slate-800">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" /> Technology Stack
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              'LangChain',
              'LangGraph',
              'Groq LLM',
              'FastAPI',
              'SSE Streaming',
              'Human-In-The-Loop',
              'Pydantic v2',
              'OpenWeather API',
              'Tavily Search',
              'React 19',
              'TypeScript',
              'Tailwind CSS',
            ].map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
