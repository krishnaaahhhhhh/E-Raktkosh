import React, { useMemo } from 'react';
import {
  Building2,
  Ambulance,
  Droplet,
  AlertTriangle,
  Plus,
  Minus,
  Compass,
  Layers,
  Navigation,
  ArrowUpRight
} from 'lucide-react';
import { AppViewMode } from '../../types';

interface CommandMapGridProps {
  allFacilities: any[];
  hospitalsList: any[];
  ambulancesList: any[];
  bloodBanksList: any[];
  activeLayer: 'all' | 'hospitals' | 'ambulances' | 'bloodbanks' | 'emergencies' | 'traffic';
  setActiveLayer: (layer: any) => void;
  mapZoom: number;
  setMapZoom: React.Dispatch<React.SetStateAction<number>>;
  setMode: (mode: AppViewMode) => void;
}

export const CommandMapGrid: React.FC<CommandMapGridProps> = ({
  allFacilities,
  hospitalsList,
  ambulancesList,
  bloodBanksList,
  activeLayer,
  setActiveLayer,
  mapZoom,
  setMapZoom,
  setMode
}) => {
  // Compute map node coordinates dynamically for ONLY the partnered facilities
  const mapData = useMemo(() => {
    // If no facilities registered yet, provide default geographic base positions
    const cityCoordinates: Record<string, { x: number; y: number }> = {
      'new delhi': { x: 52, y: 55 },
      'delhi': { x: 52, y: 55 },
      'noida': { x: 58, y: 58 },
      'gurugram': { x: 48, y: 62 },
      'gurgaon': { x: 48, y: 62 },
      'faridabad': { x: 54, y: 66 },
      'ghaziabad': { x: 58, y: 52 },
      'kanpur': { x: 68, y: 68 },
      'lucknow': { x: 74, y: 64 },
      'chandigarh': { x: 46, y: 28 },
      'panchkula': { x: 54, y: 27 },
      'mohali': { x: 42, y: 31 },
      'ludhiana': { x: 34, y: 26 },
      'ambala': { x: 50, y: 36 },
      'karnal': { x: 52, y: 44 },
      'panipat': { x: 54, y: 49 },
      'sonipat': { x: 53, y: 52 },
      'jaipur': { x: 38, y: 65 },
      'meerut': { x: 62, y: 48 },
      'agra': { x: 58, y: 69 },
      'dehradun': { x: 68, y: 25 },
      'haridwar': { x: 70, y: 32 }
    };

    // Build live partner nodes strictly from registered facilities
    const partnerNodes = allFacilities.map((fac, idx) => {
      const cityKey = (fac.city || fac.state || '').toLowerCase().trim();
      let coords = cityCoordinates[cityKey];
      if (!coords) {
        // Deterministic pseudo position for custom cities
        const angle = (idx * 57) % 360;
        const radius = 20 + ((idx * 11) % 22);
        coords = {
          x: Math.round(50 + radius * Math.cos((angle * Math.PI) / 180)),
          y: Math.round(50 + radius * Math.sin((angle * Math.PI) / 180))
        };
      } else {
        // Slight jitter if multiple facilities in same city
        const offset = (idx % 4) * 3;
        coords = {
          x: Math.min(88, Math.max(12, coords.x + (idx % 2 === 0 ? offset : -offset))),
          y: Math.min(88, Math.max(12, coords.y + (idx % 3 === 0 ? offset : -offset)))
        };
      }

      return {
        id: fac.facilityId || fac.id || `node-${idx}`,
        facility: fac,
        name: fac.facilityName || 'Partner Node',
        city: fac.city || 'National Grid',
        type: fac.facilityType as 'hospital' | 'ambulance' | 'blood_bank',
        x: coords.x,
        y: coords.y,
        status: fac.status || 'OPERATIONAL',
        phone: fac.contactPhone || '108',
        capacity:
          fac.facilityType === 'hospital'
            ? `${fac.hospitalCapacity?.icuBeds || 0} ICU Beds`
            : fac.facilityType === 'blood_bank'
            ? '8 Blood Groups Synced'
            : `${fac.ambulanceFleetData?.connectedCount || 1} Ambulances`
      };
    });

    // Build connections between nearby partner nodes
    const connections: Array<[number, number]> = [];
    for (let i = 0; i < partnerNodes.length; i++) {
      for (let j = i + 1; j < partnerNodes.length; j++) {
        if (i !== j && (i + j) % 2 === 0) {
          connections.push([i, j]);
        }
      }
    }

    return { partnerNodes, connections };
  }, [allFacilities]);

  // Filter nodes based on active layer
  const filteredNodes = useMemo(() => {
    if (activeLayer === 'all') return mapData.partnerNodes;
    if (activeLayer === 'hospitals') return mapData.partnerNodes.filter((n) => n.type === 'hospital');
    if (activeLayer === 'ambulances') return mapData.partnerNodes.filter((n) => n.type === 'ambulance');
    if (activeLayer === 'bloodbanks') return mapData.partnerNodes.filter((n) => n.type === 'blood_bank');
    return mapData.partnerNodes;
  }, [mapData.partnerNodes, activeLayer]);

  return (
    <div className="w-full h-full relative rounded-2xl bg-white border border-slate-200/80 p-3.5 flex flex-col min-h-[460px] overflow-hidden shadow-xs">
      {/* Map Floating Layer Controls */}
      <div className="absolute top-4 left-4 z-20 space-y-2 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200/90 shadow-md">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
          MAP FILTERS ({allFacilities.length} LIVE)
        </div>
        <div className="flex flex-col gap-1 w-36">
          {[
            { id: 'all', label: 'All Partners', count: allFacilities.length, icon: Layers },
            { id: 'hospitals', label: 'Hospitals', count: hospitalsList.length, icon: Building2 },
            { id: 'ambulances', label: 'Ambulances', count: ambulancesList.length, icon: Ambulance },
            { id: 'bloodbanks', label: 'Blood Banks', count: bloodBanksList.length, icon: Droplet }
          ].map((layer) => {
            const isSelected = activeLayer === layer.id;
            const IconC = layer.icon;
            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id as any)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <IconC className="w-3.5 h-3.5" />
                  <span className="truncate">{layer.label}</span>
                </div>
                <span className="text-[10px] font-bold font-mono px-1 rounded bg-slate-100 text-slate-600">
                  {layer.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200/90 shadow-md text-[10px] space-y-1.5">
        <div className="font-bold text-slate-500 uppercase text-[9px]">PARTNER TOPOLOGY</div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex items-center justify-center text-[7px] text-white font-bold">+</span>
          <span>Partner Hospital ({hospitalsList.length})</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex items-center justify-center text-[7px] text-white font-bold">A</span>
          <span>EMS Fleet ({ambulancesList.length})</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Blood Bank ({bloodBanksList.length})</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-4 h-0.5 bg-emerald-500" />
          <span>Mesh Topology Sync</span>
        </div>
      </div>

      {/* Zoom & Recenter Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/90 shadow-md">
        <button
          onClick={() => setMapZoom((prev) => Math.min(prev + 0.15, 1.6))}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setMapZoom((prev) => Math.max(prev - 0.15, 0.7))}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setMapZoom(1)}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          title="Reset View"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Topology Canvas Background */}
      <div className="relative flex-1 w-full rounded-2xl bg-[#F8F9FA] border border-slate-200/80 overflow-hidden flex items-center justify-center min-h-[380px]">
        {/* SVG Mesh Vector Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="partner-grid-pattern" width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="0.4" fill="#CBD5E1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#partner-grid-pattern)" />

          {/* Interconnecting Green Mesh Topology Lines */}
          <g stroke="#10B981" strokeWidth="0.6" strokeOpacity="0.75">
            {mapData.connections.map(([i, j], idx) => {
              const node1 = mapData.partnerNodes[i];
              const node2 = mapData.partnerNodes[j];
              if (!node1 || !node2) return null;
              return (
                <line
                  key={idx}
                  x1={node1.x}
                  y1={node1.y}
                  x2={node2.x}
                  y2={node2.y}
                  strokeDasharray={idx % 2 === 0 ? '1,1' : 'none'}
                />
              );
            })}
          </g>
        </svg>

        {/* Partner Facility Pins */}
        <div
          style={{ transform: `scale(${mapZoom})`, transformOrigin: 'center center' }}
          className="absolute inset-0 w-full h-full transition-transform duration-200"
        >
          {filteredNodes.map((node) => {
            const isAmbulance = node.type === 'ambulance';
            const isBloodBank = node.type === 'blood_bank';
            const isHospital = node.type === 'hospital';

            return (
              <div
                key={node.id}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
                onClick={() => {
                  if (isHospital) setMode('hospital');
                  else if (isBloodBank) setMode('bloodbank');
                  else setMode('ambulance');
                }}
              >
                {/* Live Connected Pulsing Ring */}
                <div
                  className={`absolute w-7 h-7 -translate-y-0.5 rounded-full animate-ping pointer-events-none ${
                    isHospital ? 'bg-emerald-500/20' : isBloodBank ? 'bg-rose-500/20' : 'bg-blue-500/20'
                  }`}
                />

                {/* Marker Icon */}
                <div className="relative">
                  {isHospital ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md text-[9px] font-black border border-white">
                      +
                    </div>
                  ) : isBloodBank ? (
                    <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md text-[8px] font-bold border border-white">
                      🩸
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md text-[8px] font-black border border-white">
                      A
                    </div>
                  )}
                </div>

                {/* Facility Name & City Label */}
                <span className="text-[10px] font-bold text-slate-800 whitespace-nowrap mt-0.5 bg-white/90 px-1.5 py-0.5 rounded-md border border-slate-200/80 shadow-xs">
                  {node.name}
                </span>

                {/* Rich Tooltip on Hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-start bg-white border border-slate-200 p-2.5 rounded-xl whitespace-nowrap text-[11px] z-30 shadow-xl min-w-[180px]">
                  <div className="flex items-center justify-between w-full pb-1 mb-1 border-b border-slate-100">
                    <span className="font-bold text-slate-900">{node.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black">
                      LIVE
                    </span>
                  </div>
                  <div className="text-slate-600 text-[10px]">📍 {node.city}</div>
                  <div className="text-emerald-600 font-bold text-[10px] mt-0.5">⚡ {node.capacity}</div>
                  <div className="mt-1.5 w-full pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-blue-600 font-bold">
                    <span>Click to open live dashboard</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State Banner if no facilities connected */}
        {allFacilities.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/85 backdrop-blur-xs p-6 text-center z-20">
            <Building2 className="w-10 h-10 text-slate-400 mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No Collaborated Facilities Connected Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-3">
              Only hospitals, blood banks, and ambulance fleets registered with us in <span className="font-bold font-mono">/hb</span> appear on this live grid.
            </p>
            <button
              onClick={() => setMode('partner')}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register Partner Facility (/hb)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
