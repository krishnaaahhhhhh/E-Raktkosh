import React from 'react';
import {
  HeartHandshake,
  Building2,
  FileCode,
  ShieldCheck,
  Navigation,
  Check,
} from 'lucide-react';
import { TransferStatus } from '../types/transfer';

interface TransferStepperProps {
  currentStatus: TransferStatus;
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}

export const TransferStepper: React.FC<TransferStepperProps> = ({
  currentStatus,
  currentStep,
  onStepClick,
}) => {
  const steps = [
    { id: 1, stepMap: 1, label: '1. Stabilization & Triage', sub: 'Golden Hour Command', icon: HeartHandshake },
    { id: 2, stepMap: 2, label: '2. Select Higher Center', sub: 'Cath Lab Readiness', icon: Building2 },
    { id: 3, stepMap: 3, label: '3. Digital E-Dossier', sub: 'ABDM FHIR Bundle', icon: FileCode },
    { id: 4, stepMap: 4, label: '4. Consent & Authorization', sub: 'Audited Verification', icon: ShieldCheck },
    { id: 5, stepMap: 8, label: '5. Transit & Live Radar', sub: '5G Mobile Telemetry', icon: Navigation },
  ];

  // Map internal 1-8 steps to the 5 milestones
  const getMilestoneIndex = (step: number) => {
    if (step <= 1) return 1;
    if (step === 2) return 2;
    if (step === 3) return 3;
    if (step >= 4 && step <= 7) return 4;
    return 5;
  };

  const activeMilestone = getMilestoneIndex(currentStep);

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = activeMilestone > step.id;
            const isCurrent = activeMilestone === step.id;

            return (
              <button
                key={step.id}
                onClick={() => onStepClick(step.stepMap)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center space-x-3 ${
                  isCurrent
                    ? 'bg-red-50/80 dark:bg-slate-800/90 border-red-500 shadow-md ring-2 ring-red-500/20'
                    : isCompleted
                    ? 'bg-emerald-50/60 dark:bg-slate-900 border-emerald-300 dark:border-emerald-800/80 hover:bg-emerald-50'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-90'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs flex-shrink-0 transition font-bold ${
                    isCurrent
                      ? 'bg-red-600 text-white shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-4 h-4" />}
                </div>

                <div className="min-w-0">
                  <div className={`text-xs font-bold truncate ${isCurrent ? 'text-red-700 dark:text-red-400' : isCompleted ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                    {step.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {step.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
