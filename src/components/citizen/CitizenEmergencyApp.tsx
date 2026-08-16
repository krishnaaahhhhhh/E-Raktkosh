import React from 'react';
import { PrathmiktaExactEmergencyDashboard } from '../dashboard/PrathmiktaExactEmergencyDashboard';

export const CitizenEmergencyApp: React.FC = () => {
  return (
    <div className="w-full h-full overflow-y-auto bg-[#05070d]">
      <PrathmiktaExactEmergencyDashboard />
    </div>
  );
};
