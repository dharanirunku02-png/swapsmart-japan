import React from 'react';
import { Sparkles, Play, SkipForward, X, CheckCircle2, ChevronRight } from 'lucide-react';

export const DEMO_STEPS = [
  {
    step: 1,
    title: "Normal Station Baseline",
    badge: "INITIAL STATE",
    description: "6 major Tokyo mobility hubs operating normally during morning commuter hours. Inventories are stable."
  },
  {
    step: 2,
    title: "Surge at Shibuya",
    badge: "DEMAND SPIKE",
    description: "Sudden morning rush and e-bike delivery couriers converge on Shibuya station. Swap requests skyrocket."
  },
  {
    step: 3,
    title: "Inventory Depletion",
    badge: "SUPPLY DROP",
    description: "Shibuya available batteries drop from 18 to just 4. Swapping queue begins to back up."
  },
  {
    step: 4,
    title: "AI Shortage Detection",
    badge: "ANOMALY DETECTED",
    description: "Intelligent telemetry detects rapid drain velocity exceeding recharge recovery threshold."
  },
  {
    step: 5,
    title: "Predictive Forecast Alert",
    badge: "AI PREDICTION",
    description: "AI model scores Shibuya as CRITICAL (Score: 88). Forecasts complete stockout in ~7 minutes."
  },
  {
    step: 6,
    title: "Donor Station Identified",
    badge: "NETWORK SCAN",
    description: "Optimization engine scans Tokyo metro network and selects Shinjuku (24 surplus batteries, 3.4 km away)."
  },
  {
    step: 7,
    title: "Redistribution Recommendation",
    badge: "AI RECOMMENDATION",
    description: "System generates optimal dispatch plan: Transfer 10 batteries from Shinjuku to Shibuya."
  },
  {
    step: 8,
    title: "Operator Dispatch Approval",
    badge: "DISPATCHED",
    description: "Optimization plan is approved. Automated courier dispatch leaves Shinjuku immediately."
  },
  {
    step: 9,
    title: "Live Transit Across Tokyo",
    badge: "IN-FLIGHT LOGISTICS",
    description: "Battery transfer is animated live on the Tokyo corridor map with real-time GPS coordinates."
  },
  {
    step: 10,
    title: "Stock Restored & Shortage Averted!",
    badge: "IMPACT PROVEN",
    description: "Shibuya restocked (+10 units). Waiting time slashed by 65% (8.2m ➔ 2.9m). Zero drivers turned away!"
  }
];

export default function HackathonDemoBar({
  currentStep,
  totalSteps = 10,
  isPlaying,
  onNext,
  onStop
}) {
  const stepInfo = DEMO_STEPS[currentStep - 1] || DEMO_STEPS[0];
  const progressPct = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="bg-gradient-to-r from-blue-950/95 via-indigo-950/95 to-slate-900/95 border-b border-cyan-500/40 px-4 lg:px-8 py-3 sticky top-[57px] z-30 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Step Indicator & Story */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-mono font-black text-sm shrink-0 shadow-lg shadow-cyan-500/20">
            {currentStep}/{totalSteps}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                {stepInfo.badge}
              </span>
              <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <span>{stepInfo.title}</span>
              </h4>
            </div>
            <p className="text-xs text-slate-200/90 font-medium mt-0.5 max-w-2xl">
              {stepInfo.description}
            </p>
          </div>
        </div>

        {/* Right: Pitch Controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Progress Mini Bar */}
          <div className="hidden sm:block w-32 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {currentStep < totalSteps ? (
            <button
              onClick={onNext}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20"
            >
              <span>Next Step</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onStop}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pitch Complete!</span>
            </button>
          )}

          <button
            onClick={onStop}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Exit Demo Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
