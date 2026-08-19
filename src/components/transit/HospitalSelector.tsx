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
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {label}
          </span>
        );
      case 'SOFT_LOCKED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            {label}
          </span>
        );
      case 'ON_CALL':
      case 'LIMITED':
      case 'ACCEPTING (PRIORITY ONLY)':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            {label}
          </span>
        );
      case 'OCCUPIED':
      case 'FULL':
      case 'UNAVAILABLE':
      case 'DIVERSION RECOMMENDED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-900 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            {label}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Step Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                STEP 2 OF 5
              </span>
              <span className="text-xs text-slate-500 font-medium">Destination Routing & Tele-ICU Bridge</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Select Receiving Higher Center
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time catheterization lab readiness, cardiology team availability, and transit feasibility index.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              Back
            </button>
            <button
              id="btn-continue-to-dossier"
              onClick={onContinueToDossier}
              className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm transition cursor-pointer"
            >
              <span>Compile E-Dossier for {selectedHospital.city}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {hospitals.map((hospital) => {
          const isSelected = hospital.id === selectedHospitalId;
          const isRecommended = hospital.overallReadinessScore >= 90;

          return (
            <div
              key={hospital.id}
              onClick={() => onSelectHospital(hospital.id)}
              className={`rounded-2xl p-5 border-2 transition cursor-pointer flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-sky-50/50 border-sky-500 shadow-md ring-2 ring-sky-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{hospital.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{hospital.city}</p>
                    </div>
                  </div>

                  {isRecommended && (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                      ★ Recommended
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {hospital.recommendedReason}
                </p>
              </div>

              {/* Stats & Feasibility */}
              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Distance & Route:</span>
                  <span className="font-bold text-slate-900">{hospital.distanceKm} km via NH-27</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Estimated Travel Time:</span>
                  <span className="font-mono font-bold text-red-600">{hospital.estimatedTravelTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Cath Lab Readiness:</span>
                  <span className="font-semibold text-emerald-700">{hospital.cathLabStatus} ({hospital.cathLabNumber})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">CCU / ICU Beds:</span>
                  <span className="font-bold text-slate-900">{hospital.icuBedsAvailable} Available</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">On-Call Cardiologist:</span>
                  <span className="font-medium text-slate-800">{hospital.receivingDoctor}</span>
                </div>
              </div>

              {/* Selection Button */}
              <button
                type="button"
                className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                  isSelected
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isSelected ? '✓ Selected Destination' : 'Select Hospital'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
