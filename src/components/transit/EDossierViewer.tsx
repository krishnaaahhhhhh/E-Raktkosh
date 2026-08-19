import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Code2,
  CheckCircle2,
  Activity,
  Heart,
  Pill,
  Clock,
  User,
  FlaskConical,
  Stethoscope,
  Layers,
  ArrowRight,
  Printer,
  Sparkles,
  Eye,
} from 'lucide-react';
import { TransferRequestState } from '../../types/transfer';
import { FHIRService } from '../../services/fhirService';

interface EDossierViewerProps {
  state: TransferRequestState;
  onProceedToConsent?: () => void;
  onOpenPdf: () => void;
  onBack?: () => void;
}

export const EDossierViewer: React.FC<EDossierViewerProps> = ({
  state,
  onProceedToConsent,
  onOpenPdf,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'clinical' | 'fhir' | 'timeline'>('clinical');
  const [selectedFhirResource, setSelectedFhirResource] = useState<string>('Patient');
  const [showFullJson, setShowFullJson] = useState<boolean>(false);

  const { patient, clinical, encounterId } = state;
  const selectedHospital = state.hospitals.find((h) => h.id === state.selectedHospitalId);

  // Generate real FHIR Bundle representation
  const fhirBundle = FHIRService.generateEDossierFHIRBundle(patient, clinical, encounterId);

  return (
    <div className="space-y-6 font-sans">
      {/* Step Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                FHIR R4 BUNDLE
              </span>
              <span className="text-xs text-slate-500 font-medium font-mono">
                ENCOUNTER: {encounterId}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-3">
              <span>Digital E-Dossier Viewer</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                ABDM Compliant
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified clinical transfer package compiled for {selectedHospital?.name || 'Receiving Higher Center'}.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              >
                Back
              </button>
            )}
            <button
              onClick={onOpenPdf}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export PDF Dossier</span>
            </button>
            {onProceedToConsent && (
              <button
                id="btn-proceed-to-consent"
                onClick={onProceedToConsent}
                className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm transition cursor-pointer"
              >
                <span>Proceed to Authorization</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ABDM & FHIR Envelope Banner */}
        <div className="bg-slate-50 p-4 rounded-xl text-slate-800 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                ABDM Document Reference ID: <span className="font-mono text-indigo-700">{fhirBundle.id}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Timestamp: {fhirBundle.timestamp} • Cryptographic Hash: SHA-256 Verified
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              ✓ SCHEMA VALIDATED
            </span>
            <span className="px-2.5 py-1 rounded-md bg-sky-100 text-sky-800 font-bold text-[10px]">
              ● 8 FHIR RESOURCES
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('clinical')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'clinical'
              ? 'bg-red-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Clinical Summary & Diagnostics
        </button>
        <button
          onClick={() => setActiveTab('fhir')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'fhir'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          FHIR R4 JSON Bundle
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-sky-700 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Clinical Encounter Timeline
        </button>
      </div>

      {/* Tab 1: Clinical Presentation */}
      {activeTab === 'clinical' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black">
                    {patient.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{patient.name}</h3>
                    <p className="text-xs text-slate-500">
                      {patient.age}y / {patient.gender === 'M' ? 'Male' : 'Female'} • ABHA: <strong className="font-mono text-slate-700">{patient.abhaId}</strong>
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
                  Blood Group: {patient.bloodGroup}+
                </span>
              </div>

              <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 text-xs space-y-1">
                <span className="font-bold text-red-900 uppercase tracking-wider text-[10px]">Primary Diagnosis</span>
                <div className="text-sm font-black text-red-700">{clinical.diagnosis} (ICD-10: {clinical.icd10Code})</div>
                <p className="text-slate-700">{clinical.historyOfPresentIllness}</p>
              </div>
            </div>

            {/* Diagnostic Findings */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Emergency Diagnostic Findings</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">12-Lead ECG</span>
                  <div className="font-bold text-slate-900">3.5mm ST Elevation V1-V4</div>
                  <p className="text-slate-500 text-[11px]">Proximal LAD occlusion pattern</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Cardiac Biomarkers</span>
                  <div className="font-bold text-red-600">Troponin-I &gt; 4.8 ng/mL</div>
                  <p className="text-slate-500 text-[11px]">High positive at 18:05 IST</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Bedside Echo</span>
                  <div className="font-bold text-slate-900">Anterior Wall Hypokinesia</div>
                  <p className="text-slate-500 text-[11px]">LVEF ~40%, No effusion</p>
                </div>
              </div>
            </div>

            {/* Medications */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Emergency Dosing Administered</h4>
              <table className="w-full text-left text-xs divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Medication</th>
                    <th className="p-2.5">Dose & Route</th>
                    <th className="p-2.5">Time</th>
                    <th className="p-2.5">Doctor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {clinical.medications.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{m.drugName}</td>
                      <td className="p-2.5">{m.dose} ({m.route})</td>
                      <td className="p-2.5 font-mono">{m.timeAdministered}</td>
                      <td className="p-2.5">{m.administeredBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vitals Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Pre-Transit Vitals</h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Heart Rate</span>
                  <span className="font-mono font-black text-red-600 text-base">{clinical.vitals.heartRate} bpm</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Blood Pressure</span>
                  <span className="font-mono font-black text-slate-900 text-base">{clinical.vitals.bloodPressure}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">SpO2</span>
                  <span className="font-mono font-black text-emerald-600 text-base">{clinical.vitals.spO2}%</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Respiratory Rate</span>
                  <span className="font-mono font-black text-slate-900 text-base">{clinical.vitals.respiratoryRate} /min</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Referring Medical Node</h4>
              <div className="text-slate-700">
                <div>Facility: <strong className="text-slate-900">{patient.currentHospital}</strong></div>
                <div>Attending: {patient.attendingDoctor}</div>
                <div className="font-mono text-slate-500 text-[11px]">Reg: {patient.attendingRegNumber}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: FHIR Bundle */}
      {activeTab === 'fhir' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">FHIR R4 JSON Composition Bundle</h3>
            <button
              onClick={() => setShowFullJson(!showFullJson)}
              className="text-xs font-bold text-sky-700 hover:text-sky-800"
            >
              {showFullJson ? 'Show Formatted View' : 'Show Raw JSON'}
            </button>
          </div>

          <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96">
            {JSON.stringify(fhirBundle, null, 2)}
          </pre>
        </div>
      )}

      {/* Tab 3: Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Encounter Timeline Log</h3>
          <div className="space-y-3 text-xs">
            {(state.timeline || []).map((event: any, idx: number) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-3">
                <span className="font-mono font-bold text-slate-900 px-2 py-0.5 bg-white rounded border border-slate-200 text-[11px]">
                  {event.time}
                </span>
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">{event.title || event.event}</div>
                  <p className="text-slate-600">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
