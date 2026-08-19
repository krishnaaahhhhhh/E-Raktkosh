import React from 'react';
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
  Building2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { TransferRequestState } from '../../types/transfer';
import { DynamicLightTransitMap } from './DynamicLightTransitMap';

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

  return (
    <div className="space-y-5 font-sans">
      {/* Top Banner Ribbon */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                LIVE TRANSIT RADAR
              </span>
              <span className="text-xs text-slate-500 font-mono font-bold">
                ENCOUNTER: {encounterId}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Kanpur → Lucknow Transit Highway Corridor (NH-27)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time GPS telemetry, mobile 5G clinical tele-monitoring, and Cath Lab arrival sync.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onOpenArchitecture}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition cursor-pointer"
            >
              Encounter Architecture
            </button>
          </div>
        </div>

        {/* Live Corridor Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block uppercase font-bold text-[10px]">Speed</span>
            <span className="text-lg font-black text-slate-900">{ambulance.speedKmH || 82} km/h</span>
            <span className="text-emerald-700 font-semibold block text-[11px]">Green Channel Cleared</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block uppercase font-bold text-[10px]">Distance Remaining</span>
            <span className="text-lg font-black text-slate-900">{ambulance.distanceRemainingKm} km</span>
            <span className="text-slate-500 block text-[11px]">Total 88 km route</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block uppercase font-bold text-[10px]">Cath Lab ETA</span>
            <span className="text-lg font-black text-amber-600">{ambulance.etaString}</span>
            <span className="text-slate-500 block text-[11px]">Direct Table Transfer</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block uppercase font-bold text-[10px]">5G Telemetry Status</span>
            <span className="text-lg font-black text-emerald-600">
              {(ambulance as any).telemetrySignalStrength ?? 98}%
            </span>
            <span className="text-slate-500 block text-[11px]">Zero Packet Loss</span>
          </div>
        </div>
      </div>

      {/* Main Dynamic Light Map View */}
      <DynamicLightTransitMap
        state={state}
        onUpdateProgress={onUpdateProgress}
        height="500px"
        showControls={true}
      />
    </div>
  );
};
