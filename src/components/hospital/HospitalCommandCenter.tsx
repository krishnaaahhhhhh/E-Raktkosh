import React from 'react';
import { TopCommandBar } from './TopCommandBar';
import { FloorMatrix } from './FloorMatrix';
import { InboundQueue } from './InboundQueue';

export const HospitalCommandCenter: React.FC = () => {
  return (
    <div
      id="hospital-wall-command-center"
      className="w-full h-full flex flex-col bg-[#070b14] overflow-hidden select-none font-sans"
    >
      {/* Top Command Bar */}
      <TopCommandBar />

      {/* Main Grid: Left Floor Matrix (65%), Right Live Inbound Queue (35%) */}
      <div className="flex-1 flex flex-col lg:flex-row w-full h-full min-h-0 overflow-hidden">
        {/* Left Section: Floor-by-Floor Bed Matrix & Doctor Rosters */}
        <div className="w-full lg:w-[62%] xl:w-[65%] h-[50vh] lg:h-full overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-800/80">
          <FloorMatrix />
        </div>

        {/* Right Section: Live Inbound Ambulance & Ongoing Emergency Queue */}
        <div className="w-full lg:w-[38%] xl:w-[35%] h-[50vh] lg:h-full overflow-y-auto bg-[#080d1a]">
          <InboundQueue />
        </div>
      </div>
    </div>
  );
};
