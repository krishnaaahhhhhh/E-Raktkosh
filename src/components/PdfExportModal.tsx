import React from 'react';
import {
  Printer,
  Download,
  X,
  ShieldCheck,
  Building2,
  HeartPulse,
  Stethoscope,
  Activity,
  FileCheck2,
  QrCode,
} from 'lucide-react';
import { TransferRequestState } from '../types/transfer';

interface PdfExportModalProps {
  isOpen: boolean;
  state: TransferRequestState;
  onClose: () => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  state,
  onClose,
}) => {
  if (!isOpen) return null;

  const { patient, clinical, encounterId } = state;
  const selectedHospital = state.hospitals.find((h) => h.id === state.selectedHospitalId);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `E-Dossier-${encounterId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      id="pdf-export-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Printer className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Official Clinical E-Dossier (PDF / Print Fallback)
              </h3>
              <p className="text-xs text-slate-400">
                ABDM Emergency Clinical Handoff Form • Encounter: <span className="font-mono text-amber-300">{encounterId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadJson}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
            <button
              id="btn-print-dossier"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper View */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex-1">
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 space-y-6 text-xs text-slate-800 dark:text-slate-200">
            {/* Header / Seal */}
            <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-lg tracking-wider text-slate-900 dark:text-white">
                    PRATHMIKTA EMERGENCY NETWORK
                  </span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[10px] font-bold uppercase rounded">
                    CRITICAL TRANSFER DOSSIER
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ayushman Bharat Digital Mission (ABDM) Interoperable Emergency Clinical Document
                </p>
                <div className="text-xs font-mono font-bold mt-1 text-slate-700 dark:text-slate-300">
                  ENCOUNTER ID: {encounterId} • DOSSIER REF: EDOS-{encounterId}
                </div>
              </div>

              {/* Mock QR Verification */}
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="w-14 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-mono font-bold text-[9px] rounded">
                  QR-VERIFIED
                </div>
                <span className="text-[9px] text-slate-500 mt-0.5 block">ABDM Fast-Track</span>
              </div>
            </div>

            {/* Transfer Routing Header */}
            <div className="grid grid-cols-2 gap-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Origin / Referring Facility</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{patient.currentHospital}</span>
                <span className="text-slate-500 block mt-0.5">Attending: {patient.attendingDoctor} ({patient.attendingRegNumber})</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Receiving Higher Center</span>
                <span className="font-bold text-sky-600 dark:text-sky-400 text-sm">{selectedHospital?.name}</span>
                <span className="text-slate-500 block mt-0.5">Consultant: {selectedHospital?.receivingDoctor} • {selectedHospital?.cathLabNumber}</span>
              </div>
            </div>

            {/* Patient Demographics */}
            <div className="space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-1">
                1. Patient Demographics & Identification
              </h4>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <span className="text-slate-500 block text-[10px]">Patient Name:</span>
                  <span className="font-bold">{patient.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Age / Sex:</span>
                  <span className="font-semibold">{patient.age} yrs / {patient.gender === 'M' ? 'Male' : 'Female'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Blood Group:</span>
                  <span className="font-bold text-red-600">{patient.bloodGroup}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ABHA ID:</span>
                  <span className="font-mono font-bold text-emerald-600">{patient.abhaId}</span>
                </div>
              </div>
            </div>

            {/* Diagnosis & Clinical Summary */}
            <div className="space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-1">
                2. Clinical Presentation & Emergency Stabilization
              </h4>
              <p className="p-2.5 bg-red-50/50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-900/40 text-red-900 dark:text-red-300 font-semibold">
                DIAGNOSIS: {clinical.diagnosis} (ICD-10: {clinical.icd10Code})
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {clinical.historyOfPresentIllness}
              </p>
            </div>

            {/* Stabilization & Vitals */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 block">Vitals Prior to Transit:</span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 block">HR</span>
                    <span className="font-bold text-sm text-red-600">{clinical.vitals.heartRate} bpm</span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 block">SpO2</span>
                    <span className="font-bold text-sm text-sky-600">{clinical.vitals.spO2}%</span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 block">BP</span>
                    <span className="font-bold text-sm text-emerald-600">{clinical.vitals.bloodPressure.split(' ')[0]}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 block">Critical Diagnostics:</span>
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 space-y-1 text-[11px]">
                  <div>• <strong>12-Lead ECG:</strong> 3.5mm ST Elevation V1-V4</div>
                  <div>• <strong>Troponin-I:</strong> &gt; 4.8 ng/mL (Positive)</div>
                  <div>• <strong>POCUS Echo:</strong> Anterior Wall Hypokinesia</div>
                </div>
              </div>
            </div>

            {/* Medications Administered */}
            <div className="space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-1">
                3. Medications & Emergency Dosing
              </h4>
              <table className="w-full text-left border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-2">Medication</th>
                    <th className="p-2">Dose / Route</th>
                    <th className="p-2">Time</th>
                    <th className="p-2">Clinician</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-[11px]">
                  {clinical.medications.map((m, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-semibold">{m.drugName} ({m.category})</td>
                      <td className="p-2">{m.dose} via {m.route}</td>
                      <td className="p-2 font-mono">{m.timeAdministered}</td>
                      <td className="p-2 text-slate-500">{m.administeredBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Consent & Audit Verification */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Authorization & Consent Status:</span>
                <span className="text-emerald-600 font-mono">
                  {state.consent.type === 'EMERGENCY_OVERRIDE' ? 'EMERGENCY CLINICAL OVERRIDE AUDITED' : 'ABDM PATIENT CONSENT VALIDATED'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Purpose: {state.consent.purpose} • Timestamp: {state.consent.timestamp}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Audit Digest: {state.consent.auditHash}
              </div>
            </div>

            {/* Doctor Signatures */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="h-10 border-b border-dashed border-slate-400 flex items-center justify-center font-serif italic text-slate-700 dark:text-slate-300">
                  {patient.attendingDoctor}
                </div>
                <span className="text-slate-500 block mt-1">Referring Attending Physician</span>
                <span className="font-mono text-[10px] text-slate-400">Reg: {patient.attendingRegNumber}</span>
              </div>

              <div>
                <div className="h-10 border-b border-dashed border-slate-400 flex items-center justify-center font-serif italic text-slate-700 dark:text-slate-300">
                  {selectedHospital?.receivingDoctor}
                </div>
                <span className="text-slate-500 block mt-1">Receiving Higher Center Interventionalist</span>
                <span className="text-[10px] text-slate-400">{selectedHospital?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
