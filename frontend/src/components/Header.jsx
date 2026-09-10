import React from 'react';
import { Zap, Clock, ShieldCheck, Activity, Radio, Cpu } from 'lucide-react';

export default function Header({ state, dataSource, onReset }) {
  const isCritical = state?.predicted_shortages_count > 0;

  return (
    <header className="border-b border-slate-800/80 bg-[#0d131f]/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0a0e17] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                  SwapSmart <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Japan</span>
                </h1>
                <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 uppercase">
                  東京 METRO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                AI-Powered EV & E-Bike Battery Swapping Network
              </p>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              LIVE
            </span>
          </div>
        </div>

        {/* Live Simulation Indicators & Tokyo Time */}
        <div className="flex flex-wrap items-center gap-2.5 justify-end w-full md:w-auto text-xs">
          {/* Synthetic Demo Data Disclaimer */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Simulation / Synthetic Demo Data</span>
          </div>

          {/* Simulated Tokyo Clock */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 font-mono text-slate-200">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">{state?.sim_time || "08:42:00"}</span>
            <span className="text-slate-400 text-[11px]">JST</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-300 text-[11px] font-sans font-medium">{state?.sim_day_period || "Morning Rush"}</span>
          </div>

          {/* Engine / Data Source Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
            <Radio className={`w-3.5 h-3.5 ${dataSource === 'backend' ? 'text-emerald-400' : 'text-amber-400'} animate-pulse`} />
            <span className="text-[11px]">
              {dataSource === 'backend' ? 'FastAPI Connected' : 'Local Engine Active'}
            </span>
          </div>

          {/* Shortage Threat Badge */}
          {isCritical ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 font-semibold animate-pulse">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <span>{state.predicted_shortages_count} Shortage Alert</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Network Balanced</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
