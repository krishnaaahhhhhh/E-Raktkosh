import React from 'react';
import {
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Stethoscope,
  Activity,
  FileCheck,
  ShieldCheck,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { TransferRequestState } from '../types/transfer';

interface TransferCommandPanelProps {
  state: TransferRequestState;
  onStartTransfer: () => void;
  onOpenDossierDirectly: () => void;
}

export const TransferCommandPanel: React.FC<TransferCommandPanelProps> = ({
  state,
  onStartTransfer,
  onOpenDossierDirectly,
}) => {
  const { patient, clinical } = state;

  return (
    <div className="space-y-8">
      {/* Primary Feature Hero Card: Pillar 4 Inter-Hospital Transfer */}
      <div
        id="inter-hospital-transfer-card"
        className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white border border-slate-800 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle soft lighting */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-sky-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider">
                <HeartHandshake className="w-4 h-4" />
                <span>Pillar 4 • Critical Care Continuity</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Inter-Hospital Transfer & E-Dossier Dispatch
              </h1>

              <p className="text-base text-slate-300 leading-relaxed">
                Secure patient handoff to higher centers. Seamlessly synchronizes ABDM-compliant clinical records, destination catheterization readiness, and ALS transit telemetry under a unified Encounter ID.
              </p>

              {/* Key Transfer Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Golden-Hour Stabilization Confirmed</span>
                </span>
                <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-sky-500/10 text-sky-300 border border-sky-500/30 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>FHIR R4 E-Dossier Ready</span>
                </span>
                <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span>Direct Cath Lab Bypass Protocol</span>
                </span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 min-w-[260px] lg:self-center">
              <button
                id="btn-transfer-patient-primary"
                onClick={onStartTransfer}
                className="w-full inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-2xl text-base font-extrabold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-xl shadow-red-600/30 transition transform active:scale-98 cursor-pointer"
              >
                <span>Initiate Patient Transfer</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                id="btn-view-edossier-precheck"
                onClick={onOpenDossierDirectly}
                className="w-full inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-sky-400" />
                <span>Inspect Digital E-Dossier</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Transfer Case Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Emergency Diagnosis */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2.5">
              <Activity className="w-5 h-5 text-red-500" />
              <span>Emergency Condition</span>
            </h2>
            <span className="px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-bold font-mono">
              ICD-10 {clinical.icd10Code}
            </span>
          </div>

          <div className="p-4 bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl space-y-1">
            <p className="text-sm font-bold text-red-900 dark:text-red-300">
              {clinical.diagnosis}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {clinical.chiefComplaint}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Transfer Indication
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              District Hospital Kanpur lacks a primary percutaneous coronary intervention (PCI) catheterization laboratory. Emergency transfer to a tertiary PCI apex center is mandatory within the recommended 120-minute door-to-balloon time window.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Attending Physician:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{patient.attendingDoctor}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Council Registration:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{patient.attendingRegNumber}</span>
            </div>
          </div>
        </div>

        {/* Column 2: Stabilization Record */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2.5">
              <Stethoscope className="w-5 h-5 text-emerald-500" />
              <span>Stabilization Record</span>
            </h2>
            <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              ✓ Protocol Completed
            </span>
          </div>

          <div className="space-y-3">
            {clinical.stabilizationInterventions.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50"
              >
                <span className="font-mono font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                  {item.time}
                </span>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {item.intervention}
                  </p>
                  <p className="text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">
                    ↳ {item.response}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
            <span className="font-bold">Transit Readiness:</span> Patient hemodynamically stable for ALS transport with continuous ECG telemetry.
          </div>
        </div>

        {/* Column 3: Diagnostic Snapshot */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2.5">
              <TrendingUp className="w-5 h-5 text-sky-500" />
              <span>Diagnostic Snapshot</span>
            </h2>
            <span className="px-2.5 py-1 rounded-md bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-xs font-bold">
              18:17 ECG
            </span>
          </div>

          {/* ECG Waveform Canvas */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-emerald-400 font-bold">LEAD V2 (25mm/s)</span>
              <span className="font-mono text-red-400 font-bold animate-pulse">ST ELEVATION +3.8mm</span>
            </div>

            <svg viewBox="0 0 300 70" className="w-full h-16 text-emerald-400 stroke-current stroke-2 fill-none">
              <path
                d="M 0 45 L 30 45 L 35 48 L 40 45 L 45 45 L 50 20 L 55 70 L 60 30 L 70 30 L 85 45 L 115 45 L 120 48 L 125 45 L 130 45 L 135 18 L 140 72 L 145 28 L 155 28 L 170 45 L 200 45 L 205 48 L 210 45 L 215 45 L 220 18 L 225 72 L 230 28 L 240 28 L 255 45 L 300 45"
              />
            </svg>

            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">HR</span>
                <span className="font-mono font-bold text-slate-200">{clinical.vitals.heartRate} bpm</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">SpO2</span>
                <span className="font-mono font-bold text-slate-200">{clinical.vitals.spO2}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">BP</span>
                <span className="font-mono font-bold text-slate-200">{clinical.vitals.bloodPressure.split(' ')[0]}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Troponin-I:</span>
              <span className="font-bold text-red-600 dark:text-red-400">&gt; 4.8 ng/mL (High Positive)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Bedside Echo:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">Anterior Wall Hypokinesia</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">LVEF:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">~ 45%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
