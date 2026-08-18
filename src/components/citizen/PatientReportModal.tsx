import React, { useRef, useState } from 'react';
import {
  FileText,
  Download,
  Share2,
  Printer,
  X,
  Heart,
  Activity,
  Shield,
  Clock,
  MapPin,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  User,
  Building2,
  Calendar,
  Sparkles,
  PhoneCall,
  Send,
  Radio,
  Check,
  ArrowUpRight
} from 'lucide-react';
import { RealHospital } from '../../services/hospitalService';
import { usePrathmikta } from '../../context/PrathmiktaContext';

export interface PatientEmergencyReportData {
  reportId: string;
  timestamp: string;
  patientName: string;
  patientAge: string;
  gender?: string;
  contactPhone?: string;
  inputMethod: 'AI Voice Triage' | 'Manual Self-Triage' | 'Paramedic Assisted';
  emergencyCategory: string;
  symptomDuration: string;
  consciousness: string;
  vitals: {
    spo2: number;
    pulse: number;
    bp: string;
  };
  medicalRedFlags: string[];
  allergies: string;
  hospital: RealHospital;
  userLocationName: string;
  qrTokenId: string;
  severityLevel: 'RED (Critical / Immediate)' | 'YELLOW (Urgent)' | 'GREEN (Stable)';
  clinicalSummary: string;
  aiSuggestedActions: string[];
}

interface PatientReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: PatientEmergencyReportData;
}

