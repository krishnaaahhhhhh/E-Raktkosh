import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Ambulance,
  Radio,
  Wifi,
  Activity,
  Heart,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Building2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { TransferRequestState } from '../types/transfer';
import { ROUTE_WAYPOINTS } from '../services/ambulanceService';

interface TransitMapTrackerProps {
  state: TransferRequestState;
  onUpdateProgress: (percent: number) => void;
  onOpenArchitecture: () => void;
}

export const TransitMapTracker: React.FC<TransitMapTrackerProps> = ({
  state,
  onUpdateProgress,
  onOpenArchitecture,
}) => {
  const { ambulance, clinical, encounterId } = state;
  const selectedHospital = state.hospitals.find((h) => h.id === state.selectedHospitalId);

  // Auto progression simulator
  const [autoSimulate, setAutoSimulate] = useState<boolean>(true);

  useEffect(() => {
    if (!autoSimulate || state.status !== 'EN_ROUTE') return;

    const interval = setInterval(() => {
      onUpdateProgress(Math.min(100, ambulance.routeProgressPercent + 1.5));
    }, 1800);

    return () => clearInterval(interval);
  }, [autoSimulate, state.status, ambulance.routeProgressPercent]);

  // Calculate current active waypoint
  const currentWaypointIndex = Math.min(
    ROUTE_WAYPOINTS.length - 1,
    Math.floor((ambulance.routeProgressPercent / 100) * (ROUTE_WAYPOINTS.length - 1))
  );

  return (
    <div className="space-y-8">
      {/* Tracker Top Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              LIVE TRANSIT RADAR
            </span>
            <span className="text-xs text-slate-500 font-mono font-bold">
              ENCOUNTER: {encounterId}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5">
            Kanpur → Lucknow Transit Highway Corridor
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time GPS telemetry, mobile 5G clinical tele-monitoring, and Cath Lab arrival sync.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoSimulate(!autoSimulate)}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
              autoSimulate
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}
          >
            {autoSimulate ? '● Auto-Simulating Route' : '○ Simulation Paused'}
          </button>

          <button
            onClick={onOpenArchitecture}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition cursor-pointer"
          >
            View Encounter Tree
          </button>
        </div>
      </div>

      {/* Main Transit Map Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High-Tech Simulated Route Map */}
        <div className="lg:col-span-2 bg-slate-950 rounded-3xl p-6 sm:p-7 border border-slate-800 text-white shadow-2xl space-y-5 flex flex-col justify-between">
          {/* Map Top Indicators */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-mono font-bold text-emerald-400">CORRIDOR STATUS: GREEN CHANNEL CLEARED</span>
            </div>
            <div className="flex items-center space-x-4 text-slate-400 font-mono">
              <span>SPEED: <strong className="text-white font-bold">{ambulance.speedKmH} km/h</strong></span>
              <span>DIST REMAINING: <strong className="text-white font-bold">{ambulance.distanceRemainingKm} km</strong></span>
              <span>ETA: <strong className="text-amber-400 font-bold">{ambulance.etaString}</strong></span>
            </div>
          </div>

          {/* Interactive Custom SVG Highway Route Visualizer */}
          <div className="relative bg-slate-900/90 rounded-2xl p-5 border border-slate-800 h-88 flex flex-col justify-between overflow-hidden">
            {/* Grid styling */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none"></div>

            {/* Top Origin & Destination Labels */}
            <div className="flex justify-between items-center z-10">
              <div className="flex items-center space-x-2.5 bg-slate-950/90 px-3.5 py-2 rounded-xl border border-slate-800">
                <Building2 className="w-4 h-4 text-red-400" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Origin Point</span>
                  <span className="text-xs font-bold text-white">District Hospital, Kanpur</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 bg-slate-950/90 px-3.5 py-2 rounded-xl border border-sky-500/40">
                <Building2 className="w-4 h-4 text-sky-400" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Destination PCI Center</span>
                  <span className="text-xs font-bold text-sky-400">{selectedHospital?.name || 'SGPGI Lucknow'}</span>
                </div>
              </div>
            </div>

            {/* SVG Transit Path with Moving Marker */}
            <div className="relative w-full my-auto z-10 py-8">
              <svg viewBox="0 0 700 120" className="w-full h-24 overflow-visible">
                {/* Background Highway Track */}
                <path
                  d="M 50 60 C 180 20, 320 100, 480 30 C 580 -10, 620 60, 650 60"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                
                {/* Active Completed Route Glow */}
                <path
                  d="M 50 60 C 180 20, 320 100, 480 30 C 580 -10, 620 60, 650 60"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="700"
                  strokeDashoffset={700 - (ambulance.routeProgressPercent / 100) * 700}
                />

                {/* Waypoint Markers */}
                {[
                  { x: 50, y: 60, label: 'Kanpur ER' },
                  { x: 160, y: 38, label: 'Jajmau Toll' },
                  { x: 300, y: 88, label: 'Unnao Bypass' },
                  { x: 450, y: 40, label: 'Nawabganj' },
                  { x: 570, y: 22, label: 'Shaheed Path' },
                  { x: 650, y: 60, label: 'SGPGI Cath Lab' },
                ].map((wp, idx) => (
                  <g key={idx} transform={`translate(${wp.x}, ${wp.y})`}>
                    <circle r="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
                    <text
                      y="20"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {wp.label}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Dynamic Ambulance Position Badge */}
              <div
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 pointer-events-none"
                style={{
                  left: `${Math.min(92, Math.max(5, ambulance.routeProgressPercent))}%`,
                }}
              >
                <div className="relative -ml-8 -mt-9 flex flex-col items-center">
                  <div className="px-2.5 py-1 bg-red-600 text-white font-mono font-bold text-[10px] rounded-lg shadow-lg flex items-center gap-1.5 whitespace-nowrap animate-bounce">
                    <Ambulance className="w-3.5 h-3.5" />
                    ALS-042 ({ambulance.speedKmH} km/h)
                  </div>
                  <div className="w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white shadow-md mt-1 animate-ping"></div>
                </div>
              </div>
            </div>

            {/* Bottom Route Progress Slider */}
            <div className="z-10 bg-slate-950/90 p-4 rounded-xl border border-slate-800 flex items-center space-x-4">
              <span className="text-xs font-mono text-slate-400 font-bold whitespace-nowrap">
                PROGRESS: {ambulance.routeProgressPercent.toFixed(0)}%
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={ambulance.routeProgressPercent}
                onChange={(e) => onUpdateProgress(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2.5 bg-slate-700 rounded-lg"
              />
              <span className="text-xs font-mono font-bold text-emerald-400 whitespace-nowrap">
                {ROUTE_WAYPOINTS[currentWaypointIndex]?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: In-Transit Telemetry & 12-Lead Stream */}
        <div className="bg-slate-950 rounded-3xl p-6 sm:p-7 border border-slate-800 text-white shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>In-Transit Telemetry Stream</span>
            </h3>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              5G CONNECTED
            </span>
          </div>

          {/* Real-time ECG Sweep Visualizer */}
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-3">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span className="text-emerald-400 font-bold">LEAD II (Continuous)</span>
              <span className="text-red-400 font-bold animate-pulse">ST-ELEVATION ACTIVE</span>
            </div>

            {/* Sweep SVG */}
            <svg viewBox="0 0 300 60" className="w-full h-16 text-emerald-400 stroke-current stroke-2 fill-none">
              <path
                d="M 0 35 L 20 35 L 25 38 L 30 35 L 35 35 L 40 10 L 45 50 L 50 20 L 60 20 L 70 35 L 100 35 L 105 38 L 110 35 L 115 35 L 120 10 L 125 50 L 130 20 L 140 20 L 150 35 L 180 35 L 185 38 L 190 35 L 195 35 L 200 10 L 205 50 L 210 20 L 220 20 L 230 35 L 260 35 L 265 38 L 270 35 L 275 35 L 280 10 L 285 50 L 290 20 L 300 35"
              />
            </svg>

            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">HR</span>
                <span className="text-base font-black text-rose-400 font-mono">{clinical.vitals.heartRate} bpm</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">SpO2</span>
                <span className="text-base font-black text-sky-400 font-mono">{clinical.vitals.spO2}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">BP</span>
                <span className="text-base font-black text-emerald-400 font-mono">{clinical.vitals.bloodPressure.split(' ')[0]}</span>
              </div>
            </div>
          </div>

          {/* Unit & Paramedic Log */}
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Onboard Paramedic:</span>
              <span className="font-bold text-slate-200">{ambulance.paramedic}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Defibrillator / Monitor:</span>
              <span className="font-bold text-emerald-400">ONLINE (Zoll X-Series)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Oxygen Flow:</span>
              <span className="font-semibold text-slate-200">2 L/min via Nasal Cannula</span>
            </div>
          </div>

          <div className="p-4 bg-sky-950/30 border border-sky-500/30 rounded-2xl text-xs text-sky-300 leading-relaxed">
            <span className="font-bold">Cath Lab 02 Direct Protocol:</span> Destination team ready for patient handover immediately at Emergency Ramp Bay 2.
          </div>
        </div>
      </div>
    </div>
  );
};
