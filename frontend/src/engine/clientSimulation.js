// High-fidelity client-side simulation engine fallback for SwapSmart Japan
// Ensures 100% standalone reliability during hackathons

const INITIAL_STATIONS = [
  {
    id: "shibuya",
    name: "Shibuya Station",
    name_ja: "渋谷駅前",
    lat: 35.6580,
    lng: 139.7016,
    capacity: 45,
    available: 8,
    charging: 14,
    reserved: 3,
    in_use: 20,
    active_requests: 28,
    demand_level: "High",
    shortage_risk_score: 84,
    shortage_risk_level: "Critical",
    predicted_shortage_min: 7,
    avg_waiting_time: 6.8,
    ev_requests_count: 14,
    ebike_requests_count: 22,
    temperature_c: 26.2,
    power_draw_kw: 28.5,
    sensor_health: "ONLINE",
    swapper_slots_total: 10,
    swapper_slots_operational: 10
  },
  {
    id: "shinjuku",
    name: "Shinjuku Station",
    name_ja: "新宿西口",
    lat: 35.6909,
    lng: 139.7003,
    capacity: 50,
    available: 28,
    charging: 12,
    reserved: 2,
    in_use: 8,
    active_requests: 9,
    demand_level: "Low",
    shortage_risk_score: 18,
    shortage_risk_level: "Low",
    predicted_shortage_min: null,
    avg_waiting_time: 2.1,
    ev_requests_count: 8,
    ebike_requests_count: 6,
    temperature_c: 23.8,
    power_draw_kw: 18.0,
    sensor_health: "ONLINE",
    swapper_slots_total: 12,
    swapper_slots_operational: 12
  },
  {
    id: "akihabara",
    name: "Akihabara Station",
    name_ja: "秋葉原電気街",
    lat: 35.6983,
    lng: 139.7731,
    capacity: 35,
    available: 14,
    charging: 10,
    reserved: 2,
    in_use: 9,
    active_requests: 14,
    demand_level: "Medium",
    shortage_risk_score: 38,
    shortage_risk_level: "Medium",
    predicted_shortage_min: 24,
    avg_waiting_time: 3.6,
    ev_requests_count: 5,
    ebike_requests_count: 14,
    temperature_c: 24.1,
    power_draw_kw: 16.4,
    sensor_health: "ONLINE",
    swapper_slots_total: 8,
    swapper_slots_operational: 8
  },
  {
    id: "shinagawa",
    name: "Shinagawa Station",
    name_ja: "品川港南口",
    lat: 35.6284,
    lng: 139.7387,
    capacity: 40,
    available: 19,
    charging: 11,
    reserved: 2,
    in_use: 8,
    active_requests: 11,
    demand_level: "Medium",
    shortage_risk_score: 28,
    shortage_risk_level: "Low",
    predicted_shortage_min: null,
    avg_waiting_time: 2.8,
    ev_requests_count: 9,
    ebike_requests_count: 6,
    temperature_c: 24.9,
    power_draw_kw: 19.2,
    sensor_health: "ONLINE",
    swapper_slots_total: 8,
    swapper_slots_operational: 8
  },
  {
    id: "tokyo_stn",
    name: "Tokyo Station",
    name_ja: "東京丸の内",
    lat: 35.6812,
    lng: 139.7671,
    capacity: 55,
    available: 24,
    charging: 16,
    reserved: 3,
    in_use: 12,
    active_requests: 18,
    demand_level: "Medium",
    shortage_risk_score: 34,
    shortage_risk_level: "Medium",
    predicted_shortage_min: 28,
    avg_waiting_time: 3.2,
    ev_requests_count: 15,
    ebike_requests_count: 11,
    temperature_c: 25.1,
    power_draw_kw: 24.0,
    sensor_health: "ONLINE",
    swapper_slots_total: 12,
    swapper_slots_operational: 12
  },
  {
    id: "yokohama",
    name: "Yokohama Station",
    name_ja: "横浜西口",
    lat: 35.4658,
    lng: 139.6227,
    capacity: 40,
    available: 17,
    charging: 12,
    reserved: 2,
    in_use: 9,
    active_requests: 12,
    demand_level: "Medium",
    shortage_risk_score: 30,
    shortage_risk_level: "Low",
    predicted_shortage_min: null,
    avg_waiting_time: 3.0,
    ev_requests_count: 8,
    ebike_requests_count: 8,
    temperature_c: 23.5,
    power_draw_kw: 17.5,
    sensor_health: "ONLINE",
    swapper_slots_total: 8,
    swapper_slots_operational: 8
  }
];

