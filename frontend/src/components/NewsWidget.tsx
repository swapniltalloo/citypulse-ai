import React from 'react';
import type { NewsCardData } from '../types';
import { ExternalLink, Newspaper, ShieldCheck } from 'lucide-react';

export const NewsWidget: React.FC<{ data: NewsCardData }> = ({ data }) => {
  return (
    <div className="my-3 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-indigo-950/40 border border-indigo-500/30 p-4 shadow-xl backdrop-blur-md max-w-xl">
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Newspaper className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-indigo-400 font-semibold">
              Live Verified Dispatches
            </h4>
            <span className="text-sm font-bold text-white capitalize">{data.query}</span>
          </div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono flex items-center gap-1 border border-indigo-500/30">
          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Tavily Search
        </span>
      </div>

      <div className="mt-3 space-y-2.5">
        {data.articles.map((art, idx) => (
          <a
            key={idx}
            href={art.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-indigo-400/50 transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-2">
              <h5 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-1">
                {art.title}
              </h5>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 flex-shrink-0 mt-0.5" />
            </div>
            <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {art.snippet}
            </p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-mono text-cyan-400/80 bg-cyan-950/40 px-1.5 py-0.5 rounded">
                {art.domain}
              </span>
              <span className="group-hover:text-slate-300 transition-colors">Read full dispatch →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
