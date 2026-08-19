import React, { useState } from 'react';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  FileText,
  HeartPulse,
  Zap,
  Ambulance,
  User,
  Clock,
  Send,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { TransferRequestState } from '../../types/transfer';

interface ReceivingHospitalDashboardProps {
  state: TransferRequestState;
  onAcceptTransfer: (notes?: string) => void;
  onViewDossier: () => void;
  onProceedToDispatch: () => void;
  onRequestClarification?: (note: string) => void;
}

export const ReceivingHospitalDashboard: React.FC<ReceivingHospitalDashboardProps> = ({
  state,
  onAcceptTransfer,
  onViewDossier,
  onProceedToDispatch,
}) => {
  const [showClarificationModal, setShowClarificationModal] = useState<boolean>(false);
  const [clarificationText, setClarificationText] = useState<string>(
    'Confirm patient received 5000 IU Heparin bolus. Prepare Cath Lab 2 for immediate direct-transfer sheath insertion on arrival.'
  );

  const selectedHospital = state.hospitals.find((h) => h.id === state.selectedHospitalId);
  const isAccepted = state.receivingDoctorAccepted || state.status === 'RECEIVING_ACCEPTED' || state.status === 'AMBULANCE_DISPATCHED' || state.status === 'EN_ROUTE';

  const handleAccept = () => {
    onAcceptTransfer(clarificationText);
  };

  return (
    <div className="space-y-8">
      {/* Receiving Hospital Top Command Bar */}
      <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-600/20 text-sky-400 flex items-center justify-center border border-sky-500/30 flex-shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
                TERTIARY HIGHER CENTER COMMAND
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-extrabold uppercase">
                CODE STEMI GATEWAY
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {selectedHospital?.name || 'SGPGI Lucknow'} — Emergency & Cath Lab Triage
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chief Interventionalist: <span className="text-slate-200 font-semibold">{selectedHospital?.receivingDoctor}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onViewDossier}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-sky-400" />
            <span>VIEW E-DOSSIER</span>
          </button>
        </div>
      </div>

      {/* Main Incoming Transfer Alert Box */}
      <div
        id="incoming-transfer-card"
        className={`rounded-3xl p-7 sm:p-8 border-2 transition-all ${
          isAccepted
            ? 'bg-emerald-950/20 dark:bg-emerald-950/20 border-emerald-500/60 shadow-xl shadow-emerald-950/30'
            : 'bg-white dark:bg-slate-900 border-red-500/80 shadow-2xl shadow-red-950/20'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 rounded-full bg-red-600 text-white text-xs font-extrabold tracking-wider uppercase flex items-center gap-1.5 animate-pulse">
                <HeartPulse className="w-4 h-4" />
                Priority: CRITICAL
              </span>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                ENCOUNTER ID: {state.encounterId}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                ABDM Encrypted Packet Verified
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Incoming Transfer: {state.patient.name} ({state.patient.age} {state.patient.gender})
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Condition: <span className="font-bold text-red-600 dark:text-red-400">{state.patient.condition}</span> • Origin: <span className="font-semibold text-slate-800 dark:text-slate-200">{state.patient.currentHospital}</span>
            </p>
          </div>

          {/* Right Status Badge */}
          <div className="flex flex-col items-start lg:items-end">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Transit ETA Window</div>
            <div className="text-3xl font-black text-amber-500 font-mono flex items-center gap-2 mt-0.5">
              <Clock className="w-6 h-6" />
              <span>02h 18m</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Corridor: Kanpur → Lucknow (88 km)</div>
          </div>
        </div>

        {/* Readiness Checklist Status Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-7">
          {/* E-Dossier */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 uppercase font-bold">E-Dossier</span>
              <FileText className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Available
            </div>
            <p className="text-xs text-slate-500">12-lead ECG, labs & meds loaded</p>
          </div>

          {/* Cardiology */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 uppercase font-bold">Cardiology</span>
              <HeartPulse className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              {isAccepted ? 'Confirmed & Standby' : 'Notified'}
            </div>
            <p className="text-xs text-slate-500">Dr. Vivek Saxena on call</p>
          </div>

          {/* Cath Lab */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 uppercase font-bold">Cath Lab</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className={`text-sm font-bold flex items-center gap-1 ${isAccepted ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400'}`}>
              <Sparkles className="w-4 h-4" />
              {isAccepted ? 'Confirmed Reserved (Lab 02)' : 'Soft Locked (Lab 02)'}
            </div>
            <p className="text-xs text-slate-500">Direct ER-to-table protocol</p>
          </div>

          {/* ALS Ambulance */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 uppercase font-bold">ALS Ambulance</span>
              <Ambulance className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Assigned (ALS-042)
            </div>
            <p className="text-xs text-slate-500">Paramedic Arjun Nair</p>
          </div>
        </div>

        {/* Action Button Bar */}
        {!isAccepted ? (
          <div className="pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Receiving physician action required to hard-confirm Cath Lab 02 and trigger departure clearance.
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onViewDossier}
                className="flex-1 sm:flex-none px-5 py-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
              >
                VIEW E-DOSSIER
              </button>

              <button
                onClick={() => setShowClarificationModal(true)}
                className="flex-1 sm:flex-none px-5 py-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>REQUEST CLARIFICATION</span>
              </button>

              <button
                id="btn-accept-transfer-primary"
                onClick={handleAccept}
                className="flex-1 sm:flex-none px-7 py-3 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ACCEPT TRANSFER</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-5 border-t border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                TRANSFER ACCEPTED — CATH LAB 02 RESERVED
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Receiving physician {selectedHospital?.receivingDoctor} authorized admission. ALS dispatch unlocked.
              </p>
            </div>

            <button
              id="btn-proceed-to-dispatch-screen"
              onClick={onProceedToDispatch}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/30 transition cursor-pointer"
            >
              <Ambulance className="w-4 h-4" />
              <span>Proceed to ALS Ambulance Dispatch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Clarification Pre-orders Modal */}
      {showClarificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Add Receiving Cath Lab Pre-Orders / Clarification
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              These clinical pre-orders will be transmitted in real-time to the attending ALS paramedic in unit ALS-042.
            </p>

            <textarea
              rows={3}
              value={clarificationText}
              onChange={(e) => setClarificationText(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowClarificationModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowClarificationModal(false);
                  handleAccept();
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
              >
                Send Pre-Orders & Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
