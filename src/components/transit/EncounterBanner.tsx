import React from 'react';
import {
  User,
  HeartPulse,
  Building,
  Stethoscope,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { TransferRequestState } from '../../types/transfer';

interface EncounterBannerProps {
  state: TransferRequestState;
}

export const EncounterBanner: React.FC<EncounterBannerProps> = ({ state }) => {
  const getStatusBadge = () => {
    switch (state.status) {
      case 'STABILIZED_READY':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
          label: 'Patient Stabilized • Transfer Ready',
        };
      case 'DESTINATION_SELECTED':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
          label: 'Destination Selected',
        };
      case 'DOSSIER_PREPARED':
        return {
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
          label: 'E-Dossier Compiled (FHIR Ready)',
        };
      case 'CONSENT_GRANTED':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
          label: 'ABDM Consent Authorized',
        };
      case 'OVERRIDE_LOGGED':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
          label: 'Emergency Override Audited',
        };
      case 'TRANSFER_REQUESTED':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
          label: 'Awaiting Higher Center Acceptance',
        };
      case 'RECEIVING_ACCEPTED':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
          label: 'Transfer Accepted • Cath Lab 02 Reserved',
        };
      case 'AMBULANCE_DISPATCHED':
      case 'EN_ROUTE':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
          label: 'ALS En Route • Live Telemetry Active',
        };
      case 'ARRIVED_AT_DESTINATION':
        return {
          bg: 'bg-emerald-600 text-white border-emerald-600',
          label: 'Patient Arrived at Destination Cath Lab',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
          label: state.status,
        };
    }
  };

  const statusBadge = getStatusBadge();
  const selectedHospital = state.hospitals.find((h) => h.id === state.selectedHospitalId);

  return (
    <div
      id="encounter-summary-banner"
      className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Patient Details & Condition */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Patient Name */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex-shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base text-slate-900 dark:text-white">
                    {state.patient.name}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {state.patient.age}y / {state.patient.gender}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800/40">
                    {state.patient.bloodGroup}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="font-mono">{state.patient.abhaId}</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> ABHA-Linked
                  </span>
                </div>
              </div>
            </div>

            {/* Condition */}
            <div className="hidden sm:flex items-center space-x-3 pl-4 sm:border-l sm:border-slate-200 dark:sm:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 flex-shrink-0">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-red-600 dark:text-red-400">
                    {state.patient.condition}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                    ✓ Stabilized
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {state.patient.currentHospital} • {state.patient.attendingDoctor}
                </p>
              </div>
            </div>
          </div>

          {/* Status Badge & Target Center */}
          <div className="flex items-center space-x-3 self-start lg:self-auto">
            {selectedHospital && (
              <div className="hidden md:flex flex-col items-end text-right text-xs">
                <span className="text-slate-400 text-[11px] uppercase font-semibold">Target Center</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedHospital.name}</span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono font-semibold">ETA: {selectedHospital.estimatedTravelTime}</span>
              </div>
            )}

            <div
              className={`text-xs font-bold px-3.5 py-2 rounded-xl border flex items-center space-x-2 shadow-xs ${statusBadge.bg}`}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span>{statusBadge.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
