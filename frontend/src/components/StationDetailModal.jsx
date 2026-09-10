import React from 'react';
import { X, Battery, BatteryCharging, Zap, Thermometer, Wifi, Clock, Cpu, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';

export default function StationDetailModal({ station, onClose, onTriggerSpike }) {
  if (!station) return null;

  const isCritical = station.shortage_risk_level === 'Critical';
  const isHigh = station.shortage_risk_level === 'High';
  const isMedium = station.shortage_risk_level === 'Medium';
  const availPct = Math.round((station.available / station.capacity) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <div className={`p-3 rounded-2xl ${
            isCritical ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
          }`}>
            <Battery className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-white">
                {station.name}
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                {station.name_ja}
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {station.sensor_health}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Coordinates: [{station.lat.toFixed(4)}, {station.lng.toFixed(4)}] • Capacity: {station.capacity} Units
            </p>
          </div>
        </div>

        {/* Shortage Threat Alert if any */}
        {station.shortage_risk_score >= 50 && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>AI Alert: Risk score is {station.shortage_risk_score}/100. Stockout estimated in ~{station.predicted_shortage_min || 8} minutes.</span>
            </div>
            <button
              onClick={() => onTriggerSpike(station.id, 10)}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 font-bold text-white transition text-[11px]"
            >
              Test Surge
            </button>
          </div>
        )}

        {/* Battery State Invariant Breakdown */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Battery State Allocation (Total: {station.capacity})</span>
            <span className="font-mono text-cyan-400">{availPct}% Available</span>
          </div>

          <div className="h-4 rounded-full bg-slate-800 flex overflow-hidden p-0.5 gap-0.5">
            <div
              className="bg-emerald-400 rounded-l-full transition-all duration-500"
              style={{ width: `${(station.available / station.capacity) * 100}%` }}
              title={`Available: ${station.available}`}
            />
            <div
              className="bg-blue-400 transition-all duration-500"
              style={{ width: `${(station.charging / station.capacity) * 100}%` }}
              title={`Charging: ${station.charging}`}
            />
            <div
              className="bg-amber-400 transition-all duration-500"
              style={{ width: `${(station.reserved / station.capacity) * 100}%` }}
              title={`Reserved: ${station.reserved}`}
            />
            <div
              className="bg-slate-600 rounded-r-full transition-all duration-500"
              style={{ width: `${(station.in_use / station.capacity) * 100}%` }}
              title={`In Use: ${station.in_use}`}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 mt-3 text-center">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-[10px] uppercase font-bold text-emerald-400">Available</div>
              <div className="text-base font-black font-mono text-emerald-300">{station.available}</div>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-[10px] uppercase font-bold text-blue-400">Charging</div>
              <div className="text-base font-black font-mono text-blue-300">{station.charging}</div>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="text-[10px] uppercase font-bold text-amber-400">Reserved</div>
              <div className="text-base font-black font-mono text-amber-300">{station.reserved}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
              <div className="text-[10px] uppercase font-bold text-slate-400">In Use</div>
              <div className="text-base font-black font-mono text-slate-300">{station.in_use}</div>
            </div>
          </div>
        </div>

        {/* IoT Telemetry Section */}
        <div className="mb-6">
          <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>IoT Station Sensor Telemetry</span>
          </h4>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
              <Thermometer className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-slate-400 text-[10px]">Cabinet Core Temp</div>
                <div className="font-bold text-white font-mono text-sm">{station.temperature_c}°C</div>
                <div className="text-[10px] text-emerald-400">Normal Range (&lt;35°C)</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <div className="text-slate-400 text-[10px]">Grid Power Draw</div>
                <div className="font-bold text-white font-mono text-sm">{station.power_draw_kw} kW</div>
                <div className="text-[10px] text-slate-400">Smart Grid Active</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <div className="text-slate-400 text-[10px]">Avg Wait Time</div>
                <div className="font-bold text-white font-mono text-sm">{station.avg_waiting_time} min</div>
                <div className="text-[10px] text-slate-400">Queue: {station.active_requests} users</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Vehicles served: <span className="text-white font-mono">{station.ev_requests_count} EV</span> •{' '}
            <span className="text-cyan-300 font-mono">{station.ebike_requests_count} E-Bikes</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onTriggerSpike(station.id, 16)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 flex items-center gap-1.5 transition"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Simulate Demand Spike</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
