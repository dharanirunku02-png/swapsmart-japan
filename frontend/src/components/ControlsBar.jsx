import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Zap, Sparkles, TrendingUp, Filter, Bike, Car, ArrowRightLeft } from 'lucide-react';

export default function ControlsBar({
  isRunning,
  simSpeed,
  onTogglePlay,
  onReset,
  onSetSpeed,
  onTriggerSpike,
  onRunDemo,
  onOptimize,
  hasRecommendations,
  vehicleFilter,
  onSetVehicleFilter,
  stations = []
}) {
  const [selectedStationForSpike, setSelectedStationForSpike] = useState('shibuya');
  const [showSpikeDropdown, setShowSpikeDropdown] = useState(false);

  return (
    <div className="bg-[#111827]/80 backdrop-blur border-y border-slate-800/80 px-4 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Simulation Primary Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'PAUSE' : 'START SIMULATION'}</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
            title="Reset Simulation to 08:42 AM"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs">
            <span className="px-2 text-slate-500 font-mono text-[11px]">SPEED:</span>
            {[
              { label: '0.5x', val: 0.5 },
              { label: '1x', val: 1.0 },
              { label: '2x', val: 2.0 },
              { label: '5x', val: 5.0 },
            ].map(({ label, val }) => (
              <button
                key={label}
                onClick={() => onSetSpeed(val)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                  simSpeed === val
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Highlighted Hackathon Pitch Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRunDemo}
            className="relative group overflow-hidden flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all border border-cyan-400/40"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
            <span>RUN HACKATHON DEMO</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 font-mono">10-STEP</span>
          </button>

          {/* Quick Optimize Network Button */}
          {hasRecommendations && (
            <button
              onClick={onOptimize}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-semibold animate-pulse transition"
              title="Execute AI recommended battery transfer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>OPTIMIZE NETWORK</span>
            </button>
          )}
        </div>

        {/* Right: Manual Spike & Vehicle Filters */}
        <div className="flex items-center gap-2">
          {/* Demand Spike Controller */}
          <div className="relative">
            <button
              onClick={() => setShowSpikeDropdown(!showSpikeDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>TRIGGER DEMAND SPIKE</span>
            </button>

            {showSpikeDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-[#162032] border border-slate-700 rounded-xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                  Select Target Station:
                </div>
                <div className="space-y-1">
                  {stations.map(st => (
                    <button
                      key={st.id}
                      onClick={() => {
                        onTriggerSpike(st.id, 18);
                        setShowSpikeDropdown(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-700/60 text-slate-200 flex items-center justify-between transition"
                    >
                      <span className="font-medium">{st.name}</span>
                      <span className="text-[10px] font-mono text-cyan-400">{st.name_ja}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Type Filter */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs">
            <button
              onClick={() => onSetVehicleFilter('ALL')}
              className={`px-2 py-1 rounded text-[11px] transition ${
                vehicleFilter === 'ALL'
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => onSetVehicleFilter('EV')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition ${
                vehicleFilter === 'EV'
                  ? 'bg-blue-600/80 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Car className="w-3 h-3" />
              <span>EV</span>
            </button>
            <button
              onClick={() => onSetVehicleFilter('E-BIKE')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition ${
                vehicleFilter === 'E-BIKE'
                  ? 'bg-emerald-600/80 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bike className="w-3 h-3" />
              <span>E-BIKE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
