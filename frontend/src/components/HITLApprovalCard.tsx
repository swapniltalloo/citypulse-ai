import React, { useState } from 'react';
import type { PendingApproval } from '../types';
import { ShieldAlert, Check, X, Terminal, Loader2 } from 'lucide-react';

interface Props {
  approval: PendingApproval;
  onDecision: (approved: boolean, reason?: string) => Promise<void>;
}

export const HITLApprovalCard: React.FC<Props> = ({ approval, onDecision }) => {
  const [loading, setLoading] = useState(false);

  const handleDecision = async (approved: boolean) => {
    setLoading(true);
    try {
      await onDecision(approved);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-rose-950/40 border-2 border-amber-500/50 shadow-2xl backdrop-blur-md max-w-xl animate-bounce-short">
      <div className="flex items-center gap-3 pb-3 border-b border-amber-500/20">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 animate-pulse">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Human-in-the-Loop Guardrail Triggered
          </div>
          <h4 className="text-sm font-semibold text-white">
            Operator Authorization Requested
          </h4>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-300">
        <p>The agent is requesting permission to execute an external tool:</p>
        <div className="mt-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px]">
          <div className="text-amber-400 flex items-center gap-1.5 font-bold">
            <Terminal className="w-3.5 h-3.5" />
            Tool: {approval.tool_name}
          </div>
          <div className="text-slate-400 mt-1">
            Arguments: {JSON.stringify(approval.args)}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2.5">
        <button
          disabled={loading}
          onClick={() => handleDecision(false)}
          className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <X className="w-3.5 h-3.5" /> Reject Call
        </button>

        <button
          disabled={loading}
          onClick={() => handleDecision(true)}
          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          )}
          Authorize Execution
        </button>
      </div>
    </div>
  );
};
