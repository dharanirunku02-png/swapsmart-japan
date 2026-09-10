# SwapSmart Japan 🇯🇵⚡
> **AI-Powered EV & E-Bike Battery Swapping Network**  
> *Intelligent Tracking, Real-Time Shortage Prediction & Automated Redistribution for Congested Japanese Metro Areas*

[![Hackathon](https://img.shields.io/badge/Hackathon-India--Japan%202026-blue.svg)](https://github.com)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.14-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20Tailwind-61DAFB.svg)](https://react.dev/)
[![Leaflet](https://img.shields.io/badge/Mapping-Leaflet%20%7C%20OpenStreetMap-199900.svg)](https://leafletjs.com/)
[![Live Simulation](https://img.shields.io/badge/Live%20Simulation-Click%20Here-emerald?style=for-the-badge&logo=googlechrome&logoColor=white)](https://dharanirunku02-png.github.io/swapsmart-japan/)

---

### 🚀 Live Simulation Web Application
> 🔗 **Interactive Simulation Demo**: **[https://dharanirunku02-png.github.io/swapsmart-japan/](https://dharanirunku02-png.github.io/swapsmart-japan/)**  
> *Experience the live Tokyo Metropolitan battery swapping network, AI shortage risk prediction, and automated redistribution directly in your browser with zero installation.*

---

> [!IMPORTANT]
> **Disclaimer**: This project uses **synthetic simulation data for demonstration purposes**. It does not represent real-time actual Japanese municipal or power grid infrastructure. All station locations, battery levels, and telemetry values are mathematically generated to simulate high-density urban mobility dynamics.

---

## 1. Problem Statement
> **"E-Bike & EV Battery-Swapping Network:**  
> *An intelligent tracking and optimization system for shared EV and e-bike battery swapping stations tailored for congested Japanese metro areas."*

### Problem Explanation
In densely populated Japanese metropolitan hubs like Tokyo (Shibuya, Shinjuku, Akihabara, Shinagawa, Tokyo Station, Yokohama), rapid adoption of electric two-wheelers (e-bike couriers like UberEats Japan, Demaecan) and micro-EVs creates severe localized swapping spikes. 

During morning and evening rush hours:
- Single stations face sudden depletion within 10–15 minutes.
- Delivery couriers and commuters face waiting times exceeding 8–10 minutes.
- Simultaneously, neighboring stations just 3–4 km away have surplus idle batteries.
- Fixed charging turnaround times create grid stress and bottlenecked availability without coordinated network-wide balancing.

---

## 2. Solution: SwapSmart Japan
SwapSmart Japan is an end-to-end smart-city mobility operations system featuring:
1. **Real-time IoT Telemetry & Tracking**: Live monitoring of battery availability, charging cells, cabinet temperatures, and power draw across 6 strategic Tokyo hubs.
2. **Dynamic User Demand Simulation**: Synthetic driver requests for both EVs (4-wheelers) and E-Bikes (2-wheelers) with time-of-day rush hour modeling.
3. **AI Shortage Prediction Module**: Transparent predictive scoring (0–100) that forecasts upcoming battery stockouts minutes before they occur.
4. **Intelligent Optimization Engine**: Multi-criteria donor-recipient algorithm that calculates optimal redistribution routes, transfer quantities, and transit times.
5. **Before vs. After Comparative Analytics**: Visual proof showing a **65% reduction in waiting time** and eliminated driver stockouts.
6. **Live Battery Transit Animation**: Real-time moving transit vehicles mapped along Tokyo transit corridors.
7. **10-Step Automated Hackathon Demo Mode**: Pre-scripted narrative sequence crafted for judges to understand the entire solution in under 60 seconds.

---

## 3. Architecture & Tech Stack

```
                               ┌────────────────────────────────────────┐
                               │       React 18 + Vite Frontend         │
                               │  (Tailwind CSS, Leaflet, Recharts)     │
                               └──────────────────┬─────────────────────┘
                                                  │
                                                  ▼
                               ┌────────────────────────────────────────┐
                               │           REST & WebSocket API         │
                               │         (FastAPI / Python 3.14)        │
                               └──────────────────┬─────────────────────┘
                                                  │
               ┌──────────────────────────────────┼──────────────────────────────────┐
               ▼                                  ▼                                  ▼
┌─────────────────────────────┐    ┌─────────────────────────────┐    ┌─────────────────────────────┐
│      Simulation Engine      │    │    AI Prediction Engine     │    │     Optimization Engine     │
│ - 6 Tokyo Mobility Hubs     │    │ - Net Drain Velocity        │    │ - Candidate Donor Selection │
│ - EV & E-Bike Request Queue │    │ - Recharging Recovery Rate  │    │ - Haversine Distance Calc   │
│ - Strict State Invariant    │    │ - Tokyo Rush Hour Weights   │    │ - Before vs After Impact    │
│ - Live Transit Interpolation│    │ - 0–100 Shortage Risk Score │    │ - Dispatch Logistics        │
└─────────────────────────────┘    └─────────────────────────────┘    └─────────────────────────────┘
```

### Technology Stack
- **Frontend**: React 18, Vite 5, Tailwind CSS 3, Lucide React (Icons), Leaflet & OpenStreetMap (interactive map), Recharts (data visualization).
- **Backend**: Python 3.14, FastAPI, Uvicorn, Pydantic v2.
- **Simulation**: Dual-Engine (FastAPI background runner + Client-side zero-latency fallback mirror).
- **Zero Paid Dependencies**: Operates 100% locally with open-source tools.

---

## 4. Key Metro Stations (Tokyo Area)

| Station | Japanese | Coordinates | Total Capacity | Profile |
|---|---|---|---|---|
| **Shibuya** | 渋谷駅前 | `35.6580, 139.7016` | 45 | High youth mobility, heavy e-bike food delivery |
| **Shinjuku** | 新宿西口 | `35.6909, 139.7003` | 50 | Massive commuter interchange, high surplus reserve |
| **Akihabara** | 秋葉原電気街 | `35.6983, 139.7731` | 35 | Tech & retail corridor, dense micro-mobility |
| **Shinagawa** | 品川港南口 | `35.6284, 139.7387` | 40 | Shinkansen corridor, logistics & EV traffic |
| **Tokyo Station** | 東京丸の内 | `35.6812, 139.7671` | 55 | Central business district, fleet vehicle hubs |
| **Yokohama** | 横浜西口 | `35.4658, 139.6227` | 40 | Cross-prefecture bay area commuter gateway |

---

## 5. Mathematical & Algorithmic Foundations

### A. Strict Battery State Invariant
At every simulation tick and across every station:
$$\text{Available} + \text{Charging} + \text{Reserved} + \text{InUse} = \text{Station Capacity}$$
- Values are strictly non-negative ($\ge 0$).
- When a user swaps, Available $\to$ In Use; returned depleted battery enters Charging.
- When charging completes, Charging $\to$ Available.
- Transfers decrement source Available and increment destination Available atomically.

### B. AI Shortage Risk Scoring Algorithm
$$\text{Net Drain Rate} = (\text{Active Requests} \times 0.35 + 0.5) \times W_{\text{period}} - (\text{Charging Cells} \times 0.15)$$
$$\text{Time to Stockout} = \frac{\text{Available Batteries}}{\max(0.1, \text{Net Drain Rate})}$$
$$\text{Risk Score} = \min\left(100, \max\left(0, \frac{100}{1.0 + \frac{\text{Time to Stockout}}{10.0}} + \text{Penalty}_{\text{low buffer}}\right)\right)$$

**Classification Tiers:**
- `0 – 30`: **LOW** (Emerald)
- `31 – 60`: **MEDIUM** (Amber)
- `61 – 80`: **HIGH** (Orange)
- `81 – 100`: **CRITICAL** (Rose Red)

### C. Multi-Criteria Redistribution Optimization
When deficit station $D$ is detected:
$$\text{Surplus}_i = \text{Available}_i - \max(5, \text{Capacity}_i \times 0.20)$$
$$\text{Score}_i = \frac{\text{Surplus}_i \times 2.0}{\text{Distance}(D, i) + 1.5} \times \left(1.0 - \frac{\text{Risk}_i}{150.0}\right)$$
The candidate with highest score is selected as donor, ensuring donor remains safe while deficit station is restocked.

---

## 6. How to Run Locally

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ & npm

### Option A: Running Backend (FastAPI)
```powershell
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run FastAPI with auto-reload
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API docs available at: `http://127.0.0.1:8000/docs`

### Option B: Running Frontend (React + Vite)
```powershell
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
Dashboard available at: `http://localhost:5173`

---

## 7. Automated 10-Step Hackathon Demo Mode
Click the **"RUN HACKATHON DEMO"** button in the dashboard to execute the complete judge flow:

1. **Step 1: Normal Station Baseline** — All 6 Tokyo hubs operating in balance.
2. **Step 2: Surge at Shibuya** — Morning delivery & commuter rush spike simulated (+18 requests).
3. **Step 3: Inventory Depletion** — Available units drop to 2; queues build up.
4. **Step 4: AI Shortage Detection** — Drain velocity exceeds recharge rate.
5. **Step 5: Predictive Forecast Alert** — Shortage predicted in ~7 minutes (Score: 88/100).
6. **Step 6: Donor Station Identified** — Shinjuku identified with 24 batteries (surplus transferable).
7. **Step 7: Redistribution Recommendation** — Plan generated: Transfer 10 batteries Shinjuku $\to$ Shibuya.
8. **Step 8: Operator Approval** — One-click dispatch triggers automated transfer.
9. **Step 9: Live Transit Across Tokyo** — Animated transit vehicle travels along the corridor map.
10. **Step 10: Stock Restored & Shortage Averted** — Waiting time slashed from 8.2m to 2.9m (-65%)!

---

## 8. Deployment Guidelines (GitHub / Cloud)
- **Frontend**: Can be built via `npm run build` and deployed directly to **Vercel**, **Netlify**, or **GitHub Pages**.
- **Backend**: Can be deployed via Docker or **Render / Fly.io / Railway**.
- **Dual-Mode Capability**: If deployed statically on GitHub Pages without a Python backend, the frontend automatically activates its built-in client simulation engine so judges always see a fully functional, animated experience!

---

## 9. Future Enhancements
- **Dynamic Pricing Incentives**: Discounting battery swap rates at surplus stations to encourage self-balancing by commuters.
- **Solar & Grid Arbitrage**: Timing recharging cycles to coincide with off-peak electricity tariffs.
- **Direct Battery Telemetry (CAN Bus / OBD)**: Real-time battery State of Health (SoH) and thermal run-away prevention.

---
*Created for the India–Japan Hackathon 2026. Built with precision, performance, and impact in mind.*
