import React from 'react';
import { PrathmiktaProvider, usePrathmikta } from './context/PrathmiktaContext';
import { HeaderNav } from './components/HeaderNav';
import { LandingPage } from './components/landing/LandingPage';
import { CitizenEmergencyApp } from './components/citizen/CitizenEmergencyApp';
import { PlannedAdmissionBooking } from './components/citizen/PlannedAdmissionBooking';
import { ParamedicAmbulanceApp } from './components/paramedic/ParamedicAmbulanceApp';
import { HospitalCommandCenter } from './components/hospital/HospitalCommandCenter';
import { EmergencyCoordinateCenter } from './components/coordinate/EmergencyCoordinateCenter';
import { DualSplitView } from './components/DualSplitView';

const AppContent: React.FC = () => {
  const { mode } = usePrathmikta();
  const isCustomHeaderMode = mode === 'patient' || mode === 'citizen' || mode === 'planned_admission';

  return (
    <div id="prathmikta-root-container" className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {!isCustomHeaderMode && <HeaderNav />}
      <main className="flex-1 w-full h-full min-h-0 overflow-hidden relative">
        {mode === 'landing' && <LandingPage />}
        {(mode === 'patient' || mode === 'citizen') && <CitizenEmergencyApp />}
        {mode === 'planned_admission' && <PlannedAdmissionBooking />}
        {(mode === 'hospital' || mode === 'tv_command') && <HospitalCommandCenter />}
        {(mode === 'coordinate' || mode === 'regional_deoc') && <EmergencyCoordinateCenter />}
        {mode === 'paramedic' && <ParamedicAmbulanceApp />}
        {mode === 'dual_split' && <DualSplitView />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <PrathmiktaProvider>
      <AppContent />
    </PrathmiktaProvider>
  );
}
