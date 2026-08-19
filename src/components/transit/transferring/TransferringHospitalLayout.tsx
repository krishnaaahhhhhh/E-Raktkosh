import React from 'react';
import {
  LayoutDashboard,
  Send,
  Activity,
  History,
  ArrowRightLeft,
  Sliders,
  Bell,
} from 'lucide-react';
import { TransferRequestState } from '../../../types/transfer';

export type TransferringSubRoute =
  | 'overview'
  | 'create-transfer'
  | 'active-transfers'
  | 'history';

interface TransferringHospitalLayoutProps {
  currentSubRoute: TransferringSubRoute;
  onNavigate: (route: TransferringSubRoute) => void;
  onSwitchToReceiving: () => void;
  onOpenSandbox: () => void;
  state: TransferRequestState;
  children: React.ReactNode;
}

export const TransferringHospitalLayout: React.FC<TransferringHospitalLayoutProps> = ({
  currentSubRoute,
  onNavigate,
  onSwitchToReceiving,
  onOpenSandbox,
  state,
  children,
}) => {
  const isTransferActive =
    state.status !== 'STABILIZED_READY' && state.status !== 'DESTINATION_SELECTED';

  // Strict 4 Navigation Options (Simplified & Easy to Navigate)
  const navItems = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'create-transfer' as const, label: 'New Transfer', icon: Send, highlight: true },
    {
      id: 'active-transfers' as const,
      label: 'Active & Transit',
      icon: Activity,
      badge: isTransferActive ? '1 Active' : undefined,
    },
    { id: 'history' as const, label: 'Transfer History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Header Bar */}
      <div className="bg-red-600 text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="bg-white/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
            TRANSFERRING HOSPITAL
          </span>
          <span className="font-semibold">District Hospital Kanpur (ER Unit)</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenSandbox}
            className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1 transition cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulation</span>
          </button>
          <button
            onClick={onSwitchToReceiving}
            className="px-3 py-1 rounded bg-white text-red-700 hover:bg-red-50 font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Switch to Receiving Center</span>
          </button>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              P4
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-slate-900 leading-tight">PRATHMIKTA</h1>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  TRANSFERRING
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Inter-Hospital Emergency Transfer</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 font-semibold">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>ABDM Gateway Online</span>
            </div>
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 text-xs">
              <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs border border-red-200">
                DR
              </div>
              <div className="hidden md:block text-left">
                <div className="font-bold text-slate-800 leading-none">Dr. Rajesh Tripathi</div>
                <div className="text-[10px] text-slate-500">CMO Kanpur ER</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body with Clean 4-Option Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row gap-5">
        {/* Left Sidebar - 4 Max Options */}
        <aside className="w-full md:w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-2 sticky top-20 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Workflow
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSubRoute === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-red-50 text-red-700 font-bold border-l-3 border-red-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Compact Current Case Info */}
            <div className="mt-3 pt-3 border-t border-slate-100 px-2.5 pb-1 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Current Case
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-0.5">
                <div className="font-bold text-slate-900 truncate">{state.patient.name} ({state.patient.age}y/M)</div>
                <div className="text-red-600 font-semibold text-[11px] truncate">{state.patient.condition}</div>
                <div className="text-slate-400 text-[10px] font-mono truncate">{state.encounterId}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};
