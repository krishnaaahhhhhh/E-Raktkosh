import React, { useState, useMemo } from 'react';
import {
  Building2,
  Ambulance,
  Droplet,
  Search,
  ArrowUpRight,
  Plus,
  Filter
} from 'lucide-react';
import { AppViewMode } from '../../types';

interface CommandFacilityTableProps {
  allFacilities: any[];
  setMode: (mode: AppViewMode) => void;
  timeStr: string;
}

export const CommandFacilityTable: React.FC<CommandFacilityTableProps> = ({
  allFacilities,
  setMode,
  timeStr
}) => {
  const [filterType, setFilterType] = useState<'all' | 'hospital' | 'blood_bank' | 'ambulance'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredFacilities = useMemo(() => {
    return allFacilities.filter((fac) => {
      if (filterType !== 'all' && fac.facilityType !== filterType) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (fac.facilityName || '').toLowerCase().includes(q) ||
        (fac.city || '').toLowerCase().includes(q) ||
        (fac.state || '').toLowerCase().includes(q) ||
        (fac.facilityId || '').toLowerCase().includes(q)
      );
    });
  }, [allFacilities, filterType, searchQuery]);

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>REAL-TIME COLLABORATED PARTNER FACILITIES</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Showing only verified hospitals, blood banks, and ambulance fleets connected with Prathmikta.
          </p>
        </div>

        {/* Filter Pills & Search Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter Pills */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px]">
            {[
              { id: 'all', label: 'All Connected', count: allFacilities.length },
              { id: 'hospital', label: 'Hospitals', count: allFacilities.filter(f => f.facilityType === 'hospital').length },
              { id: 'blood_bank', label: 'Blood Banks', count: allFacilities.filter(f => f.facilityType === 'blood_bank').length },
              { id: 'ambulance', label: 'Ambulances', count: allFacilities.filter(f => f.facilityType === 'ambulance').length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search partner..."
              className="pl-8 pr-3 py-1 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 sm:w-48 text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="w-full overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase">
              <th className="py-2.5 px-3 font-bold">Partner Facility</th>
              <th className="py-2.5 px-3 font-bold">Type</th>
              <th className="py-2.5 px-3 font-bold">Location</th>
              <th className="py-2.5 px-3 font-bold">Capacity / Units</th>
              <th className="py-2.5 px-3 font-bold">API Mesh Sync</th>
              <th className="py-2.5 px-3 font-bold">Last Ping</th>
              <th className="py-2.5 px-3 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredFacilities.length > 0 ? (
              filteredFacilities.map((fac, idx) => {
                const isHospital = fac.facilityType === 'hospital';
                const isBloodBank = fac.facilityType === 'blood_bank';
                const isAmbulance = fac.facilityType === 'ambulance';

                const capacityLabel = isHospital
                  ? `${fac.hospitalCapacity?.icuBeds || 0} ICU Beds • ${fac.hospitalCapacity?.ventilators || 0} Vents`
                  : isBloodBank
                  ? `${Object.values(fac.bloodBankData?.stockMatrix || {}).reduce((s: number, v: any) => s + (Number(v) || 0), 0)} Total Blood Units`
                  : `${fac.ambulanceFleetData?.connectedCount || 1} Ambulances (${fac.ambulanceFleetData?.gpsSyncType || 'GPS'})`;

                return (
                  <tr key={fac.facilityId || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-slate-900 font-bold flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isHospital ? 'bg-emerald-500' : isBloodBank ? 'bg-rose-500' : 'bg-blue-500'}`} />
                      <div>
                        <div className="text-slate-900 font-bold">{fac.facilityName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{fac.facilityId || `ID-${idx + 101}`}</div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isHospital ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        isBloodBank ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {isHospital ? 'Hospital' : isBloodBank ? 'Blood Bank' : 'EMS Fleet'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {fac.city || fac.state || 'National Grid'}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800 text-[11px]">
                      {capacityLabel}
                    </td>
                    <td className="py-3 px-3 text-emerald-600 font-mono text-[11px]">
                      <span className="inline-flex items-center gap-1 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        100% (AES-256)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[10px] font-mono">
                      {timeStr || '14:27:10'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          if (isHospital) setMode('hospital');
                          else if (isBloodBank) setMode('bloodbank');
                          else setMode('ambulance');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      >
                        <span>Open</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Building2 className="w-6 h-6 text-slate-300" />
                    <span>No partner facilities found matching filter.</span>
                    <button
                      onClick={() => setMode('partner')}
                      className="mt-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Register Partner Facility (/hb)</span>
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
