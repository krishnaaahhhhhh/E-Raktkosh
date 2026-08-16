import React, { useState } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import {
  Ambulance,
  Activity,
  HeartPulse,
  Wind,
  Brain,
  ShieldAlert,
  Send,
  Navigation,
  Clock,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileCheck,
  Stethoscope,
  MapPin,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { playConfirmChime, playTactileClick } from '../../lib/audio';
import { EcgWaveformMonitor, EcgRhythmType } from './EcgWaveformMonitor';

export const ParamedicAmbulanceApp: React.FC = () => {
  const {
    activeHospital,
    patientName,
    setPatientName,
    patientAge,
    setPatientAge,
    patientGender,
    setPatientGender,
    contactPhone,
    symptomCategory,
    subSymptoms,
    vitals,
    setVitals,
    avpuScale,
    setAvpuScale,
    currentSeverity,
    targetDepartment,
    targetFloorId,
    dispatchInboundEmergency,
    activeCitizenDispatch
  } = usePrathmikta();

  const [ambulanceId] = useState('AMB-DL-108-442');
  const [paramedicName] = useState('Paramedic Officer Rajeev Anand');
  const [ecgStatus, setEcgStatus] = useState<EcgRhythmType>('ST-Elevation STEMI');
  const [ivAccess, setIvAccess] = useState<'18G Left Forearm' | '20G Right Antecubital' | 'Central Line Pending'>('18G Left Forearm');
  const [oxygenLpm, setOxygenLpm] = useState<number>(4);
  const [isPreAlertTransmitted, setIsPreAlertTransmitted] = useState<boolean>(false);
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);

  const handleTransmitPreAlert = async () => {
    setIsTransmitting(true);
    playTactileClick();
    try {
      await dispatchInboundEmergency();
      setIsPreAlertTransmitted(true);
      playConfirmChime();
    } finally {
      setIsTransmitting(false);
    }
  };

  return (
    <div id="paramedic-ambulance-app" className="w-full h-full bg-[#050914] text-slate-100 flex flex-col overflow-y-auto">
      {/* Top Paramedic Status Bar */}
      <div className="bg-amber-950/40 border-b border-amber-500/40 px-4 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400">
            <Ambulance className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                TIER 2: PARAMEDIC TABLET
              </span>
              <span className="text-xs font-bold text-white tracking-wide">{ambulanceId}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                GPS LIVE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Duty Crew: <span className="text-slate-200 font-semibold">{paramedicName}</span> &bull; En-route to{' '}
              <span className="text-cyan-300 font-bold">{activeHospital.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-paramedic-transmit-prealert"
            onClick={handleTransmitPreAlert}
            disabled={isTransmitting}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all shadow-lg cursor-pointer ${
              isPreAlertTransmitted
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 animate-pulse'
            }`}
          >
            {isTransmitting ? (
              <span>Transmitting Telemetry...</span>
            ) : isPreAlertTransmitted ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Hospital ER Pre-Alert Transmitted</span>
              </>
            ) : (
              <>
                <Radio className="w-4 h-4" />
                <span>Transmit Golden-Hour Pre-Alert &rarr;</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Vitals, Clinical Protocol & Pre-Hospital Interventions */}
      <div className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Active Route & Target ER Handshake Header */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
              Assigned Emergency Receiving Facility
            </span>
            <h3 className="text-lg font-black text-white">{activeHospital.name}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              {activeHospital.address}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Ambulance ETA</div>
              <div className="text-base font-black text-cyan-400 font-mono">4.5 MINS</div>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Target Bay</div>
              <div className="text-base font-black text-red-400 font-mono">{targetDepartment.split(' ')[0]}</div>
            </div>
            <div className="text-center px-3">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Floor Level</div>
              <div className="text-base font-black text-amber-400 font-mono">FLOOR {targetFloorId}</div>
            </div>
          </div>
        </div>

        {/* Rapid Paramedic Clinical Vitals Transmission */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left 2 Cols: Live Vitals Monitor & Adjustments */}
          <div className="lg:col-span-2 space-y-5">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-500 animate-pulse" />
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    On-Scene Rapid Vital Signs Telemetry
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                  REAL-TIME SYNC
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* SpO2 */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase font-mono">SpO2 Oxygen</span>
                  <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
                    {vitals.spo2 || 94}%
                  </div>
                  <div className="flex justify-center gap-1 mt-2">
                    <button
                      onClick={() => setVitals((v) => ({ ...v, spo2: Math.max(70, (v.spo2 || 94) - 1) }))}
                      className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      onClick={() => setVitals((v) => ({ ...v, spo2: Math.min(100, (v.spo2 || 94) + 1) }))}
                      className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Heart Rate */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-red-400 font-bold uppercase font-mono">Heart Rate (BPM)</span>
                  <div className="text-2xl font-black text-red-400 font-mono mt-1">
                    {vitals.heartRate || 108}
                  </div>
                  <div className="flex justify-center gap-1 mt-2">
                    <button
                      onClick={() => setVitals((v) => ({ ...v, heartRate: Math.max(40, (v.heartRate || 108) - 5) }))}
                      className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      onClick={() => setVitals((v) => ({ ...v, heartRate: Math.min(220, (v.heartRate || 108) + 5) }))}
                      className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Blood Pressure */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-amber-400 font-bold uppercase font-mono">Blood Pressure</span>
                  <div className="text-xl font-black text-amber-400 font-mono mt-1.5">
                    {vitals.systolicBp || 155}/{vitals.diastolicBp || 95}
                  </div>
                  <div className="flex justify-center gap-1 mt-2">
                    <button
                      onClick={() =>
                        setVitals((v) => ({
                          ...v,
                          systolicBp: Math.max(60, (v.systolicBp || 155) - 5),
                          diastolicBp: Math.max(40, (v.diastolicBp || 95) - 3)
                        }))
                      }
                      className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      onClick={() =>
                        setVitals((v) => ({
                          ...v,
                          systolicBp: Math.min(240, (v.systolicBp || 155) + 5),
                          diastolicBp: Math.min(140, (v.diastolicBp || 95) + 3)
                        }))
                      }
                      className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* AVPU Neurological Scale */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-purple-400 font-bold uppercase font-mono">AVPU Neuro</span>
                  <div className="text-base font-black text-purple-400 font-mono mt-2 truncate">
                    {avpuScale.split(' - ')[0]} ({avpuScale.split(' - ')[1]?.slice(0, 8)})
                  </div>
                  <div className="mt-2">
                    <select
                      value={avpuScale}
                      onChange={(e) => setAvpuScale(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 text-[10px] rounded px-1 py-0.5 text-slate-300"
                    >
                      <option value="A - Alert">A - Alert</option>
                      <option value="V - Responsive to Voice">V - Voice</option>
                      <option value="P - Responsive to Pain">P - Pain</option>
                      <option value="U - Unresponsive">U - Unresp</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 12-Lead ECG & Paramedic Interventions */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-red-400" />
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    12-Lead ECG & Pre-Hospital Emergency Interventions
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>LIVE CARDIAC MONITOR</span>
                </span>
              </div>

              {/* Canvas-Based Real-Time ECG Waveform Monitor */}
              <EcgWaveformMonitor
                rhythm={ecgStatus}
                onRhythmChange={setEcgStatus}
                heartRate={vitals.heartRate || 108}
                onHeartRateChange={(newHr) => setVitals((v) => ({ ...v, heartRate: newHr }))}
                spo2={vitals.spo2 || 94}
                lead="Lead II"
                showControls={true}
              />

              {/* Pre-Hospital Interventions Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* IV Cannulation */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>IV Access Line</span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">VASCULAR PATENT</span>
                  </label>
                  <select
                    value={ivAccess}
                    onChange={(e) => setIvAccess(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                  >
                    <option value="18G Left Forearm">18G Left Forearm (Patent)</option>
                    <option value="20G Right Antecubital">20G Right Antecubital</option>
                    <option value="Central Line Pending">Central Line Required at ER</option>
                  </select>
                </div>

                {/* Oxygen Therapy */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>High-Flow O2 Flow Rate</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">NRBM MASK</span>
                  </label>
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5">
                    <Wind className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-xs font-black font-mono text-cyan-300">
                      {oxygenLpm} Liters/min (High-Flow NRBM)
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        onClick={() => setOxygenLpm((prev) => Math.max(2, prev - 2))}
                        className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        onClick={() => setOxygenLpm((prev) => Math.min(15, prev + 2))}
                        className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Col: Patient Summary & Transmit Pre-Alert Card */}
          <div className="space-y-5">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-black uppercase text-amber-400">Patient Intake Dossier</span>
                <span className="text-[10px] font-mono text-slate-400">ID: {patientName.slice(0, 3)}-992</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400">Patient Name & Age:</span>
                  <div className="font-bold text-white text-sm mt-0.5">
                    {patientName}, {patientAge} yrs ({patientGender})
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Primary Emergency Syndrome:</span>
                  <div className="font-bold text-red-400 mt-0.5 uppercase tracking-wide">
                    {symptomCategory} ({subSymptoms[0] || 'Acute Trauma'})
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Hospital Pre-Alert Department:</span>
                  <div className="font-bold text-cyan-300 mt-0.5">{targetDepartment}</div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400">12-Lead ECG Finding:</span>
                  <div className="font-mono font-bold text-amber-300 mt-0.5">{ecgStatus}</div>
                </div>
              </div>

              <button
                id="btn-paramedic-action-call-er"
                onClick={() => {
                  window.location.href = `tel:${activeHospital.emergencyHotline.split('/')[0].trim()}`;
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Call ER Direct: {activeHospital.emergencyHotline}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
