import React from 'react';
import type { AQICardData } from '../types';
import { Activity } from 'lucide-react';

export const AQIWidget: React.FC<{ data: AQICardData }> = ({ data }) => {
  const getBadgeColor = (aqi: number) => {
    switch (aqi) {
      case 1:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 2:
        return 'text-lime-400 bg-lime-500/10 border-lime-500/30';
      case 3:
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 4:
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  return (
    <div className="my-3 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-emerald-950/40 border border-emerald-500/30 p-4 shadow-xl backdrop-blur-md max-w-md">
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              Atmospheric Pollution & AQI
            </h4>
            <span className="text-sm font-bold text-white">{data.city}</span>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeColor(data.aqi)}`}>
          Level {data.aqi} • {data.label}
        </span>
      </div>

      <div className="mt-3">
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
          {data.advisory}
        </p>

        <div className="grid grid-cols-3 gap-2 mt-2.5 text-center text-xs">
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/40">
            <div className="text-slate-400 text-[10px]">PM2.5</div>
            <div className="font-semibold text-white mt-0.5">{data.pm2_5}</div>
          </div>
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/40">
            <div className="text-slate-400 text-[10px]">PM10</div>
            <div className="font-semibold text-white mt-0.5">{data.pm10}</div>
          </div>
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/40">
            <div className="text-slate-400 text-[10px]">NO2</div>
            <div className="font-semibold text-white mt-0.5">{data.no2}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
