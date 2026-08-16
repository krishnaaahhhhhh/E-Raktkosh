import React from 'react';
import { PrathmiktaProvider, usePrathmikta } from './context/PrathmiktaContext';
import { HeaderNav } from './components/HeaderNav';
import { LandingPage } from './components/landing/LandingPage';
import { CitizenEmergencyApp } from './components/citizen/CitizenEmergencyApp';
import { ParamedicAmbulanceApp } from './components/paramedic/ParamedicAmbulanceApp';
import { HospitalCommandCenter } from './components/hospital/HospitalCommandCenter';
import { EmergencyCoordinateCenter } from './components/coordinate/EmergencyCoordinateCenter';
import { DualSplitView } from './components/DualSplitView';

const MainContent: React.FC = () => {
  const { mode } = usePrathmikta();

  return (
    <main className="flex-1 w-full h-full min-h-0 overflow-hidden relative">
      {mode === 'landing' && <LandingPage />}
      {(mode === 'patient' || mode === 'citizen') && <CitizenEmergencyApp />}
      {(mode === 'hospital' || mode === 'tv_command') && <HospitalCommandCenter />}
      {(mode === 'coordinate' || mode === 'regional_deoc') && <EmergencyCoordinateCenter />}
      {mode === 'paramedic' && <ParamedicAmbulanceApp />}
      {mode === 'dual_split' && <DualSplitView />}
    </main>
  );
};

export default function App() {
  return (
    <PrathmiktaProvider>
      <div id="prathmikta-root-container" className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
        <HeaderNav />
        <MainContent />
      </div>
    </PrathmiktaProvider>
  );
}
