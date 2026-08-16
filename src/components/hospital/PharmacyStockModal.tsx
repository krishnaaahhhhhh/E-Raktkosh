import React, { useState } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import {
  X,
  Pill,
  ShieldAlert,
  Clock,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Droplet,
  Heart,
  Wind
} from 'lucide-react';
import { PharmacyItem } from '../../types';

interface PharmacyStockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PharmacyStockModal: React.FC<PharmacyStockModalProps> = ({ isOpen, onClose }) => {
  const { activeHospital, updatePharmacyStock } = usePrathmikta();

  if (!isOpen) return null;

  const pharmacy = activeHospital.pharmacy;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Critical Resus':
        return <Flame className="w-4 h-4 text-red-400" />;
      case 'Blood Products':
        return <Droplet className="w-4 h-4 text-rose-400" />;
      case 'Cardiology':
        return <Heart className="w-4 h-4 text-cyan-400" />;
      case 'Airway / Trauma':
        return <Wind className="w-4 h-4 text-amber-400" />;
      default:
        return <Pill className="w-4 h-4 text-purple-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Critical Stock':
        return 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse';
      case 'Low':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0c1220] border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.15)] overflow-hidden text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#080d18]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                  24/7 ER Emergency Medical Store
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  OPEN 24x7
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Pharmacist On Duty: <span className="text-slate-200">{pharmacy.onDutyPharmacist}</span> • {pharmacy.contactNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stock Matrix List */}
        <div className="p-6 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2 uppercase font-mono">
            <span>Critical Emergency Formulary & Crash Cart</span>
            <span>Real-time Stepper Sync</span>
          </div>

          <div className="space-y-2">
            {pharmacy.items.map((item) => (
              <div
                key={item.id}
                id={`pharmacy-item-${item.id}`}
                className="p-3.5 rounded-xl bg-[#070b14] border border-slate-800/80 hover:border-cyan-500/40 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Category: <span className="text-slate-300">{item.category}</span> • Min Threshold: {item.minThreshold} {item.unit}
                    </p>
                  </div>
                </div>

                {/* Steppers */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-base font-black font-mono text-white">
                      {item.stockLevel}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono ml-1">{item.unit}</span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
                    <button
                      id={`btn-stock-dec-${item.id}`}
                      onClick={() => updatePharmacyStock(item.id, item.stockLevel - 1)}
                      className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-stock-inc-${item.id}`}
                      onClick={() => updatePharmacyStock(item.id, item.stockLevel + 1)}
                      className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-cyan-400 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-[#080d18] flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>WebSocket Live Pharmacy Broadcast Enabled</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
