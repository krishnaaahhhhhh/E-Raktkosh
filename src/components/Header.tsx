import React from 'react';
import {
  Activity,
  Building2,
  Ambulance,
  GitMerge,
  FileText,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { TransferRequestState } from '../types/transfer';

interface HeaderProps {
  state: TransferRequestState;
  activeView: 'referring' | 'receiving' | 'ambulance' | 'architecture';
  setActiveView: (view: 'referring' | 'receiving' | 'ambulance' | 'architecture') => void;
  onOpenPdf: () => void;
  onOpenSandboxDrawer: () => void;
  onResetDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  activeView,
  setActiveView,
  onOpenPdf,
  onOpenSandboxDrawer,
  onResetDemo,
}) => {
  const isEnRoute = state.status === 'EN_ROUTE' || state.status === 'AMBULANCE_DISPATCHED';
  const isAccepted = state.receivingDoctorAccepted || state.status === 'RECEIVING_ACCEPTED';

  return (
    <header id="prathmikta-header" className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Bar */}
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-900/40 ring-1 ring-white/20 flex-shrink-0">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="font-black text-xl tracking-wider text-white">PRATHMIKTA</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-md">
                  Pillar 4
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Inter-Hospital Transit & E-Dossier Dispatch
              </p>
            </div>
          </div>

          {/* Master Encounter Key Badge */}
          <div className="hidden md:flex items-center bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-700 space-x-2.5">
            <span className="text-xs text-slate-400 font-medium">Encounter:</span>
            <span className="text-xs font-mono font-extrabold text-amber-400 tracking-wide">
              {state.encounterId}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              ABDM Synced
            </span>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-3">
            <button
              id="header-export-pdf-btn"
              onClick={onOpenPdf}
              className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 transition cursor-pointer"
              title="Export formatted clinical E-Dossier"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              <span>PDF Dossier</span>
            </button>

            <button
              id="header-sandbox-btn"
              onClick={onOpenSandboxDrawer}
              className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-amber-500/30 transition cursor-pointer"
              title="Simulation controls & error injection"
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden sm:inline">Sandbox</span>
            </button>

            <button
              id="header-reset-btn"
              onClick={onResetDemo}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-700/60 transition cursor-pointer"
              title="Reset Demo Workflow"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clean Spacious View Navigation */}
        <div className="flex space-x-2 pb-3 overflow-x-auto scrollbar-none">
          <button
            id="nav-view-referring"
            onClick={() => setActiveView('referring')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeView === 'referring'
                ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>District Hospital (Referring ER)</span>
          </button>

          <button
            id="nav-view-receiving"
            onClick={() => setActiveView('receiving')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer relative ${
              activeView === 'receiving'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-900/40'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Receiving Hospital (SGPGI Lucknow)</span>
            {state.status === 'TRANSFER_REQUESTED' && (
              <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-extrabold rounded animate-pulse">
                ACTION REQUIRED
              </span>
            )}
            {isAccepted && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>

          <button
            id="nav-view-ambulance"
            onClick={() => setActiveView('ambulance')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeView === 'ambulance'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Ambulance className="w-4 h-4" />
            <span>ALS Ambulance (ALS-042)</span>
            {isEnRoute && (
              <span className="px-1.5 py-0.5 bg-emerald-400 text-slate-950 text-[10px] font-extrabold rounded flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-spin" />
                EN ROUTE
              </span>
            )}
          </button>

          <button
            id="nav-view-architecture"
            onClick={() => setActiveView('architecture')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeView === 'architecture'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <GitMerge className="w-4 h-4" />
            <span>Encounter Architecture</span>
          </button>
        </div>
      </div>
    </header>
  );
};
