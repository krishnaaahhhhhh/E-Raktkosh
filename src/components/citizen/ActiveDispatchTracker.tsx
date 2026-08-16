import React, { useEffect, useState } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
  PhoneCall,
  XCircle,
  AlertCircle,
  Building2,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { EmergencyQrModal } from './EmergencyQrModal';
import { AiClinicalReportModal } from '../hospital/AiClinicalReportModal';

export const ActiveDispatchTracker: React.FC = () => {
  const {
    activeCitizenDispatch,
    cancelCitizenDispatch,
    activeHospital,
    currentTriageData,
    qrPayloadString
  } = usePrathmikta();

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isAiReportOpen, setIsAiReportOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(
    Math.round((activeCitizenDispatch?.etaMinutes || 4.2) * 60)
  );

  useEffect(() => {
    if (!activeCitizenDispatch) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCitizenDispatch]);

  if (!activeCitizenDispatch) return null;

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const etaText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const getStatusBadge = () => {
    switch (activeCitizenDispatch.status) {
      case 'bay_ready':
        return {
          text: 'ER Trauma Bay Ready & Staffed',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
        };
      case 'cath_lab_prepped':
        return {
          text: 'Cath Lab Suite Prepped for Primary PCI',
          color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
        };
      case 'acknowledged':
        return {
          text: 'ER Triage Lead Acknowledged Inbound',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/50'
        };
      case 'arrived':
        return {
          text: 'Patient Arrived at Hospital ER',
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/50'
        };
      default:
        return {
          text: 'Telemetry Alert Transmitted • En Route',
          color: 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse'
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="p-4 bg-slate-900 border-b border-slate-800 shadow-xl text-slate-100">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">
                DISPATCH #{activeCitizenDispatch.dispatchId}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge.color}`}>
                {statusBadge.text}
              </span>
            </div>
            <div className="text-xs text-slate-300 font-semibold mt-0.5 flex items-center gap-2">
              <span>{activeHospital.name}</span>
              <span className="text-slate-500">•</span>
              <span className="text-cyan-400 font-mono">Assigned: {activeCitizenDispatch.assignedBay || 'Floor 0 Resus'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Dynamic ETA Countdown */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Transit Countdown</span>
              <span className="text-sm font-black font-mono text-white">{etaText}</span>
            </div>
          </div>

          <button
            onClick={() => setIsAiReportOpen(true)}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 text-purple-200 border border-purple-500/50 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
            title="Preview AI Clinical Diagnostic Briefing sent to ER"
          >
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>AI Report</span>
          </button>

          <button
            onClick={() => setIsQrOpen(true)}
            className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <QrCode className="w-4 h-4" />
            <span>QR Pass</span>
          </button>

          <a
            href={`tel:${activeHospital.phone}`}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>Call ER</span>
          </a>

          <button
            onClick={cancelCitizenDispatch}
            title="Dismiss / Edit Dispatch"
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      <EmergencyQrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        triageData={activeCitizenDispatch.patient || currentTriageData}
        qrPayloadString={qrPayloadString}
      />

      {isAiReportOpen && activeCitizenDispatch && (
        <AiClinicalReportModal
          isOpen={isAiReportOpen}
          onClose={() => setIsAiReportOpen(false)}
          dispatch={activeCitizenDispatch}
        />
      )}
    </div>
  );
};
