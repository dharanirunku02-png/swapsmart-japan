import time
import uuid
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from models import Station, SwapRequest, ActiveTransfer, SimulationEvent, SimulationState, OptimizationRecommendation
from prediction import calculate_shortage_risk
from optimizer import generate_redistribution_recommendations, haversine_distance_km

INITIAL_STATIONS_DATA = [
    {
        "id": "shibuya",
        "name": "Shibuya Station",
        "name_ja": "渋谷駅前",
        "lat": 35.6580,
        "lng": 139.7016,
        "capacity": 45,
        "available": 8,
        "charging": 14,
        "reserved": 3,
        "in_use": 20,
        "active_requests": 28,
        "demand_level": "High",
        "avg_waiting_time": 6.8,
        "ev_requests_count": 12,
        "ebike_requests_count": 16,
        "temperature_c": 26.2,
        "power_draw_kw": 28.5,
        "sensor_health": "ONLINE",
        "swapper_slots_total": 10,
        "swapper_slots_operational": 10
    },
    {
        "id": "shinjuku",
        "name": "Shinjuku Station",
        "name_ja": "新宿西口",
        "lat": 35.6909,
        "lng": 139.7003,
        "capacity": 50,
        "available": 28,
        "charging": 12,
        "reserved": 2,
        "in_use": 8,
        "active_requests": 9,
        "demand_level": "Low",
        "avg_waiting_time": 2.1,
        "ev_requests_count": 5,
        "ebike_requests_count": 4,
        "temperature_c": 23.8,
        "power_draw_kw": 18.0,
        "sensor_health": "ONLINE",
        "swapper_slots_total": 12,
        "swapper_slots_operational": 12
    },
    {
        "id": "akihabara",
        "name": "Akihabara Station",
        "name_ja": "秋葉原電気街",
        "lat": 35.6983,
        "lng": 139.7731,
        "capacity": 35,
        "available": 14,
        "charging": 10,
        "reserved": 2,
        "in_use": 9,
        "active_requests": 14,
        "demand_level": "Medium",
        "avg_waiting_time": 3.6,
        "ev_requests_count": 4,
        "ebike_requests_count": 10,
        "temperature_c": 24.1,
        "power_draw_kw": 16.4,
        "sensor_health": "ONLINE",
        "swapper_slots_total": 8,
        "swapper_slots_operational": 8
    },
    {
        "id": "shinagawa",
        "name": "Shinagawa Station",
        "name_ja": "品川港南口",
        "lat": 35.6284,
        "lng": 139.7387,
        "capacity": 40,
        "available": 19,
        "charging": 11,
        "reserved": 2,
        "in_use": 8,
        "active_requests": 11,
        "demand_level": "Medium",
        "avg_waiting_time": 2.8,
        "ev_requests_count": 7,
        "ebike_requests_count": 4,
        "temperature_c": 24.9,
        "power_draw_kw": 19.2,
        "sensor_health": "ONLINE",
        "swapper_slots_total": 8,
        "swapper_slots_operational": 8
    },
    {
        "id": "tokyo_stn",
        "name": "Tokyo Station",
        "name_ja": "東京丸の内",
        "lat": 35.6812,
        "lng": 139.7671,
        "capacity": 55,
        "available": 24,
        "charging": 16,
        "reserved": 3,
        "in_use": 12,
        "active_requests": 18,
        "demand_level": "Medium",
        "avg_waiting_time": 3.2,
        "ev_requests_count": 11,
        "ebike_requests_count": 7,
        "temperature_c": 25.1,
        "power_draw_kw": 24.0,
        "sensor_health": "ONLINE",
        "swapper_slots_total": 12,
        "swapper_slots_operational": 12
    },
    {
        "id": "yokohama",
        "name": "Yokohama Station",
        "name_ja": "横浜西口",
        "lat": 35.4658,
        "lng": 139.6227,
        "capacity": 40,
        "available": 17,
        "charging": 12,
        "reserved": 2,
        "in_use": 9,
        "active_requests": 12,
        "demand_level": "Medium",
        "avg_waiting_time": 3.0,
        "ev_requests_count": 6,
        "ebike_requests_count": 6,
        "temperature_c": 23.5,
        "power_draw_kw": 17.5,
        "sensor_health": "ONLINE",
        "swapper_slots_total": 8,
        "swapper_slots_operational": 8
    }
]

