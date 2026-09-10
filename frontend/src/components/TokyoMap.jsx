import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Truck, Navigation, Battery, ShieldAlert, Sparkles } from 'lucide-react';

export default function TokyoMap({ stations = [], activeTransfers = [], onSelectStation, selectedStationId }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const transferLayerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Tokyo Metropolitan Area
    const map = L.map(mapContainerRef.current, {
      center: [35.65, 139.72],
      zoom: 11,
      minZoom: 9,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // OpenStreetMap standard tile layer with dark CSS filter applied via index.css
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    // Layer group for dynamic transfer lines
    transferLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Station Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    stations.forEach(st => {
      const isSelected = selectedStationId === st.id;
      const isCritical = st.shortage_risk_level === 'Critical';
      const isHigh = st.shortage_risk_level === 'High';
      const isMedium = st.shortage_risk_level === 'Medium';

      // Color selection
      let colorBg = '#10b981'; // green
      let glowClass = '';
      if (isCritical) {
        colorBg = '#f43f5e'; // red
        glowClass = 'marker-ripple-critical';
      } else if (isHigh) {
        colorBg = '#f97316'; // orange
        glowClass = 'marker-ripple-high';
      } else if (isMedium) {
        colorBg = '#f59e0b'; // amber
      }

      const customHtml = `
        <div class="relative cursor-pointer group" style="transform: translate(-50%, -50%);">
          ${(isCritical || isHigh) ? `<div class="absolute inset-0 rounded-full ${glowClass}" style="background-color: ${colorBg};"></div>` : ''}
          <div class="relative flex items-center justify-center w-10 h-10 rounded-2xl shadow-xl border-2 transition-transform duration-300 group-hover:scale-110"
               style="background-color: #0f172a; border-color: ${colorBg}; box-shadow: 0 0 15px ${colorBg}55;">
            <div class="flex flex-col items-center justify-center leading-none text-white">
              <span class="text-[12px] font-black font-mono">${st.available}</span>
              <span class="text-[8px] font-mono opacity-70">/ ${st.capacity}</span>
            </div>
            <div class="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 flex items-center justify-center text-[8px]"
                 style="background-color: ${colorBg};">
            </div>
          </div>
          <div class="absolute top-11 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-900/95 border border-slate-700 text-slate-200 text-[10px] font-medium shadow pointer-events-none flex items-center gap-1">
            <span>${st.name.replace(" Station", "")}</span>
            <span class="text-cyan-400 font-mono text-[9px]">${st.name_ja}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: 'custom-station-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      if (!markersRef.current[st.id]) {
        const marker = L.marker([st.lat, st.lng], { icon: customIcon }).addTo(map);
        marker.on('click', () => {
          onSelectStation(st.id);
        });
        markersRef.current[st.id] = marker;
      } else {
        markersRef.current[st.id].setIcon(customIcon);
        markersRef.current[st.id].setLatLng([st.lat, st.lng]);
      }
    });
  }, [stations, selectedStationId, onSelectStation]);

  // Update In-Flight Redistribution Visuals
  useEffect(() => {
    const map = mapInstanceRef.current;
    const transferLayer = transferLayerRef.current;
    if (!map || !transferLayer) return;

    transferLayer.clearLayers();

    activeTransfers.forEach(trf => {
      // 1. Draw glowing route corridor line
      const polyline = L.polyline([trf.source_coords, trf.destination_coords], {
        color: '#06b6d4',
        weight: 3,
        opacity: 0.8,
        dashArray: '6, 8',
        lineCap: 'round'
      });
      transferLayer.addLayer(polyline);

      // 2. Draw Moving Transit Vehicle Marker
      const currentPos = trf.current_coords || trf.source_coords;
      const progress = Math.round(trf.progress_pct || 0);

      const truckHtml = `
        <div class="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/95 border border-cyan-400 text-cyan-200 shadow-xl shadow-cyan-500/30 text-[10px] font-mono whitespace-nowrap animate-bounce"
             style="transform: translate(-50%, -50%);">
          <span>🚚</span>
          <span class="font-bold text-white">${trf.quantity} BATTERIES</span>
          <span class="text-cyan-400">(${progress}%)</span>
        </div>
      `;

      const truckIcon = L.divIcon({
        html: truckHtml,
        className: 'transfer-truck-marker',
        iconSize: [120, 24],
        iconAnchor: [60, 12]
      });

      const truckMarker = L.marker(currentPos, { icon: truckIcon });
      transferLayer.addLayer(truckMarker);
    });
  }, [activeTransfers]);

  return (
    <div className="relative w-full h-[460px] rounded-2xl overflow-hidden border border-slate-800 bg-[#0a0e17] shadow-2xl">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Overlays & Legend */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="bg-[#0f172a]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 shadow-lg pointer-events-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tokyo Swapping Network</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Click any station marker for IoT telemetry & controls
          </div>
        </div>

        {/* Legend */}
        <div className="bg-[#0f172a]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 shadow-lg text-[11px] flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300">Normal (&gt;10)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-300">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-rose-300 font-medium">Critical Shortage</span>
          </div>
        </div>
      </div>

      {/* Active Transfer Floating Pill */}
      {activeTransfers.length > 0 && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10 bg-[#0f172a]/95 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/40 text-xs shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
            <Truck className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>Automated Rebalance In Transit</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-300">
                {activeTransfers[0].progress_pct.toFixed(0)}%
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-mono">
              {activeTransfers[0].source_name} ➔ {activeTransfers[0].destination_name} ({activeTransfers[0].quantity} units)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
