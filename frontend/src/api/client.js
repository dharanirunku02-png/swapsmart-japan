import { ClientSimulationEngine } from '../engine/clientSimulation';

const fallbackEngine = new ClientSimulationEngine();
let isBackendAvailable = null;

export async function checkBackendHealth() {
  try {
    const res = await fetch('/api/health', { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      isBackendAvailable = true;
      return true;
    }
  } catch (err) {
    // backend unreachable
  }
  isBackendAvailable = false;
  return false;
}

export async function fetchSimulationState() {
  if (isBackendAvailable !== false) {
    try {
      const res = await fetch('/api/simulation/state', { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        isBackendAvailable = true;
        const data = await res.json();
        return { data, source: 'backend' };
      }
    } catch (e) {
      isBackendAvailable = false;
    }
  }
  
  // Fallback to client engine
  return { data: fallbackEngine.getState(), source: 'client' };
}

export async function postStartSimulation() {
  if (isBackendAvailable) {
    try {
      const res = await fetch('/api/simulation/start', { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      isBackendAvailable = false;
    }
  }
  fallbackEngine.isRunning = true;
  fallbackEngine.addEvent("INFO", "Simulation started in local engine.");
  return { status: "started" };
}

export async function postPauseSimulation() {
  if (isBackendAvailable) {
    try {
      const res = await fetch('/api/simulation/pause', { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      isBackendAvailable = false;
    }
  }
  fallbackEngine.isRunning = false;
  fallbackEngine.addEvent("INFO", "Simulation paused.");
  return { status: "paused" };
}

export async function postResetSimulation() {
  if (isBackendAvailable) {
    try {
      const res = await fetch('/api/simulation/reset', { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      isBackendAvailable = false;
    }
  }
  fallbackEngine.reset();
  return { status: "reset" };
}

export async function postSetSpeed(speed) {
  if (isBackendAvailable) {
    try {
      const res = await fetch('/api/simulation/speed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speed })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      isBackendAvailable = false;
    }
  }
  fallbackEngine.simSpeed = speed;
  return { status: "ok", speed };
}

export async function postTriggerSpike(stationId, magnitude = 16) {
  if (isBackendAvailable) {
    try {
      const res = await fetch('/api/simulation/demand-spike', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ station_id: stationId, magnitude })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      isBackendAvailable = false;
    }
  }
  fallbackEngine.triggerSpike(stationId, magnitude);
  return { status: "ok", station_id: stationId };
}

export async function postExecuteOptimization(recommendationId) {
  if (isBackendAvailable) {
    try {
      const res = await fetch('/api/optimization/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendation_id: recommendationId })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      isBackendAvailable = false;
    }
  }
  const transfer = fallbackEngine.executeTransfer(recommendationId);
  return { status: "dispatched", transfer };
}

export { fallbackEngine };
