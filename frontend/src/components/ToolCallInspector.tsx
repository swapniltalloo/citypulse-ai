import React, { useState } from 'react';
import type { ToolCall } from '../types';
import { ChevronDown, ChevronRight, Terminal, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const ToolCallInspector: React.FC<{ toolCalls: ToolCall[] }> = ({ toolCalls }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="space-y-1.5 my-2">
      {toolCalls.map((tc) => {
        const isExpanded = expandedId === tc.id;
        const isCompleted = tc.status === 'completed';
        const isRejected = tc.status === 'rejected';
        const isExecuting = tc.status === 'executing' || tc.status === 'pending';

        return (
          <div
            key={tc.id}
            className="rounded-xl border border-slate-700/60 bg-slate-900/60 overflow-hidden text-xs transition-colors"
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : tc.id)}
              className="w-full flex items-center justify-between p-2.5 hover:bg-slate-800/50 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {isRejected && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                {isExecuting && <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono font-semibold text-slate-200">
                  {tc.tool_name}
                </span>
                <span className="font-mono text-[11px] text-slate-400 truncate max-w-[200px]">
                  ({Object.entries(tc.args).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(', ')})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {tc.execution_time_ms && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {tc.execution_time_ms}ms
                  </span>
                )}
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] font-mono text-slate-300">
                <div className="text-slate-500 font-semibold mb-1">Invocation Parameters:</div>
                <pre className="p-2 rounded bg-slate-900 overflow-x-auto text-cyan-300">
                  {JSON.stringify(tc.args, null, 2)}
                </pre>
                {tc.result && (
                  <>
                    <div className="text-slate-500 font-semibold mt-2.5 mb-1">Tool Output Payload:</div>
                    <pre className="p-2 rounded bg-slate-900 overflow-x-auto text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                      {tc.result}
                    </pre>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
