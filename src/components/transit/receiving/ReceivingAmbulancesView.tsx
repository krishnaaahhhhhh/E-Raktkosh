import React from 'react';
import {
  Ambulance,
  HeartPulse,
  Navigation,
  CheckCircle2,
  Clock,
  Radio,
  Wifi,
  Activity,
  MapPin,
} from 'lucide-react';
import { TransferRequestState } from '../../../types/transfer';

interface ReceivingAmbulancesViewProps {
  state: TransferRequestState;
  onOpenTransitRadar: () => void;
}

export const ReceivingAmbulancesView: React.FC<ReceivingAmbulancesViewProps> = ({
  state,
  onOpenTransitRadar,
}) => {
  const isEnRoute = state.status === 'AMBULANCE_DISPATCHED' || state.status === 'EN_ROUTE';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">Inbound Critical Care Ambulances</h2>
          <p className="text-xs text-slate-500">Real-time tele-monitoring streams of inbound ALS units approaching SGPGI Lucknow</p>
        </div>
        <button
          onClick={onOpenTransitRadar}
          className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-xs transition cursor-pointer self-start sm:self-auto flex items-center space-x-1.5"
        >
          <Navigation className="w-4 h-4" />
          <span>Open Full-Screen Transit Radar</span>
        </button>
      </div>

      {/* Main Inbound Unit Card */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-2xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Ambulance className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-black text-[10px] uppercase">
                  ALS CORRIDOR UNIT
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">{state.ambulance.vehicleNumber}</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                Patient: {state.patient.name} (54M • STEMI)
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Corridor ETA</span>
            <span className="text-2xl font-black text-slate-900 font-mono">{state.ambulance.etaString}</span>
            <span className="text-xs text-amber-700 font-semibold block">{state.ambulance.distanceRemainingKm} km remaining</span>
          </div>
        </div>

        {/* Live Vitals & Equipment Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Live Heart Rate</span>
            <span className="text-lg font-black text-red-600">{state.clinical.vitals.heartRate} bpm</span>
            <span className="text-[10px] text-slate-500">Lead II Sinus Tach</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">In-Transit BP</span>
            <span className="text-lg font-black text-slate-900">{state.clinical.vitals.bloodPressure}</span>
            <span className="text-[10px] text-slate-500">Stable on Infusion</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">In-Transit SpO2</span>
            <span className="text-lg font-black text-emerald-600">{state.clinical.vitals.spO2}%</span>
            <span className="text-[10px] text-slate-500">High-Flow O2</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">5G Telemetry Link</span>
            <span className="text-lg font-black text-sky-700">99.8%</span>
            <span className="text-[10px] text-emerald-600 font-bold">● Streaming Live</span>
          </div>
        </div>

        {/* Route Progress Preview */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between font-bold text-slate-800">
            <span>Route: District Hospital Kanpur → SGPGI Lucknow (NH-27)</span>
            <span className="text-sky-700">{state.ambulance.routeProgressPercent}% Traversed</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-sky-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(12, state.ambulance.routeProgressPercent)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Kanpur ER (Km 0)</span>
            <span>Unnao Bypass (Km 38)</span>
            <span>Bani Plaza (Km 70)</span>
            <span>SGPGI Cath Lab Bay 2 (Km 88)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
