import React from 'react';
import {
  Droplet,
  MapPin,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { AppViewMode } from '../../types';

interface CommandBloodBankViewProps {
  bloodBanksList: any[];
  setMode: (mode: AppViewMode) => void;
}

export const CommandBloodBankView: React.FC<CommandBloodBankViewProps> = ({
  bloodBanksList,
  setMode
}) => {
  const totalUnits = bloodBanksList.reduce((acc, b) => {
    const matrix = b.bloodBankData?.stockMatrix || {};
    return acc + Object.values(matrix).reduce((s: number, v: any) => s + (Number(v) || 0), 0);
  }, 0);

  return (
    <div className="space-y-4">
      {/* Header & Stats Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Droplet className="w-5 h-5 text-rose-500 fill-rose-100" />
            <span>Collaborated Blood Banks ({bloodBanksList.length} Banks • {totalUnits} Total Units)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time cold-chain blood stock matrices (A+, B+, O+, AB+) synced across partnered blood banks.
          </p>
        </div>
        <button
          onClick={() => setMode('partner')}
          className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Blood Bank (/hb)</span>
        </button>
      </div>

      {/* Blood Banks Grid */}
      {bloodBanksList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {bloodBanksList.map((bb, idx) => {
            const matrix = (bb.bloodBankData?.stockMatrix || {
              'A+': 18, 'A-': 8, 'B+': 24, 'B-': 6,
              'O+': 32, 'O-': 11, 'AB+': 14, 'AB-': 5
            }) as Record<string, number>;
            const sumUnits: number = Object.values(matrix).reduce((s: number, v: any) => s + (Number(v) || 0), 0);

            return (
              <div
                key={bb.facilityId || idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                        <h3 className="font-bold text-slate-900 text-sm">{bb.facilityName}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{bb.city || 'City'}, {bb.state || 'State'}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold">
                      {bb.bloodBankData?.coldChainStatus || 'Cold Chain OK'}
                    </span>
                  </div>

                  {/* 8 Blood Group Matrix */}
                  <div className="grid grid-cols-4 gap-1.5 my-3">
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((grp) => {
                      const qty = Number(matrix[grp]) || 0;
                      return (
                        <div key={grp} className="p-1.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                          <div className="text-[9px] text-slate-400 font-bold">{grp}</div>
                          <div className="text-xs font-black text-rose-600 font-mono">{qty}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-600 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Total Reserves:</span>
                      <span className="font-bold text-rose-600 font-mono">{sumUnits} Units</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Emergency Desk:</span>
                      <span className="font-mono font-semibold text-slate-800">{bb.contactPhone || '108'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setMode('bloodbank')}
                  className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <span>Launch Live Blood Inventory (/b)</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Droplet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Blood Banks Connected Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Blood banks that partner via <span className="font-mono font-bold">/hb</span> will appear here with live 8-group stock availability.
          </p>
          <button
            onClick={() => setMode('partner')}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Blood Bank (/hb)</span>
          </button>
        </div>
      )}
    </div>
  );
};
