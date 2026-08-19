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
  onProceedToConsent: () => void;
  onOpenPdf: () => void;
  onBack: () => void;
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
    <div className="space-y-8">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              STEP 3 OF 5
            </span>
            <span className="text-xs text-slate-500 font-medium">Digital Handoff Envelope</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-3">
            <span>Digital E-Dossier</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              FHIR R4 Bundle
            </span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            ABDM-ready clinical handoff package compiled for {selectedHospital?.name || 'Higher Center'}.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
          >
            Back
          </button>
          <button
            onClick={onOpenPdf}
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>Export PDF Dossier</span>
          </button>
          <button
            id="btn-proceed-to-consent"
            onClick={onProceedToConsent}
            className="inline-flex items-center space-x-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30 transition cursor-pointer"
          >
            <span>Proceed to Authorization</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ABDM & FHIR Envelope Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl text-white border border-slate-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/60 flex items-center justify-center flex-shrink-0 ring-2 ring-indigo-400/30">
            <Layers className="w-6 h-6 text-indigo-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                ABDM Electronic Health Record Package
              </span>
              <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-200 px-2.5 py-0.5 rounded-md border border-indigo-400/30">
                {fhirBundle.entry.length} FHIR Resources
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Encounter: <span className="font-mono text-amber-300 font-bold">{encounterId}</span> • Bundle Digest: <span className="font-mono text-slate-400">{fhirBundle.id}</span>
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-800/90 p-1.5 rounded-xl border border-slate-700/80 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('clinical')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'clinical'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Clinical Dossier
          </button>
          <button
            onClick={() => setActiveTab('fhir')}
            className={`flex-1 md:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'fhir'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>FHIR Bundle</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Timeline
          </button>
        </div>
      </div>

      {/* Tab 1: Clinical Dossier View */}
      {activeTab === 'clinical' && (
        <div className="space-y-6">
          {/* Section 1: PATIENT SUMMARY */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                <User className="w-4 h-4 text-sky-500" />
                <span>1. Patient Demographics & Identification</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                ABHA: {patient.abhaId}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Full Name:</span>
                <span className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5 block">{patient.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Age / Gender / Blood:</span>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {patient.age} yrs • {patient.gender === 'M' ? 'Male' : 'Female'} • {patient.bloodGroup}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Current Facility:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{patient.currentHospital}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Target Receiving Center:</span>
                <span className="font-bold text-sky-600 dark:text-sky-400 mt-0.5 block">{selectedHospital?.name}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500">Emergency Condition:</span>
                <span className="font-bold text-red-600 dark:text-red-400 block mt-1">{patient.condition}</span>
              </div>
              <div>
                <span className="text-slate-500">Known Allergies:</span>
                <span className="font-semibold text-amber-700 dark:text-amber-400 block mt-1">
                  {patient.allergies.join(', ') || 'No known allergies'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Emergency Contact Proxy:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 block mt-1">
                  {patient.emergencyContact.name} ({patient.emergencyContact.relationship}) - {patient.emergencyContact.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: CLINICAL SUMMARY */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                <Stethoscope className="w-4 h-4 text-emerald-500" />
                <span>2. Clinical Presentation & Stabilization Record</span>
              </h3>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {patient.stabilizationStatus}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300">Chief Complaint & History of Present Illness:</span>
                <p className="text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  {clinical.historyOfPresentIllness}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300">Emergency Interventions Completed:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {clinical.stabilizationInterventions.map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/50 space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span>{item.intervention}</span>
                        <span className="font-mono text-[11px] text-slate-500">{item.time}</span>
                      </div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400">
                        Outcome: {item.response} ({item.performedBy})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 & 4: VITALS & INVESTIGATIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vitals */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <Activity className="w-4 h-4 text-rose-500" />
                <span>3. Telemetry & Vitals Prior to Transit</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Heart Rate</span>
                  <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">{clinical.vitals.heartRate}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">bpm</span>
                </div>

                <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">SpO2 (2L O2)</span>
                  <span className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono mt-0.5 block">{clinical.vitals.spO2}%</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Nasal Cannula</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Blood Pressure</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">{clinical.vitals.bloodPressure.split(' ')[0]}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">mmHg</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Temperature</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{clinical.vitals.temperature}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Resp. Rate</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{clinical.vitals.respiratoryRate}/min</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">GCS Score</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">15/15</span>
                </div>
              </div>

              <div className="text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/40 text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-800 dark:text-slate-200">Cardiac Rhythm: </span>
                {clinical.vitals.rhythm}
              </div>
            </div>

            {/* Investigations */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <FlaskConical className="w-4 h-4 text-purple-500" />
                <span>4. Critical Diagnostic Investigations</span>
              </h3>

              <div className="space-y-3">
                {clinical.investigations.map((inv, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl text-xs border ${
                      inv.status === 'Critical'
                        ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{inv.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                          inv.status === 'Critical'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {inv.status} ({inv.time})
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {inv.findings}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: MEDICATIONS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                <Pill className="w-4 h-4 text-amber-500" />
                <span>5. Emergency Medications Administered</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {clinical.medications.length} Drugs Logged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px]">
                    <th className="pb-3">Medication</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Dose / Route</th>
                    <th className="pb-3">Time Administered</th>
                    <th className="pb-3">Clinician</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {clinical.medications.map((med, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 font-bold text-slate-900 dark:text-white">{med.drugName}</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                          {med.category}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-700 dark:text-slate-300">{med.dose} ({med.route})</td>
                      <td className="py-3.5 font-mono text-slate-600 dark:text-slate-400">{med.timeAdministered}</td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-400">{med.administeredBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: FHIR Bundle Inspector */}
      {activeTab === 'fhir' && (
        <div className="bg-slate-950 rounded-2xl p-6 sm:p-7 border border-slate-800 text-white space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-emerald-400 font-mono flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                <span>FHIR R4 Bundle Inspector (ABDM Profile)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Structured clinical resources bundled for interoperable exchange.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFullJson(!showFullJson)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>{showFullJson ? 'Show Resource View' : 'Show Full Raw JSON'}</span>
              </button>
            </div>
          </div>

          {!showFullJson ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {/* Resource List */}
              <div className="md:col-span-1 space-y-2">
                <span className="text-xs text-slate-400 uppercase font-bold px-1 block">
                  Bundle Resources ({fhirBundle.entry.length})
                </span>
                {fhirBundle.entry.map((entry, idx) => {
                  const rType = entry.resource.resourceType;
                  const isSelected = selectedFhirResource === rType;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedFhirResource(rType)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-mono transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/40'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span>{rType}</span>
                      <span className="text-[10px] opacity-75">v1</span>
                    </button>
                  );
                })}
              </div>

              {/* Resource Content */}
              <div className="md:col-span-3 bg-slate-900 rounded-xl p-5 border border-slate-800 overflow-x-auto max-h-[450px]">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-3 mb-3 border-b border-slate-800 font-mono">
                  <span>Resource: {selectedFhirResource}</span>
                  <span className="text-emerald-400 font-bold">Validated ABDM R4</span>
                </div>
                <pre className="text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto">
                  {JSON.stringify(
                    fhirBundle.entry.find((e) => e.resource.resourceType === selectedFhirResource)?.resource ||
                      fhirBundle.entry[0].resource,
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 overflow-x-auto max-h-[500px]">
              <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
                {JSON.stringify(fhirBundle, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Timeline View */}
      {activeTab === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>6. Clinical & Dispatch Timeline</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Comprehensive chronological audit trail under Encounter ID: <span className="font-mono font-bold text-amber-500">{encounterId}</span>
            </p>
          </div>

          <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {state.timeline.map((event) => (
              <div key={event.id} className="relative">
                {/* Node Bullet */}
                <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-indigo-600 border-4 border-white dark:border-slate-900 text-white flex items-center justify-center shadow-sm"></div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {event.time}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {event.title}
                      </h4>
                    </div>
                    {event.badge && (
                      <span className="px-2.5 py-0.5 rounded-md bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[10px] font-bold">
                        {event.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {event.description}
                  </p>
                  {event.actor && (
                    <div className="text-xs text-slate-400">
                      Logged by: {event.actor}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Dispatch Trigger Callout */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-5">
        <div>
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            E-Dossier Sealed & Ready for Dispatch
          </div>
          <div className="text-base font-extrabold text-white mt-1">
            Destination: {selectedHospital?.name} • Receiving Lead: {selectedHospital?.receivingDoctor}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Next step: Patient Data Authorization (ABDM Electronic Consent or Audited Emergency Clinical Override)
          </p>
        </div>

        <button
          id="btn-dossier-confirm-next"
          onClick={onProceedToConsent}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/30 transition cursor-pointer"
        >
          <span>Authorize Patient Consent</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
