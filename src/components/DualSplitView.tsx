import React from 'react';
import { CitizenEmergencyApp } from './citizen/CitizenEmergencyApp';
import { HospitalCommandCenter } from './hospital/HospitalCommandCenter';
import { Smartphone, Tv, Sparkles, ArrowRight } from 'lucide-react';

export const DualSplitView: React.FC = () => {
  return (
    <div id="dual-split-view" className="w-full h-full flex flex-col xl:flex-row overflow-hidden bg-black">
      {/* Left Screen: Citizen Emergency PWA */}
      <div className="w-full xl:w-1/2 h-[50vh] xl:h-full flex flex-col border-b-2 xl:border-b-0 xl:border-r-2 border-cyan-500/40 relative">
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span className="uppercase tracking-wider">Citizen Split-Screen Emergency PWA (Patient / Paramedic)</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
            <span>Tap Dispatch</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <CitizenEmergencyApp />
        </div>
      </div>

      {/* Right Screen: Hospital ER Wall Command Center */}
      <div className="w-full xl:w-1/2 h-[50vh] xl:h-full flex flex-col relative bg-[#070b14]">
        <div className="px-4 py-2 bg-[#080d1a] border-b border-cyan-500/40 flex items-center justify-between text-xs font-bold text-slate-300">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="uppercase tracking-wider">Hospital ER Wall-Mounted TV Command Center (1080p/4K)</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">Real-time WebSocket Synchronized</span>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <HospitalCommandCenter />
        </div>
      </div>
    </div>
  );
};
