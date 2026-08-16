import React, { useState } from 'react';
import { InboundDispatch, VitalSample } from '../../types';
import {
  Sparkles,
  HeartPulse,
  Activity,
  Brain,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  X,
  Printer,
  Share2,
  Clock,
  Pill,
  Stethoscope,
  Building2,
  UserCheck,
  Zap,
  PhoneCall
} from 'lucide-react';
import { playConfirmChime, playTactileClick } from '../../lib/audio';
import { EcgWaveformMonitor, EcgRhythmType } from '../paramedic/EcgWaveformMonitor';

interface AiClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispatch: InboundDispatch;
}

export const AiClinicalReportModal: React.FC<AiClinicalReportModalProps> = ({
  isOpen,
  onClose,
  dispatch
}) => {
  const [activeTab, setActiveTab] = useState<'ai_summary' | 'vitals_delta' | 'protocols' | 'timeline'>('ai_summary');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !dispatch) return null;

  const { patient, aiReport } = dispatch;
  const vitalHistory: VitalSample[] =
    dispatch.vitalHistory || patient.vitalHistory || [];
  const delta = aiReport?.vitalDelta;

  const handlePrint = () => {
    playTactileClick();
    window.print();
  };

  const handleShare = () => {
    playTactileClick();
    const text = `🚨 AI CLINICAL ER BRIEF - ${patient.fullName} (${patient.age}y, ${patient.gender})
Condition: ${aiReport?.suspectedCondition}
Urgency: ${aiReport?.urgencyLevel}
BP Evolution: ${delta?.bpChange.initial} ➔ ${delta?.bpChange.current} (${delta?.bpChange.summary})
SpO2 Evolution: ${delta?.spo2Change.initial}% ➔ ${delta?.spo2Change.current}% (${delta?.spo2Change.summary})
Target: Floor ${patient.targetFloorId} - ${dispatch.assignedBay || 'Resus Bay 1'}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      playConfirmChime();
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div
      id="ai-clinical-report-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="ai-clinical-report-modal-content"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] text-slate-100 overflow-hidden"
      >
        {/* Modal Top Command Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-[#0a192f] to-slate-900 border-b border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.6)]">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  AI CLINICAL SYNTHESIS REPORT
                </span>
                <span className="text-xs font-mono text-slate-400">
                  #{aiReport?.reportId || 'AI-REP-7740'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2 mt-0.5">
                <span>{patient.fullName}</span>
                <span className="text-xs font-medium text-slate-400">
                  ({patient.age}y &bull; {patient.gender} &bull; AVPU: {patient.avpuScale.split(' - ')[0]})
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{copied ? 'Copied Brief!' : 'Copy ER Brief'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Print</span>
            </button>
            <button
              onClick={() => {
                playTactileClick();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/90 border-b border-slate-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('ai_summary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ai_summary'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Executive Brief</span>
          </button>
          <button
            onClick={() => setActiveTab('vitals_delta')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'vitals_delta'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>BP & Oxygen Changes ({delta?.bpChange.deltaSystolic !== undefined ? `${delta.bpChange.deltaSystolic} mmHg` : 'Live'})</span>
          </button>
          <button
            onClick={() => setActiveTab('protocols')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'protocols'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Pill className="w-3.5 h-3.5 text-amber-400" />
            <span>Medications & Bay Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vital Telemetry Log ({vitalHistory.length} Samples)</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* TAB 1: AI EXECUTIVE BRIEF */}
          {activeTab === 'ai_summary' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Suspected Diagnosis Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border border-red-500/50 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-red-600 text-white">
                    {aiReport?.urgencyLevel.replace(/_/g, ' ') || 'CRITICAL IMMEDIATE OT'}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-mono text-cyan-300">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>AI Model Confidence: {aiReport?.confidenceScore || 96}%</span>
                  </div>
                </div>

                <h3 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-red-500 animate-pulse shrink-0" />
                  <span>{aiReport?.suspectedCondition || 'Acute STEMI / Anterior Coronary Thrombosis'}</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {aiReport?.clinicalRationale}
                </p>
              </div>

              {/* Vital Change Summary Banner (BP & SpO2 at a glance) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* BP Delta Quick Card */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-red-400" />
                      Blood Pressure Evolution
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                      Delta: {delta?.bpChange.deltaSystolic !== undefined && delta.bpChange.deltaSystolic >= 0 ? '+' : ''}{delta?.bpChange.deltaSystolic} mmHg
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 font-mono">
                    <span className="text-xs text-slate-400">Initial: <b className="text-slate-200">{delta?.bpChange.initial}</b></span>
                    <span className="text-cyan-400">&rarr;</span>
                    <span className="text-base font-black text-white">Current: <b className="text-emerald-400">{delta?.bpChange.current}</b> mmHg</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {delta?.bpChange.summary}
                  </p>
                </div>

                {/* SpO2 Delta Quick Card */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      Oxygen Saturation (SpO2) Evolution
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                      delta?.spo2Change.deltaPercent && delta.spo2Change.deltaPercent >= 0
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-red-950 text-red-300 border border-red-800'
                    }`}>
                      Delta: {delta?.spo2Change.deltaPercent !== undefined && delta.spo2Change.deltaPercent >= 0 ? '+' : ''}{delta?.spo2Change.deltaPercent}%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 font-mono">
                    <span className="text-xs text-slate-400">Onset: <b className="text-slate-200">{delta?.spo2Change.initial}%</b></span>
                    <span className="text-cyan-400">&rarr;</span>
                    <span className="text-base font-black text-white">Current: <b className={delta?.spo2Change.current && delta.spo2Change.current < 90 ? 'text-red-400' : 'text-emerald-400'}>{delta?.spo2Change.current}%</b></span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {delta?.spo2Change.summary}
                  </p>
                </div>
              </div>

              {/* Diagnostic Hypotheses Probabilities */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>AI Differential Diagnostic Probabilities</span>
                </h4>

                <div className="space-y-2.5">
                  {aiReport?.diagnosticHypotheses.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{item.diagnosis}</span>
                        <span className="font-mono font-black text-cyan-400">{item.probability}% Probability</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            idx === 0
                              ? 'bg-gradient-to-r from-red-500 to-amber-500'
                              : 'bg-gradient-to-r from-cyan-600 to-blue-600'
                          }`}
                          style={{ width: `${item.probability}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Key Driver: {item.keyDriver}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Stratification Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Airway Compromise</span>
                  <span className={`text-xs font-black uppercase mt-1 inline-block px-2 py-0.5 rounded ${
                    aiReport?.riskStratification.airwayRisk === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {aiReport?.riskStratification.airwayRisk} Risk
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Cardiac Arrest Threat</span>
                  <span className={`text-xs font-black uppercase mt-1 inline-block px-2 py-0.5 rounded ${
                    aiReport?.riskStratification.cardiacArrestRisk === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {aiReport?.riskStratification.cardiacArrestRisk} Risk
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Organ Failure</span>
                  <span className={`text-xs font-black uppercase mt-1 inline-block px-2 py-0.5 rounded ${
                    aiReport?.riskStratification.organFailureRisk === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {aiReport?.riskStratification.organFailureRisk} Risk
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED BP & OXYGEN DELTA / TELEMETRY ANALYSIS */}
          {activeTab === 'vitals_delta' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <b>Pre-Hospital Vital Telemetry Tracking:</b> Shows how patient vitals have shifted from incident onset to live transit arrival.
                </span>
              </div>

              {/* BP In-Depth Progression Card */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-400" />
                    <span>Blood Pressure (BP) Shift Over Transit Time</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-cyan-300">
                    Systolic Delta: {delta?.bpChange.deltaSystolic !== undefined && delta.bpChange.deltaSystolic >= 0 ? '+' : ''}{delta?.bpChange.deltaSystolic} mmHg
                  </span>
                </div>

                {/* Progression Stepper */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {vitalHistory.map((sample, idx) => {
                    const isLast = idx === vitalHistory.length - 1;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border ${
                          isLast
                            ? 'bg-red-950/30 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                            : 'bg-slate-950/80 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                          <span>{sample.phase}</span>
                          <span>{sample.timestamp.split(' ')[0]}</span>
                        </div>
                        <div className="text-lg font-black font-mono text-white">
                          {sample.systolicBp}/{sample.diastolicBp} <span className="text-xs font-normal text-slate-400">mmHg</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 truncate">
                          {sample.notes || 'Routine check'}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-slate-800 text-xs text-slate-300">
                  <b className="text-cyan-400 font-mono">Clinical BP Interpretation: </b>
                  {delta?.bpChange.summary}
                </div>
              </div>

              {/* SpO2 In-Depth Progression Card */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Oxygen Saturation (SpO2) Shift</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-emerald-300">
                    SpO2 Delta: {delta?.spo2Change.deltaPercent !== undefined && delta.spo2Change.deltaPercent >= 0 ? '+' : ''}{delta?.spo2Change.deltaPercent}%
                  </span>
                </div>

                {/* Progression Stepper */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {vitalHistory.map((sample, idx) => {
                    const isLast = idx === vitalHistory.length - 1;
                    const isCrit = sample.spo2 < 90;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border ${
                          isLast
                            ? 'bg-cyan-950/30 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                            : 'bg-slate-950/80 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                          <span>{sample.phase}</span>
                          <span>{sample.timestamp.split(' ')[0]}</span>
                        </div>
                        <div className={`text-lg font-black font-mono ${isCrit ? 'text-red-400' : 'text-emerald-400'}`}>
                          {sample.spo2}% <span className="text-xs font-normal text-slate-400">SpO2</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 truncate">
                          {isCrit ? '🚨 Hypoxic threshold' : 'Stable oxygenation'}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-slate-800 text-xs text-slate-300">
                  <b className="text-cyan-400 font-mono">Oxygenation Trend: </b>
                  {delta?.spo2Change.summary}
                </div>
              </div>

              {/* Heart Rate & Respiration Progression */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Heart Rate Delta</span>
                  <div className="text-base font-black font-mono text-white">
                    {delta?.heartRateChange.initial} bpm &rarr; <span className="text-emerald-400">{delta?.heartRateChange.current} bpm</span> ({delta?.heartRateChange.deltaBpm} bpm)
                  </div>
                  <p className="text-[10px] text-slate-400">{delta?.heartRateChange.summary}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Target Care Destination</span>
                  <div className="text-base font-black text-cyan-300">
                    Floor {patient.targetFloorId}: {dispatch.assignedBay || 'Priority Resus Bay'}
                  </div>
                  <p className="text-[10px] text-slate-400">Assigned: {dispatch.assignedDoctor || 'Trauma Lead'}</p>
                </div>
              </div>

              {/* 12-Lead Real-Time Telemetry ECG Waveform Strip */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-red-400" />
                    <span>In-Transit 12-Lead ECG Waveform Live Telemetry Stream</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                    DIAGNOSTIC CALIBRATED
                  </span>
                </div>
                <EcgWaveformMonitor
                  rhythm={
                    aiReport?.suspectedCondition.toLowerCase().includes('stemi') ||
                    aiReport?.suspectedCondition.toLowerCase().includes('coronary')
                      ? 'ST-Elevation STEMI'
                      : aiReport?.suspectedCondition.toLowerCase().includes('trauma')
                      ? 'Normal Sinus'
                      : 'ST-Elevation STEMI'
                  }
                  heartRate={delta?.heartRateChange.current || patient.vitals.heartRate || 108}
                  spo2={delta?.spo2Change.current || patient.vitals.spo2 || 94}
                  lead="Lead II"
                  showControls={true}
                />
              </div>
            </div>
          )}

          {/* TAB 3: STAT PRE-ARRIVAL ORDERS & MEDICATIONS */}
          {activeTab === 'protocols' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Stat Medications */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-amber-400" />
                  <span>Stat Medications to Prepare at Gurney Arrival</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {aiReport?.suggestedActionProtocols.immediateMeds.map((med, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-black/50 border border-slate-800 flex items-center gap-2 text-xs font-medium text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{med}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bay & Equipment Preparation */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <span>Floor & Bay Readiness Protocol</span>
                </h4>
                <div className="space-y-2">
                  {aiReport?.suggestedActionProtocols.bayPreps.map((prep, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-black/50 border border-slate-800 flex items-center gap-2 text-xs font-medium text-slate-200">
                      <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{prep}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialist Callouts */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-purple-400" />
                  <span>Specialist Emergency Alert Roster</span>
                </h4>
                <div className="space-y-2">
                  {aiReport?.suggestedActionProtocols.specialistCallouts.map((doc, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-black/50 border border-slate-800 flex items-center justify-between text-xs font-medium text-slate-200">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-purple-400" />
                        <span>{doc}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800">
                        Page Transmitted
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COMPLETE VITAL TELEMETRY LOG */}
          {activeTab === 'timeline' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Phase / Time</th>
                      <th className="p-3">BP (mmHg)</th>
                      <th className="p-3">SpO2</th>
                      <th className="p-3">Heart Rate</th>
                      <th className="p-3">Resp Rate</th>
                      <th className="p-3">GCS</th>
                      <th className="p-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950 text-slate-200">
                    {vitalHistory.map((sample, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="p-3 font-bold text-cyan-300">
                          {sample.phase}
                          <div className="text-[10px] text-slate-500">{sample.timestamp}</div>
                        </td>
                        <td className="p-3 font-black text-white">
                          {sample.systolicBp}/{sample.diastolicBp}
                        </td>
                        <td className="p-3 font-black text-emerald-400">
                          {sample.spo2}%
                        </td>
                        <td className="p-3 font-bold text-slate-300">
                          {sample.heartRate} bpm
                        </td>
                        <td className="p-3 text-slate-400">
                          {sample.respiratoryRate}/min
                        </td>
                        <td className="p-3 text-slate-400">
                          {sample.gcs}/15
                        </td>
                        <td className="p-3 text-[11px] text-slate-400 font-sans">
                          {sample.notes || 'In-transit tele-monitoring'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Triage Protocol verified with Golden Hour Resuscitation Guidelines.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                playTactileClick();
                onClose();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold transition-colors cursor-pointer text-center"
            >
              Acknowledge & Close File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
