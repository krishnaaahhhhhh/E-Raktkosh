import React, { useState, useEffect } from 'react';
import { TransferringHospitalLayout, TransferringSubRoute } from './transferring/TransferringHospitalLayout';
import { TransferringOverview } from './transferring/TransferringOverview';
import { CreateTransferWorkflow } from './transferring/CreateTransferWorkflow';
import { ActiveTransfersView } from './transferring/ActiveTransfersView';
import { TransferHistoryView } from './transferring/TransferHistoryView';

import { ReceivingHospitalLayout, ReceivingSubRoute } from './receiving/ReceivingHospitalLayout';
import { ReceivingOverview } from './receiving/ReceivingOverview';
import { IncomingTransfersView } from './receiving/IncomingTransfersView';
import { AcceptedTransfersView } from './receiving/AcceptedTransfersView';
import { ReceivingHistoryView } from './receiving/ReceivingHistoryView';

import { EDossierViewer } from './EDossierViewer';
import { PdfExportModal } from './PdfExportModal';
import { SimulationControls } from './SimulationControls';
import { ConsentModal } from './ConsentModal';

import { transferService } from '../../services/transferService';
import { TransferRequestState } from '../../types/transfer';
import { ArrowLeft, X } from 'lucide-react';

interface TransitDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransitDossierModal: React.FC<TransitDossierModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [state, setState] = useState<TransferRequestState>(transferService.getState());
  const [currentDashboard, setCurrentDashboard] = useState<'transferring' | 'receiving'>('transferring');
  const [transferringSubRoute, setTransferringSubRoute] = useState<TransferringSubRoute>('overview');
  const [receivingSubRoute, setReceivingSubRoute] = useState<ReceivingSubRoute>('overview');

  // Modals
  const [isPdfOpen, setIsPdfOpen] = useState<boolean>(false);
  const [isSandboxOpen, setIsSandboxOpen] = useState<boolean>(false);
  const [isConsentOpen, setIsConsentOpen] = useState<boolean>(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false);

  // Subscribe to shared state
  useEffect(() => {
    const unsubscribe = transferService.subscribe((newState) => {
      setState(newState);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const navigateTransferring = (route: TransferringSubRoute) => {
    setTransferringSubRoute(route);
  };

  const navigateReceiving = (route: ReceivingSubRoute) => {
    setReceivingSubRoute(route);
  };

  const switchToReceiving = () => {
    setCurrentDashboard('receiving');
    setReceivingSubRoute('overview');
  };

  const switchToTransferring = () => {
    setCurrentDashboard('transferring');
    setTransferringSubRoute('overview');
  };

  // State actions
  const handleSelectHospital = (hospitalId: string) => {
    transferService.selectDestinationHospital(hospitalId);
  };

  const handleGenerateDossier = () => {
    transferService.generateEDossier();
  };

  const handleAuthorizeConsent = (
    isEmergencyOverride: boolean,
    overrideData?: { staffName: string; staffReg: string; reason: string }
  ) => {
    setIsConsentOpen(false);
    transferService.validateConsent(isEmergencyOverride, overrideData);
  };

  const handleSendTransferRequest = () => {
    transferService.sendTransferRequest();
  };

  const handleAcceptTransfer = (notes?: string) => {
    transferService.acceptTransfer(notes);
    transferService.dispatchAmbulance();
    setReceivingSubRoute('accepted');
  };

  const handleUpdateTransitProgress = (percent: number) => {
    transferService.updateTransitProgress(percent);
  };

  const handleResetDemo = () => {
    transferService.resetDemo();
    setCurrentDashboard('transferring');
    setTransferringSubRoute('overview');
    setReceivingSubRoute('overview');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md overflow-y-auto flex flex-col font-sans selection:bg-red-600 selection:text-white animate-fade-in">
      {/* Top Banner Bar for Modal Controls */}
      <div className="bg-amber-600 text-slate-950 px-4 py-2 text-xs font-black flex items-center justify-between border-b border-amber-700 shadow-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-slate-950 text-amber-400 rounded text-[10px] uppercase tracking-wider font-extrabold">
            Pillar 4 Module
          </span>
          <span>Post-Crisis Inter-Hospital Transit &amp; E-Dossier Dispatch</span>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-white rounded-lg flex items-center gap-1.5 transition cursor-pointer text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
          <span>Exit to Main App</span>
          <X className="w-3.5 h-3.5 ml-1 text-slate-400 hover:text-white" />
        </button>
      </div>

      <div className="flex-1 min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
        {/* DASHBOARD 1: TRANSFERRING HOSPITAL (KANPUR ER) */}
        {currentDashboard === 'transferring' && (
          <TransferringHospitalLayout
            currentSubRoute={transferringSubRoute}
            onNavigate={navigateTransferring}
            onSwitchToReceiving={switchToReceiving}
            onOpenSandbox={() => setIsSandboxOpen(true)}
            state={state}
          >
            {transferringSubRoute === 'overview' && (
              <TransferringOverview
                state={state}
                onInitiateTransfer={() => navigateTransferring('create-transfer')}
                onViewActiveTransfer={() => navigateTransferring('active-transfers')}
                onViewDossier={() => setIsDossierModalOpen(true)}
                onOpenPdf={() => setIsPdfOpen(true)}
                onSwitchToReceiving={switchToReceiving}
              />
            )}

            {transferringSubRoute === 'create-transfer' && (
              <CreateTransferWorkflow
                state={state}
                onSelectHospital={handleSelectHospital}
                onGenerateDossier={handleGenerateDossier}
                onAuthorizeConsent={handleAuthorizeConsent}
                onSendTransferRequest={handleSendTransferRequest}
                onOpenPdf={() => setIsPdfOpen(true)}
                onSwitchToReceiving={switchToReceiving}
              />
            )}

            {transferringSubRoute === 'active-transfers' && (
              <ActiveTransfersView
                state={state}
                onViewDossier={() => setIsDossierModalOpen(true)}
                onTrackTransit={() => {}}
                onSwitchToReceiving={switchToReceiving}
                onUpdateTransitProgress={handleUpdateTransitProgress}
              />
            )}

            {transferringSubRoute === 'history' && (
              <TransferHistoryView
                state={state}
                onOpenPdf={() => setIsPdfOpen(true)}
              />
            )}
          </TransferringHospitalLayout>
        )}

        {/* DASHBOARD 2: RECEIVING HOSPITAL (SGPGI LUCKNOW) */}
        {currentDashboard === 'receiving' && (
          <ReceivingHospitalLayout
            currentSubRoute={receivingSubRoute}
            onNavigate={navigateReceiving}
            onSwitchToTransferring={switchToTransferring}
            onOpenSandbox={() => setIsSandboxOpen(true)}
            state={state}
          >
            {receivingSubRoute === 'overview' && (
              <ReceivingOverview
                state={state}
                onReviewTransfer={() => navigateReceiving('incoming')}
                onViewDossier={() => setIsDossierModalOpen(true)}
                onAcceptTransfer={() => handleAcceptTransfer()}
                onTrackAmbulance={() => navigateReceiving('accepted')}
                onViewResources={() => navigateReceiving('accepted')}
              />
            )}

            {receivingSubRoute === 'incoming' && (
              <IncomingTransfersView
                state={state}
                onAcceptTransfer={() => handleAcceptTransfer()}
                onTrackAmbulance={() => navigateReceiving('accepted')}
                onOpenPdf={() => setIsPdfOpen(true)}
              />
            )}

            {receivingSubRoute === 'accepted' && (
              <AcceptedTransfersView
                state={state}
                onTrackAmbulance={() => {}}
                onViewDossier={() => setIsDossierModalOpen(true)}
                onUpdateTransitProgress={handleUpdateTransitProgress}
              />
            )}

            {receivingSubRoute === 'history' && (
              <ReceivingHistoryView
                state={state}
                onOpenPdf={() => setIsPdfOpen(true)}
              />
            )}
          </ReceivingHospitalLayout>
        )}

        {/* Shared E-Dossier Inspect Modal */}
        {isDossierModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="font-bold text-sm">Clinical E-Dossier Inspection (FHIR R4 Bundle)</div>
                <button
                  onClick={() => setIsDossierModalOpen(false)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <EDossierViewer
                  state={state}
                  onOpenPdf={() => setIsPdfOpen(true)}
                  onProceedToConsent={() => {
                    setIsDossierModalOpen(false);
                    if (currentDashboard === 'transferring') {
                      navigateTransferring('create-transfer');
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Printable PDF Modal */}
        <PdfExportModal
          isOpen={isPdfOpen}
          state={state}
          onClose={() => setIsPdfOpen(false)}
        />

        {/* Consent Modal */}
        <ConsentModal
          isOpen={isConsentOpen}
          state={state}
          onClose={() => setIsConsentOpen(false)}
          onAuthorizeConsent={handleAuthorizeConsent}
        />

        {/* Simulation Sandbox Drawer */}
        <SimulationControls
          isOpen={isSandboxOpen}
          state={state}
          onClose={() => setIsSandboxOpen(false)}
          onSimulateError={(type) => transferService.simulateError(type)}
          onResolveError={() => transferService.resolveError()}
          onFastForwardAcceptance={() => {
            transferService.acceptTransfer();
            setCurrentDashboard('receiving');
            setReceivingSubRoute('accepted');
          }}
          onFastForwardDispatch={() => {
            transferService.dispatchAmbulance();
            if (currentDashboard === 'transferring') {
              setTransferringSubRoute('active-transfers');
            } else {
              setReceivingSubRoute('accepted');
            }
          }}
          onReset={handleResetDemo}
          onOpenPdf={() => setIsPdfOpen(true)}
        />
      </div>
    </div>
  );
};
