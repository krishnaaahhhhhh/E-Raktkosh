import React from 'react';
import {
  Inbox,
  CheckCircle2,
  AlertCircle,
  FileText,
  Ambulance,
  Clock,
  Printer,
} from 'lucide-react';
import { TransferRequestState } from '../../../types/transfer';

interface IncomingTransfersViewProps {
  state: TransferRequestState;
  onAcceptTransfer: (notes?: string) => void;
  onTrackAmbulance: () => void;
  onOpenPdf: () => void;
}

export const IncomingTransfersView: React.FC<IncomingTransfersViewProps> = ({
  state,
  onAcceptTransfer,
  onTrackAmbulance,
  onOpenPdf,
}) => {
  const isAccepted =
    state.status === 'RECEIVING_ACCEPTED' ||
    state.status === 'AMBULANCE_DISPATCHED' ||
    state.status === 'EN_ROUTE' ||
    state.status === 'ARRIVED_AT_DESTINATION';

  return (
    <div className="space-y-5 font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Incoming Transfer Referrals</h2>
          <p className="text-xs text-slate-500">Review clinical requests from district emergency departments.</p>
        </div>
      </div>

      {/* Referral Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">{state.patient.name}</span>
                <span className="text-xs text-slate-500">({state.patient.age}y/M)</span>
              </div>
              <span className="text-xs text-red-700 font-semibold">{state.clinical.diagnosis}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isAccepted ? (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Accepted & Standby Ready</span>
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Pending Review</span>
              </span>
            )}
          </div>
        </div>

        {/* Clinical Summary */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="font-bold text-slate-800">Clinical Handoff Summary</div>
          <p className="text-slate-600 leading-relaxed">
            {state.clinical.historyOfPresentIllness}
          </p>
          <div className="flex justify-between pt-1 text-slate-500">
            <span>Referring ER: <strong>{state.patient.currentHospital}</strong></span>
            <span>ABHA: <strong className="font-mono">{state.patient.abhaId}</strong></span>
          </div>
        </div>

        {/* Vitals Grid */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-400 font-bold">HR</div>
            <div className="font-bold text-red-600">{state.clinical.vitals.heartRate} bpm</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-400 font-bold">BP</div>
            <div className="font-bold text-slate-900">{state.clinical.vitals.bloodPressure}</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-400 font-bold">SpO2</div>
            <div className="font-bold text-emerald-700">{state.clinical.vitals.spO2}% (4L O2)</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-400 font-bold">RR</div>
            <div className="font-bold text-slate-900">{state.clinical.vitals.respiratoryRate} /min</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={onOpenPdf}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Clinical Dossier</span>
          </button>

          {!isAccepted ? (
            <button
              onClick={() => onAcceptTransfer('Transfer accepted for emergency PCI.')}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Accept Case & Reserve Cath Lab 02</span>
            </button>
          ) : (
            <button
              onClick={onTrackAmbulance}
              className="px-5 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Ambulance className="w-4 h-4" />
              <span>Track Inbound Ambulance</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
