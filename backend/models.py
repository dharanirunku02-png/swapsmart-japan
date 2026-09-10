from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Station(BaseModel):
    id: str
    name: str
    name_ja: str
    lat: float
    lng: float
    capacity: int
    available: int
    charging: int
    reserved: int
    in_use: int
    active_requests: int
    demand_level: str  # "Low", "Medium", "High", "Critical"
    shortage_risk_score: int  # 0 to 100
    shortage_risk_level: str  # "Low", "Medium", "High", "Critical"
    predicted_shortage_min: Optional[int] = None
    avg_waiting_time: float  # in minutes
    ev_requests_count: int = 0
    ebike_requests_count: int = 0
    temperature_c: float = 24.5
    power_draw_kw: float = 16.0
    sensor_health: str = "ONLINE"  # "ONLINE", "WARNING", "OFFLINE"
    swapper_slots_total: int = 8
    swapper_slots_operational: int = 8

class SwapRequest(BaseModel):
    request_id: str
    vehicle_type: str  # "EV" or "E-Bike"
    station_id: str
    station_name: str
    battery_kwh: float
    request_time: str
    status: str  # "ALLOCATED", "PENDING", "COMPLETED"
    waiting_time_min: float

class OptimizationRecommendation(BaseModel):
    id: str
    source_id: str
    source_name: str
    destination_id: str
    destination_name: str
    transfer_quantity: int
    distance_km: float
    estimated_transit_min: float
    reason: str
    before_metrics: Dict[str, Any]
    after_metrics: Dict[str, Any]
    status: str = "RECOMMENDED"  # "RECOMMENDED", "IN_TRANSIT", "COMPLETED"

class ActiveTransfer(BaseModel):
    id: str
    source_id: str
    source_name: str
    destination_id: str
    destination_name: str
    quantity: int
    progress_pct: float
    source_coords: List[float]
    destination_coords: List[float]
    current_coords: List[float]
    eta_seconds: int

class SimulationEvent(BaseModel):
    id: str
    timestamp: str
    type: str  # "REQUEST", "ALLOCATION", "SPIKE", "PREDICTION", "OPTIMIZATION", "TRANSFER", "CHARGED"
    message: str
    station_name: Optional[str] = None
    severity: str = "info"  # "info", "warning", "critical", "success"

class SimulationState(BaseModel):
    sim_time: str
    sim_day_period: str  # "Morning Rush", "Midday", "Evening Rush", "Night"
    is_running: bool
    sim_speed: float  # 1.0, 2.0, 5.0
    total_stations: int
    total_available_batteries: int
    total_active_requests: int
    total_charging_batteries: int
    network_avg_waiting_time: float
    predicted_shortages_count: int
    stations: List[Station]
    recent_requests: List[SwapRequest]
    active_transfers: List[ActiveTransfer]
    recommendations: List[OptimizationRecommendation]
    events: List[SimulationEvent]
