import React, { useEffect, useState } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import { InboundDispatch } from '../../types';
import {
  ShieldAlert,
  Clock,
  HeartPulse,
  Brain,
  Wind,
  Flame,
  Activity,
  CheckCircle,
  Stethoscope,
  Building2,
  AlertTriangle,
  QrCode,
  User,
  Radio,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Sparkles,
  TrendingDown,
  TrendingUp,
  FileText
} from 'lucide-react';
import { EmergencyQrModal } from '../citizen/EmergencyQrModal';
import { AiClinicalReportModal } from './AiClinicalReportModal';

export const InboundQueue: React.FC = () => {
  const {
    activeHospital,
    updatePatientDispatchStatus,
    activeCitizenDispatch
  } = usePrathmikta();

  const [selectedQrDispatch, setSelectedQrDispatch] = useState<InboundDispatch | null>(null);
  const [selectedAiReportDispatch, setSelectedAiReportDispatch] = useState<InboundDispatch | null>(null);
  const [ticker, setTicker] = useState(0);

  // Live countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dispatches = activeHospital.activeDispatches || [];

  const getSymptomIcon = (category: string) => {
    switch (category) {
      case 'cardiac':
        return <HeartPulse className="w-4 h-4 text-red-400 animate-pulse" />;
      case 'stroke':
        return <Brain className="w-4 h-4 text-red-400" />;
      case 'trauma':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'respiratory':
        return <Wind className="w-4 h-4 text-cyan-400" />;
      case 'burn':
        return <Flame className="w-4 h-4 text-amber-400" />;
      default:
        return <Activity className="w-4 h-4 text-emerald-400" />;
    }
  };

  const calculateRemainingSeconds = (dispatch: InboundDispatch) => {
    const elapsedSeconds = Math.floor((Date.now() - new Date(dispatch.dispatchTimestamp).getTime()) / 1000);
    const totalEtaSeconds = Math.round(dispatch.etaMinutes * 60);
    return Math.max(0, totalEtaSeconds - elapsedSeconds);
  };

  const formatCountdown = (dispatch: InboundDispatch) => {
    const remaining = calculateRemainingSeconds(dispatch);
    if (remaining === 0) return 'ARRIVED / ON SITE';
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} remaining`;
  };

  return (
    <div
      id="inbound-emergency-queue"
      className="w-full h-full flex flex-col bg-[#080d1a] border-l border-cyan-500/30 text-slate-100 overflow-y-auto"
    >
      {/* Queue Header */}
      <div className="p-3.5 border-b border-slate-800 bg-[#070b14] flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-6 h-6 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              Live Inbound Emergency Queue
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-red-500 text-white font-bold">
                {dispatches.length}
              </span>
            </h2>
          </div>
        </div>
        <span className="text-[10px] font-mono text-cyan-400">Auto-Sorted by Severity</span>
      </div>

      {/* Dispatches List */}
      <div className="p-3.5 space-y-3 flex-1">
        {dispatches.length === 0 ? (
          <div className="p-8 text-center bg-[#0c1220] rounded-2xl border border-slate-800 space-y-2">
            <Activity className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">No Active Inbound Emergencies</h3>
            <p className="text-[11px] text-slate-500">
              Transmit a dispatch from the Citizen Emergency App to watch real-time ER wall synchronization.
            </p>
          </div>
        ) : (
          dispatches.map((dispatch) => {
            const isRed = dispatch.severity === 'RED';
            const countdownText = formatCountdown(dispatch);

            return (
              <div
                key={dispatch.dispatchId}
                id={`inbound-card-${dispatch.dispatchId}`}
                className={`rounded-xl border p-3.5 transition-all shadow-xl space-y-3 ${
                  isRed
                    ? 'bg-gradient-to-b from-[#160c14] to-[#0c1220] border-red-500/70 shadow-[0_0_20px_rgba(239,68,68,0.2)] ring-1 ring-red-500/40'
                    : 'bg-[#0c1220] border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                }`}
              >
                {/* Card Top: Severity Badge + Countdown */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        isRed ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-500 text-slate-950 font-bold'
                      }`}
                    >
                      PRIORITY {dispatch.severity}: {dispatch.patient.symptomCategory.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      #{dispatch.dispatchId}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-slate-700/80">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    <span className="text-xs font-black font-mono text-white">{countdownText}</span>
                  </div>
                </div>

                {/* Patient Information & Target Floor */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 text-white font-bold">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{dispatch.patient.fullName}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Age: <b className="text-slate-200">{dispatch.patient.age}y</b> • Gender: <b className="text-slate-200">{dispatch.patient.gender}</b> • AVPU: <b className="text-cyan-300">{dispatch.patient.avpuScale.split(' - ')[0]}</b>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-[10px] font-mono font-bold">
                      FLOOR {dispatch.assignedFloor}: {dispatch.assignedBay || 'Resus Bay 1'}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                      {dispatch.assignedDoctor || 'Dr. Vivek Mehra, MD'}
                    </p>
                  </div>
                </div>

                {/* Clinical Symptoms & Warning Indicators */}
                <div className="p-2 rounded-lg bg-black/50 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-red-300 font-medium">
                    {getSymptomIcon(dispatch.patient.symptomCategory)}
                    <span className="truncate">{dispatch.patient.primaryComplaint}</span>
                  </div>

                  {dispatch.patient.knownAllergies.length > 0 && (
                    <div className="text-[10px] text-amber-300">
                      <b className="text-amber-400">Allergy Warning:</b> {dispatch.patient.knownAllergies.join(', ')}
                    </div>
                  )}

                  {/* AI Clinical & Vital Delta Badge */}
                  {dispatch.aiReport && (
                    <div className="mt-1.5 p-1.5 rounded-md bg-purple-950/40 border border-purple-500/30 flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-1 text-[10px]">
                        <div className="flex items-center gap-1 text-purple-300 font-bold truncate">
                          <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                          <span className="truncate">AI: {dispatch.aiReport.suspectedCondition}</span>
                        </div>
                        <span className="text-[9px] font-mono px-1 rounded bg-purple-900/60 text-purple-200 border border-purple-500/40">
                          {dispatch.aiReport.urgencyLevel}
                        </span>
                      </div>

                      {/* Vital Delta Quick Preview */}
                      {dispatch.aiReport.vitalDelta && (
                        <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-slate-300 pt-0.5">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">BP:</span>
                            <span className="text-slate-200 font-bold">{dispatch.aiReport.vitalDelta.bpChange.initial}➔{dispatch.aiReport.vitalDelta.bpChange.current}</span>
                            {dispatch.aiReport.vitalDelta.bpChange.deltaSystolic !== 0 && (
                              <span className={dispatch.aiReport.vitalDelta.bpChange.deltaSystolic > 0 ? 'text-amber-400' : 'text-cyan-400'}>
                                ({dispatch.aiReport.vitalDelta.bpChange.deltaSystolic > 0 ? '+' : ''}{dispatch.aiReport.vitalDelta.bpChange.deltaSystolic})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-slate-400">SpO2:</span>
                            <span className="text-slate-200 font-bold">{dispatch.aiReport.vitalDelta.spo2Change.initial}%➔{dispatch.aiReport.vitalDelta.spo2Change.current}%</span>
                            {dispatch.aiReport.vitalDelta.spo2Change.deltaPercent !== 0 && (
                              <span className={dispatch.aiReport.vitalDelta.spo2Change.deltaPercent < 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                                ({dispatch.aiReport.vitalDelta.spo2Change.deltaPercent > 0 ? '+' : ''}{dispatch.aiReport.vitalDelta.spo2Change.deltaPercent}%)
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!dispatch.aiReport && dispatch.patient.vitals && (
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300 pt-0.5">
                      <span>BP: <b>{dispatch.patient.vitals.systolicBp || 120}/{dispatch.patient.vitals.diastolicBp || 80}</b></span>
                      <span>•</span>
                      <span>HR: <b>{dispatch.patient.vitals.heartRate || 80} bpm</b></span>
                      <span>•</span>
                      <span>SpO2: <b className={dispatch.patient.vitals.spo2 && dispatch.patient.vitals.spo2 < 90 ? 'text-red-400' : 'text-emerald-400'}>{dispatch.patient.vitals.spo2 || 98}%</b></span>
                    </div>
                  )}
                </div>

                {/* Interactive ER Action Controls */}
                <div className="flex items-center justify-between gap-1.5 pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      id={`btn-view-ai-${dispatch.dispatchId}`}
                      onClick={() => setSelectedAiReportDispatch(dispatch)}
                      className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-950/80 to-cyan-950/80 hover:from-purple-900 hover:to-cyan-900 border border-purple-500/50 text-purple-300 text-xs font-bold flex items-center gap-1 shadow-sm transition-all group"
                      title="View AI Clinical Synthesis & Vital Delta Evolution"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform" />
                      <span>AI Report</span>
                    </button>

                    <button
                      id={`btn-view-qr-${dispatch.dispatchId}`}
                      onClick={() => setSelectedQrDispatch(dispatch)}
                      className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="View Digital QR Pass"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QR</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {dispatch.status === 'dispatched' && (
                      <button
                        id={`btn-ack-${dispatch.dispatchId}`}
                        onClick={() =>
                          updatePatientDispatchStatus(
                            dispatch.dispatchId,
                            'acknowledged',
                            dispatch.assignedBay,
                            dispatch.assignedDoctor
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-extrabold transition-all"
                      >
                        Acknowledge Inbound
                      </button>
                    )}

                    {dispatch.status === 'acknowledged' && (
                      <button
                        id={`btn-prep-bay-${dispatch.dispatchId}`}
                        onClick={() =>
                          updatePatientDispatchStatus(
                            dispatch.dispatchId,
                            dispatch.patient.symptomCategory === 'cardiac' ? 'cath_lab_prepped' : 'bay_ready',
                            dispatch.patient.symptomCategory === 'cardiac' ? 'Cath Lab 1 Prepped' : 'Resus Bay 1 Ready'
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-extrabold transition-all shadow-md"
                      >
                        {dispatch.patient.symptomCategory === 'cardiac' ? 'Cath Lab Standby Ready' : 'Bay 1 Prepped & Staffed'}
                      </button>
                    )}

                    {(dispatch.status === 'bay_ready' || dispatch.status === 'cath_lab_prepped') && (
                      <button
                        id={`btn-admit-${dispatch.dispatchId}`}
                        onClick={() =>
                          updatePatientDispatchStatus(
                            dispatch.dispatchId,
                            'arrived',
                            dispatch.assignedBay
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-all shadow-md"
                      >
                        Mark Arrived & Admitted
                      </button>
                    )}

                    {dispatch.status === 'arrived' && (
                      <span className="px-3 py-1.5 rounded-lg bg-blue-950 border border-blue-600/60 text-blue-300 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Admitted on Floor {dispatch.assignedFloor}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* QR Modal Inspector for selected dispatch */}
      {selectedQrDispatch && (
        <EmergencyQrModal
          isOpen={!!selectedQrDispatch}
          onClose={() => setSelectedQrDispatch(null)}
          triageData={selectedQrDispatch.patient}
          qrPayloadString={JSON.stringify(selectedQrDispatch.patient)}
        />
      )}

      {/* AI Clinical Report Modal Inspector */}
      {selectedAiReportDispatch && (
        <AiClinicalReportModal
          isOpen={!!selectedAiReportDispatch}
          onClose={() => setSelectedAiReportDispatch(null)}
          dispatch={selectedAiReportDispatch}
        />
      )}
    </div>
  );
};
