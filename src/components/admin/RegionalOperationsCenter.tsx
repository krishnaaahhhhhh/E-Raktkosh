import React, { useState } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import { HospitalFacility } from '../../types';
import {
  Layers,
  Hospital,
  Bed,
  HeartPulse,
  Wind,
  Ambulance,
  PhoneCall,
  AlertTriangle,
  Radio,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Flame,
  Search
} from 'lucide-react';
import { playTactileClick } from '../../lib/audio';

export const RegionalOperationsCenter: React.FC = () => {
  const { hospitals, setActiveHospitalId, setMode } = usePrathmikta();
  const [searchCity, setSearchCity] = useState('');
  const [surgeAlertActive, setSurgeAlertActive] = useState(false);

  const hospitalList = Object.values(hospitals) as HospitalFacility[];

  const filteredHospitals = searchCity
    ? hospitalList.filter(
        (h) =>
          h.name.toLowerCase().includes(searchCity.toLowerCase()) ||
          h.city.toLowerCase().includes(searchCity.toLowerCase()) ||
          h.state?.toLowerCase().includes(searchCity.toLowerCase())
      )
    : hospitalList;

  // Aggregate stats across all connected hospitals
  const totalNetworkBeds = hospitalList.reduce((acc, h) => acc + h.totalFacilityBeds, 0);
  const totalOccupiedBeds = hospitalList.reduce((acc, h) => acc + h.occupiedFacilityBeds, 0);
  const totalFreeBeds = totalNetworkBeds - totalOccupiedBeds;
  const overallOccupancyPct = Math.round((totalOccupiedBeds / totalNetworkBeds) * 100);

  return (
    <div id="regional-operations-center" className="w-full h-full bg-[#040711] text-slate-100 flex flex-col overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-purple-950/40 border-b border-purple-500/40 px-4 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/50 text-purple-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-purple-500 text-slate-950">
                TIER 4: DEOC / 108 ADMIN
              </span>
              <span className="text-xs font-bold text-white tracking-wide">
                District Emergency Operations Network
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Regional Multi-Hospital Capacity Grid &bull; Emergency Dispatch Routing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playTactileClick();
              setSurgeAlertActive((prev) => !prev);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              surgeAlertActive
                ? 'bg-red-600 text-white border-red-500 animate-pulse'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{surgeAlertActive ? 'MASS CASUALTY PROTOCOL ACTIVE' : 'Declare Mass Surge Alert'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Network Metrics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Connected Hospitals</span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              {hospitalList.length} Facilities
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Live Telemetry
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Total Available Beds</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1">
              {totalFreeBeds} <span className="text-xs text-slate-400 font-normal">/ {totalNetworkBeds}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Net Capacity: {100 - overallOccupancyPct}% Free
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Network Occupancy</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1">
              {overallOccupancyPct}%
            </div>
            <span className="text-[11px] text-amber-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Normal Surge Index
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Active 108 Ambulances</span>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono mt-1">
              18 Units
            </div>
            <span className="text-[11px] text-cyan-400 font-mono">
              Avg ETA: 5.2 mins
            </span>
          </div>
        </div>

        {/* Hospital Facility Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Hospital className="w-5 h-5 text-purple-400" />
                Inter-Hospital Bed Surge Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Click any hospital to inspect its live ER TV Wall Command Center.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Filter by city or hospital name..."
                className="bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHospitals.map((hosp) => {
              const freeBeds = hosp.totalFacilityBeds - hosp.occupiedFacilityBeds;
              const occPct = Math.round((hosp.occupiedFacilityBeds / hosp.totalFacilityBeds) * 100);

              return (
                <div
                  key={hosp.id}
                  id={`deoc-hosp-${hosp.id}`}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/80 transition-all shadow-lg space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700">
                          {hosp.traumaLevel}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">{hosp.city}, {hosp.state}</span>
                      </div>
                      <h4 className="text-base font-black text-white mt-1">{hosp.name}</h4>
                    </div>

                    <button
                      onClick={() => {
                        setActiveHospitalId(hosp.id);
                        setMode('tv_command');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Open TV ER Wall &rarr;
                    </button>
                  </div>

                  {/* Bed Stats Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Total Bed Occupancy:</span>
                      <span className="font-bold text-white">
                        {hosp.occupiedFacilityBeds} / {hosp.totalFacilityBeds} ({occPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occPct > 90 ? 'bg-red-500' : occPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${occPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Specialized Units Available */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800 flex items-center gap-1">
                      <Bed className="w-3 h-3" /> {freeBeds} Free Beds
                    </span>
                    {hosp.cathLabActive && (
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-red-400 border border-slate-800 flex items-center gap-1">
                        <HeartPulse className="w-3 h-3" /> Cath Lab Active
                      </span>
                    )}
                    {hosp.burnUnitReady && (
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-orange-400 border border-slate-800 flex items-center gap-1">
                        <Flame className="w-3 h-3" /> Burn Unit
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
