import React from 'react';
import { Activity, AlertTriangle, Zap, ArrowRightLeft, BatteryCharging, CheckCircle, Flame } from 'lucide-react';

export default function LiveEventsFeed({ events = [] }) {
  const getEventBadge = (type, severity) => {
    switch (type) {
      case 'SPIKE':
        return {
          icon: Flame,
          color: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
          label: 'SPIKE'
        };
      case 'PREDICTION':
        return {
          icon: AlertTriangle,
          color: severity === 'critical' ? 'text-rose-400 bg-rose-500/15 border-rose-500/40' : 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
          label: 'AI PREDICT'
        };
      case 'OPTIMIZATION':
        return {
          icon: ArrowRightLeft,
          color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
          label: 'REBALANCE'
        };
      case 'ALLOCATION':
        return {
          icon: Zap,
          color: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
          label: 'SWAP'
        };
      case 'CHARGED':
        return {
          icon: BatteryCharging,
          color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
          label: 'RECHARGE'
        };
      default:
        return {
          icon: Activity,
          color: 'text-slate-400 bg-slate-800 border-slate-700',
          label: 'EVENT'
        };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#111827]/80 backdrop-blur p-5 shadow-xl flex flex-col h-[400px]">
      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">
              Live Simulation Activity Feed
            </h3>
            <p className="text-[11px] text-slate-400">
              Autonomous telemetry, swap transactions, and redistribution logs
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          REAL-TIME STREAM
        </span>
      </div>

      {/* Events List */}
      <div className="overflow-y-auto space-y-2 pr-1 flex-1 font-mono">
        {events.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            Awaiting simulation events...
          </div>
        ) : (
          events.map(evt => {
            const badge = getEventBadge(evt.type, evt.severity);
            const Icon = badge.icon;

            return (
              <div
                key={evt.id}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition flex items-start gap-2.5 text-xs group"
              >
                {/* Timestamp */}
                <span className="text-[11px] text-slate-500 font-mono shrink-0 mt-0.5">
                  {evt.timestamp}
                </span>

                {/* Badge */}
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 ${badge.color}`}>
                  <Icon className="w-2.5 h-2.5" />
                  <span>{badge.label}</span>
                </span>

                {/* Message */}
                <div className="flex-1 font-sans text-slate-300 group-hover:text-white transition-colors text-[12px] leading-snug">
                  {evt.message}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