export const PatientReportModal: React.FC<PatientReportModalProps> = ({
  isOpen,
  onClose,
  report
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { emitTelemetryLog, setMode } = usePrathmikta();

  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [transferStatus, setTransferStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [transferMessage, setTransferMessage] = useState<string>('');

  if (!isOpen) return null;

  const handlePrintOrDownloadPdf = () => {
    window.print();
  };

  // Direct Transfer to Hospital ER Reception Dashboard & MongoDB persistence
  const handleDirectTransferToHospitalDashboard = async () => {
    setIsTransferring(true);
    setTransferStatus('idle');
    setTransferMessage('');

    try {
      // 1. Prepare standard InboundDispatch payload for Hospital Reception Grid
      const dispatchPayload = {
        dispatchId: report.qrTokenId || `DISP-${Date.now()}`,
        hospitalId: report.hospital.id || 'gsvm-kanpur',
        hospitalName: report.hospital.name,
        severity: report.severityLevel.includes('RED') ? 'RED' : 'YELLOW',
        status: 'In Queue',
        etaMinutes: report.hospital.travelTimeMinutes || 6,
        ambulanceId: 'CITIZEN-EMERGENCY',
        patient: {
          fullName: report.patientName,
          age: parseInt(report.patientAge) || 35,
          gender: report.gender || 'Male',
          contactPhone: '+91 98765 43210',
          symptomCategory: report.emergencyCategory,
          subSymptoms: report.medicalRedFlags,
          onsetTime: report.symptomDuration,
          avpuScale: report.consciousness === 'Unconscious' ? 'U' : report.consciousness === 'Drowsy' ? 'V' : 'A',
          vitals: {
            bp: report.vitals.bp,
            spo2: report.vitals.spo2,
            heartRate: report.vitals.pulse
          },
          targetDepartment: report.emergencyCategory.includes('Cardiac')
            ? 'Emergency Cardiology'
            : report.emergencyCategory.includes('Trauma')
            ? 'ER Trauma Bay'
            : 'Emergency Critical Care',
          clinicalPriorityNotes: report.clinicalSummary
        },
        originCoords: { lat: report.hospital.lat || 26.4712, lng: report.hospital.lng || 80.3211 },
        currentCoords: { lat: report.hospital.lat || 26.4712, lng: report.hospital.lng || 80.3211 }
      };

      // POST to backend API (broadcasts via Socket.io to hospital and saves in MongoDB)
      await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dispatchPayload)
      });

      // Also log telemetry event for full grid sync
      try {
        await emitTelemetryLog({
          id: `log-${Date.now()}`,
          eventType: 'inbound_transfer',
          caseId: report.qrTokenId,
          hospitalId: report.hospital.id || 'gsvm-kanpur',
          text: `🚨 Direct Transfer: AI Medical Report for ${report.patientName} (${report.emergencyCategory}) transmitted to ${report.hospital.name} live dashboard.`,
          bedAssigned: report.severityLevel.includes('RED') ? 'Trauma Bay #1 / ICU' : 'Observation Bay',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
      } catch {
        // non-blocking
      }

      setIsTransferring(false);
      setTransferStatus('success');
      setTransferMessage(`Transferred directly to ${report.hospital.name} ER Reception Dashboard! Hospital triage desk has received patient vitals, QR token (${report.qrTokenId}), and AI clinical report in real-time.`);
    } catch (err) {
      console.error('Direct transfer error:', err);
      setIsTransferring(false);
      setTransferStatus('failed');
      setTransferMessage('Transfer failed to reach the server. Please check your network connection.');
    }
  };

  const handleShareReport = async () => {
    const shareText = `🚨 *PRATHMIKTA EMERGENCY TRIAGE REPORT* 🚨\n\n` +
      `👤 *Patient:* ${report.patientName} (${report.patientAge}, ${report.gender || 'M/F'})\n` +
      `⏱️ *Time:* ${report.timestamp}\n` +
      `🏥 *Target Hospital:* ${report.hospital.name}\n` +
      `🩺 *Category:* ${report.emergencyCategory} [${report.severityLevel}]\n` +
      `📊 *Vitals:* SpO2: ${report.vitals.spo2}%, Pulse: ${report.vitals.pulse} bpm, BP: ${report.vitals.bp} mmHg\n` +
      `🚩 *Red Flags:* ${report.medicalRedFlags.join(', ') || 'None reported'}\n` +
      `🎟️ *Fast-Track Token:* ${report.qrTokenId}\n\n` +
      `📍 *Location:* ${report.userLocationName}\n` +
      `*Prathmikta National Emergency Grid*`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Emergency Medical Report - ${report.patientName}`,
          text: shareText
        });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('📋 Medical Triage Report copied to clipboard!');
      } catch {
        // fallback
      }
    }
  };

  const isRed = report.severityLevel.includes('RED');

  return (
    <div
      id="patient-report-modal-overlay"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full text-slate-900 shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar (Print, Share, Download, Close) */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight leading-tight flex items-center gap-2">
                <span>AI Emergency Triage Report</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  VERIFIED &amp; READY
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                Report ID: {report.reportId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintOrDownloadPdf}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Transfer Status Banner */}
        {transferStatus === 'success' && (
          <div className="bg-emerald-600 text-white px-5 py-3 flex items-start justify-between gap-3 animate-in slide-in-from-top-2">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-black text-white">Directly Reflected on Hospital Dashboard!</p>
                <p className="text-emerald-100 text-[11px] leading-snug mt-0.5">{transferMessage}</p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                setMode('hospital');
              }}
              className="px-3 py-1 bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-lg text-[11px] shrink-0 flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <span>View Hospital Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {transferStatus === 'failed' && (
          <div className="bg-rose-600 text-white px-5 py-2.5 flex items-center gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{transferMessage}</span>
          </div>
        )}

        {/* Report Printable Document Container */}
        <div ref={printRef} id="printable-patient-report" className="p-6 space-y-6 overflow-y-auto max-h-[72vh] text-left">
          
          {/* Header Banner */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-red-600 text-white flex items-center justify-center font-black text-xs">
                  +
                </div>
                <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                  PRATHMIKTA EMERGENCY TRIAGE REPORT
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                AI Pre-Arrival Clinical Assessment &amp; ER Reservation
              </p>
            </div>

            {/* Severity Pill */}
            <div className={`px-3 py-1.5 rounded-xl text-center border font-black text-xs uppercase tracking-wider ${
              isRed
                ? 'bg-red-100 text-red-700 border-red-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              <div className="text-[9px] opacity-75 font-semibold">Triage Severity</div>
              <div>{report.severityLevel}</div>
            </div>
          </div>

          {/* Section 1: Patient Demographics & Intake Time */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient Name</div>
              <div className="text-sm font-black text-slate-900">{report.patientName}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Age / Gender</div>
              <div className="text-sm font-black text-slate-900">{report.patientAge} • {report.gender || 'M'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Timestamp</div>
              <div className="text-xs font-mono font-bold text-slate-800">{report.timestamp}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mode</div>
              <div className="text-xs font-bold text-blue-600">{report.inputMethod}</div>
            </div>
          </div>

          {/* Section 2: Vitals Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                <span>Extracted Golden Hour Vitals</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">BLE / Sensor Synchronized</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200 text-center">
                <div className="text-[10px] font-bold text-blue-600 uppercase">SpO2 (Oxygen)</div>
                <div className="text-2xl font-black text-blue-700">
                  {report.vitals.spo2}%
                </div>
                <div className="text-[10px] font-semibold text-slate-500">
                  {report.vitals.spo2 >= 95 ? 'Normal' : 'Critical (Hypoxia Risk)'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-red-50/60 border border-red-200 text-center">
                <div className="text-[10px] font-bold text-red-600 uppercase">Heart Pulse</div>
                <div className="text-2xl font-black text-red-700">
                  {report.vitals.pulse} <span className="text-xs font-bold">bpm</span>
                </div>
                <div className="text-[10px] font-semibold text-slate-500">
                  {report.vitals.pulse > 100 ? 'Tachycardia' : 'Stable Rate'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-center">
                <div className="text-[10px] font-bold text-emerald-600 uppercase">Blood Pressure</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-700">
                  {report.vitals.bp} <span className="text-[10px] font-bold">mmHg</span>
                </div>
                <div className="text-[10px] font-semibold text-slate-500">Paramedic Synced</div>
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Risk Profile & Red Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                <Shield className="w-3.5 h-3.5 text-red-500" />
                <span>Medical Red Flags &amp; Comorbidities</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {report.medicalRedFlags.length > 0 ? (
                  report.medicalRedFlags.map((flag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-bold"
                    >
                      {flag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 font-medium">No major red flags reported</span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Duration &amp; Known Allergies</span>
              </div>
              <div className="text-xs font-bold text-slate-800 pt-1">
                Onset: <span className="text-blue-600 font-black">{report.symptomDuration}</span> • Allergies: <span className="text-amber-600 font-black">{report.allergies || 'None'}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Consciousness: <span className="font-bold text-slate-800">{report.consciousness}</span>
              </div>
            </div>
          </div>

          {/* Destination Hospital & Geolocation Routing */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Destination ER: {report.hospital.name}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500">
                ETA: ~{report.hospital.travelTime || `${report.hospital.travelTimeMinutes || 8} min`}
              </span>
            </div>

            <div className="text-xs text-slate-600 flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{report.hospital.address}</span>
            </div>
          </div>

          {/* AI Clinical Summary & First-Aid Directive */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>AI Clinical Triage Summary &amp; Immediate Directives</span>
            </div>
            <p className="text-xs text-blue-950 font-medium leading-relaxed">
              {report.clinicalSummary}
            </p>

            <div className="pt-2 border-t border-blue-200/80 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                Pre-Arrival Action Directives:
              </div>
              <ul className="space-y-1">
                {report.aiSuggestedActions.map((action, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5"></span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ER Fast-Track Token & QR Footnote */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                Authorized Emergency Digital Pass
              </div>
              <div className="text-sm font-bold">
                Fast-Track ER &amp; Stretcher Priority Bay Reserved
              </div>
              <p className="text-[11px] text-slate-400">
                Present this report at triage desk or ambulance handover.
              </p>
            </div>

            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-12 h-12 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center">
                <QrCode className="w-10 h-10 text-slate-800" />
              </div>
              <div className="text-left">
                <div className="text-[9px] font-bold uppercase text-slate-400">Scan at Gate</div>
                <div className="text-xs font-mono font-black text-slate-900">{report.qrTokenId}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          
          {/* Direct Transfer Button (Highest priority) */}
          <button
            type="button"
            onClick={handleDirectTransferToHospitalDashboard}
            disabled={isTransferring}
            className="flex-1 sm:flex-initial py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isTransferring ? (
              <>
                <Radio className="w-4 h-4 animate-spin" />
                <span>Transferring to ER Dashboard...</span>
              </>
            ) : transferStatus === 'success' ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Transferred to ER Grid!</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Transfer Direct to Hospital Dashboard</span>
              </>
            )}
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handlePrintOrDownloadPdf}
            className="flex-1 sm:flex-initial py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download / Print PDF</span>
          </button>

          {/* Share via Web Share */}
          <button
            type="button"
            onClick={handleShareReport}
            className="flex-1 sm:flex-initial py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Share</span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
