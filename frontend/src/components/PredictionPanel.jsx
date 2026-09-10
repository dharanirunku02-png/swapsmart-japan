import React from 'react';
import { Cpu, AlertTriangle, TrendingDown, Clock, ShieldCheck, Zap } from 'lucide-react';

export default function PredictionPanel({ stations = [], simPeriod = "Morning Rush" }) {
  // Sort stations by risk score descending
  const sorted = [...stations].sort((a, b) => (b.shortage_risk_score || 0) - (a.shortage_risk_score || 0));
  const highestRiskStation = sorted[0];
  const hasCritical = highestRiskStation && highestRiskStation.shortage_risk_score >= 60;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#111827]/80 backdrop-blur p-5 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>AI Shortage Predictor</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  ML HEURISTIC
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Drain velocity vs. charging recovery model
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {simPeriod} Multiplier: {simPeriod.includes('Rush') ? '1.35x' : '1.0x'}
          </span>
        </div>

        {/* Primary Alert Banner */}
        {hasCritical ? (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 mb-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-rose-300 text-xs uppercase tracking-wide">
                    Imminent Shortage Detected
                  </span>
                  <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    SCORE {highestRiskStation.shortage_risk_score}/100
                  </span>
                </div>
                <p className="text-xs text-rose-200/90 font-medium mt-1">
                  {highestRiskStation.name} will experience battery exhaustion in{' '}
                  <span className="font-bold text-white font-mono underline decoration-rose-400">
                    ~{highestRiskStation.predicted_shortage_min || 8} minutes
                  </span>{' '}
                  without redistribution.
                </p>
                <div className="text-[11px] text-rose-300/70 mt-1">
                  Active Requests: {highestRiskStation.active_requests} • Available: {highestRiskStation.available} • Charging: {highestRiskStation.charging}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 mb-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-300">
                Network Supply Buffer Healthy
              </div>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">
                All 6 Tokyo metro stations have sufficient reserves for the current 45-minute horizon.
              </p>
            </div>
          </div>
        )}

        {/* Station Threat Gauges */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Station Shortage Risk Index</span>
            <span>0 – 100 Scale</span>
          </div>

          {sorted.map(st => {
            const score = st.shortage_risk_score || 0;
            const level = st.shortage_risk_level || 'Low';
            let barColor = 'bg-emerald-400';
            let textColor = 'text-emerald-400';

            if (score >= 81) {
              barColor = 'bg-rose-500';
              textColor = 'text-rose-400';
            } else if (score >= 61) {
              barColor = 'bg-orange-500';
              textColor = 'text-orange-400';
            } else if (score >= 31) {
              barColor = 'bg-amber-400';
              textColor = 'text-amber-300';
            }

            return (
              <div key={st.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-slate-200">
                    <span>{st.name.replace(" Station", "")}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">{st.name_ja}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {st.predicted_shortage_min && (
                      <span className="text-[10px] text-rose-300 font-mono flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        ~{st.predicted_shortage_min}m
                      </span>
                    )}
                    <span className={`font-mono font-bold text-xs ${textColor}`}>
                      {score}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ({level})
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Classification: 0-30 Low | 31-60 Med | 61-80 High | 81-100 Critical</span>
        <span className="font-mono text-cyan-400">Auto-eval: 2s</span>
      </div>
    </div>
  );
}
