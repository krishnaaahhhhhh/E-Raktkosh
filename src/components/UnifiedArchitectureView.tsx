import React, { useState } from 'react';
import {
  GitMerge,
  FileCode,
  Ambulance,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Code2,
  ChevronRight,
  Eye,
  KeyRound,
  Layers,
} from 'lucide-react';
import { TransferRequestState } from '../types/transfer';

interface UnifiedArchitectureViewProps {
  state: TransferRequestState;
  onOpenDossier: () => void;
  onOpenReceiving: () => void;
  onOpenAmbulance: () => void;
}

export const UnifiedArchitectureView: React.FC<UnifiedArchitectureViewProps> = ({
  state,
  onOpenDossier,
  onOpenReceiving,
  onOpenAmbulance,
}) => {
  const [selectedNode, setSelectedNode] = useState<'dossier' | 'ambulance' | 'readiness' | 'timeline' | 'consent'>('dossier');

  const selectedHospital = state.hospitals.find((h) => h.id === state.selectedHospitalId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            SYSTEM ARCHITECTURE & INTEGRITY
          </span>
          <span className="text-xs text-slate-500 font-medium">Prathmikta Pillar 4 Data Model</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5">
          Unified Encounter Architecture
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Everything in the emergency transfer lifecycle is bound to a single immutable Encounter ID.
        </p>
      </div>

      {/* Visual Architectural Tree Graph */}
      <div className="bg-slate-950 rounded-3xl p-7 sm:p-9 text-white border border-slate-800 shadow-2xl space-y-8 relative overflow-hidden">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
            <span>MASTER ROOT KEY:</span>
            <span className="text-white font-black">{state.encounterId}</span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">
            Single Source of Truth Across Healthcare Nodes
          </h3>
        </div>

        {/* Tree Topology Diagram */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Node 1: E-Dossier */}
          <div
            onClick={() => setSelectedNode('dossier')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              selectedNode === 'dossier'
                ? 'bg-indigo-950/80 border-indigo-500 shadow-xl shadow-indigo-950/50 ring-2 ring-indigo-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <FileCode className="w-6 h-6 text-indigo-400" />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold">
                FHIR R4
              </span>
            </div>
            <h4 className="text-sm font-black text-white">E-DOSSIER BUNDLE</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Patient, Observation, MedicationAdmin, DiagnosticReport resources.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Sealed & Validated
            </div>
          </div>

          {/* Node 2: ALS Ambulance */}
          <div
            onClick={() => setSelectedNode('ambulance')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              selectedNode === 'ambulance'
                ? 'bg-amber-950/80 border-amber-500 shadow-xl shadow-amber-950/50 ring-2 ring-amber-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <Ambulance className="w-6 h-6 text-amber-400" />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold">
                TELEMETRY
              </span>
            </div>
            <h4 className="text-sm font-black text-white">ALS AMBULANCE</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Unit ALS-042 GPS stream, continuous ECG lead II, vitals feed.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> 5G Link Synced
            </div>
          </div>

          {/* Node 3: Destination Readiness */}
          <div
            onClick={() => setSelectedNode('readiness')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              selectedNode === 'readiness'
                ? 'bg-sky-950/80 border-sky-500 shadow-xl shadow-sky-950/50 ring-2 ring-sky-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <Building2 className="w-6 h-6 text-sky-400" />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-bold">
                CATH LAB
              </span>
            </div>
            <h4 className="text-sm font-black text-white">DESTINATION READINESS</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {selectedHospital?.name} Cath Lab 02 standby lock, ICU bed reserved.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Acceptance Verified
            </div>
          </div>

          {/* Node 4: Clinical Timeline */}
          <div
            onClick={() => setSelectedNode('timeline')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              selectedNode === 'timeline'
                ? 'bg-emerald-950/80 border-emerald-500 shadow-xl shadow-emerald-950/50 ring-2 ring-emerald-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-6 h-6 text-emerald-400" />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">
                AUDIT LOG
              </span>
            </div>
            <h4 className="text-sm font-black text-white">CLINICAL TIMELINE</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Admit (18:04), ECG (18:17), STEMI Alert (18:23), Dispatch (18:51).
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> {state.timeline.length} Events Timestamped
            </div>
          </div>
        </div>

        {/* Dynamic Node Details Inspector */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-slate-400 font-bold uppercase">
              Selected Branch: {selectedNode.toUpperCase()}
            </span>
            <span className="text-indigo-400 font-sans">
              Parent Root: <strong className="text-amber-400 font-bold">{state.encounterId}</strong>
            </span>
          </div>

          {selectedNode === 'dossier' && (
            <div className="space-y-3 text-slate-300 font-sans">
              <div className="text-xs text-emerald-400 font-mono font-bold">
                Payload Format: FHIR Document Bundle (ABDM R4 Profile)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Contains complete patient demographics, chief complaints, 12-lead ECG findings (3.8mm ST-elevation V1-V4), qualitative Troponin-I (&gt;4.8 ng/mL), dual antiplatelet loading doses (Aspirin 325mg + Ticagrelor 180mg) and IV Heparin 5000 IU.
              </p>
              <button
                onClick={onOpenDossier}
                className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-sans cursor-pointer"
              >
                Inspect E-Dossier Component
              </button>
            </div>
          )}

          {selectedNode === 'ambulance' && (
            <div className="space-y-3 text-slate-300 font-sans">
              <div className="text-xs text-amber-400 font-mono font-bold">
                Vehicle: {state.ambulance.vehicleNumber} • Status: {state.ambulance.status}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Real-time tele-monitoring stream broadcasting to both District Hospital Kanpur and SGPGI Lucknow Cath Lab 2. Equipped with defibrillator, ventilator, and 1800L O2.
              </p>
              <button
                onClick={onOpenAmbulance}
                className="mt-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold font-sans cursor-pointer"
              >
                Inspect Transit Radar
              </button>
            </div>
          )}

          {selectedNode === 'readiness' && (
            <div className="space-y-3 text-slate-300 font-sans">
              <div className="text-xs text-sky-400 font-mono font-bold">
                Receiving Center: {selectedHospital?.name} • Doctor: {selectedHospital?.receivingDoctor}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cath Lab 02 is hard-reserved for immediate patient reception upon arrival (direct-to-table bypass protocol). Emergency line: {selectedHospital?.contactEmergencyLine}.
              </p>
              <button
                onClick={onOpenReceiving}
                className="mt-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold font-sans cursor-pointer"
              >
                Inspect Higher Center Dashboard
              </button>
            </div>
          )}

          {selectedNode === 'timeline' && (
            <div className="space-y-3 text-slate-300 font-sans">
              <div className="text-xs text-emerald-400 font-mono font-bold">
                Chronological Audit Chain ({state.timeline.length} entries)
              </div>
              <div className="space-y-1.5 text-xs">
                {state.timeline.slice(-3).map((tl, i) => (
                  <div key={i} className="text-slate-300">
                    • <span className="font-mono text-amber-300 font-bold">[{tl.time}]</span> {tl.title} ({tl.actor || 'System'})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
