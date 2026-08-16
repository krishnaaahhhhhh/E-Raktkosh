import React, { useState } from 'react';
import { parseQrPayload } from '../../lib/triageEngine';
import { PatientTriageData } from '../../types';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import {
  X,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  Send,
  User,
  Heart,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({ isOpen, onClose }) => {
  const { dispatchInboundEmergency, qrPayloadString } = usePrathmikta();
  const [inputRaw, setInputRaw] = useState('');
  const [parsedData, setParsedData] = useState<Partial<PatientTriageData> | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleParse = (text: string) => {
    setInputRaw(text);
    setErrorMsg('');
    setSuccessMsg('');
    const result = parseQrPayload(text);
    if (result) {
      setParsedData(result);
    } else {
      setParsedData(null);
      if (text.trim().length > 10) {
        setErrorMsg('Invalid QR token or corrupted checksum format.');
      }
    }
  };

  const handleLoadSampleFromCitizen = () => {
    handleParse(qrPayloadString);
  };

  const handleIntakePatient = async () => {
    if (!parsedData) return;
    try {
      await dispatchInboundEmergency(parsedData as PatientTriageData);
      setSuccessMsg(`Patient ${parsedData.fullName} successfully admitted to ER queue!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      setErrorMsg('Failed to dispatch scanned intake.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0c1220] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#080d18]">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <ScanLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                ER Handheld QR Scanner & Intake Terminal
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Decodes encrypted citizen & paramedic offline triage tokens
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

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Scan or Paste QR Code Payload:
              </label>
              <button
                onClick={handleLoadSampleFromCitizen}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-mono font-semibold"
              >
                <Sparkles className="w-3 h-3" />
                Paste Active Citizen Draft
              </button>
            </div>
            <textarea
              rows={3}
              value={inputRaw}
              onChange={(e) => handleParse(e.target.value)}
              placeholder='Paste JSON or scan data here (e.g. {"v":"PRATHMIKTA-1.0","nm":"Anil Sharma"...})'
              className="w-full bg-[#070b14] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {parsedData && (
            <div className="p-4 rounded-xl bg-[#070b14] border border-cyan-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-black uppercase tracking-wider ${
                      parsedData.severity === 'RED'
                        ? 'bg-red-500 text-white'
                        : parsedData.severity === 'AMBER'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-500 text-slate-950'
                    }`}
                  >
                    PRIORITY: {parsedData.severity}
                  </span>
                  <h4 className="text-sm font-bold text-white">{parsedData.fullName}</h4>
                  <span className="text-xs text-slate-400">({parsedData.age}y, {parsedData.gender})</span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 font-bold">
                  {parsedData.targetDepartment}
                </span>
              </div>

              {parsedData.subSymptoms && parsedData.subSymptoms.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {parsedData.subSymptoms.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-slate-300 border border-slate-800">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {parsedData.knownAllergies && parsedData.knownAllergies.length > 0 && (
                <div className="text-[11px] text-red-300">
                  <b className="text-red-400">Allergies:</b> {parsedData.knownAllergies.join(', ')}
                </div>
              )}

              <button
                onClick={handleIntakePatient}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Admit & Assign to ER Resus Queue</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
