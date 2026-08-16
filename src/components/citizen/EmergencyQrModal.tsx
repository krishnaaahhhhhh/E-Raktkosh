import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PatientTriageData } from '../../types';
import {
  X,
  QrCode,
  ShieldCheck,
  Download,
  Share2,
  Copy,
  Check,
  AlertOctagon,
  Heart,
  Clock,
  User,
  Phone,
  Layers
} from 'lucide-react';

interface EmergencyQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  triageData: PatientTriageData;
  qrPayloadString: string;
}

export const EmergencyQrModal: React.FC<EmergencyQrModalProps> = ({
  isOpen,
  onClose,
  triageData,
  qrPayloadString
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(qrPayloadString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'RED':
        return 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
      case 'AMBER':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Emergency Triage QR Pass
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Offline Clinical Hand-off Token • Hash: {triageData.payloadHash}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Triage Priority Banner */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between ${getSeverityBadgeClass(
              triageData.severity
            )}`}
          >
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider">
                  PRIORITY: {triageData.severity} ({triageData.symptomCategory.toUpperCase()})
                </div>
                <div className="text-[11px] opacity-90">{triageData.targetDepartment}</div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10">
              FLOOR {triageData.targetFloorId}
            </span>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-inner border-2 border-slate-200">
            <QRCodeSVG
              value={qrPayloadString}
              size={210}
              level="M"
              includeMargin={false}
              className="rounded"
            />
            <p className="text-[11px] text-slate-700 font-mono font-semibold mt-3 text-center">
              Scan with ER Handheld Scanner or Paramedic App for instant patient intake
            </p>
          </div>

          {/* Patient Quick Summary Details */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold text-white">{triageData.fullName}</span> ({triageData.age}y, {triageData.gender})
              </div>
              <div className="flex items-center gap-1.5 font-mono text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                {triageData.contactPhone}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Onset: <b className="text-amber-400">{triageData.onsetTime}</b></span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>AVPU: <b className="text-cyan-400">{triageData.avpuScale.split(' - ')[0]}</b></span>
              </div>
            </div>

            {triageData.subSymptoms.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Reported Symptoms:
                </span>
                <div className="flex flex-wrap gap-1">
                  {triageData.subSymptoms.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {triageData.knownAllergies.length > 0 && (
              <div className="pt-1 text-[11px] text-red-300">
                <span className="font-bold text-red-400">Allergies:</span> {triageData.knownAllergies.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/60 text-xs">
          <button
            onClick={handleCopyRaw}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Payload!' : 'Copy Raw Data'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-lg shadow-cyan-600/30 transition-all"
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
