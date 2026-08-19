import React, { useState } from 'react';
import {
  CheckCircle2,
  Building2,
  FileText,
  ShieldCheck,
  Send,
  ArrowRight,
  ArrowLeft,
  HeartPulse,
  Printer,
  Sparkles,
  Lock,
  ArrowRightLeft,
} from 'lucide-react';
import { TransferRequestState } from '../../../types/transfer';

interface CreateTransferWorkflowProps {
  state: TransferRequestState;
  onSelectHospital: (hospitalId: string) => void;
  onGenerateDossier: () => void;
  onAuthorizeConsent: (isEmergencyOverride: boolean, overrideData?: { staffName: string; staffReg: string; reason: string }) => void;
  onSendTransferRequest: () => void;
  onOpenPdf: () => void;
  onSwitchToReceiving: () => void;
}

export const CreateTransferWorkflow: React.FC<CreateTransferWorkflowProps> = ({
  state,
  onSelectHospital,
  onGenerateDossier,
  onAuthorizeConsent,
  onSendTransferRequest,
  onOpenPdf,
  onSwitchToReceiving,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isOverride, setIsOverride] = useState<boolean>(false);
  const [overrideReason, setOverrideReason] = useState<string>('Acute STEMI requiring emergency primary PCI transfer.');

  const selectedHospital = state.hospitals.find((h) => h.id === state.selectedHospitalId) || state.hospitals[0];

  const steps = [
    { num: 1, title: 'Patient & Diagnosis' },
    { num: 2, title: 'Receiving Hospital' },
    { num: 3, title: 'E-Dossier & Consent' },
    { num: 4, title: 'Transmit Referral' },
  ];

  const handleNextFromStep1 = () => {
    setCurrentStep(2);
  };

  const handleNextFromStep2 = () => {
    onGenerateDossier();
    setCurrentStep(3);
  };

  const handleNextFromStep3 = () => {
    onAuthorizeConsent(isOverride, isOverride ? {
      staffName: 'Dr. Rajesh Tripathi',
      staffReg: 'UP-MED-38192',
      reason: overrideReason,
    } : undefined);
    onSendTransferRequest();
    setCurrentStep(4);
  };

  return (
    <div className="space-y-5 font-sans">
      {/* 4 Clean Step Indicator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {steps.map((step) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <button
                key={step.num}
                onClick={() => setCurrentStep(step.num)}
                className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex items-center space-x-2.5 ${
                  isCurrent
                    ? 'bg-red-50 border-red-500 text-red-800 ring-2 ring-red-500/20'
                    : isCompleted
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCurrent
                      ? 'bg-red-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? '✓' : step.num}
                </div>
                <div className="truncate">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Step {step.num}
                  </div>
                  <div className="text-xs font-bold truncate">{step.title}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: PATIENT & CLINICAL DIAGNOSIS */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">1. Confirm Patient & Clinical Details</h3>
            <p className="text-xs text-slate-500">
              Verify pre-transit stabilization and vital parameters before selecting destination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900 text-sm">{state.patient.name}</div>
              <div className="text-slate-600">
                Age: <strong>{state.patient.age} yrs</strong> • Gender: <strong>Male</strong> • Blood: <strong>{state.patient.bloodGroup}+</strong>
              </div>
              <div className="text-slate-600 font-mono">ABHA: {state.patient.abhaId}</div>
              <div className="text-slate-600">Attending: <strong>{state.patient.attendingDoctor}</strong></div>
            </div>

            <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-200 space-y-2 text-xs">
              <div className="font-bold text-red-900 text-sm">Emergency Diagnosis</div>
              <div className="font-bold text-red-700">{state.clinical.diagnosis}</div>
              <div className="text-slate-700">{state.clinical.historyOfPresentIllness}</div>
            </div>
          </div>

          {/* Vitals Summary */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold">HR</div>
              <div className="font-bold text-red-600 text-sm">{state.clinical.vitals.heartRate} bpm</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold">BP</div>
              <div className="font-bold text-slate-900 text-sm">{state.clinical.vitals.bloodPressure}</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold">SpO2</div>
              <div className="font-bold text-emerald-700 text-sm">{state.clinical.vitals.spO2}% (4L O2)</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold">RR</div>
              <div className="font-bold text-slate-900 text-sm">{state.clinical.vitals.respiratoryRate} /min</div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              onClick={handleNextFromStep1}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition cursor-pointer"
            >
              <span>Next: Select Receiving Hospital</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT RECEIVING HOSPITAL */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">2. Select Destination Higher Center</h3>
            <p className="text-xs text-slate-500">
              Real-time Cath Lab and ICU availability along the transit corridor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {state.hospitals.map((h) => {
              const isSelected = h.id === state.selectedHospitalId;
              return (
                <div
                  key={h.id}
                  onClick={() => onSelectHospital(h.id)}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-sky-50/60 border-sky-500 ring-2 ring-sky-500/20'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{h.name}</span>
                      {h.id === 'sgpgi-lucknow' && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">{h.city} • {h.distanceKm} km ({h.estimatedTravelTime})</div>
                  </div>

                  <div className="text-xs space-y-1 border-t border-slate-200/60 pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cath Lab:</span>
                      <span className="font-semibold text-emerald-700">{h.cathLabStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">CCU Beds:</span>
                      <span className="font-bold text-slate-800">{h.icuBedsAvailable} Available</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-1.5 rounded-lg text-xs font-bold transition ${
                      isSelected ? 'bg-sky-700 text-white' : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ Selected Destination' : 'Select'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleNextFromStep2}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition cursor-pointer"
            >
              <span>Compile E-Dossier for {selectedHospital.name}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: E-DOSSIER & CONSENT */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">3. Electronic Dossier & ABDM Consent</h3>
              <p className="text-xs text-slate-500">
                Digital health record bundle compiled and ready for secure handoff.
              </p>
            </div>
            <button
              onClick={onOpenPdf}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Printable PDF</span>
            </button>
          </div>

          {/* Dossier Overview Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800">FHIR R4 Diagnostic Bundle:</span>
              <span className="font-mono text-emerald-700 font-bold">DIGITALLY SEALED</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>Encounter ID: <strong className="text-slate-900 font-mono">{state.encounterId}</strong></div>
              <div>Destination: <strong className="text-slate-900">{selectedHospital.name}</strong></div>
            </div>
          </div>

          {/* Consent Selection */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Patient Data Sharing Authorization</span>
            </div>

            <div className="flex items-center space-x-4 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-800">
                <input
                  type="radio"
                  name="consent"
                  checked={!isOverride}
                  onChange={() => setIsOverride(false)}
                  className="text-emerald-600"
                />
                <span>Standard ABDM Consent (Patient / Kin Authorized)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-800">
                <input
                  type="radio"
                  name="consent"
                  checked={isOverride}
                  onChange={() => setIsOverride(true)}
                  className="text-amber-600"
                />
                <span>Emergency Clinical Override (Unconscious / Critical)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleNextFromStep3}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Transmit Transfer Request</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: TRANSMIT & DISPATCH COMPLETE */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">Transfer Request Transmitted Successfully</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Clinical E-Dossier for <strong>{state.patient.name}</strong> has been transmitted to <strong>{selectedHospital.name}</strong>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-md mx-auto text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Encounter ID:</span>
              <span className="font-mono font-bold text-slate-900">{state.encounterId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cath Lab Status:</span>
              <span className="font-semibold text-emerald-700">Awaiting Acceptance</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ALS Ambulance:</span>
              <span className="font-bold text-slate-800">ALS-042 on standby</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onSwitchToReceiving}
              className="px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Open Receiving Hospital View to Accept</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
