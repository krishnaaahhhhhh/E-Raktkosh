import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  Lock,
  ArrowRight,
  Send,
  ShieldCheck,
  FileCode,
  Radio,
  Server,
  Zap,
  Clock,
  Sparkles,
} from 'lucide-react';
import { TransferRequestState } from '../types/transfer';

interface SecureHandshakeAnimationProps {
  state: TransferRequestState;
  onCompleteHandshake: () => void;
  onOpenReceivingView: () => void;
}

export const SecureHandshakeAnimation: React.FC<SecureHandshakeAnimationProps> = ({
  state,
  onCompleteHandshake,
  onOpenReceivingView,
}) => {
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);

  const stages = [
    { id: 1, title: 'Referring Node', desc: 'District Hospital Kanpur dispatch socket initialized' },
    { id: 2, title: 'Clinical Validation', desc: 'Vitals, 12-lead ECG, medications & timeline verified' },
    { id: 3, title: 'FHIR Compilation', desc: 'Bundle sealed with SHA-256 integrity digest' },
    { id: 4, title: 'Consent Verification', desc: state.consent.type === 'EMERGENCY_OVERRIDE' ? 'Emergency clinical override audit signature logged' : 'ABDM Electronic Patient Consent validated' },
    { id: 5, title: 'Transfer Encryption', desc: 'Simulating AES-256-GCM encrypted payload dispatch' },
    { id: 6, title: 'Receiving Gateway', desc: `${state.hospitals.find(h => h.id === state.selectedHospitalId)?.name || 'SGPGI Lucknow'} Cath Lab Bridge notified` },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < stages.length) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setIsDone(true);
          onCompleteHandshake();
          return prev;
        }
      });
    }, 650);

    return () => clearInterval(timer);
  }, []);

  const selectedHospital = state.hospitals.find((h) => h.id === state.selectedHospitalId);

  return (
    <div
      id="secure-transfer-handshake-screen"
      className="bg-slate-950 rounded-3xl p-8 sm:p-10 text-white border border-slate-800 shadow-2xl space-y-8 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 relative z-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>ABDM Secure Channel Simulation</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
          Secure Transfer Handshake
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Orchestrating verifiable clinical packet transmission from <span className="text-slate-200 font-bold">{state.patient.currentHospital}</span> to <span className="text-sky-400 font-bold">{selectedHospital?.name}</span>.
        </p>
      </div>

      {/* Interactive Handshake Node Pipeline */}
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {stages.map((stage, idx) => {
            const isCompleted = currentStage > idx;
            const isCurrent = currentStage === idx;

            return (
              <div
                key={stage.id}
                className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 shadow-lg shadow-emerald-950/40'
                    : isCurrent
                    ? 'bg-indigo-950/60 border-indigo-500 text-white ring-2 ring-indigo-500/40 animate-pulse'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold">0{stage.id}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Radio className="w-4 h-4 text-indigo-400 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold leading-snug">{stage.title}</h4>
                  <p className="text-[11px] mt-1 line-clamp-2 opacity-80">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Checklist / Live Terminal */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 max-w-3xl mx-auto font-mono text-xs space-y-3 relative z-10">
        <div className="text-slate-400 text-xs border-b border-slate-800 pb-3 flex items-center justify-between font-bold">
          <span>ENCOUNTER ID: {state.encounterId}</span>
          <span className="text-emerald-400">STATUS: {isDone ? 'TRANSMITTED' : 'HANDSHAKE IN PROGRESS'}</span>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center space-x-2.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>✓ Patient data validated (Rajesh Kumar, 54M, STEMI)</span>
          </div>
          <div className={`flex items-center space-x-2.5 ${currentStage >= 3 ? 'text-emerald-400' : 'text-slate-600'}`}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{currentStage >= 3 ? '✓ E-Dossier generated (FHIR R4 Bundle sealed)' : '○ E-Dossier compilation'}</span>
          </div>
          <div className={`flex items-center space-x-2.5 ${currentStage >= 4 ? 'text-emerald-400' : 'text-slate-600'}`}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{currentStage >= 4 ? `✓ Consent verified (${state.consent.type === 'EMERGENCY_OVERRIDE' ? 'EMERGENCY OVERRIDE' : 'ABDM ARTIFACT'})` : '○ Consent authorization'}</span>
          </div>
          <div className={`flex items-center space-x-2.5 ${currentStage >= 5 ? 'text-emerald-400' : 'text-slate-600'}`}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{currentStage >= 5 ? '✓ Encryption simulated (AES-256-GCM envelope)' : '○ Cryptographic encryption'}</span>
          </div>
          <div className={`flex items-center space-x-2.5 ${currentStage >= 6 ? 'text-emerald-400' : 'text-slate-600'}`}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{currentStage >= 6 ? `✓ Transfer initiated -> ${selectedHospital?.name}` : '○ Receiving hospital handshake'}</span>
          </div>
        </div>
      </div>

      {/* Completion & Next Action */}
      {isDone && (
        <div className="text-center space-y-4 max-w-xl mx-auto pt-3 animate-fade-in relative z-10">
          <div className="p-5 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl text-emerald-300 space-y-1">
            <h3 className="text-lg font-bold flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Transfer Request Sent</span>
            </h3>
            <p className="text-xs text-slate-300">
              Status: <span className="font-semibold text-amber-300">Awaiting receiving hospital confirmation</span>
            </p>
            <p className="text-xs text-slate-400">
              Cath Lab 02 soft-lock notification pushed to {selectedHospital?.receivingDoctor}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="btn-switch-to-receiving-view"
              onClick={onOpenReceivingView}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 transition cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Switch to Receiving Hospital View (SGPGI Lucknow)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
