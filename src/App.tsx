/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EncounterBanner } from './components/EncounterBanner';
import { TransferStepper } from './components/TransferStepper';
import { TransferCommandPanel } from './components/TransferCommandPanel';
import { HospitalSelector } from './components/HospitalSelector';
import { EDossierViewer } from './components/EDossierViewer';
import { ConsentModal } from './components/ConsentModal';
import { SecureHandshakeAnimation } from './components/SecureHandshakeAnimation';
import { ReceivingHospitalDashboard } from './components/ReceivingHospitalDashboard';
import { AmbulanceDispatchModal } from './components/AmbulanceDispatchModal';
import { TransitMapTracker } from './components/TransitMapTracker';
import { UnifiedArchitectureView } from './components/UnifiedArchitectureView';
import { PdfExportModal } from './components/PdfExportModal';
import { SimulationControls } from './components/SimulationControls';
import { transferService } from './services/transferService';
import { TransferRequestState } from './types/transfer';

export default function App() {
  const [state, setState] = useState<TransferRequestState>(transferService.getState());
  const [activeView, setActiveView] = useState<'referring' | 'receiving' | 'ambulance' | 'architecture'>('referring');
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Modals
  const [isConsentOpen, setIsConsentOpen] = useState<boolean>(false);
  const [isPdfOpen, setIsPdfOpen] = useState<boolean>(false);
  const [isSandboxOpen, setIsSandboxOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = transferService.subscribe((newState) => {
      setState(newState);
    });
    return () => unsubscribe();
  }, []);

  // Map state status to step number
  useEffect(() => {
    switch (state.status) {
      case 'STABILIZED_READY':
        // don't force step if user navigated
        break;
      case 'DESTINATION_SELECTED':
        if (currentStep < 2) setCurrentStep(2);
        break;
      case 'DOSSIER_PREPARED':
        if (currentStep < 3) setCurrentStep(3);
        break;
      case 'CONSENT_GRANTED':
      case 'OVERRIDE_LOGGED':
        if (currentStep < 5) setCurrentStep(5);
        break;
      case 'TRANSFER_REQUESTED':
        if (currentStep < 6) setCurrentStep(6);
        break;
      case 'RECEIVING_ACCEPTED':
        if (currentStep < 7) setCurrentStep(7);
        break;
      case 'AMBULANCE_DISPATCHED':
      case 'EN_ROUTE':
      case 'ARRIVED_AT_DESTINATION':
        if (currentStep < 8) setCurrentStep(8);
        break;
    }
  }, [state.status]);

  // Handlers
  const handleStartTransfer = () => {
    setCurrentStep(2);
    transferService.selectDestinationHospital(state.selectedHospitalId);
  };

  const handleSelectHospital = (id: string) => {
    transferService.selectDestinationHospital(id);
  };

  const handleContinueToDossier = () => {
    transferService.generateEDossier();
    setCurrentStep(3);
  };

  const handleProceedToConsent = () => {
    setIsConsentOpen(true);
  };

  const handleAuthorizeConsent = (
    isEmergencyOverride: boolean,
    overrideData?: { staffName: string; staffReg: string; reason: string }
  ) => {
    setIsConsentOpen(false);
    transferService.validateConsent(isEmergencyOverride, overrideData);
    transferService.sendTransferRequest();
    setCurrentStep(5);
  };

  const handleHandshakeComplete = () => {
    // handshake finished, can open receiving view
  };

  const handleAcceptTransfer = (notes?: string) => {
    transferService.acceptTransfer(notes);
    setCurrentStep(7);
  };

  const handleDispatchAmbulance = () => {
    transferService.dispatchAmbulance();
    setCurrentStep(8);
  };

  const handleUpdateTransitProgress = (percent: number) => {
    transferService.updateTransitProgress(percent);
  };

  const handleResetDemo = () => {
    transferService.resetDemo();
    setCurrentStep(1);
    setActiveView('referring');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Top Header */}
      <Header
        state={state}
        activeView={activeView}
        setActiveView={(v) => {
          setActiveView(v);
          if (v === 'receiving') setCurrentStep(6);
          if (v === 'ambulance') setCurrentStep(8);
        }}
        onOpenPdf={() => setIsPdfOpen(true)}
        onOpenSandboxDrawer={() => setIsSandboxOpen(true)}
        onResetDemo={handleResetDemo}
      />

      {/* Patient & Encounter Identifier Banner */}
      <EncounterBanner state={state} />

      {/* Main Flow Stepper (Available in Referring View) */}
      {activeView === 'referring' && (
        <TransferStepper
          currentStatus={state.status}
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
        />
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: Referring Hospital (Kanpur ER) */}
        {activeView === 'referring' && (
          <div className="space-y-6 animate-fade-in">
            {currentStep === 1 && (
              <TransferCommandPanel
                state={state}
                onStartTransfer={handleStartTransfer}
                onOpenDossierDirectly={() => {
                  transferService.generateEDossier();
                  setCurrentStep(3);
                }}
              />
            )}

            {currentStep === 2 && (
              <HospitalSelector
                hospitals={state.hospitals}
                selectedHospitalId={state.selectedHospitalId}
                onSelectHospital={handleSelectHospital}
                onContinueToDossier={handleContinueToDossier}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <EDossierViewer
                state={state}
                onProceedToConsent={handleProceedToConsent}
                onOpenPdf={() => setIsPdfOpen(true)}
                onBack={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && (
              <div className="text-center py-12 space-y-4">
                <p className="text-sm text-slate-500">Opening Authorization Modal...</p>
                <button
                  onClick={() => setIsConsentOpen(true)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white"
                >
                  Open Patient Authorization Modal
                </button>
              </div>
            )}

            {currentStep === 5 && (
              <SecureHandshakeAnimation
                state={state}
                onCompleteHandshake={handleHandshakeComplete}
                onOpenReceivingView={() => {
                  setActiveView('receiving');
                  setCurrentStep(6);
                }}
              />
            )}

            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="p-4 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-800 text-xs text-sky-800 dark:text-sky-300 flex items-center justify-between">
                  <span>
                    Simulating higher-center triage view for receiving cardiologist at <strong>{state.hospitals.find(h => h.id === state.selectedHospitalId)?.name}</strong>.
                  </span>
                  <button
                    onClick={() => setActiveView('receiving')}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg"
                  >
                    Full Screen Higher Center View
                  </button>
                </div>
                <ReceivingHospitalDashboard
                  state={state}
                  onAcceptTransfer={handleAcceptTransfer}
                  onViewDossier={() => setCurrentStep(3)}
                  onProceedToDispatch={() => setCurrentStep(7)}
                />
              </div>
            )}

            {currentStep === 7 && (
              <AmbulanceDispatchModal
                state={state}
                onDispatchAmbulance={handleDispatchAmbulance}
                onViewLiveRoute={() => setCurrentStep(8)}
              />
            )}

            {currentStep === 8 && (
              <TransitMapTracker
                state={state}
                onUpdateProgress={handleUpdateTransitProgress}
                onOpenArchitecture={() => setActiveView('architecture')}
              />
            )}
          </div>
        )}

        {/* VIEW 2: Receiving Hospital View (SGPGI Lucknow) */}
        {activeView === 'receiving' && (
          <div className="space-y-6 animate-fade-in">
            <ReceivingHospitalDashboard
              state={state}
              onAcceptTransfer={handleAcceptTransfer}
              onViewDossier={() => {
                setActiveView('referring');
                setCurrentStep(3);
              }}
              onProceedToDispatch={() => {
                setActiveView('referring');
                setCurrentStep(7);
              }}
            />
          </div>
        )}

        {/* VIEW 3: ALS Ambulance View */}
        {activeView === 'ambulance' && (
          <div className="space-y-6 animate-fade-in">
            <TransitMapTracker
              state={state}
              onUpdateProgress={handleUpdateTransitProgress}
              onOpenArchitecture={() => setActiveView('architecture')}
            />
          </div>
        )}

        {/* VIEW 4: Architecture View (Encounter Tree) */}
        {activeView === 'architecture' && (
          <div className="space-y-6 animate-fade-in">
            <UnifiedArchitectureView
              state={state}
              onOpenDossier={() => {
                setActiveView('referring');
                setCurrentStep(3);
              }}
              onOpenReceiving={() => {
                setActiveView('receiving');
              }}
              onOpenAmbulance={() => {
                setActiveView('ambulance');
              }}
            />
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <ConsentModal
        isOpen={isConsentOpen}
        state={state}
        onClose={() => setIsConsentOpen(false)}
        onAuthorizeConsent={handleAuthorizeConsent}
      />

      <PdfExportModal
        isOpen={isPdfOpen}
        state={state}
        onClose={() => setIsPdfOpen(false)}
      />

      <SimulationControls
        isOpen={isSandboxOpen}
        state={state}
        onClose={() => setIsSandboxOpen(false)}
        onSimulateError={(type) => transferService.simulateError(type)}
        onResolveError={() => transferService.resolveError()}
        onFastForwardAcceptance={() => {
          transferService.acceptTransfer();
          setActiveView('receiving');
        }}
        onFastForwardDispatch={() => {
          transferService.dispatchAmbulance();
          setActiveView('ambulance');
        }}
        onReset={handleResetDemo}
        onOpenPdf={() => setIsPdfOpen(true)}
      />
    </div>
  );
}
