import React from 'react';
import type { Session } from '../types';
import { Plus, MessageSquare, Trash2, Cpu, CloudRain, Newspaper, Sparkles } from 'lucide-react';

interface Props {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onQuickPrompt: (city: string, promptText: string) => void;
  healthInfo?: any;
}

const QUICK_CITIES = [
  { name: 'Tokyo', icon: '🗼', prompt: 'Provide a comprehensive city intelligence briefing for Tokyo: current weather, timezone, top tech hotspots, and breaking news.' },
  { name: 'New York', icon: '🗽', prompt: 'What is the current atmospheric condition, local time, and latest business news in New York City?' },
  { name: 'London', icon: '🎡', prompt: 'Give me a live status briefing for London: weather forecast, AQI, and top cultural events today.' },
  { name: 'Paris', icon: '🥐', prompt: 'Urban intelligence report for Paris: local time, weather, and must-visit heritage landmarks.' },
  { name: 'Bengaluru', icon: '🚀', prompt: 'Briefing for Bengaluru: current weather, startup scene news, and notable tech hubs.' },
  { name: 'San Francisco', icon: '🌉', prompt: 'Comprehensive briefing for San Francisco: local time, climate conditions, and latest AI news.' },
];

export const Sidebar: React.FC<Props> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onQuickPrompt,
}) => {
  return (
    <aside className="w-72 bg-surface border-r border-borderDark flex flex-col h-full select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-borderDark flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-sm">
            CP
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              CityPulse <span className="text-cyan-400 font-mono text-xs">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Urban Autonomous Recon</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
          v1.0
        </span>
      </div>

      {/* New Session Button */}
      <div className="p-3">
        <button
          onClick={onNewSession}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 hover:from-cyan-500/20 hover:to-indigo-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all group shadow-sm"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          <span>New Recon Mission</span>
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 tracking-wider">
          Recent Missions
        </div>

        {sessions.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-slate-500">
            No previous sessions.<br />Start a new exploration above!
          </div>
        ) : (
          sessions.map((s) => {
            const isActive = s.session_id === activeSessionId;
            return (
              <div
                key={s.session_id}
                onClick={() => onSelectSession(s.session_id)}
                className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/40 font-medium shadow-inner'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate">{s.title || 'Untitled Session'}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(s.session_id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity"
                  title="Delete Session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}

        {/* Quick City Presets */}
        <div className="pt-4 text-[10px] uppercase font-bold text-slate-500 px-2 py-1 tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Quick City Presets
        </div>
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {QUICK_CITIES.map((c) => (
            <button
              key={c.name}
              onClick={() => onQuickPrompt(c.name, c.prompt)}
              className="p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-500/40 text-left transition-all text-xs flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <span>{c.icon}</span>
              <span className="truncate font-medium">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* System Health Diagnostics Footer */}
      <div className="p-3 border-t border-borderDark bg-slate-950/50 text-[11px]">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Telemetry Status</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
          </span>
        </div>
        <div className="space-y-1 text-slate-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-cyan-400" /> Groq LLM</span>
            <span className="font-mono text-emerald-400">Ready</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1"><CloudRain className="w-3 h-3 text-cyan-400" /> OpenWeather</span>
            <span className="font-mono text-emerald-400">Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1"><Newspaper className="w-3 h-3 text-cyan-400" /> Tavily Search</span>
            <span className="font-mono text-emerald-400">Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