class SimulationEngine:
    def __init__(self):
        self.reset()

    def reset(self):
        self.is_running = True
        self.sim_speed = 1.0
        self.sim_clock = datetime(2026, 9, 11, 8, 42, 0)  # Hackathon date / morning rush
        self.sim_day_period = "Morning Rush"
        self.stations: Dict[str, Dict[str, Any]] = {}
        
        for data in INITIAL_STATIONS_DATA:
            st = dict(data)
            score, level, pred_min = calculate_shortage_risk(st, self.sim_day_period)
            st["shortage_risk_score"] = score
            st["shortage_risk_level"] = level
            st["predicted_shortage_min"] = pred_min
            # Ensure capacity invariant
            self._enforce_capacity_invariant(st)
            self.stations[st["id"]] = st
            
        self.recent_requests: List[Dict[str, Any]] = []
        self.active_transfers: List[Dict[str, Any]] = []
        self.recommendations: List[Dict[str, Any]] = []
        self.events: List[Dict[str, Any]] = []
        
        # Initial event logs
        self.add_event(
            "INFO", 
            "SwapSmart Japan Simulation Engine initialized for Tokyo Metropolitan Area.", 
            severity="info"
        )
        self.add_event(
            "PREDICTION", 
            "AI Shortage Predictor online: Monitoring 6 core mobility nodes.", 
            severity="info"
        )
        self._refresh_recommendations()

    def _enforce_capacity_invariant(self, station: Dict[str, Any]):
        """Ensures available + charging + reserved + in_use == capacity and all >= 0."""
        cap = station["capacity"]
        station["available"] = max(0, station["available"])
        station["charging"] = max(0, station["charging"])
        station["reserved"] = max(0, min(5, station["reserved"]))
        
        assigned = station["available"] + station["charging"] + station["reserved"]
        if assigned > cap:
            # Scale back available or charging
            station["available"] = max(0, cap - station["charging"] - station["reserved"])
        station["in_use"] = max(0, cap - (station["available"] + station["charging"] + station["reserved"]))

    def get_time_string(self) -> str:
        return self.sim_clock.strftime("%H:%M:%S")

    def add_event(self, event_type: str, message: str, station_name: Optional[str] = None, severity: str = "info"):
        event = {
            "id": str(uuid.uuid4())[:8],
            "timestamp": self.get_time_string(),
            "type": event_type,
            "message": message,
            "station_name": station_name,
            "severity": severity
        }
        self.events.insert(0, event)
        if len(self.events) > 50:
            self.events.pop()

    def tick(self, seconds_advanced: int = 15):
        """Advances the simulation by simulated seconds."""
        if not self.is_running:
            return

        effective_advance = int(seconds_advanced * self.sim_speed)
        self.sim_clock += timedelta(seconds=effective_advance)
        
        # Update period
        hour = self.sim_clock.hour
        if 7 <= hour < 10:
            self.sim_day_period = "Morning Rush"
        elif 10 <= hour < 16:
            self.sim_day_period = "Midday"
        elif 16 <= hour < 20:
            self.sim_day_period = "Evening Rush"
        else:
            self.sim_day_period = "Night"

        # 1. Update in-flight battery transfers
        self._update_transfers(effective_advance)

        # 2. Simulate user arrivals, swaps, charging
        for st_id, st in self.stations.items():
            self._simulate_station_tick(st)

        # 3. Recalculate AI predictions
        for st in self.stations.values():
            score, level, pred_min = calculate_shortage_risk(st, self.sim_day_period)
            prev_level = st.get("shortage_risk_level")
            st["shortage_risk_score"] = score
            st["shortage_risk_level"] = level
            st["predicted_shortage_min"] = pred_min

            # If risk transitioned to Critical, log alert
            if prev_level != "Critical" and level == "Critical":
                self.add_event(
                    "PREDICTION", 
                    f"CRITICAL SHORTAGE RISK at {st['name']}: {st['available']} batteries remaining. Depletion in ~{pred_min or 5} min.", 
                    station_name=st["name"], 
                    severity="critical"
                )

        # 4. Refresh optimization recommendations
        self._refresh_recommendations()

    def _simulate_station_tick(self, st: Dict[str, Any]):
        """Runs random yet realistic traffic arrivals and charging transitions."""
        # Demand probability based on time period
        period_prob = {
            "Morning Rush": 0.75,
            "Midday": 0.45,
            "Evening Rush": 0.85,
            "Night": 0.25
        }.get(self.sim_day_period, 0.5)

        # Higher activity for Shibuya and Tokyo Station
        if st["id"] in ["shibuya", "tokyo_stn"]:
            period_prob += 0.15

        # Vehicle arrival
        if random.random() < period_prob:
            vehicle_type = "E-Bike" if random.random() < 0.65 else "EV"
            battery_kwh = 1.2 if vehicle_type == "E-Bike" else 14.4
            
            # Create swap request
            req_id = f"REQ-{random.randint(1000, 9999)}"
            wait_time = round(random.uniform(1.2, 3.5) if st["available"] > 3 else random.uniform(5.0, 9.5), 1)
            
            if vehicle_type == "E-Bike":
                st["ebike_requests_count"] += 1
            else:
                st["ev_requests_count"] += 1
                
            st["active_requests"] = min(50, st["active_requests"] + 1)
            
            # Perform swap if battery available
            if st["available"] > 0:
                st["available"] -= 1
                # Returned depleted battery enters charging
                st["charging"] = min(st["capacity"] - st["available"] - st["reserved"], st["charging"] + 1)
                st["active_requests"] = max(0, st["active_requests"] - 1)
                status = "ALLOCATED"
                
                # Small chance of event log to keep feed clean
                if random.random() < 0.35:
                    self.add_event(
                        "ALLOCATION", 
                        f"{vehicle_type} battery allocated at {st['name']}. Swapped in 45s.", 
                        station_name=st["name"], 
                        severity="info"
                    )
            else:
                status = "QUEUED"
                st["avg_waiting_time"] = min(15.0, round(st["avg_waiting_time"] + 0.4, 1))

            req = {
                "request_id": req_id,
                "vehicle_type": vehicle_type,
                "station_id": st["id"],
                "station_name": st["name"],
                "battery_kwh": battery_kwh,
                "request_time": self.get_time_string(),
                "status": status,
                "waiting_time_min": wait_time
            }
            self.recent_requests.insert(0, req)
            if len(self.recent_requests) > 30:
                self.recent_requests.pop()

        # Charging battery completion (Charging -> Available)
        if st["charging"] > 0 and random.random() < 0.65:
            charged_count = random.choice([1, 2, 3])
            charged_count = min(charged_count, st["charging"])
            
            # Check capacity space
            room = st["capacity"] - (st["available"] + st["reserved"])
            if room > 0:
                actual_recharged = min(charged_count, room)
                st["charging"] -= actual_recharged
                st["available"] += actual_recharged
                
                if random.random() < 0.20:
                    self.add_event(
                        "CHARGED",
                        f"{actual_recharged} battery cell(s) fully charged at {st['name']}.",
                        station_name=st["name"],
                        severity="info"
                    )

        # Dynamic waiting time adjustment
        if st["available"] > 10:
            st["avg_waiting_time"] = max(1.8, round(st["avg_waiting_time"] * 0.95, 1))
        elif st["available"] <= 3:
            st["avg_waiting_time"] = min(14.0, round(st["avg_waiting_time"] + 0.3, 1))

        # Sensor telemetry variations
        st["temperature_c"] = round(23.0 + (st["charging"] * 0.25) + random.uniform(-0.3, 0.3), 1)
        st["power_draw_kw"] = round(max(4.0, st["charging"] * 1.8 + random.uniform(-0.5, 0.5)), 1)
        
        # Enforce invariant
        self._enforce_capacity_invariant(st)

    def _update_transfers(self, delta_seconds: int):
        """Updates in-flight redistribution logistics."""
        completed_transfers = []
        for transfer in self.active_transfers:
            # Transit takes approx 15-20 simulation seconds for demo responsiveness
            transfer["progress_pct"] = min(100.0, transfer["progress_pct"] + (delta_seconds * 3.5))
            
            # Interpolate coordinates for visual map animation
            t = transfer["progress_pct"] / 100.0
            src_lat, src_lng = transfer["source_coords"]
            dst_lat, dst_lng = transfer["destination_coords"]
            curr_lat = round(src_lat + t * (dst_lat - src_lat), 5)
            curr_lng = round(src_lng + t * (dst_lng - src_lng), 5)
            transfer["current_coords"] = [curr_lat, curr_lng]
            transfer["eta_seconds"] = max(0, int((100.0 - transfer["progress_pct"]) / 3.5))

            if transfer["progress_pct"] >= 100.0:
                completed_transfers.append(transfer)

        for comp in completed_transfers:
            self.active_transfers.remove(comp)
            # Batteries safely arrive at destination
            dest_st = self.stations.get(comp["destination_id"])
            if dest_st:
                qty = comp["quantity"]
                dest_st["available"] += qty
                dest_st["active_requests"] = max(0, dest_st["active_requests"] - qty)
                dest_st["avg_waiting_time"] = max(2.2, round(dest_st["avg_waiting_time"] * 0.45, 1))
                self._enforce_capacity_invariant(dest_st)
                
                self.add_event(
                    "OPTIMIZATION", 
                    f"REDISTRIBUTION COMPLETE: {qty} batteries docked at {dest_st['name']}. Shortage resolved, waiting time reduced!", 
                    station_name=dest_st["name"], 
                    severity="success"
                )

    def _refresh_recommendations(self):
        stations_list = list(self.stations.values())
        self.recommendations = generate_redistribution_recommendations(stations_list)

    def trigger_demand_spike(self, station_id: str, spike_magnitude: int = 15):
        """Simulates a sudden surge of EV/e-bike requests at a station."""
        st = self.stations.get(station_id)
        if not st:
            return False

        st["active_requests"] += spike_magnitude
        st["available"] = max(2, st["available"] - int(spike_magnitude * 0.4))
        st["avg_waiting_time"] = round(st["avg_waiting_time"] + 3.8, 1)
        self._enforce_capacity_invariant(st)

        self.add_event(
            "SPIKE", 
            f"DEMAND SURGE DETECTED: Sudden +{spike_magnitude} swap requests at {st['name']}. Available units dropping rapidly.", 
            station_name=st["name"], 
            severity="warning"
        )
        
        # Trigger immediate risk update and recommendations
        score, level, pred_min = calculate_shortage_risk(st, self.sim_day_period)
        st["shortage_risk_score"] = score
        st["shortage_risk_level"] = level
        st["predicted_shortage_min"] = pred_min
        
        self.add_event(
            "PREDICTION", 
            f"AI WARNING: {st['name']} Shortage Risk elevated to {level.upper()} (Score: {score}). Stockout predicted in ~{pred_min or 8} min.", 
            station_name=st["name"], 
            severity="critical"
        )
        
        self._refresh_recommendations()
        return True

    def execute_recommendation(self, recommendation_id: str) -> Optional[Dict[str, Any]]:
        """Executes a recommended battery redistribution transfer."""
        rec = next((r for r in self.recommendations if r["id"] == recommendation_id), None)
        if not rec:
            # Fallback: if list is empty or id not matched, pick first recommendation
            if self.recommendations:
                rec = self.recommendations[0]
            else:
                return None

        src = self.stations.get(rec["source_id"])
        dst = self.stations.get(rec["destination_id"])
        if not src or not dst:
            return None

        qty = rec["transfer_quantity"]
        if src["available"] < qty:
            qty = max(1, src["available"] - 4)
            if qty <= 0:
                return None

        # Source available decreases atomically
        src["available"] -= qty
        self._enforce_capacity_invariant(src)

        transfer_record = {
            "id": f"TRF-{random.randint(100, 999)}",
            "source_id": src["id"],
            "source_name": src["name"],
            "destination_id": dst["id"],
            "destination_name": dst["name"],
            "quantity": qty,
            "progress_pct": 0.0,
            "source_coords": [src["lat"], src["lng"]],
            "destination_coords": [dst["lat"], dst["lng"]],
            "current_coords": [src["lat"], src["lng"]],
            "eta_seconds": int(rec["estimated_transit_min"] * 60)
        }
        self.active_transfers.append(transfer_record)

        self.add_event(
            "OPTIMIZATION", 
            f"DISPATCH APPROVED: Transfer of {qty} batteries from {src['name']} to {dst['name']} is now in transit.", 
            station_name=src["name"], 
            severity="success"
        )

        self._refresh_recommendations()
        return transfer_record

    def get_state(self) -> Dict[str, Any]:
        stations_list = list(self.stations.values())
        tot_avail = sum(s["available"] for s in stations_list)
        tot_charging = sum(s["charging"] for s in stations_list)
        tot_requests = sum(s["active_requests"] for s in stations_list)
        avg_wait = round(sum(s["avg_waiting_time"] for s in stations_list) / max(1, len(stations_list)), 1)
        critical_count = sum(1 for s in stations_list if s["shortage_risk_level"] in ["Critical", "High"])

        return {
            "sim_time": self.get_time_string(),
            "sim_day_period": self.sim_day_period,
            "is_running": self.is_running,
            "sim_speed": self.sim_speed,
            "total_stations": len(stations_list),
            "total_available_batteries": tot_avail,
            "total_active_requests": tot_requests,
            "total_charging_batteries": tot_charging,
            "network_avg_waiting_time": avg_wait,
            "predicted_shortages_count": critical_count,
            "stations": stations_list,
            "recent_requests": self.recent_requests[:20],
            "active_transfers": self.active_transfers,
            "recommendations": self.recommendations,
            "events": self.events[:35]
        }

# Global singleton engine instance
engine = SimulationEngine()
