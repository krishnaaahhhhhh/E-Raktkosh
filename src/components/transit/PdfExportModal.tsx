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
import { TransferRequestState } from '../../types/transfer';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
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
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
            <button
              id="btn-print-dossier"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document Simulator */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-slate-100 flex justify-center">
          <div
            id="printable-dossier-sheet"
            className="bg-white border border-slate-300 p-8 max-w-2xl w-full shadow-lg space-y-6 text-slate-900 text-xs font-serif"
          >
            {/* Form Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
              <div>
                <div className="font-sans font-bold text-xs uppercase text-red-600 tracking-wider">
                  PRATHMIKTA EMERGENCY CARE NETWORK
                </div>
                <h1 className="font-sans text-xl font-black uppercase text-slate-900">
                  Inter-Hospital Clinical Transfer Dossier
                </h1>
                <p className="text-[11px] text-slate-600 font-sans">
                  Ayushman Bharat Digital Mission (ABDM) • Emergency Handoff Artifact
                </p>
              </div>

              <div className="text-right font-sans">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Encounter Identifier</div>
                <div className="font-mono text-xs font-bold text-slate-900">{encounterId}</div>
                <div className="text-[10px] text-emerald-700 font-bold mt-1">● DIGITALLY SEALED</div>
              </div>
            </div>

            {/* Section 1: Demographics & Facility Routing */}
            <div className="grid grid-cols-2 gap-4 font-sans border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Patient Information</div>
                <div className="font-bold text-sm text-slate-900">{patient.name}</div>
                <div className="text-slate-600 text-xs">
                  Age: {patient.age} Yrs | Gender: {patient.gender === 'M' ? 'Male' : 'Female'} | Blood Group: {patient.bloodGroup}+
                </div>
                <div className="text-slate-600 text-xs font-mono">ABHA: {patient.abhaId}</div>
              </div>

              <div className="space-y-1 text-right">
                <div className="text-[10px] uppercase font-bold text-slate-500">Transfer Routing</div>
                <div className="text-xs">
                  <strong>Origin:</strong> {patient.currentHospital}
                </div>
                <div className="text-xs">
                  <strong>Destination:</strong> {selectedHospital?.name || 'SGPGI Lucknow'}
                </div>
                <div className="text-xs text-red-600 font-bold">
                  Target Service: {selectedHospital?.cathLabNumber || 'Cath Lab 02'}
                </div>
              </div>
            </div>

            {/* Section 2: Clinical Summary & Reason for Transfer */}
            <div className="space-y-2 font-sans border-b border-slate-200 pb-4">
              <div className="text-[10px] uppercase font-bold text-slate-500">Primary Emergency Diagnosis</div>
              <div className="p-2.5 bg-red-50 border border-red-200 rounded font-bold text-red-900 text-xs">
                {clinical.diagnosis} (ICD-10 Code: {clinical.icd10Code})
              </div>
              <p className="text-slate-700 text-xs leading-relaxed">
                <strong>HPI / Clinical Course:</strong> {clinical.historyOfPresentIllness}
              </p>
            </div>

            {/* Section 3: Vitals at Dispatch */}
            <div className="font-sans border-b border-slate-200 pb-4 space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-500">Pre-Transit Vital Signs</div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-[10px] text-slate-500 font-bold">HR</div>
                  <div className="font-bold text-red-600">{clinical.vitals.heartRate} bpm</div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-[10px] text-slate-500 font-bold">BP</div>
                  <div className="font-bold text-slate-900">{clinical.vitals.bloodPressure}</div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-[10px] text-slate-500 font-bold">SpO2</div>
                  <div className="font-bold text-emerald-600">{clinical.vitals.spO2}% (4L O2)</div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-[10px] text-slate-500 font-bold">RR</div>
                  <div className="font-bold text-slate-900">{clinical.vitals.respiratoryRate} /min</div>
                </div>
              </div>
            </div>

            {/* Section 4: Emergency Medications Administered */}
            <div className="font-sans border-b border-slate-200 pb-4 space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-500">Emergency Medications Log</div>
              <table className="w-full text-left text-xs border border-slate-200 divide-y divide-slate-200">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-600">
                  <tr>
                    <th className="p-1.5">Drug Name</th>
                    <th className="p-1.5">Dose</th>
                    <th className="p-1.5">Route</th>
                    <th className="p-1.5">Administered</th>
                    <th className="p-1.5">Clinician</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clinical.medications.map((m, idx) => (
                    <tr key={idx}>
                      <td className="p-1.5 font-semibold">{m.drugName}</td>
                      <td className="p-1.5">{m.dose}</td>
                      <td className="p-1.5">{m.route}</td>
                      <td className="p-1.5 font-mono">{m.timeAdministered}</td>
                      <td className="p-1.5">{m.administeredBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Section 5: Clinician Signatures & ABDM Hash */}
            <div className="grid grid-cols-2 gap-6 font-sans pt-2">
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Referring Physician</div>
                <div className="font-bold text-slate-900">{patient.attendingDoctor}</div>
                <div className="text-[11px] text-slate-600 font-mono">Reg: {patient.attendingRegNumber}</div>
                <div className="text-[10px] text-slate-400">Digitally signed via ABDM Bridge</div>
              </div>

              <div className="space-y-1 text-right">
                <div className="text-[10px] uppercase font-bold text-slate-500">Receiving Interventionalist</div>
                <div className="font-bold text-slate-900">{selectedHospital?.receivingDoctor}</div>
                <div className="text-[11px] text-emerald-700 font-bold">Cath Lab 02 Direct Standby</div>
                <div className="text-[10px] font-mono text-slate-400">HASH: {state.consent.auditHash.substring(0, 20)}...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