export class ClientSimulationEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.isRunning = true;
    this.simSpeed = 1.0;
    this.simSeconds = 8 * 3600 + 42 * 60; // 08:42:00
    this.stations = JSON.parse(JSON.stringify(INITIAL_STATIONS));
    this.activeTransfers = [];
    this.recentRequests = [];
    this.events = [
      {
        id: "evt-init",
        timestamp: "08:42:00",
        type: "INFO",
        message: "SwapSmart Japan simulation initialized for Tokyo Metropolitan Area.",
        severity: "info"
      },
      {
        id: "evt-pred",
        timestamp: "08:42:02",
        type: "PREDICTION",
        message: "AI Shortage Predictor active: Monitoring 6 core mobility nodes.",
        severity: "info"
      }
    ];
    this.recalculatePredictions();
    this.updateRecommendations();
  }

  getTimeString() {
    const hours = Math.floor(this.simSeconds / 3600) % 24;
    const minutes = Math.floor((this.simSeconds % 3600) / 60);
    const secs = Math.floor(this.simSeconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  getDayPeriod() {
    const hours = Math.floor(this.simSeconds / 3600) % 24;
    if (hours >= 7 && hours < 10) return "Morning Rush";
    if (hours >= 10 && hours < 16) return "Midday";
    if (hours >= 16 && hours < 20) return "Evening Rush";
    return "Night";
  }

  addEvent(type, message, stationName = null, severity = "info") {
    const evt = {
      id: "evt-" + Math.random().toString(36).substring(2, 8),
      timestamp: this.getTimeString(),
      type,
      message,
      station_name: stationName,
      severity
    };
    this.events.unshift(evt);
    if (this.events.length > 40) this.events.pop();
  }

  tick(seconds = 5) {
    if (!this.isRunning) return;

    this.simSeconds += seconds * this.simSpeed;
    const period = this.getDayPeriod();

    // 1. Update transfers
    const completed = [];
    this.activeTransfers.forEach(trf => {
      trf.progress_pct = Math.min(100, trf.progress_pct + (seconds * 4.0 * this.simSpeed));
      const t = trf.progress_pct / 100.0;
      trf.current_coords = [
        trf.source_coords[0] + t * (trf.destination_coords[0] - trf.source_coords[0]),
        trf.source_coords[1] + t * (trf.destination_coords[1] - trf.source_coords[1])
      ];
      trf.eta_seconds = Math.max(0, Math.floor((100 - trf.progress_pct) / 4.0));

      if (trf.progress_pct >= 100) {
        completed.push(trf);
      }
    });

    completed.forEach(trf => {
      this.activeTransfers = this.activeTransfers.filter(t => t.id !== trf.id);
      const dest = this.stations.find(s => s.id === trf.destination_id);
      if (dest) {
        dest.available += trf.quantity;
        dest.active_requests = Math.max(0, dest.active_requests - trf.quantity);
        dest.avg_waiting_time = Math.max(2.2, +(dest.avg_waiting_time * 0.45).toFixed(1));
        this.enforceInvariant(dest);
        this.addEvent(
          "OPTIMIZATION",
          `REDISTRIBUTION COMPLETE: ${trf.quantity} batteries docked at ${dest.name}. Shortage resolved!`,
          dest.name,
          "success"
        );
      }
    });

    // 2. Station traffic
    this.stations.forEach(st => {
      const isRush = period.includes("Rush");
      const arrivalChance = isRush ? 0.7 : 0.4;

      if (Math.random() < arrivalChance) {
        const isBike = Math.random() < 0.65;
        const vehicleType = isBike ? "E-Bike" : "EV";
        const wait = +(st.available > 3 ? (1.5 + Math.random() * 2) : (5.0 + Math.random() * 4)).toFixed(1);

        if (isBike) st.ebike_requests_count++;
        else st.ev_requests_count++;

        st.active_requests = Math.min(50, st.active_requests + 1);

        if (st.available > 0) {
          st.available -= 1;
          st.charging = Math.min(st.capacity - st.available - st.reserved, st.charging + 1);
          st.active_requests = Math.max(0, st.active_requests - 1);
          
          if (Math.random() < 0.3) {
            this.addEvent("ALLOCATION", `${vehicleType} battery allocated at ${st.name}. Swapped in 45s.`, st.name, "info");
          }
        } else {
          st.avg_waiting_time = Math.min(14, +(st.avg_waiting_time + 0.3).toFixed(1));
        }

        const req = {
          request_id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
          vehicle_type: vehicleType,
          station_id: st.id,
          station_name: st.name,
          battery_kwh: isBike ? 1.2 : 14.4,
          request_time: this.getTimeString(),
          status: st.available > 0 ? "ALLOCATED" : "QUEUED",
          waiting_time_min: wait
        };
        this.recentRequests.unshift(req);
        if (this.recentRequests.length > 25) this.recentRequests.pop();
      }

      // Charging completion
      if (st.charging > 0 && Math.random() < 0.4) {
        const canRecharge = Math.min(st.charging, st.capacity - st.available - st.reserved);
        if (canRecharge > 0) {
          const count = Math.min(canRecharge, Math.random() < 0.7 ? 1 : 2);
          st.charging -= count;
          st.available += count;
        }
      }

      st.temperature_c = +(23.5 + st.charging * 0.22 + (Math.random() * 0.4 - 0.2)).toFixed(1);
      st.power_draw_kw = +(Math.max(5, st.charging * 1.7 + (Math.random() * 0.6 - 0.3))).toFixed(1);

      this.enforceInvariant(st);
    });

    this.recalculatePredictions();
    this.updateRecommendations();
  }

  enforceInvariant(st) {
    st.available = Math.max(0, st.available);
    st.charging = Math.max(0, st.charging);
    st.reserved = Math.max(0, Math.min(5, st.reserved));
    const cap = st.capacity;
    if (st.available + st.charging + st.reserved > cap) {
      st.available = Math.max(0, cap - st.charging - st.reserved);
    }
    st.in_use = Math.max(0, cap - (st.available + st.charging + st.reserved));
  }

  recalculatePredictions() {
    const period = this.getDayPeriod();
    const periodMultiplier = period === "Morning Rush" ? 1.35 : (period === "Evening Rush" ? 1.5 : 1.0);

    this.stations.forEach(st => {
      const burnRate = (st.active_requests * 0.35 + 0.5) * periodMultiplier;
      const rechargeRate = st.charging * 0.15;
      const netDrain = burnRate - rechargeRate;

      let score, level, predMin;

      if (st.available <= 2 && st.active_requests > 0) {
        score = Math.min(100, 85 + st.active_requests * 2);
        predMin = Math.max(2, Math.floor(st.available * 3));
      } else if (netDrain <= 0.05) {
        const availRatio = st.available / st.capacity;
        score = Math.max(5, Math.floor((1.0 - availRatio) * 25));
        predMin = null;
      } else {
        const stockout = st.available / Math.max(0.1, netDrain);
        predMin = Math.max(3, Math.floor(stockout * 1.6));
        let urgency = 100.0 / (1.0 + (stockout / 10.0));
        if (st.available / st.capacity < 0.2) urgency += 15;
        score = Math.min(100, Math.max(0, Math.floor(urgency)));
      }

      if (score >= 81) level = "Critical";
      else if (score >= 61) level = "High";
      else if (score >= 31) level = "Medium";
      else level = "Low";

      st.shortage_risk_score = score;
      st.shortage_risk_level = level;
      st.predicted_shortage_min = predMin;
    });
  }

  updateRecommendations() {
    const deficits = this.stations.filter(s => s.shortage_risk_score >= 60 || (s.available <= 6 && s.active_requests > 10));
    deficits.sort((a, b) => b.shortage_risk_score - a.shortage_risk_score);

    this.recommendations = [];

    deficits.forEach(def => {
      let bestDonor = null;
      let bestScore = -1;
      let bestQty = 0;
      let bestDist = 0;

      this.stations.forEach(donor => {
        if (donor.id === def.id) return;
        const safeReserve = Math.max(8, Math.floor(donor.capacity * 0.35));
        const surplus = donor.available - safeReserve;
        if (surplus < 4) return;

        // Approx distance in km
        const dist = +((Math.hypot(def.lat - donor.lat, def.lng - donor.lng) * 111).toFixed(1));
        const qty = Math.min(10, surplus);
        const score = (surplus * 2.0) / (dist + 1.5);

        if (score > bestScore) {
          bestScore = score;
          bestDonor = donor;
          bestQty = qty;
          bestDist = dist;
        }
      });

      if (bestDonor && bestQty >= 4) {
        const transitMin = +(bestDist / 0.4 + 4).toFixed(1);
        const beforeWait = def.avg_waiting_time;
        const afterWait = +(Math.max(1.8, beforeWait * 0.38)).toFixed(1);

        this.recommendations.push({
          id: "rec-" + Math.random().toString(36).substring(2, 8),
          source_id: bestDonor.id,
          source_name: bestDonor.name,
          destination_id: def.id,
          destination_name: def.name,
          transfer_quantity: bestQty,
          distance_km: bestDist,
          estimated_transit_min: transitMin,
          reason: `Critical demand (${def.active_requests} reqs) at ${def.name}. ${bestDonor.name} holds ${bestDonor.available} available (${bestQty} surplus transferable).`,
          before_metrics: {
            available_batteries: def.available,
            active_requests: def.active_requests,
            avg_waiting_time_min: beforeWait,
            shortage_risk_score: def.shortage_risk_score,
            shortage_risk_level: def.shortage_risk_level
          },
          after_metrics: {
            available_batteries: def.available + bestQty,
            active_requests: def.active_requests,
            avg_waiting_time_min: afterWait,
            shortage_risk_score: Math.max(16, def.shortage_risk_score - 55),
            shortage_risk_level: "Low",
            waiting_time_reduction_pct: +(((beforeWait - afterWait) / beforeWait) * 100).toFixed(1),
            shortages_avoided: Math.floor(bestQty * 1.2),
            estimated_requests_served: bestQty + 6
          },
          status: "RECOMMENDED"
        });
      }
    });
  }

  triggerSpike(stationId, magnitude = 16) {
    const st = this.stations.find(s => s.id === stationId);
    if (!st) return false;

    st.active_requests += magnitude;
    st.available = Math.max(2, st.available - Math.floor(magnitude * 0.4));
    st.avg_waiting_time = +(st.avg_waiting_time + 4.2).toFixed(1);
    this.enforceInvariant(st);

    this.addEvent("SPIKE", `DEMAND SURGE: +${magnitude} swap requests at ${st.name}! Availability critically low.`, st.name, "warning");
    this.recalculatePredictions();
    this.updateRecommendations();
    return true;
  }

  executeTransfer(recId) {
    const rec = this.recommendations.find(r => r.id === recId) || this.recommendations[0];
    if (!rec) return null;

    const src = this.stations.find(s => s.id === rec.source_id);
    const dst = this.stations.find(s => s.id === rec.destination_id);
    if (!src || !dst) return null;

    const qty = Math.min(rec.transfer_quantity, src.available - 3);
    if (qty <= 0) return null;

    src.available -= qty;
    this.enforceInvariant(src);

    const transfer = {
      id: "TRF-" + Math.floor(100 + Math.random() * 900),
      source_id: src.id,
      source_name: src.name,
      destination_id: dst.id,
      destination_name: dst.name,
      quantity: qty,
      progress_pct: 0,
      source_coords: [src.lat, src.lng],
      destination_coords: [dst.lat, dst.lng],
      current_coords: [src.lat, src.lng],
      eta_seconds: Math.floor(rec.estimated_transit_min * 60)
    };

    this.activeTransfers.push(transfer);
    this.addEvent("OPTIMIZATION", `DISPATCH APPROVED: ${qty} batteries leaving ${src.name} for ${dst.name}.`, src.name, "success");
    this.updateRecommendations();
    return transfer;
  }

  getState() {
    const totalAvail = this.stations.reduce((sum, s) => sum + s.available, 0);
    const totalCharging = this.stations.reduce((sum, s) => sum + s.charging, 0);
    const totalRequests = this.stations.reduce((sum, s) => sum + s.active_requests, 0);
    const avgWait = +(this.stations.reduce((sum, s) => sum + s.avg_waiting_time, 0) / this.stations.length).toFixed(1);
    const shortagesCount = this.stations.filter(s => s.shortage_risk_level === "Critical" || s.shortage_risk_level === "High").length;

    return {
      sim_time: this.getTimeString(),
      sim_day_period: this.getDayPeriod(),
      is_running: this.isRunning,
      sim_speed: this.simSpeed,
      total_stations: this.stations.length,
      total_available_batteries: totalAvail,
      total_active_requests: totalRequests,
      total_charging_batteries: totalCharging,
      network_avg_waiting_time: avgWait,
      predicted_shortages_count: shortagesCount,
      stations: this.stations,
      recent_requests: this.recentRequests,
      active_transfers: this.activeTransfers,
      recommendations: this.recommendations,
      events: this.events
    };
  }
}
