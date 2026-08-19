import React from 'react';
import {
  Building2,
  Clock,
  Navigation,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Zap,
  Bed,
  Heart,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { HigherCenter } from '../../types/transfer';

interface HospitalSelectorProps {
  hospitals: HigherCenter[];
  selectedHospitalId: string;
  onSelectHospital: (hospitalId: string) => void;
  onContinueToDossier: () => void;
  onBack: () => void;
}

export const HospitalSelector: React.FC<HospitalSelectorProps> = ({
  hospitals,
  selectedHospitalId,
  onSelectHospital,
  onContinueToDossier,
  onBack,
}) => {
  const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  const getStatusBadge = (status: string, label: string) => {
    switch (status) {
      case 'AVAILABLE':
      case 'READY TO RECEIVE':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {label}
          </span>
        );
      case 'SOFT_LOCKED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            {label}
          </span>
        );
      case 'ON_CALL':
      case 'LIMITED':
      case 'ACCEPTING (PRIORITY ONLY)':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            {label}
          </span>
        );
      case 'OCCUPIED':
      case 'FULL':
      case 'UNAVAILABLE':
      case 'DIVERSION RECOMMENDED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            {label}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              STEP 2 OF 5
            </span>
            <span className="text-xs text-slate-500 font-medium">Destination Routing & Tele-ICU Bridge</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5">
            Select Receiving Higher Center
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time catheterization lab readiness, cardiology team availability, and transit feasibility index.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
          >
            Back
          </button>
          <button
            id="btn-continue-to-dossier"
            onClick={onContinueToDossier}
            className="inline-flex items-center space-x-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30 transition cursor-pointer"
          >
            <span>Continue to E-Dossier</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {hospitals.map((hospital) => {
          const isSelected = hospital.id === selectedHospitalId;
          const isRecommended = hospital.id === 'hosp-sgpgi-lko';

          return (
            <div
              key={hospital.id}
              id={`hospital-card-${hospital.id}`}
              onClick={() => onSelectHospital(hospital.id)}
              className={`rounded-2xl p-6 sm:p-7 cursor-pointer transition-all relative border-2 ${
                isSelected
                  ? 'bg-sky-50/50 dark:bg-slate-900 border-sky-600 dark:border-sky-500 shadow-xl shadow-sky-600/10 ring-4 ring-sky-500/10'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className="absolute -top-3.5 left-6 px-3 py-1 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] font-extrabold uppercase rounded-full shadow-md tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Recommended Apex PCI Center
                </div>
              )}

              {/* Selection Check Indicator & Hospital Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {hospital.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {hospital.city}
                  </p>
                </div>

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border transition flex-shrink-0 ml-2 ${
                    isSelected
                      ? 'bg-sky-600 border-sky-600 text-white shadow-sm'
                      : 'border-slate-300 dark:border-slate-700 text-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                </div>
              </div>

              {/* Transit Distance & ETA */}
              <div className="grid grid-cols-2 gap-3 mt-5 p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center space-x-2.5">
                  <Navigation className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Distance</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">{hospital.distanceKm} km</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Transit ETA</span>
                    <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400 font-mono">{hospital.estimatedTravelTime}</span>
                  </div>
                </div>
              </div>

              {/* Resource Readiness Table */}
              <div className="mt-5 space-y-3 text-xs">
                {/* Cardiology */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2 font-medium">
                    <Heart className="w-4 h-4 text-rose-500" />
                    Cardiology:
                  </span>
                  {getStatusBadge(hospital.cardiologyStatus, hospital.cardiologyStatus)}
                </div>

                {/* Cath Lab */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2 font-medium">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Cath Lab:
                  </span>
                  {getStatusBadge(hospital.cathLabStatus, hospital.cathLabStatus)}
                </div>

                {/* ICU */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2 font-medium">
                    <Bed className="w-4 h-4 text-sky-500" />
                    ICU Capacity:
                  </span>
                  {getStatusBadge(
                    hospital.icuStatus,
                    `${hospital.icuStatus} (${hospital.icuBedsAvailable} beds)`
                  )}
                </div>

                {/* Transfer Acceptance */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Admission Status:
                  </span>
                  {getStatusBadge(hospital.transferAcceptanceStatus, hospital.transferAcceptanceStatus)}
                </div>
              </div>

              {/* Recommendation Note */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border border-slate-100 dark:border-slate-700/50">
                <span className="font-bold text-slate-800 dark:text-slate-200">Clinical Rationale: </span>
                {hospital.recommendedReason}
              </div>

              {/* Receiving Consultant */}
              <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                <span>Receiving Lead:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{hospital.receivingDoctor.split(',')[0]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Hospital Summary Callout */}
      <div className="bg-sky-50/80 dark:bg-slate-900 p-6 rounded-2xl border border-sky-200 dark:border-sky-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center flex-shrink-0 font-bold shadow-md shadow-sky-600/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-sky-700 dark:text-sky-400 font-bold uppercase tracking-wider">
              Selected Higher Center
            </div>
            <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
              {selectedHospital.name} — {selectedHospital.receivingDoctor}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Corridor Distance: {selectedHospital.distanceKm} km • Expected Transit ETA: {selectedHospital.estimatedTravelTime} • {selectedHospital.cathLabNumber || 'Cath Lab Suite'}
            </p>
          </div>
        </div>

        <button
          id="btn-confirm-destination"
          onClick={onContinueToDossier}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl text-xs font-extrabold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 transition cursor-pointer"
        >
          <span>Confirm & Build E-Dossier</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
