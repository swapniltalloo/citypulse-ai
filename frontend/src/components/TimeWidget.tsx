import React from 'react';
import type { TimeCardData } from '../types';
import { Clock, Sun, Moon, Briefcase } from 'lucide-react';

export const TimeWidget: React.FC<{ data: TimeCardData }> = ({ data }) => {
  return (
    <div className="my-3 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-amber-950/40 border border-amber-500/30 p-4 shadow-xl backdrop-blur-md max-w-md">
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
              Local Chrono & Business Schedule
            </h4>
            <span className="text-sm font-bold text-white">{data.city} Time</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-amber-300">
          {data.is_day ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
          <span>{data.utc_offset}</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-xl font-bold text-white tracking-wide">
          {data.local_time}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-300 bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
          <Briefcase className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Status: <strong>{data.business_status}</strong></span>
        </div>
      </div>
    </div>
  );
};
