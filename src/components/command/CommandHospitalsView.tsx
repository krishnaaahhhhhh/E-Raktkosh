import React from 'react';
import {
  Building2,
  Bed,
  Activity,
  Phone,
  MapPin,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { AppViewMode } from '../../types';

interface CommandHospitalsViewProps {
  hospitalsList: any[];
  setMode: (mode: AppViewMode) => void;
}

export const CommandHospitalsView: React.FC<CommandHospitalsViewProps> = ({
  hospitalsList,
  setMode
}) => {
  return (
    <div className="space-y-4">
      {/* Header & Stats Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span>Collaborated Hospitals & Trauma Centers ({hospitalsList.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time live telemetry, ICU bed capacities, and ER trauma bay sync from partnered hospitals.
          </p>
        </div>
        <button
          onClick={() => setMode('partner')}
          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Hospital (/hb)</span>
        </button>
      </div>

      {/* Hospitals Grid */}
      {hospitalsList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {hospitalsList.map((hosp, idx) => {
            const cap = hosp.hospitalCapacity || {};
            const icu = Number(cap.icuBeds) || 0;
            const vents = Number(cap.ventilators) || 0;
            const erBays = Number(cap.erTraumaBays) || 0;
            const o2 = Number(cap.oxygenCylinders) || 0;

            return (
              <div
                key={hosp.facilityId || idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h3 className="font-bold text-slate-900 text-sm">{hosp.facilityName}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{hosp.city || 'City'}, {hosp.state || 'State'}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                      {hosp.abdmId ? 'ABDM VERIFIED' : 'ACTIVE'}
                    </span>
                  </div>

                  {/* Bed & Equipment Matrix */}
                  <div className="grid grid-cols-2 gap-2 my-3">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">ICU BEDS</div>
                      <div className="text-lg font-black text-slate-900 font-mono">{icu}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">VENTILATORS</div>
                      <div className="text-lg font-black text-slate-900 font-mono">{vents}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">ER TRAUMA BAYS</div>
                      <div className="text-lg font-black text-slate-900 font-mono">{erBays}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">OXYGEN CYLINDERS</div>
                      <div className="text-lg font-black text-slate-900 font-mono">{o2}</div>
                    </div>
                  </div>

                  {/* Doctor on Duty & Contact */}
                  <div className="space-y-1 text-[11px] text-slate-600 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">ER Lead / Contact:</span>
                      <span className="font-semibold text-slate-800">{hosp.contactPerson || 'Emergency Lead'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Hotline:</span>
                      <span className="font-mono font-semibold text-slate-800">{hosp.contactPhone || '108'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setMode('hospital')}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <span>Launch Hospital ER Dashboard</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Hospitals Collaborated Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Hospitals that onboard and verify via <span className="font-mono font-bold">/hb</span> will appear here with live bed telemetry.
          </p>
          <button
            onClick={() => setMode('partner')}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard First Hospital (/hb)</span>
          </button>
        </div>
      )}
    </div>
  );
};
