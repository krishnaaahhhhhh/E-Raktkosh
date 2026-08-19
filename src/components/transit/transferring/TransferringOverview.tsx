import React from 'react';
import {
  Users,
  Send,
  Activity,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  HeartPulse,
  CheckCircle2,
  FileText,
  Ambulance,
} from 'lucide-react';
import { TransferRequestState } from '../../../types/transfer';

interface TransferringOverviewProps {
  state: TransferRequestState;
  onInitiateTransfer: () => void;
  onViewActiveTransfer: () => void;
  onViewDossier: () => void;
  onOpenPdf: () => void;
  onSwitchToReceiving: () => void;
}

export const TransferringOverview: React.FC<TransferringOverviewProps> = ({
  state,
  onInitiateTransfer,
  onViewActiveTransfer,
  onViewDossier,
  onOpenPdf,
  onSwitchToReceiving,
}) => {
  const selectedHospital = state.hospitals.find((h) => h.id === state.selectedHospitalId);
  const isTransferActive =
    state.status !== 'STABILIZED_READY' && state.status !== 'DESTINATION_SELECTED';

  return (
    <div className="space-y-5">
      {/* Top Banner / Heading with Clear Primary Action */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Emergency Transfer Command
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate emergency referral of stabilized patients to apex cardiology centres.
          </p>
        </div>
        <button
          onClick={onInitiateTransfer}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Send className="w-4 h-4" />
          <span>Start Transfer Request</span>
        </button>
      </div>

      {/* 3 Clean Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Stabilized In ER
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">03 Patients</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Referrals
            </span>
            <div className="text-2xl font-black text-red-600 mt-0.5">
              {isTransferActive ? '01 In Transit' : '00 Pending'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Receiving Apex
            </span>
            <div className="text-sm font-bold text-slate-900 mt-1">SGPGI Lucknow</div>
            <span className="text-[11px] text-emerald-700 font-semibold">Cath Lab 02 Standby</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Focus Card: Immediate Transfer Candidate */}
      <div className="bg-white rounded-2xl border-2 border-red-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <span className="px-2.5 py-0.5 rounded-md bg-red-100 text-red-800 font-bold text-xs">
              CRITICAL TRANSFER CANDIDATE
            </span>
            <span className="text-xs text-slate-500 font-mono">ABHA: {state.patient.abhaId}</span>
          </div>
          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Stabilized for Transport
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-semibold">Patient Information</div>
            <div className="text-base font-black text-slate-900">{state.patient.name}</div>
            <div className="text-xs text-slate-600">
              {state.patient.age} yrs • Male • Blood Group {state.patient.bloodGroup}+
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-semibold">Emergency Diagnosis</div>
            <div className="text-xs font-bold text-red-700 bg-red-50 p-2 rounded-lg border border-red-100">
              {state.clinical.diagnosis}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-semibold">Destination Center</div>
            <div className="text-xs font-bold text-slate-900">{selectedHospital?.name || 'SGPGI Lucknow'}</div>
            <div className="text-[11px] text-slate-500">
              Distance: {selectedHospital?.distanceKm || 88} km • Est: {selectedHospital?.estimatedTravelTime || '52 mins'}
            </div>
          </div>
        </div>

        {/* Simplified Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenPdf}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Print E-Dossier</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {isTransferActive ? (
              <button
                onClick={onViewActiveTransfer}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Ambulance className="w-4 h-4" />
                <span>Track Active Transfer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onInitiateTransfer}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <span>Initiate Transfer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
