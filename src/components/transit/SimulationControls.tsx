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
import { TransferRequestState } from '../../types/transfer';

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
      className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white text-slate-800 w-full max-w-md h-full border-l border-slate-200 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between space-y-6">
        <div className="space-y-5">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2.5">
              <Sliders className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Demonstration Sandbox</h3>
                <p className="text-xs text-slate-500">Pillar 4 Real-time State & Edge Cases</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Error / Alert Status */}
          {state.isSimulatedError ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2">
              <div className="flex items-center space-x-2 text-red-700 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Simulated Anomaly Active</span>
              </div>
              <p className="text-xs text-slate-700">
                {state.simulatedErrorMessage}
              </p>
              <div className="pt-2 flex space-x-2">
                <button
                  onClick={onResolveError}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Resolve Anomaly
                </button>
                {state.networkOfflineFallback && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPdf();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Use PDF Fallback
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>All microservices operational (FHIR Gateway, GPS Telemetry, Cath Lab Bridge).</span>
            </div>
          )}

          {/* Fast Forward Actions */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Workflow Fast-Forward Shortcuts
            </h4>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={onFastForwardAcceptance}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-800 flex items-center justify-between transition cursor-pointer"
              >
                <div>
                  <div className="font-bold flex items-center gap-1.5 text-slate-900">
                    <FastForward className="w-3.5 h-3.5 text-sky-600" />
                    <span>Fast-Forward: Higher Center Acceptance</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Simulate Dr. Vivek Saxena accepting from SGPGI Lucknow
                  </div>
                </div>
              </button>

              <button
                onClick={onFastForwardDispatch}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-800 flex items-center justify-between transition cursor-pointer"
              >
                <div>
                  <div className="font-bold flex items-center gap-1.5 text-slate-900">
                    <FastForward className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Fast-Forward: Ambulance Dispatched</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Simulate ALS-042 mobilization & real-time telemetry stream
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Edge Case Injectors */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Simulate Real-World Failure Scenarios
            </h4>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => onSimulateError('network_fail')}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-left transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <WifiOff className="w-3.5 h-3.5 text-red-600" />
                    <span>Network Offline & ABDM Sync Timeout</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tests offline physical PDF & printable handoff fallback.
                  </p>
                </div>
              </button>

              <button
                onClick={() => onSimulateError('hospital_busy')}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 text-left transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Cath Lab Emergency Diversion</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Simulates Cath Lab 02 occupied; prompts secondary center selection.
                  </p>
                </div>
              </button>

              <button
                onClick={() => onSimulateError('consent_denied')}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-left transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                    <span>Unconscious Patient / Signature Inability</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tests Emergency Clinical Override protocol & justification ledger.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Reset */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={onReset}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo to Initial State</span>
          </button>
        </div>
      </div>
    </div>
  );
};
