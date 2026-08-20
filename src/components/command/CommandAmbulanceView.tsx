import React from 'react';
import {
  Ambulance,
  Radio,
  MapPin,
  ArrowUpRight,
  Plus,
  Navigation,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { AppViewMode } from '../../types';

interface CommandAmbulanceViewProps {
  ambulancesList: any[];
  setMode: (mode: AppViewMode) => void;
}

export const CommandAmbulanceView: React.FC<CommandAmbulanceViewProps> = ({
  ambulancesList,
  setMode
}) => {
  const totalUnits = ambulancesList.reduce((acc, a) => acc + (Number(a.ambulanceFleetData?.connectedCount) || 1), 0);

  return (
    <div className="space-y-4">
      {/* Header & Stats Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Ambulance className="w-5 h-5 text-blue-600" />
            <span>Collaborated Ambulance Fleets ({ambulancesList.length} Partners • {totalUnits} Active Vehicles)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time GPS telemetry, ALS/BLS vehicle dispatch, and emergency transit tracking.
          </p>
        </div>
        <button
          onClick={() => setMode('partner')}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Ambulance Fleet (/hb)</span>
        </button>
      </div>

      {/* Ambulance Fleets Grid */}
      {ambulancesList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ambulancesList.map((fleet, idx) => {
            const data = fleet.ambulanceFleetData || {};
            const count = Number(data.connectedCount) || 1;
            const syncType = data.gpsSyncType || 'Live GPS';
            const coverage = data.operatingZone || `${fleet.city || 'Statewide'} Metro Grid`;

            return (
              <div
                key={fleet.facilityId || idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                        <h3 className="font-bold text-slate-900 text-sm">{fleet.facilityName}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{fleet.city || 'City'}, {fleet.state || 'State'}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
                      {syncType}
                    </span>
                  </div>

                  {/* Fleet Metrics */}
                  <div className="grid grid-cols-2 gap-2 my-3">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">FLEET SIZE</div>
                      <div className="text-lg font-black text-blue-600 font-mono">{count} Units</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">GPS STATUS</div>
                      <div className="text-xs font-bold text-emerald-600 mt-1 flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        ONLINE
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-600 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Coverage Zone:</span>
                      <span className="font-semibold text-slate-800 truncate">{coverage}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Dispatcher Phone:</span>
                      <span className="font-mono font-semibold text-slate-800">{fleet.contactPhone || '108'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setMode('ambulance')}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <span>Open Paramedic & Fleet Dispatch</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Ambulance className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Ambulance Fleets Connected Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            EMS operators and private ambulance providers that register via <span className="font-mono font-bold">/hb</span> will appear here with live GPS tracking.
          </p>
          <button
            onClick={() => setMode('partner')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Ambulance Fleet (/hb)</span>
          </button>
        </div>
      )}
    </div>
  );
};
