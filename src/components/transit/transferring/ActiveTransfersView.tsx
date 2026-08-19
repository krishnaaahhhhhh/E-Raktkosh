import React from 'react';
import {
  HeartPulse,
  Ambulance,
  Building2,
  Clock,
  CheckCircle2,
  FileText,
  ArrowRightLeft,
  Navigation,
} from 'lucide-react';
import { TransferRequestState } from '../../../types/transfer';
import { DynamicLightTransitMap } from '../DynamicLightTransitMap';

interface ActiveTransfersViewProps {
  state: TransferRequestState;
  onViewDossier: () => void;
  onTrackTransit: () => void;
  onSwitchToReceiving: () => void;
  onUpdateTransitProgress?: (percent: number) => void;
}

export const ActiveTransfersView: React.FC<ActiveTransfersViewProps> = ({
  state,
  onViewDossier,
  onTrackTransit,
  onSwitchToReceiving,
  onUpdateTransitProgress,
}) => {
  const selectedHospital = state.hospitals.find((h) => h.id === state.selectedHospitalId);
  const isEnRoute = state.status === 'AMBULANCE_DISPATCHED' || state.status === 'EN_ROUTE';
  const isAccepted = state.status === 'RECEIVING_ACCEPTED' || isEnRoute || state.status === 'ARRIVED_AT_DESTINATION';

  const getStatusBadge = () => {
    switch (state.status) {
      case 'TRANSFER_REQUESTED':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          text: 'Awaiting Receiving Hospital Acceptance',
        };
      case 'RECEIVING_ACCEPTED':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-200',
          dot: 'bg-sky-500',
          text: 'Transfer Accepted • Preparing ALS Dispatch',
        };
      case 'AMBULANCE_DISPATCHED':
      case 'EN_ROUTE':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500 animate-ping',
          text: 'In Transit • 5G GPS Telemetry Streaming',
        };
      case 'ARRIVED_AT_DESTINATION':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          dot: 'bg-emerald-600',
          text: 'Arrived at SGPGI Cath Lab 02',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          text: 'Ready for Transfer',
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="space-y-5 font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Active & In-Transit Transfers</h2>
          <p className="text-xs text-slate-500">Real-time status and live map telemetry for current active referrals.</p>
        </div>
      </div>

      {/* Main Active Case Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
        {/* Header with Status Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">{state.patient.name}</span>
                <span className="text-xs text-slate-500">({state.patient.age}y/M)</span>
              </div>
              <span className="text-xs text-red-700 font-semibold">{state.clinical.diagnosis}</span>
            </div>
          </div>

          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg border text-xs font-bold ${badge.bg}`}>
            <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
            <span>{badge.text}</span>
          </div>
        </div>

        {/* Transfer Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="text-slate-400 font-bold text-[10px] uppercase">Origin Facility</div>
            <div className="font-bold text-slate-900">{state.patient.currentHospital}</div>
            <div className="text-slate-500">Dr. Rajesh Tripathi</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="text-slate-400 font-bold text-[10px] uppercase">Destination Apex Center</div>
            <div className="font-bold text-slate-900">{selectedHospital?.name || 'SGPGI Lucknow'}</div>
            <div className="text-emerald-700 font-semibold">{selectedHospital?.cathLabNumber || 'Cath Lab 02'} Standby</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="text-slate-400 font-bold text-[10px] uppercase">ALS Ambulance</div>
            <div className="font-bold text-slate-900">{state.ambulance.vehicleNumber}</div>
            <div className="text-red-600 font-bold">ETA: {state.ambulance.etaString}</div>
          </div>
        </div>

        {/* Dynamic Light Theme Map */}
        <DynamicLightTransitMap
          state={state}
          onUpdateProgress={onUpdateTransitProgress || (() => {})}
          height="380px"
          showControls={true}
        />

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onViewDossier}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Inspect E-Dossier</span>
          </button>

          {!isAccepted && (
            <button
              onClick={onSwitchToReceiving}
              className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Switch to SGPGI to Accept Referral</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
