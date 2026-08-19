import React from 'react';
import {
  Ambulance,
  CheckCircle2,
  Radio,
  Wifi,
  Activity,
  Heart,
  Navigation,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { TransferRequestState } from '../../types/transfer';

interface AmbulanceDispatchModalProps {
  state: TransferRequestState;
  onDispatchAmbulance: () => void;
  onViewLiveRoute: () => void;
}

export const AmbulanceDispatchModal: React.FC<AmbulanceDispatchModalProps> = ({
  state,
  onDispatchAmbulance,
  onViewLiveRoute,
}) => {
  const { ambulance, patient } = state;
  const selectedHospital = state.hospitals.find((h) => h.id === state.selectedHospitalId);
  const isDispatched = state.status === 'AMBULANCE_DISPATCHED' || state.status === 'EN_ROUTE';

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              STEP 4 OF 5
            </span>
            <span className="text-xs text-slate-500 font-medium">Critical Care Fleet Mobilization</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5">
            ALS Ambulance Dispatch
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Advanced Life Support unit synchronization with E-Dossier and receiving Cath Lab.
          </p>
        </div>

        {isDispatched && (
          <button
            onClick={onViewLiveRoute}
            className="inline-flex items-center space-x-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30 transition cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>Open Live Transit Radar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Dispatch Card */}
      <div
        id="ambulance-dispatch-card"
        className={`rounded-3xl p-7 sm:p-9 border-2 transition-all shadow-xl ${
          isDispatched
            ? 'bg-slate-900 text-white border-emerald-500 shadow-emerald-950/30'
            : 'bg-white dark:bg-slate-900 border-amber-500/80 shadow-amber-950/20'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center ring-2 ring-amber-500/30 flex-shrink-0">
              <Ambulance className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500">
                  {ambulance.type}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isDispatched
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {isDispatched ? 'DISPATCHED • EN ROUTE' : 'READY FOR DEPARTURE'}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                Unit {ambulance.vehicleNumber}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Base Station: {ambulance.baseStation}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Assigned Crew</span>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block">
                {ambulance.paramedic}
              </span>
              <span className="text-slate-500 text-xs block">
                EMT: {ambulance.emt} • Driver: {ambulance.driver}
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Encounter Target</span>
              <span className="font-bold text-sm text-sky-600 dark:text-sky-400 block">
                {selectedHospital?.name}
              </span>
              <span className="font-mono text-amber-600 dark:text-amber-400 text-xs font-bold block">
                ETA: {ambulance.etaString} (88 km)
              </span>
            </div>
          </div>
        </div>

        {/* Real-Time Readiness Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-7 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-1">
            <span className="text-slate-500 block font-medium">E-Dossier Status</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Synced to Tablet
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-1">
            <span className="text-slate-500 block font-medium">Receiving Center</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Accepted
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-1">
            <span className="text-slate-500 block font-medium">Cardiology</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Alerted
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-1">
            <span className="text-slate-500 block font-medium">Cath Lab</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Reserved
            </span>
          </div>
        </div>

        {/* Primary CTA Dispatch Button */}
        {!isDispatched ? (
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="text-xs text-slate-500">
              Authorization key verified: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{state.consent.auditHash.substring(0, 24)}...</span>
            </div>

            <button
              id="btn-dispatch-als-ambulance"
              onClick={onDispatchAmbulance}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-9 py-4 rounded-xl text-sm font-black bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-xl shadow-red-600/40 transition transform active:scale-98 cursor-pointer"
            >
              <Ambulance className="w-5 h-5 animate-bounce" />
              <span>DISPATCH ALS AMBULANCE</span>
            </button>
          </div>
        ) : (
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center space-x-3.5">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping"></div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase">
                  AMBULANCE ALS-042 EN ROUTE
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Route: Kanpur → Lucknow NH-27 Corridor • Live telemetry streaming to SGPGI Cath Lab.
                </p>
              </div>
            </div>

            <button
              onClick={onViewLiveRoute}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 transition cursor-pointer"
            >
              <span>Track Live Route & Vitals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
