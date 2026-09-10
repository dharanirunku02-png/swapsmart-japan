import math
import uuid
from typing import List, Dict, Any, Optional

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two geographic coordinates in kilometers."""
    R = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

def generate_redistribution_recommendations(stations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Evaluates battery network state across Tokyo and generates optimal redistribution recommendations.
    
    1. Identifies deficit stations (Critical / High shortage risk).
    2. Identifies candidate donor stations with surplus batteries.
    3. Considers geographic distance, donor demand, and transport logistics.
    4. Computes Before vs After optimization metrics.
    """
    recommendations = []
    
    # Identify deficit stations (risk score >= 60 or available <= 6 with active requests)
    deficit_stations = [
        s for s in stations 
        if s.get("shortage_risk_score", 0) >= 60 or (s.get("available", 0) <= 6 and s.get("active_requests", 0) > 10)
    ]
    
    # Sort deficit stations by urgency (highest risk score first)
    deficit_stations.sort(key=lambda s: s.get("shortage_risk_score", 0), reverse=True)
    
    for deficit in deficit_stations:
        dest_id = deficit["id"]
        dest_avail = deficit["available"]
        dest_reqs = deficit["active_requests"]
        dest_cap = deficit["capacity"]
        
        # Desired transfer quantity to restore healthy buffer
        needed = min(15, max(6, int((dest_cap * 0.35) - dest_avail + (dest_reqs * 0.2))))
        
        best_donor = None
        best_score = -1.0
        best_dist = 0.0
        best_transfer_qty = 0
        
        for donor in stations:
            if donor["id"] == dest_id:
                continue
            
            # Donor must have surplus above a reasonable reserve (e.g. at least 20% of capacity or 5 batteries)
            donor_safe_reserve = max(5, int(donor["capacity"] * 0.20))
            donor_surplus = donor["available"] - donor_safe_reserve
            
            if donor_surplus < 2:
                continue  # not enough batteries to spare
                
            dist_km = haversine_distance_km(deficit["lat"], deficit["lng"], donor["lat"], donor["lng"])
            
            # Transfer quantity capped by donor surplus and target need
            transfer_qty = min(needed, max(3, donor_surplus))
            if transfer_qty > donor["available"] - 2:
                transfer_qty = max(2, donor["available"] - 2)
            if transfer_qty < 2:
                continue
                
            # Donor suitability score: rewards surplus, penalizes distance & donor risk
            donor_risk = donor.get("shortage_risk_score", 0)
            score = (donor_surplus * 2.0) / (dist_km + 1.5) * (1.0 - (donor_risk / 150.0))
            
            if score > best_score:
                best_score = score
                best_donor = donor
                best_dist = dist_km
                best_transfer_qty = transfer_qty
                
        if best_donor and best_transfer_qty > 0:
            # Transit speed in Tokyo metro ~25 km/h + 5 min dispatch/docking
            transit_time_min = round((best_dist / 25.0) * 60.0 + 4.0, 1)
            
            # Compute Before and After metrics
            before_waiting = round(deficit.get("avg_waiting_time", 7.5), 1)
            # Optimization reduces queue congestion significantly
            wait_reduction_factor = min(0.65, (best_transfer_qty / max(1, dest_reqs)) * 1.5 + 0.45)
            after_waiting = round(max(1.8, before_waiting * (1.0 - wait_reduction_factor)), 1)
            
            rec = {
                "id": str(uuid.uuid4())[:8],
                "source_id": best_donor["id"],
                "source_name": best_donor["name"],
                "destination_id": deficit["id"],
                "destination_name": deficit["name"],
                "transfer_quantity": best_transfer_qty,
                "distance_km": best_dist,
                "estimated_transit_min": transit_time_min,
                "reason": f"High swap demand ({dest_reqs} requests) at {deficit['name']} against low inventory ({dest_avail} avail). {best_donor['name']} has {best_donor['available']} batteries with {donor_surplus} surplus.",
                "before_metrics": {
                    "available_batteries": dest_avail,
                    "active_requests": dest_reqs,
                    "avg_waiting_time_min": before_waiting,
                    "shortage_risk_score": deficit.get("shortage_risk_score", 85),
                    "shortage_risk_level": deficit.get("shortage_risk_level", "Critical")
                },
                "after_metrics": {
                    "available_batteries": dest_avail + best_transfer_qty,
                    "active_requests": dest_reqs,
                    "avg_waiting_time_min": after_waiting,
                    "shortage_risk_score": max(15, deficit.get("shortage_risk_score", 85) - 55),
                    "shortage_risk_level": "Low" if (dest_avail + best_transfer_qty) >= 12 else "Medium",
                    "waiting_time_reduction_pct": round(((before_waiting - after_waiting) / max(0.1, before_waiting)) * 100, 1),
                    "shortages_avoided": max(1, int(best_transfer_qty * 1.2)),
                    "estimated_requests_served": best_transfer_qty + 5
                },
                "status": "RECOMMENDED"
            }
            recommendations.append(rec)
            
    return recommendations
