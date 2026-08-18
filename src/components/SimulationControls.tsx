import React from 'react';
import {
  Sliders,
  X,
  AlertTriangle,
  WifiOff,
  Building2,
  FileText,
  RotateCcw,
  CheckCircle2,
  FastForward,
  ShieldAlert,
} from 'lucide-react';
import { TransferRequestState } from '../types/transfer';

interface SimulationControlsProps {
  isOpen: boolean;
  state: TransferRequestState;
  onClose: () => void;
  onSimulateError: (type: 'network_fail' | 'hospital_busy' | 'consent_denied') => void;
  onResolveError: () => void;
  onFastForwardAcceptance: () => void;
  onFastForwardDispatch: () => void;
  onReset: () => void;
  onOpenPdf: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isOpen,
  state,
  onClose,
  onSimulateError,
  onResolveError,
  onFastForwardAcceptance,
  onFastForwardDispatch,
  onReset,
  onOpenPdf,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="simulation-sandbox-drawer"
      className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-slate-900 text-white w-full max-w-md h-full border-l border-slate-800 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between space-y-6">
        <div className="space-y-5">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2.5">
              <Sliders className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base font-bold text-white">Sandbox & Fallback Controls</h3>
                <p className="text-xs text-slate-400">Pillar 4 Demonstration Suite</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Error / Alert Status */}
          {state.isSimulatedError ? (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 space-y-2">
              <div className="flex items-center space-x-2 text-red-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Simulated Anomaly Active</span>
              </div>
              <p className="text-xs text-slate-300">
                {state.simulatedErrorMessage}
              </p>
              <div className="pt-2 flex space-x-2">
                <button
                  onClick={onResolveError}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Resolve Anomaly
                </button>
                {state.networkOfflineFallback && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPdf();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold border border-slate-700 flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Use PDF Fallback
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>All simulated microservices operational (FHIR Gateway, GPS Telemetry, Cath Lab Bridge).</span>
            </div>
          )}

          {/* Error Injection Suite */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              1. Inject Edge-Case & Error Scenarios
            </span>

            <button
              onClick={() => onSimulateError('network_fail')}
              className="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition flex items-start space-x-3 text-xs"
            >
              <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block">Simulate Network Interruption</span>
                <span className="text-[11px] text-slate-400">Tests offline resilient fallback to generated E-Dossier PDF dispatch.</span>
              </div>
            </button>

            <button
              onClick={() => onSimulateError('hospital_busy')}
              className="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition flex items-start space-x-3 text-xs"
            >
              <Building2 className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block">Cath Lab Overcapacity Alert</span>
                <span className="text-[11px] text-slate-400">Tests real-time rerouting to alternate regional PCI centers.</span>
              </div>
            </button>

            <button
              onClick={() => onSimulateError('consent_denied')}
              className="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition flex items-start space-x-3 text-xs"
            >
              <ShieldAlert className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block">Simulate Consent Failure</span>
                <span className="text-[11px] text-slate-400">Prompts attending physician for audited Emergency Life-Safety Override.</span>
              </div>
            </button>
          </div>

          {/* Quick Demo Fast-Forwards */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              2. Demo Fast-Forward Actions
            </span>

            <button
              onClick={() => {
                onFastForwardAcceptance();
                onClose();
              }}
              className="w-full p-2.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 text-xs font-semibold flex items-center justify-between transition"
            >
              <span className="flex items-center gap-2">
                <FastForward className="w-4 h-4" />
                Simulate Higher Center Acceptance (SGPGI)
              </span>
              <span className="text-[10px] bg-sky-500/30 px-1.5 py-0.5 rounded">1-Click</span>
            </button>

            <button
              onClick={() => {
                onFastForwardDispatch();
                onClose();
              }}
              className="w-full p-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-between transition"
            >
              <span className="flex items-center gap-2">
                <FastForward className="w-4 h-4" />
                Simulate Ambulance Dispatch & En Route
              </span>
              <span className="text-[10px] bg-amber-500/30 px-1.5 py-0.5 rounded">1-Click</span>
            </button>
          </div>
        </div>

        {/* Bottom Reset */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center justify-center space-x-2 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo to Initial Golden-Hour State</span>
          </button>
        </div>
      </div>
    </div>
  );
};
