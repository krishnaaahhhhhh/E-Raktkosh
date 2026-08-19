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
import { TransferRequestState } from '../../types/transfer';

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
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            SYSTEM ARCHITECTURE & INTEGRITY
          </span>
          <span className="text-xs text-slate-500 font-medium">Prathmikta Pillar 4 Data Model</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
          Unified Encounter Architecture
        </h2>
        <p className="text-xs text-slate-500">
          Everything in the emergency transfer lifecycle is bound to a single immutable Encounter ID.
        </p>
      </div>

      {/* Visual Architectural Tree Graph */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-mono font-bold">
            <span>MASTER ROOT KEY:</span>
            <span className="text-red-600 font-black">{state.encounterId}</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">
            Single Source of Truth Across Healthcare Nodes
          </h3>
        </div>

        {/* Tree Topology Diagram */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Node 1: E-Dossier */}
          <div
            onClick={() => setSelectedNode('dossier')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition ${
              selectedNode === 'dossier'
                ? 'bg-indigo-50/50 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <FileCode className="w-5 h-5 text-indigo-600" />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                FHIR R4
              </span>
            </div>
            <h4 className="text-xs font-black text-slate-900">E-DOSSIER BUNDLE</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Patient, Observation, MedicationAdmin, DiagnosticReport.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sealed & Validated
            </div>
          </div>

          {/* Node 2: ALS Ambulance */}
          <div
            onClick={() => setSelectedNode('ambulance')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition ${
              selectedNode === 'ambulance'
                ? 'bg-amber-50/50 border-amber-500 shadow-sm ring-2 ring-amber-500/20'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Ambulance className="w-5 h-5 text-amber-600" />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                5G GPS
              </span>
            </div>
            <h4 className="text-xs font-black text-slate-900">TELEMETRY STREAM</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Real-time route progress ({state.ambulance.routeProgressPercent}%), vitals telemetry, ETA sync.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-sky-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {state.ambulance.vehicleNumber}
            </div>
          </div>

          {/* Node 3: Higher Center Cath Lab */}
          <div
            onClick={() => setSelectedNode('readiness')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition ${
              selectedNode === 'readiness'
                ? 'bg-sky-50/50 border-sky-500 shadow-sm ring-2 ring-sky-500/20'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-5 h-5 text-sky-600" />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">
                CATH LAB
              </span>
            </div>
            <h4 className="text-xs font-black text-slate-900">RECEIVING READINESS</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Cath Lab 02 Standby lock, CCU bed hold, and interventionalist dispatch.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> SGPGI Standby
            </div>
          </div>

          {/* Node 4: Consent & Ledger */}
          <div
            onClick={() => setSelectedNode('consent')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition ${
              selectedNode === 'consent'
                ? 'bg-emerald-50/50 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                SHA-256
              </span>
            </div>
            <h4 className="text-xs font-black text-slate-900">CONSENT & AUDIT</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              ABDM Patient consent token and immutable cryptographic audit hash.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Token
            </div>
          </div>
        </div>

        {/* Node Detail Sheet */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="font-bold text-slate-900 flex items-center justify-between">
            <span>Encounter Detail: {selectedNode.toUpperCase()}</span>
            <span className="font-mono text-slate-500">{state.encounterId}</span>
          </div>
          <p className="text-slate-600">
            All updates propagate across the referring and receiving hospital dashboards instantly via the reactive state service.
          </p>
        </div>
      </div>
    </div>
  );
};
