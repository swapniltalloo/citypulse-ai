import React from 'react';
import type { WeatherCardData } from '../types';
import { Wind, Droplets, Gauge } from 'lucide-react';

export const WeatherWidget: React.FC<{ data: WeatherCardData }> = ({ data }) => {
  return (
    <div className="my-3 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900/70 to-slate-950/90 border border-cyan-500/30 p-4 shadow-xl backdrop-blur-md max-w-lg transition-all duration-300 hover:border-cyan-400/50">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <div className="text-xs uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Real-Time Atmosphere
          </div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {data.city}{data.country ? `, ${data.country}` : ''}
          </h3>
        </div>
        <div className="text-3xl filter drop-shadow-md">{data.icon_emoji}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3 items-center">
        <div>
          <div className="text-4xl font-extrabold text-white tracking-tight flex items-baseline">
            {data.temp}
            <span className="text-2xl font-light text-cyan-400 ml-0.5">{data.unit}</span>
          </div>
          <div className="text-sm font-medium text-slate-300 capitalize mt-0.5">
            {data.description}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Feels like {data.feels_like}{data.unit} • High: {data.temp_max}{data.unit}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800/60 rounded-xl p-2 border border-slate-700/50 flex flex-col justify-center">
            <span className="text-slate-400 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Humidity
            </span>
            <span className="text-sm font-semibold text-white mt-0.5">{data.humidity}%</span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-2 border border-slate-700/50 flex flex-col justify-center">
            <span className="text-slate-400 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-cyan-400" /> Wind
            </span>
            <span className="text-sm font-semibold text-white mt-0.5 truncate">{data.wind_speed}</span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-2 border border-slate-700/50 flex flex-col justify-center col-span-2">
            <span className="text-slate-400 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Barometer
            </span>
            <span className="text-sm font-semibold text-white mt-0.5">{data.pressure} hPa</span>
          </div>
        </div>
      </div>
    </div>
  );
};
