import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ControlsBar from './components/ControlsBar';
import KpiCards from './components/KpiCards';
import TokyoMap from './components/TokyoMap';
import StationTable from './components/StationTable';
import PredictionPanel from './components/PredictionPanel';
import OptimizationPanel from './components/OptimizationPanel';
import LiveEventsFeed from './components/LiveEventsFeed';
import StationDetailModal from './components/StationDetailModal';
import AnalyticsSection from './components/AnalyticsSection';
import HackathonDemoBar, { DEMO_STEPS } from './components/HackathonDemoBar';

import {
  fetchSimulationState,
  postStartSimulation,
  postPauseSimulation,
  postResetSimulation,
  postSetSpeed,
  postTriggerSpike,
  postExecuteOptimization,
  fallbackEngine
} from './api/client';

export default function App() {
  const [state, setState] = useState(fallbackEngine.getState());
  const [dataSource, setDataSource] = useState('checking...');
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [vehicleFilter, setVehicleFilter] = useState('ALL');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(1);
  const [isTransferring, setIsTransferring] = useState(false);

  const demoTimerRef = useRef(null);

  // Polling loop for simulation updates (every 1.5s)
  useEffect(() => {
    let mounted = true;

    const interval = setInterval(async () => {
      // If local engine is ticking
      if (dataSource === 'client' && state.is_running) {
        fallbackEngine.tick(3);
      }

      try {
        const { data, source } = await fetchSimulationState();
        if (mounted) {
          setState(data);
          setDataSource(source);
          if (data.active_transfers && data.active_transfers.length > 0) {
            setIsTransferring(true);
          } else {
            setIsTransferring(false);
          }
        }
      } catch (err) {
        if (mounted) {
          fallbackEngine.tick(3);
          setState(fallbackEngine.getState());
          setDataSource('client');
        }
      }
    }, 1500);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [dataSource, state?.is_running]);

  // Handle Play/Pause
  const handleTogglePlay = async () => {
    if (state.is_running) {
      await postPauseSimulation();
    } else {
      await postStartSimulation();
    }
    const { data } = await fetchSimulationState();
    setState(data);
  };

  // Handle Reset
  const handleReset = async () => {
    if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    setIsDemoMode(false);
    setDemoStep(1);
    await postResetSimulation();
    const { data } = await fetchSimulationState();
    setState(data);
  };

  // Handle Speed Change
  const handleSetSpeed = async (speed) => {
    await postSetSpeed(speed);
    const { data } = await fetchSimulationState();
    setState(data);
  };

  // Handle Trigger Demand Spike
  const handleTriggerSpike = async (stationId, magnitude = 16) => {
    await postTriggerSpike(stationId, magnitude);
    const { data } = await fetchSimulationState();
    setState(data);
  };

  // Handle Execute Optimization
  const handleExecuteOptimization = async (recId) => {
    setIsTransferring(true);
    await postExecuteOptimization(recId);
    const { data } = await fetchSimulationState();
    setState(data);
  };

  // 10-Step Hackathon Demo Mode Runner
  const handleRunDemo = () => {
    setIsDemoMode(true);
    setDemoStep(1);
    executeDemoStep(1);
  };

  const executeDemoStep = async (step) => {
    if (step === 1) {
      await postResetSimulation();
      fallbackEngine.addEvent("DEMO", "STEP 1: Normal Tokyo network operations baseline.", "Shibuya Station", "info");
    } else if (step === 2) {
      await postTriggerSpike("shibuya", 16);
      fallbackEngine.addEvent("DEMO", "STEP 2: Morning rush surge triggered at Shibuya Station.", "Shibuya Station", "warning");
    } else if (step === 3) {
      await postTriggerSpike("shibuya", 6);
      fallbackEngine.addEvent("DEMO", "STEP 3: Battery reserves at Shibuya decrease rapidly.", "Shibuya Station", "warning");
    } else if (step === 4 || step === 5) {
      fallbackEngine.addEvent("DEMO", "STEP 4 & 5: AI Shortage Predictor triggered: Imminent stockout forecasted in ~7 min.", "Shibuya Station", "critical");
    } else if (step === 6 || step === 7) {
      fallbackEngine.addEvent("DEMO", "STEP 6 & 7: Optimization Engine scans network: Shinjuku selected as optimal donor (surplus: 22 units).", "Shinjuku Station", "info");
    } else if (step === 8 || step === 9) {
      if (state.recommendations && state.recommendations.length > 0) {
        await postExecuteOptimization(state.recommendations[0].id);
      } else {
        await postExecuteOptimization(null);
      }
      fallbackEngine.addEvent("DEMO", "STEP 8 & 9: Transfer dispatched! Animated transit vehicle traveling along Tokyo corridor.", "Shinjuku Station", "success");
    } else if (step === 10) {
      const shibuya = fallbackEngine.stations.find(s => s.id === 'shibuya');
      if (shibuya) {
        shibuya.available = Math.max(16, shibuya.available);
        shibuya.avg_waiting_time = 2.9;
        shibuya.shortage_risk_score = 22;
        shibuya.shortage_risk_level = "Low";
        shibuya.predicted_shortage_min = null;
        shibuya.active_requests = 8;
      }
      fallbackEngine.activeTransfers = [];
      fallbackEngine.addEvent("DEMO", "STEP 10: Batteries restocked at Shibuya! Waiting time slashed by 65%, shortage resolved!", "Shibuya Station", "success");
    }

    const { data } = await fetchSimulationState();
    setState(data);
  };

  const handleNextDemoStep = () => {
    if (demoStep < 10) {
      const next = demoStep + 1;
      setDemoStep(next);
      executeDemoStep(next);
    } else {
      setIsDemoMode(false);
    }
  };

  const handleStopDemo = () => {
    setIsDemoMode(false);
  };

  // Filter stations if vehicle filter is applied
  const filteredStations = state?.stations || [];
  const selectedStation = state?.stations?.find(s => s.id === selectedStationId);

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Header */}
      <Header
        state={state}
        dataSource={dataSource}
        onReset={handleReset}
      />

      {/* 2. Hackathon Demo Mode Guided Bar (if active) */}
      {isDemoMode && (
        <HackathonDemoBar
          currentStep={demoStep}
          totalSteps={10}
          onNext={handleNextDemoStep}
          onStop={handleStopDemo}
        />
      )}

      {/* 3. Controls Bar */}
      <ControlsBar
        isRunning={state?.is_running}
        simSpeed={state?.sim_speed}
        onTogglePlay={handleTogglePlay}
        onReset={handleReset}
        onSetSpeed={handleSetSpeed}
        onTriggerSpike={handleTriggerSpike}
        onRunDemo={handleRunDemo}
        onOptimize={() => handleExecuteOptimization(state?.recommendations?.[0]?.id)}
        hasRecommendations={state?.recommendations?.length > 0}
        vehicleFilter={vehicleFilter}
        onSetVehicleFilter={setVehicleFilter}
        stations={state?.stations || []}
      />

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* KPI Cards Row */}
        <section>
          <KpiCards state={state} />
        </section>

        {/* Live Japan Map & AI Prediction Panel */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map (7 cols) */}
          <div className="lg:col-span-7">
            <TokyoMap
              stations={filteredStations}
              activeTransfers={state?.active_transfers || []}
              onSelectStation={setSelectedStationId}
              selectedStationId={selectedStationId}
            />
          </div>

          {/* AI Prediction & Quick Threat Assessment (5 cols) */}
          <div className="lg:col-span-5">
            <PredictionPanel
              stations={filteredStations}
              simPeriod={state?.sim_day_period}
            />
          </div>
        </section>

        {/* Station Table */}
        <section>
          <StationTable
            stations={filteredStations}
            onSelectStation={setSelectedStationId}
            onTriggerSpike={handleTriggerSpike}
            selectedStationId={selectedStationId}
          />
        </section>

        {/* Optimization Engine & Live Events Stream */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Optimization & Before/After Card (7 cols) */}
          <div className="lg:col-span-7">
            <OptimizationPanel
              recommendations={state?.recommendations || []}
              onExecuteOptimization={handleExecuteOptimization}
              isTransferring={isTransferring}
            />
          </div>

          {/* Live Activity Feed (5 cols) */}
          <div className="lg:col-span-5">
            <LiveEventsFeed
              events={state?.events || []}
            />
          </div>
        </section>

        {/* Analytics & Performance Charts */}
        <section className="pt-2">
          <AnalyticsSection
            stations={filteredStations}
          />
        </section>
      </main>

      {/* Station IoT Telemetry Modal */}
      {selectedStation && (
        <StationDetailModal
          station={selectedStation}
          onClose={() => setSelectedStationId(null)}
          onTriggerSpike={handleTriggerSpike}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0d131f] py-6 px-4 lg:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-slate-300 font-bold">SwapSmart Japan</span> — AI-Powered EV & E-Bike Battery Swapping Network
            <p className="text-[11px] text-slate-400 mt-0.5">
              Developed for India–Japan Hackathon 2026 • Tokyo Metropolitan Area Mobility Corridor Simulation
            </p>
          </div>
          <div className="text-right text-[11px] font-mono">
            <span className="text-cyan-400">Live Simulation / Synthetic Demo Data</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
