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
  const [overrideStaffName, setOverrideStaffName] = useState<string>('Dr. Ananya Sharma');
  const [overrideStaffReg, setOverrideStaffReg] = useState<string>('UP-MED-44912');
  const [overrideReason, setOverrideReason] = useState<string>(
    'Critical Anteroseptal STEMI with acute hemodynamic instability. Patient in active distress; immediate emergency higher-center PCI transfer required to prevent irreversible myocardial necrosis.'
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 sm:p-7 bg-slate-900 text-white border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-2 ring-emerald-500/30">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Patient Data Authorization</h3>
              <p className="text-xs text-slate-400 mt-0.5">ABDM Electronic Health Record Handoff Consent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
          <div className="p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 rounded-2xl text-sky-900 dark:text-sky-200">
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
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                consentMode === 'standard'
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 dark:border-emerald-600 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">ABDM Consent</span>
                <CheckCircle2
                  className={`w-4 h-4 ${
                    consentMode === 'standard' ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Standard electronic patient or proxy signature authorization.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setConsentMode('override')}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                consentMode === 'override'
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500 dark:border-amber-600 ring-2 ring-amber-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Emergency Override</span>
                <AlertOctagon
                  className={`w-4 h-4 ${
                    consentMode === 'override' ? 'text-amber-600' : 'text-slate-400'
                  }`}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Critical life-saving transfer where consent cannot be captured in time.
              </p>
            </button>
          </div>

          {/* Standard ABDM Consent Form */}
          {consentMode === 'standard' && (
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  ABDM Consent Artifact Details
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                  ✓ Consent Obtained
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient ABHA ID:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {state.patient.abhaId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Consent Timestamp:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    18 Aug 2026, 20:04
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Consent Purpose:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Emergency treatment / inter-hospital transfer
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipient Gateway:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedHospital?.name} (ABDM Node)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Override Form */}
          {consentMode === 'override' && (
            <div className="space-y-4 bg-amber-50/60 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50">
              <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-900/50 pb-3">
                <span className="font-bold text-sm text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-amber-600" />
                  Emergency Clinical Override Log
                </span>
                <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
                  Audited Entry
                </span>
              </div>

              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                If consent cannot be captured in time during a critical emergency, an authorized emergency override may be recorded and audited in the Encounter Ledger.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Authorized Medical Staff Name
                  </label>
                  <input
                    type="text"
                    value={overrideStaffName}
                    onChange={(e) => setOverrideStaffName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Medical Council Registration No.
                  </label>
                  <input
                    type="text"
                    value={overrideStaffReg}
                    onChange={(e) => setOverrideStaffReg(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Clinical Justification for Emergency Override
                  </label>
                  <textarea
                    rows={2}
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cryptographic Audit Stamp note */}
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <Lock className="w-4 h-4 text-slate-400" />
            <span>
              All authorizations generate a cryptographic SHA-256 hash appended to Encounter ID <span className="font-mono font-bold">{state.encounterId}</span>.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-authorization"
            onClick={handleSubmit}
            className="inline-flex items-center space-x-2 px-7 py-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>
              {consentMode === 'override'
                ? 'Sign Emergency Override & Dispatch'
                : 'Confirm ABDM Authorization & Dispatch'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
