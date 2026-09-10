import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Bike, Car, Activity } from 'lucide-react';

export default function AnalyticsSection({ stations = [] }) {
  // Format data for Station Inventory Bar Chart
  const inventoryData = stations.map(s => ({
    name: s.name.replace(" Station", ""),
    Available: s.available,
    Charging: s.charging,
    Capacity: s.capacity,
    InUse: s.in_use
  }));

  // Format data for Waiting Time & Risk Area Chart
  const performanceData = stations.map(s => ({
    name: s.name.replace(" Station", ""),
    "Wait Time (m)": s.avg_waiting_time,
    "Shortage Risk": s.shortage_risk_score,
    Requests: s.active_requests
  }));

  // Totals for EV vs E-Bike
  const totalEv = stations.reduce((sum, s) => sum + (s.ev_requests_count || 0), 0);
  const totalEbike = stations.reduce((sum, s) => sum + (s.ebike_requests_count || 0), 0);
  const totalVehicles = Math.max(1, totalEv + totalEbike);
  const evPct = Math.round((totalEv / totalVehicles) * 100);
  const ebikePct = Math.round((totalEbike / totalVehicles) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>Network Performance & Demand Analytics</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time multi-station inventory distributions and queue latency metrics
          </p>
        </div>

        {/* EV vs E-Bike Ratio Indicator */}
        <div className="flex items-center gap-4 bg-[#111827] border border-slate-800 px-4 py-2 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 text-blue-400 font-medium">
            <Car className="w-4 h-4" />
            <span>EVs: {totalEv} ({evPct}%)</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Bike className="w-4 h-4" />
            <span>E-Bikes: {totalEbike} ({ebikePct}%)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Battery Inventory Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-[#111827]/80 backdrop-blur p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-200">Station Battery Inventory vs. Charging Cells</span>
            <span className="text-slate-400 font-mono text-[11px]">Units per Station</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Available" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Charging" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="InUse" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Queue Waiting Time & Shortage Risk */}
        <div className="rounded-2xl border border-slate-800 bg-[#111827]/80 backdrop-blur p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-200">Queue Latency & AI Shortage Risk Score</span>
            <span className="text-slate-400 font-mono text-[11px]">Dynamic Stress Index</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="Shortage Risk" stroke="#f43f5e" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={2} />
                <Area type="monotone" dataKey="Wait Time (m)" stroke="#06b6d4" fillOpacity={1} fill="url(#colorWait)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
