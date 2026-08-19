import React from 'react';
import {
  Inbox,
  AlertTriangle,
  CheckCircle2,
  Ambulance,
  HeartPulse,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileText,
} from 'lucide-react';
import { TransferRequestState } from '../../../types/transfer';

interface ReceivingOverviewProps {
  state: TransferRequestState;
  onReviewTransfer: () => void;
  onViewDossier: () => void;
  onAcceptTransfer: () => void;
  onTrackAmbulance: () => void;
  onViewResources: () => void;
}

export const ReceivingOverview: React.FC<ReceivingOverviewProps> = ({
  state,
  onReviewTransfer,
  onViewDossier,
  onAcceptTransfer,
  onTrackAmbulance,
}) => {
  const isPending =
    state.status === 'TRANSFER_REQUESTED' ||
    state.status === 'CONSENT_GRANTED' ||
    state.status === 'DOSSIER_PREPARED';
  const isAccepted =
    state.status === 'RECEIVING_ACCEPTED' ||
    state.status === 'AMBULANCE_DISPATCHED' ||
    state.status === 'EN_ROUTE' ||
    state.status === 'ARRIVED_AT_DESTINATION';

  return (
    <div className="space-y-5 font-sans">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Receiving Triage Command
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            SGPGI Lucknow • Coronary Care & Emergency Interventional Triage Desk
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Cath Lab 02 Direct Standby</span>
        </span>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Incoming Cases
            </span>
            <div className="text-2xl font-black text-sky-800 mt-0.5">
              {isPending ? '01 New' : '00 Pending'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            <Inbox className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              In-Transit ALS Units
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">
              {isAccepted ? '01 Unit' : '00 Active'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Ambulance className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Cath Lab Capacity
            </span>
            <div className="text-sm font-bold text-slate-900 mt-1">Lab 02 Reserved</div>
            <span className="text-[11px] text-emerald-700 font-semibold">4 CCU Beds Available</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <HeartPulse className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Focus Referral Card */}
      <div className="bg-white rounded-2xl border-2 border-sky-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold text-xs">
              INCOMING REFERRAL: KANPUR ER
            </span>
            <span className="text-xs text-slate-500 font-mono">ID: {state.encounterId}</span>
          </div>
          {isAccepted ? (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Accepted • Cath Lab Reserved
            </span>
          ) : (
            <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Awaiting Clinician Acceptance
            </span>
          )}
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
            <div className="text-xs text-slate-400 font-semibold">Transit & Cath Lab Readiness</div>
            <div className="text-xs font-bold text-slate-900">Cath Lab 02 Standby</div>
            <div className="text-[11px] text-slate-500">
              ETA: {state.ambulance.etaString} • {state.ambulance.vehicleNumber}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={onViewDossier}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Inspect E-Dossier</span>
          </button>

          <div className="flex items-center space-x-2">
            {!isAccepted ? (
              <button
                onClick={onAcceptTransfer}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept Transfer & Reserve Cath Lab 02</span>
              </button>
            ) : (
              <button
                onClick={onTrackAmbulance}
                className="px-5 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Ambulance className="w-4 h-4" />
                <span>Track Inbound ALS Unit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
