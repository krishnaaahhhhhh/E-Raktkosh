import React from 'react';
import { PrathmiktaProvider, usePrathmikta } from './context/PrathmiktaContext';
import { HeaderNav } from './components/HeaderNav';
import { LandingPage } from './components/landing/LandingPage';
import { CitizenEmergencyApp } from './components/citizen/CitizenEmergencyApp';
import { PlannedAdmissionBooking } from './components/citizen/PlannedAdmissionBooking';
import { ParamedicAmbulanceApp } from './components/paramedic/ParamedicAmbulanceApp';
import { AmbulanceResponseDashboard } from './components/ambulance/AmbulanceResponseDashboard';
import { BloodBankControlCenter } from './components/bloodbank/BloodBankControlCenter';
import { HospitalCommandCenter } from './components/hospital/HospitalCommandCenter';
import { EmergencyCoordinateCenter } from './components/coordinate/EmergencyCoordinateCenter';
import { DualSplitView } from './components/DualSplitView';
import { ReceptionDashboard } from './components/reception/ReceptionDashboard';
import { FacilityRegistrationPortal } from './components/partner/FacilityRegistrationPortal';
import { MasterCommandGrid } from './components/command/MasterCommandGrid';
import { StretcherAttendantPortal } from './components/stretcher/StretcherAttendantPortal';
import { UniversalBackButton } from './components/ui/UniversalBackButton';

const AppContent: React.FC = () => {
  const { mode } = usePrathmikta();
  const isCustomHeaderMode =
    mode === 'command' ||
    mode === 'stretcher' ||
    mode === 'patient' ||
    mode === 'citizen' ||
    mode === 'planned_admission' ||
    mode === 'reception' ||
    mode === 'partner' ||
    mode === 'hospital' ||
    mode === 'tv_command' ||
    mode === 'ambulance' ||
    mode === 'paramedic' ||
    mode === 'bloodbank';

  return (
    <div id="prathmikta-root-container" className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {!isCustomHeaderMode && <HeaderNav />}
      <main className="flex-1 w-full h-full min-h-0 overflow-hidden relative">
        {mode === 'landing' && <LandingPage />}
        {mode === 'command' && <MasterCommandGrid />}
        {mode === 'stretcher' && <StretcherAttendantPortal />}
        {(mode === 'patient' || mode === 'citizen') && <CitizenEmergencyApp />}
        {mode === 'planned_admission' && <PlannedAdmissionBooking />}
        {(mode === 'reception' || mode === 'hospital' || mode === 'tv_command') && <HospitalCommandCenter />}
        {mode === 'partner' && <FacilityRegistrationPortal />}
        {(mode === 'coordinate' || mode === 'regional_deoc') && <EmergencyCoordinateCenter />}
        {(mode === 'ambulance' || mode === 'paramedic') && <AmbulanceResponseDashboard />}
        {mode === 'bloodbank' && <BloodBankControlCenter />}
        {mode === 'dual_split' && <DualSplitView />}
      </main>
      {/* Universal Floating Seamless Back Button on every sub-route */}
      <UniversalBackButton />
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
