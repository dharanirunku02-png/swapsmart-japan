from typing import Dict, Any, Tuple, Optional

PERIOD_WEIGHTS = {
    "Morning Rush": 1.35,
    "Midday": 1.0,
    "Evening Rush": 1.5,
    "Night": 0.65
}

def calculate_shortage_risk(station: Dict[str, Any], sim_period: str = "Morning Rush") -> Tuple[int, str, Optional[int]]:
    """
    Intelligent Shortage Prediction Module.
    Calculates Shortage Risk Score (0-100), Risk Level, and estimated minutes to stockout.
    
    Factors considered:
    - Available batteries
    - Station capacity
    - Active pending swap requests
    - Batteries currently charging & recharge recovery rate
    - Time-of-day demand multiplier (Tokyo rush hours)
    """
    available = station.get("available", 0)
    capacity = max(1, station.get("capacity", 40))
    active_requests = station.get("active_requests", 0)
    charging = station.get("charging", 0)
    
    period_multiplier = PERIOD_WEIGHTS.get(sim_period, 1.0)
    
    # Net battery drain velocity (swaps per minute)
    # Each active request increases burn rate; charging replenishes
    burn_rate = (active_requests * 0.35 + 0.5) * period_multiplier
    replenish_rate = charging * 0.15
    net_drain = burn_rate - replenish_rate
    
    if available <= 2 and active_requests > 0:
        # Imminent exhaustion
        score = min(100, 85 + (active_requests * 2))
        predicted_min = max(2, int(available * 3))
    elif net_drain <= 0.05:
        # Safe or charging is faster than consumption
        availability_ratio = available / capacity
        score = max(5, int((1.0 - availability_ratio) * 25))
        predicted_min = None
    else:
        time_to_stockout = available / max(0.1, net_drain)
        predicted_min = max(3, int(time_to_stockout * 1.6))
        
        # Sigmoid-like urgency mapping
        urgency = 100.0 / (1.0 + (time_to_stockout / 10.0))
        # Add slight penalty if available < 20% of capacity
        if (available / capacity) < 0.20:
            urgency += 15.0
            
        score = min(100, max(0, int(urgency)))

    # Classification into Low / Medium / High / Critical
    if score >= 81:
        level = "Critical"
    elif score >= 61:
        level = "High"
    elif score >= 31:
        level = "Medium"
    else:
        level = "Low"
        
    return score, level, predicted_min
