import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, TrendingUp, Info, Battery, Zap } from 'lucide-react';

export default function StationTable({ stations = [], onSelectStation, onTriggerSpike, selectedStationId }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#111827]/80 backdrop-blur overflow-hidden shadow-xl">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <span>Tokyo Battery Swapping Stations</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              6 Active Hubs
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time battery allocation, charging pipelines, and AI shortage alerts
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#0f172a] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Station</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3">Charging</th>
              <th className="px-4 py-3">Swap Requests</th>
              <th className="px-4 py-3">Demand Level</th>
              <th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3">Predicted Shortage</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {stations.map(st => {
              const isSelected = selectedStationId === st.id;
              const isCritical = st.shortage_risk_level === 'Critical';
              const isHigh = st.shortage_risk_level === 'High';
              const isMedium = st.shortage_risk_level === 'Medium';
              const availPct = Math.round((st.available / st.capacity) * 100);

              let statusBadge = (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Normal
                </span>
              );

              if (isCritical) {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/40 animate-pulse">
                    <AlertCircle className="w-3 h-3" /> Critical
                  </span>
                );
              } else if (isHigh) {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                    <AlertTriangle className="w-3 h-3" /> High Risk
                  </span>
                );
              } else if (isMedium) {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Moderate
                  </span>
                );
              }

              return (
                <tr
                  key={st.id}
                  onClick={() => onSelectStation(st.id)}
                  className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-cyan-500/10 border-l-4 border-l-cyan-400' : ''
                  }`}
                >
                  {/* Station Name */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-white text-sm">
                        {st.name.replace(" Station", "")}
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300">
                        {st.name_ja}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {st.swapper_slots_operational}/{st.swapper_slots_total} Slots Active • {st.temperature_c}°C
                    </div>
                  </td>

                  {/* Available Batteries */}
                  <td className="px-4 py-3.5 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-bold ${st.available <= 6 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {st.available}
                      </span>
                      <span className="text-slate-500 text-[11px]">avail</span>
                    </div>
                    <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          st.available <= 6 ? 'bg-rose-500' : st.available <= 12 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, availPct)}%` }}
                      />
                    </div>
                  </td>

                  {/* Charging */}
                  <td className="px-4 py-3.5 font-mono text-blue-300">
                    <span className="font-semibold">{st.charging}</span>
                    <span className="text-slate-500 text-[11px] ml-1">cells</span>
                  </td>

                  {/* Swap Requests */}
                  <td className="px-4 py-3.5 font-mono">
                    <span className="font-bold text-slate-200">{st.active_requests}</span>
                    <span className="text-[10px] text-slate-400 ml-1">
                      ({st.ev_requests_count} EV / {st.ebike_requests_count} Bike)
                    </span>
                  </td>

                  {/* Demand Level */}
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      st.demand_level === 'Critical' || st.demand_level === 'High'
                        ? 'bg-rose-500/10 text-rose-300'
                        : st.demand_level === 'Medium'
                        ? 'bg-amber-500/10 text-amber-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {st.demand_level}
                    </span>
                  </td>

                  {/* Capacity */}
                  <td className="px-4 py-3.5 font-mono text-slate-400">
                    {st.capacity} slots
                  </td>

                  {/* Predicted Shortage */}
                  <td className="px-4 py-3.5 font-mono">
                    {st.predicted_shortage_min ? (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-400 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        In ~{st.predicted_shortage_min} min
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Stable (&gt;60m)</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    {statusBadge}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right space-x-1.5" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onTriggerSpike(st.id, 16)}
                      className="px-2 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 transition"
                      title="Trigger Demand Surge"
                    >
                      +Spike
                    </button>
                    <button
                      onClick={() => onSelectStation(st.id)}
                      className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    >
                      IoT View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
