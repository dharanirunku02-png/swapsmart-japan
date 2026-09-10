import React from 'react';
import { MapPin, BatteryCharging, Zap, Battery, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function KpiCards({ state }) {
  const totalCapacity = state?.stations?.reduce((sum, s) => sum + s.capacity, 0) || 260;
  const avail = state?.total_available_batteries || 0;
  const availPct = Math.round((avail / totalCapacity) * 100);
  const activeReqs = state?.total_active_requests || 0;
  const charging = state?.total_charging_batteries || 0;
  const avgWait = state?.network_avg_waiting_time || 0;
  const shortages = state?.predicted_shortages_count || 0;

  const cards = [
    {
      title: "Total Stations",
      value: state?.total_stations || 6,
      subtext: "Tokyo Metropolitan Network",
      icon: MapPin,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20"
    },
    {
      title: "Available Batteries",
      value: avail,
      badge: `${availPct}% Capacity`,
      subtext: `${totalCapacity} Total Capacity`,
      icon: Battery,
      color: avail < 40 ? "text-rose-400" : "text-emerald-400",
      bg: avail < 40 ? "bg-rose-500/10" : "bg-emerald-500/10",
      border: avail < 40 ? "border-rose-500/30" : "border-emerald-500/20"
    },
    {
      title: "Active Swap Requests",
      value: activeReqs,
      badge: "Real-time Queue",
      subtext: "EV & E-Bike Commuters",
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
    {
      title: "Batteries Charging",
      value: charging,
      badge: "Smart Grid Active",
      subtext: "Auto-recharging at stations",
      icon: BatteryCharging,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      title: "Average Waiting Time",
      value: `${avgWait} min`,
      subtext: avgWait > 5.0 ? "High Metro Congestion" : "Optimal Transit Flow",
      icon: Clock,
      color: avgWait > 5.0 ? "text-rose-400" : "text-cyan-400",
      bg: avgWait > 5.0 ? "bg-rose-500/10" : "bg-cyan-500/10",
      border: avgWait > 5.0 ? "border-rose-500/30" : "border-cyan-500/20"
    },
    {
      title: "Predicted Shortages",
      value: shortages,
      badge: shortages > 0 ? "Action Required" : "Stable",
      subtext: shortages > 0 ? "AI Predictor Warning" : "Zero Risk Detected",
      icon: AlertTriangle,
      color: shortages > 0 ? "text-rose-400" : "text-emerald-400",
      bg: shortages > 0 ? "bg-rose-500/15" : "bg-emerald-500/10",
      border: shortages > 0 ? "border-rose-500/40" : "border-emerald-500/20",
      pulse: shortages > 0
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-xl bg-[#111827]/80 backdrop-blur border ${c.border} p-3.5 flex flex-col justify-between transition-all hover:border-slate-600 ${
              c.pulse ? 'ring-1 ring-rose-500/30 shadow-lg shadow-rose-500/10 animate-pulse-slow' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                {c.title}
              </span>
              <div className={`p-1.5 rounded-lg ${c.bg}`}>
                <Icon className={`w-3.5 h-3.5 ${c.color}`} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black tracking-tight font-mono ${c.color}`}>
                  {c.value}
                </span>
                {c.badge && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                    {c.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {c.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
