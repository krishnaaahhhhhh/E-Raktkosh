import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  Lock,
  FileCheck2,
  Clock,
  UserCheck,
  Building,
  KeyRound,
  ArrowRight,
  X,
  FileText,
} from 'lucide-react';
import { TransferRequestState } from '../../types/transfer';

interface ConsentModalProps {
  isOpen: boolean;
  state: TransferRequestState;
  onClose: () => void;
  onAuthorizeConsent: (isEmergencyOverride: boolean, overrideData?: { staffName: string; staffReg: string; reason: string }) => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  state,
  onClose,
  onAuthorizeConsent,
}) => {
  const [consentMode, setConsentMode] = useState<'standard' | 'override'>('standard');
  
  // Override form fields
  const [overrideStaffName, setOverrideStaffName] = useState<string>('Dr. Rajesh Tripathi');
  const [overrideStaffReg, setOverrideStaffReg] = useState<string>('UP-MED-38192');
  const [overrideReason, setOverrideReason] = useState<string>(
    'Critical Anteroseptal STEMI with evolving cardiogenic shock. Immediate emergency higher-center PCI transfer required to prevent irreversible myocardial necrosis.'
  );

  if (!isOpen) return null;

  const selectedHospital = state.hospitals.find((h) => h.id === state.selectedHospitalId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (consentMode === 'override') {
      onAuthorizeConsent(true, {
        staffName: overrideStaffName,
        staffReg: overrideStaffReg,
        reason: overrideReason,
      });
    } else {
      onAuthorizeConsent(false);
    }
  };

  return (
    <div
      id="patient-data-authorization-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Patient Data Authorization</h3>
              <p className="text-xs text-slate-500">ABDM Electronic Health Record Handoff Consent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-sky-900">
            <p className="leading-relaxed">
              The patient's clinical information will be securely shared with the selected receiving hospital (
              <span className="font-bold">{selectedHospital?.name}</span>) for continuity of emergency care.
            </p>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setConsentMode('standard')}
              className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between cursor-pointer ${
                consentMode === 'standard'
                  ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900">Standard ABDM Consent</span>
                  <CheckCircle2
                    className={`w-4 h-4 ${consentMode === 'standard' ? 'text-emerald-600' : 'text-slate-400'}`}
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Electronic consent generated via ABDM gateway.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setConsentMode('override')}
              className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between cursor-pointer ${
                consentMode === 'override'
                  ? 'bg-amber-50/50 border-amber-500 ring-2 ring-amber-500/20'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900">Emergency Override</span>
                  <AlertOctagon
                    className={`w-4 h-4 ${consentMode === 'override' ? 'text-amber-600' : 'text-slate-400'}`}
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Clinical emergency waiver when patient cannot sign in time.
                </p>
              </div>
            </button>
          </div>

          {/* Standard Mode Details */}
          {consentMode === 'standard' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex justify-between items-center text-slate-600">
                <span>Patient ABHA ID:</span>
                <span className="font-mono font-bold text-slate-900">{state.patient.abhaId}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Consent Artifact Purpose:</span>
                <span className="font-semibold text-slate-900">Emergency Inter-Hospital Transfer</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Scope:</span>
                <span className="font-semibold text-emerald-700">Full Clinical Episode & Diagnostics</span>
              </div>
            </div>
          )}

          {/* Override Form */}
          {consentMode === 'override' && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-center space-x-2 text-amber-900 font-bold">
                <AlertOctagon className="w-4 h-4 text-amber-600" />
                <span>Emergency Clinical Override Record</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Authorizing Physician
                </label>
                <input
                  type="text"
                  value={overrideStaffName}
                  onChange={(e) => setOverrideStaffName(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Medical Council Reg Number
                </label>
                <input
                  type="text"
                  value={overrideStaffReg}
                  onChange={(e) => setOverrideStaffReg(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Clinical Emergency Justification
                </label>
                <textarea
                  rows={2}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-authorization"
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition cursor-pointer flex items-center space-x-2"
          >
            <span>Authorize & Transmit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
