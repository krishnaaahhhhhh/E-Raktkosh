import React from 'react';
import {
  Ambulance,
  HeartPulse,
  Clock,
  CheckCircle2,
  Building2,
  FileText,
} from 'lucide-react';
import { TransferRequestState } from '../../../types/transfer';
import { DynamicLightTransitMap } from '../DynamicLightTransitMap';

interface AcceptedTransfersViewProps {
  state: TransferRequestState;
  onTrackAmbulance: () => void;
  onViewDossier: () => void;
  onUpdateTransitProgress?: (percent: number) => void;
}

export const AcceptedTransfersView: React.FC<AcceptedTransfersViewProps> = ({
  state,
  onTrackAmbulance,
  onViewDossier,
  onUpdateTransitProgress,
}) => {
  return (
    <div className="space-y-5 font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900">In-Transit Patients & Cath Lab Readiness</h2>
          <p className="text-xs text-slate-500">Live dynamic map telemetry and cath lab standby assignments.</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Ambulance className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">{state.patient.name}</span>
                <span className="text-xs text-slate-500">({state.patient.age}y/M)</span>
              </div>
              <span className="text-xs text-red-700 font-semibold">{state.clinical.diagnosis}</span>
            </div>
          </div>

          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>En Route • ETA: {state.ambulance.etaString}</span>
          </span>
        </div>

        {/* Readiness and Ambulance Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="text-slate-400 font-bold text-[10px] uppercase">Assigned Service</div>
            <div className="font-bold text-slate-900">Cath Lab 02 (Primary PCI Standby)</div>
            <div className="text-emerald-700 font-semibold">Team: Dr. Vivek Saxena</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="text-slate-400 font-bold text-[10px] uppercase">ALS Ambulance Unit</div>
            <div className="font-bold text-slate-900">{state.ambulance.vehicleNumber}</div>
            <div className="text-slate-500">Paramedic: Vikram Singh (ALS)</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="text-slate-400 font-bold text-[10px] uppercase">Coronary Care Unit</div>
            <div className="font-bold text-slate-900">CCU Bed 04 Reserved</div>
            <div className="text-slate-500">Direct bypass from ambulance bay</div>
          </div>
        </div>

        {/* Dynamic Light Map Component */}
        <DynamicLightTransitMap
          state={state}
          onUpdateProgress={onUpdateTransitProgress || (() => {})}
          height="380px"
          showControls={true}
        />

        {/* Action Controls */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onViewDossier}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Full Clinical E-Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
};
