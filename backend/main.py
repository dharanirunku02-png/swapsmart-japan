import asyncio
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from simulation import engine

# Background simulation runner
async def simulation_loop():
    while True:
        try:
            if engine.is_running:
                engine.tick(seconds_advanced=15)
            await asyncio.sleep(2.0)
        except Exception as e:
            print(f"Simulation loop tick error: {e}")
            await asyncio.sleep(2.0)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background simulation task
    task = asyncio.create_task(simulation_loop())
    yield
    task.cancel()

app = FastAPI(
    title="SwapSmart Japan API",
    description="AI-Powered EV & E-Bike Battery Swapping Network Simulation for congested Japanese metro areas.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class SpeedRequest(BaseModel):
    speed: float

class SpikeRequest(BaseModel):
    station_id: str
    magnitude: int = 15

class ExecuteOptimizationRequest(BaseModel):
    recommendation_id: Optional[str] = None

class DemoStepRequest(BaseModel):
    step: int

@app.get("/")
def read_root():
    return {
        "project": "SwapSmart Japan",
        "tagline": "AI-Powered EV & E-Bike Battery Swapping Network",
        "system": "Live Simulation / Synthetic Demo Data",
        "status": "online",
        "sim_time": engine.get_time_string()
    }

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "SwapSmart Japan API"}

@app.get("/api/stations")
def get_stations():
    return list(engine.stations.values())

@app.get("/api/stations/{station_id}")
def get_station(station_id: str):
    station = engine.stations.get(station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    # Return station plus its specific recent requests
    requests = [r for r in engine.recent_requests if r["station_id"] == station_id]
    return {
        "station": station,
        "recent_requests": requests
    }

@app.get("/api/simulation/state")
def get_simulation_state():
    return engine.get_state()

@app.post("/api/simulation/start")
def start_simulation():
    engine.is_running = True
    engine.add_event("INFO", "Simulation resumed by operator.", severity="info")
    return {"status": "started", "is_running": True}

@app.post("/api/simulation/pause")
def pause_simulation():
    engine.is_running = False
    engine.add_event("INFO", "Simulation paused by operator.", severity="info")
    return {"status": "paused", "is_running": False}

@app.post("/api/simulation/reset")
def reset_simulation():
    engine.reset()
    return {"status": "reset", "is_running": True}

@app.post("/api/simulation/speed")
def set_simulation_speed(req: SpeedRequest):
    if req.speed <= 0:
        raise HTTPException(status_code=400, detail="Speed must be positive")
    engine.sim_speed = req.speed
    engine.add_event("INFO", f"Simulation speed adjusted to {req.speed}x", severity="info")
    return {"status": "ok", "speed": engine.sim_speed}

@app.post("/api/simulation/demand-spike")
def trigger_spike(req: SpikeRequest):
    success = engine.trigger_demand_spike(req.station_id, req.magnitude)
    if not success:
        raise HTTPException(status_code=404, detail=f"Station '{req.station_id}' not found")
    return {"status": "ok", "station_id": req.station_id, "magnitude": req.magnitude}

@app.get("/api/predictions")
def get_predictions():
    stations_list = list(engine.stations.values())
    predictions = []
    for s in stations_list:
        predictions.append({
            "station_id": s["id"],
            "station_name": s["name"],
            "station_name_ja": s["name_ja"],
            "available": s["available"],
            "active_requests": s["active_requests"],
            "shortage_risk_score": s["shortage_risk_score"],
            "shortage_risk_level": s["shortage_risk_level"],
            "predicted_shortage_min": s["predicted_shortage_min"]
        })
    return predictions

@app.get("/api/recommendations")
def get_recommendations():
    return engine.recommendations

@app.post("/api/optimization/execute")
def execute_optimization(req: ExecuteOptimizationRequest):
    transfer = engine.execute_recommendation(req.recommendation_id or "")
    if not transfer:
        raise HTTPException(status_code=400, detail="No valid optimization recommendations available to execute.")
    return {"status": "dispatched", "transfer": transfer}

@app.get("/api/analytics")
def get_analytics():
    stations = list(engine.stations.values())
    total_ev = sum(s["ev_requests_count"] for s in stations)
    total_ebike = sum(s["ebike_requests_count"] for s in stations)
    
    station_breakdown = [
        {
            "name": s["name"].replace(" Station", ""),
            "name_ja": s["name_ja"],
            "available": s["available"],
            "charging": s["charging"],
            "in_use": s["in_use"],
            "requests": s["active_requests"],
            "waiting_time": s["avg_waiting_time"],
            "risk_score": s["shortage_risk_score"]
        }
        for s in stations
    ]
    
    return {
        "timestamp": engine.get_time_string(),
        "total_ev_requests": total_ev,
        "total_ebike_requests": total_ebike,
        "station_breakdown": station_breakdown,
        "network_utilization_pct": round(
            (sum(s["in_use"] + s["charging"] for s in stations) / max(1, sum(s["capacity"] for s in stations))) * 100, 1
        )
    }

@app.post("/api/demo/hackathon-step")
def demo_step(req: DemoStepRequest):
    """Executes predefined narrative steps for the Hackathon live pitch."""
    step = req.step
    if step == 1:
        engine.reset()
        engine.add_event("DEMO", "STEP 1: Baseline Tokyo Metropolitan network operation initialized.", severity="info")
    elif step == 2:
        engine.trigger_demand_spike("shibuya", 18)
        engine.add_event("DEMO", "STEP 2 & 3: High morning rush demand surge hits Shibuya. Battery reserves dropping.", station_name="Shibuya Station", severity="warning")
    elif step == 4 or step == 5:
        engine.add_event("DEMO", "STEP 4 & 5: AI Shortage Predictor triggered Critical warning for Shibuya (Depletion in ~8 min).", station_name="Shibuya Station", severity="critical")
    elif step == 6 or step == 7:
        engine._refresh_recommendations()
        engine.add_event("DEMO", "STEP 6 & 7: Optimization Engine recommends dispatching surplus batteries from Shinjuku to Shibuya.", severity="info")
    elif step == 8 or step == 9:
        if engine.recommendations:
            engine.execute_recommendation(engine.recommendations[0]["id"])
        engine.add_event("DEMO", "STEP 8 & 9: Redistribution approved! Live animated transit underway across Tokyo corridor.", severity="success")
    elif step == 10:
        # Complete transfer immediately for presentation finale
        shibuya = engine.stations.get("shibuya")
        if shibuya:
            shibuya["available"] = max(14, shibuya["available"])
            shibuya["avg_waiting_time"] = 2.8
            shibuya["shortage_risk_score"] = 24
            shibuya["shortage_risk_level"] = "Low"
            shibuya["active_requests"] = 6
        engine.active_transfers.clear()
        engine.add_event("DEMO", "STEP 10: Batteries restocked! Shibuya shortage averted, waiting time slashed from 8.2m to 2.8m!", station_name="Shibuya Station", severity="success")
        
    return {"status": "ok", "step": step, "state": engine.get_state()}
