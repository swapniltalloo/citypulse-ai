import React from 'react';
import type { PlacesCardData } from '../types';
import { MapPin, Compass } from 'lucide-react';

export const PlacesWidget: React.FC<{ data: PlacesCardData }> = ({ data }) => {
  return (
    <div className="my-3 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-purple-950/40 border border-purple-500/30 p-4 shadow-xl backdrop-blur-md max-w-xl">
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-purple-400 font-semibold">
              Urban Landmarks & Points of Interest
            </h4>
            <span className="text-sm font-bold text-white">{data.city} Highlights</span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {data.places.map((place, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-purple-400/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-white flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  {place.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">
                {place.vibe}
              </p>
            </div>
            <div className="mt-2.5">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {place.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
