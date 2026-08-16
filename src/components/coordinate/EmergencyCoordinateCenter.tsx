import React, { useState } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import { HospitalFacility, InboundDispatch, TriageSeverity } from '../../types';
import { INDIAN_STATES } from '../../lib/locationData';
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
  Search,
  ArrowRightLeft,
  Activity,
  PlusCircle,
  Clock,
  ShieldAlert,
  Droplet,
  Stethoscope,
  ChevronRight,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { playCodeRedAlert, playConfirmChime, playTactileClick } from '../../lib/audio';

export const EmergencyCoordinateCenter: React.FC = () => {
  const {
    hospitals,
    activeHospitalId,
    setActiveHospitalId,
    setMode,
    activeCitizenDispatch,
    updatePatientDispatchStatus,
    dispatchInboundEmergency,
    selectedState,
    setSelectedState,
    updateFloorBeds
  } = usePrathmikta();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(activeHospitalId);
  const [surgeAlertActive, setSurgeAlertActive] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'RED' | 'AMBER' | 'GREEN'>('ALL');
  const [isSimulatingDispatch, setIsSimulatingDispatch] = useState(false);

  const hospitalList = Object.values(hospitals) as HospitalFacility[];

  // Filter hospitals based on search
  const filteredHospitals = searchQuery
    ? hospitalList.filter(
        (h) =>
          h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.traumaLevel.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : hospitalList;

  // Aggregate stats across all connected hospitals
  const totalNetworkBeds = hospitalList.reduce((acc, h) => acc + h.totalFacilityBeds, 0);
  const totalOccupiedBeds = hospitalList.reduce((acc, h) => acc + h.occupiedFacilityBeds, 0);
  const totalFreeBeds = totalNetworkBeds - totalOccupiedBeds;
  const overallOccupancyPct = totalNetworkBeds > 0 ? Math.round((totalOccupiedBeds / totalNetworkBeds) * 100) : 0;

  // Collect all active dispatches across facilities
  const allDispatches: InboundDispatch[] = [];
  hospitalList.forEach((h) => {
    if (h.activeDispatches && h.activeDispatches.length > 0) {
      allDispatches.push(...h.activeDispatches);
    }
  });
  if (activeCitizenDispatch && !allDispatches.some((d) => d.dispatchId === activeCitizenDispatch.dispatchId)) {
    allDispatches.unshift(activeCitizenDispatch);
  }

  const filteredDispatches = filterSeverity === 'ALL'
    ? allDispatches
    : allDispatches.filter((d) => d.severity === filterSeverity);

  // Selected hospital facility detail
  const targetDetailHosp = hospitals[selectedFacilityId] || hospitalList[0];

  // Re-route dispatch handler
  const handleRerouteDispatch = (dispatchId: string, newHospitalId: string) => {
    playTactileClick();
    const newHosp = hospitals[newHospitalId];
    if (!newHosp) return;
    updatePatientDispatchStatus(dispatchId, 'rerouted', undefined, `Reassigned to ${newHosp.name}`);
    playConfirmChime();
  };

  // Simulate Multi-Casualty Incident Dispatch
  const handleSimulateIncident = async () => {
    setIsSimulatingDispatch(true);
    playTactileClick();
    try {
      await dispatchInboundEmergency();
      playConfirmChime();
    } catch {
      // ignore
    } finally {
      setIsSimulatingDispatch(false);
    }
  };

  return (
    <div id="emergency-coordinate-center" className="w-full h-full bg-[#040711] text-slate-100 flex flex-col overflow-y-auto font-sans">
      {/* Top Coordinator Command Header */}
      <div className="bg-[#090d1a] border-b border-purple-500/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-purple-600 text-white uppercase tracking-wider">
                /coordinate
              </span>
              <span className="text-sm font-black text-white tracking-wide">
                108 Central Emergency Coordination & DEOC Network
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Live Inter-Hospital Capacity Grid &bull; 108 Fleet Orchestration &bull; Golden-Hour Load Balancing
            </p>
          </div>
        </div>

        {/* State/Region Selector & Surge Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* State / District selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1">
            <MapPin className="w-3.5 h-3.5 text-purple-400" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
            >
              {INDIAN_STATES.map((state) => (
                <option key={state.id} value={state.id} className="bg-slate-900 text-white">
                  {state.name} ({state.code})
                </option>
              ))}
            </select>
          </div>

          {/* Mass Surge Alert Toggle */}
          <button
            id="btn-declare-mass-surge"
            onClick={() => {
              playTactileClick();
              if (!surgeAlertActive) {
                playCodeRedAlert();
              }
              setSurgeAlertActive((prev) => !prev);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-md ${
              surgeAlertActive
                ? 'bg-red-600 text-white border-red-500 animate-pulse shadow-red-600/50'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{surgeAlertActive ? 'MASS CASUALTY PROTOCOL ACTIVE' : 'Declare Surge Alert'}</span>
          </button>

          {/* 1-Click Inject Simulation */}
          <button
            id="btn-inject-emergency-dispatch"
            onClick={handleSimulateIncident}
            disabled={isSimulatingDispatch}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/40 transition-all cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <PlusCircle className="w-3.5 h-3.5 text-purple-200" />
            <span>{isSimulatingDispatch ? 'Injecting...' : 'Inject Test Emergency'}</span>
          </button>
        </div>
      </div>

      {/* Main Coordinate Dashboard Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        
        {/* District Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Monitored Facilities</span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              {hospitalList.length} Hospitals
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Telemetry Active
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Available Beds</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1">
              {totalFreeBeds} <span className="text-xs text-slate-400 font-normal font-sans">/ {totalNetworkBeds}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Net Vacancy: {100 - overallOccupancyPct}%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">District Bed Surge Index</span>
            <div className={`text-2xl sm:text-3xl font-black font-mono mt-1 ${
              overallOccupancyPct > 85 ? 'text-red-400' : overallOccupancyPct > 70 ? 'text-amber-400' : 'text-cyan-400'
            }`}>
              {overallOccupancyPct}%
            </div>
            <span className="text-[11px] text-amber-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> {overallOccupancyPct > 85 ? 'High Bed Pressure' : 'Balanced Capacity'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Active 108 Dispatches</span>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono mt-1">
              {allDispatches.length} In-Transit
            </div>
            <span className="text-[11px] text-cyan-400 font-mono">
              Avg Route ETA: 5.4 mins
            </span>
          </div>
        </div>

        {/* Section: Live Active Dispatches & Fleet Orchestrator */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Ambulance className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-black text-white uppercase tracking-wide">
                  Live Regional 108 Fleet & Emergency Dispatch Stream
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized monitoring of all ambulances en-route to emergency departments across the district.
              </p>
            </div>

            {/* Severity Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
              {(['ALL', 'RED', 'AMBER', 'GREEN'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => {
                    playTactileClick();
                    setFilterSeverity(sev);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filterSeverity === sev
                      ? sev === 'RED'
                        ? 'bg-red-600 text-white'
                        : sev === 'AMBER'
                        ? 'bg-amber-600 text-white'
                        : sev === 'GREEN'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sev === 'ALL' ? 'All (Live)' : `Code ${sev}`}
                </button>
              ))}
            </div>
          </div>

          {/* Dispatch Cards Grid */}
          {filteredDispatches.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-slate-300">All emergency fleets clear and standby.</p>
              <p className="text-xs text-slate-500">Click &ldquo;Inject Test Emergency&rdquo; above to simulate a live 108 dispatch.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredDispatches.map((disp) => {
                const isRed = disp.severity === 'RED';
                return (
                  <div
                    key={disp.dispatchId}
                    id={`dispatch-card-${disp.dispatchId}`}
                    className={`p-4 rounded-xl bg-slate-950 border transition-all space-y-3 ${
                      isRed ? 'border-red-600/60 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-black font-mono px-2 py-0.5 rounded ${
                              disp.severity === 'RED'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                                : disp.severity === 'AMBER'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            }`}
                          >
                            CODE {disp.severity}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{disp.dispatchId}</span>
                        </div>
                        <h4 className="text-sm font-black text-white mt-1">
                          {disp.patient.fullName}, {disp.patient.age}y ({disp.patient.gender})
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black font-mono text-cyan-400">
                          {disp.etaMinutes} min ETA
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono">{disp.etaDistanceKm} km</p>
                      </div>
                    </div>

                    {/* Suspected Pathology & Vitals */}
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Suspected:</span>
                        <span className="font-bold text-amber-300 truncate max-w-[170px]">
                          {disp.aiReport?.suspectedCondition || disp.patient.symptomCategory}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">Vitals Stream:</span>
                        <span className="text-slate-200">
                          BP {disp.patient.vitals?.systolicBp ?? 120}/{disp.patient.vitals?.diastolicBp ?? 80} &bull; HR {disp.patient.vitals?.heartRate ?? 80} &bull; SpO2 {disp.patient.vitals?.spo2 ?? 98}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Destination ER:</span>
                        <span className="font-bold text-purple-300 truncate max-w-[150px]">
                          {disp.hospitalName.split(' - ')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Coordinator Action Bar: Re-route & Status update */}
                    <div className="flex items-center gap-2 pt-1">
                      {/* Re-route Selector */}
                      <div className="flex-1">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleRerouteDispatch(disp.dispatchId, e.target.value);
                            }
                          }}
                          defaultValue=""
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                        >
                          <option value="" disabled>
                            Re-route Hospital...
                          </option>
                          {hospitalList.map((h) => (
                            <option key={h.id} value={h.id} className="bg-slate-900 text-white">
                              &rarr; {h.name.split(' - ')[0]} ({h.totalFacilityBeds - h.occupiedFacilityBeds} Free)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Fast-Track Direct Inspection */}
                      <button
                        onClick={() => {
                          playTactileClick();
                          setActiveHospitalId(disp.hospitalId);
                          setMode('hospital');
                        }}
                        title="Open this Hospital's ER TV Wall"
                        className="px-2.5 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 text-xs font-bold border border-purple-500/40 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <span>ER Wall</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section: District Multi-Hospital Capacity Matrix & Facility Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                <Hospital className="w-5 h-5 text-purple-400" />
                Inter-Hospital Bed Surge & Resource Capacity Grid
              </h3>
              <p className="text-xs text-slate-400">
                Click any hospital card to inspect live floor beds, ICU ventilators, and pharmacy stock.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hospital, city, or trauma level..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHospitals.map((hosp) => {
              const freeBeds = hosp.totalFacilityBeds - hosp.occupiedFacilityBeds;
              const occPct = hosp.totalFacilityBeds > 0 ? Math.round((hosp.occupiedFacilityBeds / hosp.totalFacilityBeds) * 100) : 0;
              const isFull = occPct >= 90;

              return (
                <div
                  key={hosp.id}
                  id={`deoc-hosp-${hosp.id}`}
                  className={`p-4 rounded-2xl bg-slate-900/90 border transition-all shadow-lg space-y-3.5 cursor-pointer ${
                    selectedFacilityId === hosp.id
                      ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                      : isFull
                      ? 'border-red-500/60'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                  onClick={() => {
                    playTactileClick();
                    setSelectedFacilityId(hosp.id);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700">
                          {hosp.traumaLevel}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">{hosp.city}, {hosp.state}</span>
                      </div>
                      <h4 className="text-sm font-black text-white mt-1">{hosp.name}</h4>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playTactileClick();
                        setActiveHospitalId(hosp.id);
                        setMode('hospital');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Open /hospital &rarr;
                    </button>
                  </div>

                  {/* Bed Occupancy Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Total Bed Occupancy:</span>
                      <span className={`font-bold ${isFull ? 'text-red-400' : 'text-white'}`}>
                        {hosp.occupiedFacilityBeds} / {hosp.totalFacilityBeds} ({occPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occPct > 90 ? 'bg-red-500' : occPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, occPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Critical Specialized Infrastructure Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[9px] text-slate-400 block uppercase">Free Beds</span>
                      <span className="font-bold text-emerald-400">{freeBeds} Free</span>
                    </div>

                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[9px] text-slate-400 block uppercase">Cath Lab</span>
                      <span className={`font-bold ${hosp.cathLabActive ? 'text-red-400' : 'text-slate-500'}`}>
                        {hosp.cathLabActive ? 'READY' : 'OFFLINE'}
                      </span>
                    </div>

                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[9px] text-slate-400 block uppercase">Burn Unit</span>
                      <span className={`font-bold ${hosp.burnUnitReady ? 'text-amber-400' : 'text-slate-500'}`}>
                        {hosp.burnUnitReady ? 'READY' : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Coordinator Bed Quick-Adjust Controls */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-xs">
                    <span className="text-[10px] text-slate-400">Coordinator Bed Overrides:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTactileClick();
                          setActiveHospitalId(hosp.id);
                          updateFloorBeds(1, 'occupied', -1);
                        }}
                        title="Release 1 bed"
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono font-bold text-xs cursor-pointer"
                      >
                        -1 Occ
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTactileClick();
                          setActiveHospitalId(hosp.id);
                          updateFloorBeds(1, 'occupied', 1);
                        }}
                        title="Admit 1 bed"
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-red-400 font-mono font-bold text-xs cursor-pointer"
                      >
                        +1 Occ
                      </button>
                    </div>
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
