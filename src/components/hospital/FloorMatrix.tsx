import React from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import {
  Layers,
  Plus,
  Minus,
  Activity,
  Heart,
  Wind,
  Brain,
  Pill,
  User,
  Phone,
  ShieldCheck,
  Stethoscope,
  Building2,
  AlertCircle
} from 'lucide-react';
import { FloorData } from '../../types';

export const FloorMatrix: React.FC = () => {
  const { activeHospital, updateFloorBeds, updateDoctorStatus } = usePrathmikta();

  const getFloorTheme = (floorId: number) => {
    switch (floorId) {
      case 0:
        return {
          border: 'border-red-500/40',
          headerBg: 'bg-red-950/40 text-red-300',
          badge: 'bg-red-500/20 text-red-300 border-red-500/40',
          icon: <Activity className="w-4 h-4 text-red-400" />
        };
      case 1:
        return {
          border: 'border-cyan-500/40',
          headerBg: 'bg-cyan-950/40 text-cyan-300',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          icon: <Heart className="w-4 h-4 text-cyan-400" />
        };
      case 2:
        return {
          border: 'border-purple-500/40',
          headerBg: 'bg-purple-950/40 text-purple-300',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          icon: <Brain className="w-4 h-4 text-purple-400" />
        };
      default:
        return {
          border: 'border-emerald-500/40',
          headerBg: 'bg-emerald-950/40 text-emerald-300',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: <Building2 className="w-4 h-4 text-emerald-400" />
        };
    }
  };

  const getDoctorStatusBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'In OT':
        return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
      case 'On Rounds':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const cycleDoctorStatus = (floorId: number, docId: string, currentStatus: string) => {
    const cycleMap: Record<string, 'Present' | 'In OT' | 'On Rounds' | 'Off Duty'> = {
      'Present': 'In OT',
      'In OT': 'On Rounds',
      'On Rounds': 'Off Duty',
      'Off Duty': 'Present'
    };
    const nextStatus = cycleMap[currentStatus] || 'Present';
    updateDoctorStatus(floorId, docId, nextStatus);
  };

  return (
    <div id="floor-matrix-section" className="w-full h-full flex flex-col p-3.5 space-y-3 overflow-y-auto bg-[#070b14] text-slate-100">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
            Floor-by-Floor Critical Matrix & Roster
          </h2>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Click <b className="text-cyan-300">[+]</b> / <b className="text-cyan-300">[-]</b> to broadcast bed states in real-time
        </span>
      </div>

      {/* Floors 0, 1, 2, 3 Grid Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {activeHospital.floors.map((floor) => {
          const theme = getFloorTheme(floor.floorId);
          const occupancyRate = Math.round((floor.occupiedBeds / floor.totalBeds) * 100) || 0;

          return (
            <div
              key={floor.floorId}
              id={`floor-card-${floor.floorId}`}
              className={`rounded-xl bg-[#0c1220] border ${theme.border} p-3.5 shadow-lg flex flex-col justify-between gap-3`}
            >
              {/* Floor Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    {theme.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white font-mono">{floor.floorLabel}:</span>
                      <h3 className="text-xs font-bold text-slate-200">{floor.name}</h3>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">{floor.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${theme.badge}`}>
                    {floor.status}
                  </span>
                  {floor.floorId === 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      24/7 PHARMACY
                    </span>
                  )}
                </div>
              </div>

              {/* Main Bed Stepper & Occupancy Metric Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-2 rounded-lg bg-[#070b14] border border-slate-800/80">
                {/* General Beds Stepper */}
                <div className="flex items-center justify-between sm:justify-start gap-3">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Occupied Beds</div>
                    <div className="text-xs font-black font-mono text-white flex items-center gap-1.5 mt-0.5">
                      <span className="text-cyan-300">{floor.occupiedBeds}</span>
                      <span className="text-slate-500">/</span>
                      <span className="text-slate-400">{floor.totalBeds}</span>
                      <span className="text-[10px] text-emerald-400 font-normal">({floor.availableBeds} free)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                    <button
                      id={`btn-floor-${floor.floorId}-dec`}
                      onClick={() => updateFloorBeds(floor.floorId, 'occupied', -1)}
                      title="Discharge / Free 1 Bed"
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 flex items-center justify-center transition-colors text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      id={`btn-floor-${floor.floorId}-inc`}
                      onClick={() => updateFloorBeds(floor.floorId, 'occupied', 1)}
                      title="Admit / Occupy 1 Bed"
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-cyan-400 flex items-center justify-center transition-colors text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* ICU Beds Stepper */}
                <div className="flex items-center justify-between sm:justify-start gap-3 border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-2 sm:pt-0 sm:pl-2.5">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Critical ICU</div>
                    <div className="text-xs font-black font-mono text-cyan-300 mt-0.5">
                      {floor.icuBeds.occupied}/{floor.icuBeds.total} Occ
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                    <button
                      id={`btn-floor-${floor.floorId}-icu-dec`}
                      onClick={() => updateFloorBeds(floor.floorId, 'icu_occupied', -1)}
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-[10px]"
                    >
                      -
                    </button>
                    <button
                      id={`btn-floor-${floor.floorId}-icu-inc`}
                      onClick={() => updateFloorBeds(floor.floorId, 'icu_occupied', 1)}
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center text-[10px]"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Ventilator in use stepper */}
                <div className="flex items-center justify-between sm:justify-start gap-3 border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-2 sm:pt-0 sm:pl-2.5">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Ventilators</div>
                    <div className="text-xs font-black font-mono text-amber-300 mt-0.5">
                      {floor.ventilators.inUse}/{floor.ventilators.total} In Use
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                    <button
                      id={`btn-floor-${floor.floorId}-vent-dec`}
                      onClick={() => updateFloorBeds(floor.floorId, 'vent_inuse', -1)}
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-[10px]"
                    >
                      -
                    </button>
                    <button
                      id={`btn-floor-${floor.floorId}-vent-inc`}
                      onClick={() => updateFloorBeds(floor.floorId, 'vent_inuse', 1)}
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 flex items-center justify-center text-[10px]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Bays Mini Status Ribbon */}
              {floor.bays && floor.bays.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Assigned Bay Occupancy:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {floor.bays.map((bay) => (
                      <span
                        key={bay.bayId}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border flex items-center gap-1.5 ${
                          bay.status === 'occupied'
                            ? 'bg-red-950/60 text-red-300 border-red-800/60'
                            : bay.status === 'prepped'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                            : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            bay.status === 'occupied'
                              ? 'bg-red-500'
                              : bay.status === 'prepped'
                              ? 'bg-amber-500 animate-ping'
                              : 'bg-emerald-500'
                          }`}
                        />
                        <span>{bay.name}</span>
                        {bay.patientName && <span className="font-bold text-white">({bay.patientName})</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* On-Duty Doctor Roster */}
              <div className="border-t border-slate-800/80 pt-2 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                  <span>Attending Physicians Roster ({floor.doctors.length}):</span>
                  <span className="text-[9px] text-cyan-400 font-mono">Tap status to cycle</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {floor.doctors.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-1.5 rounded-lg bg-[#070b14] border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <Stethoscope className="w-3 h-3 text-cyan-400" />
                          <span className="text-[11px] font-bold text-slate-200 truncate">{doc.name}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 truncate block">{doc.specialization}</span>
                      </div>

                      <button
                        id={`btn-doc-status-${doc.id}`}
                        onClick={() => cycleDoctorStatus(floor.floorId, doc.id, doc.status)}
                        title="Click to toggle status: Present / In OT / On Rounds / Off Duty"
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer hover:brightness-125 ${getDoctorStatusBadge(
                          doc.status
                        )}`}
                      >
                        {doc.status}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
