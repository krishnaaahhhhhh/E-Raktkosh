import React, { useState } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import {
  EMERGENCY_SYMPTOM_CATEGORIES,
  ALLERGY_PRESETS,
  PREEXISTING_CONDITION_PRESETS
} from '../../lib/triageEngine';
import { SymptomCategory, AvpuScale } from '../../types';
import {
  HeartPulse,
  ShieldAlert,
  Brain,
  Activity,
  Flame,
  Wind,
  Clock,
  User,
  Phone,
  AlertTriangle,
  Send,
  QrCode,
  PhoneCall,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Stethoscope
} from 'lucide-react';
import { EmergencyQrModal } from './EmergencyQrModal';

const categoryIcons: Record<string, React.ReactNode> = {
  cardiac: <HeartPulse className="w-5 h-5" />,
  trauma: <ShieldAlert className="w-5 h-5" />,
  stroke: <Brain className="w-5 h-5" />,
  respiratory: <Wind className="w-5 h-5" />,
  burn: <Flame className="w-5 h-5" />,
  general: <Activity className="w-5 h-5" />
};

export const SymptomTriageForm: React.FC = () => {
  const {
    patientName,
    setPatientName,
    patientAge,
    setPatientAge,
    patientGender,
    setPatientGender,
    contactPhone,
    setContactPhone,
    symptomCategory,
    setSymptomCategory,
    subSymptoms,
    toggleSubSymptom,
    onsetTime,
    setOnsetTime,
    knownAllergies,
    toggleAllergy,
    preExistingConditions,
    toggleCondition,
    avpuScale,
    setAvpuScale,
    vitals,
    setVitals,
    currentSeverity,
    targetDepartment,
    targetFloorId,
    clinicalPriorityNotes,
    currentTriageData,
    qrPayloadString,
    dispatchInboundEmergency,
    activeHospital,
    isTransitActive,
    transitProgress
  } = usePrathmikta();

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isVitalsOpen, setIsVitalsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategoryObj =
    EMERGENCY_SYMPTOM_CATEGORIES.find((c) => c.category === symptomCategory) ||
    EMERGENCY_SYMPTOM_CATEGORIES[0];

  const handleCategorySelect = (cat: SymptomCategory) => {
    setSymptomCategory(cat);
    const catObj = EMERGENCY_SYMPTOM_CATEGORIES.find((c) => c.category === cat);
    if (catObj && catObj.subSymptoms.length > 0) {
      // Auto pre-select the primary symptom
      toggleSubSymptom(catObj.subSymptoms[0]);
    }
  };

  const handleDispatch = async () => {
    setIsSubmitting(true);
    try {
      await dispatchInboundEmergency();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityStyle = () => {
    if (currentSeverity === 'RED') {
      return {
        bg: 'bg-red-950/70 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.25)] text-red-100',
        badge: 'bg-red-500 text-white animate-pulse',
        ring: 'ring-1 ring-red-500/50'
      };
    }
    if (currentSeverity === 'AMBER') {
      return {
        bg: 'bg-amber-950/70 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.25)] text-amber-100',
        badge: 'bg-amber-500 text-slate-950 font-bold',
        ring: 'ring-1 ring-amber-500/50'
      };
    }
    return {
      bg: 'bg-emerald-950/70 border-emerald-500/80 text-emerald-100',
      badge: 'bg-emerald-500 text-slate-950 font-bold',
      ring: 'ring-1 ring-emerald-500/50'
    };
  };

  const severityStyle = getSeverityStyle();

  return (
    <div
      id="symptom-triage-form"
      className="w-full h-full flex flex-col bg-slate-950 border-l border-slate-800 text-slate-100 overflow-y-auto"
    >
      {/* IN-TRANSIT ZERO-WAIT LIVE TELEMETRY BANNER */}
      {isTransitActive && (
        <div className="p-3 bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border-b border-red-500/50 text-white">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-xs font-black uppercase text-red-300">
                🚨 Live Transit Active &bull; रास्ते में सवाल जवाब
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-200 border border-red-500/40">
              Moving: {Math.round(transitProgress * 100)}% Route Done
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 leading-snug">
            अस्पताल से अनुमति का इंतजार किए बिना लाइव रूट शुरू हो चुका है। आप रास्ते में इन सवालों के जवाब देते रहें, यह जानकारी सीधे ER डॉक्टरों तक पहुँच रही है।
          </p>
        </div>
      )}

      {/* Top Triage Priority Live Computed Banner */}
      <div className={`p-3.5 border-b transition-all ${severityStyle.bg}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${severityStyle.badge}`}>
              PRIORITY {currentSeverity}: {currentSeverity === 'RED' ? 'CODE RED RESUS' : currentSeverity === 'AMBER' ? 'URGENT' : 'STANDARD'}
            </span>
            <div className="text-xs font-bold text-white tracking-wide">{targetDepartment}</div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-black/50 border border-white/20">
            FLOOR {targetFloorId}
          </span>
        </div>
        <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed font-medium">
          {clinicalPriorityNotes}
        </p>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* Question 1: 1-Tap Rapid Symptom Selector Chips */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700 flex items-center justify-center text-[11px] font-bold">1</span>
              <span>Primary Emergency Condition (मुख्य लक्षण)</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Synced
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {EMERGENCY_SYMPTOM_CATEGORIES.map((cat) => {
              const isSelected = symptomCategory === cat.category;
              const isRed = cat.defaultSeverity === 'RED';
              return (
                <button
                  key={cat.id}
                  id={`chip-category-${cat.id}`}
                  onClick={() => handleCategorySelect(cat.category)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? isRed
                        ? 'bg-red-950/80 border-red-500 ring-2 ring-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                        : 'bg-amber-950/80 border-amber-500 ring-2 ring-amber-500/50'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected ? (isRed ? 'bg-red-500 text-white' : 'bg-amber-500 text-black') : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {categoryIcons[cat.category]}
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="mt-2">
                    <h4 className="text-xs font-bold text-slate-100">{cat.title}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{cat.shortDesc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question 2: Symptom Specific Presentation */}
        {selectedCategoryObj && (
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700 flex items-center justify-center text-[11px] font-bold">2</span>
              <span>Specific Signs & Symptoms ({selectedCategoryObj.title}):</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              {selectedCategoryObj.subSymptoms.map((sym, idx) => {
                const isChecked = subSymptoms.includes(sym);
                return (
                  <button
                    key={idx}
                    id={`btn-subsymptom-${idx}`}
                    onClick={() => toggleSubSymptom(sym)}
                    className={`text-left p-2 rounded-lg border text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-red-950/60 border-red-500/80 text-red-200 font-semibold shadow-sm'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                        isChecked ? 'bg-red-500 border-red-500 text-white font-bold' : 'border-slate-600'
                      }`}
                    >
                      {isChecked ? '✓' : ''}
                    </span>
                    <span className="flex-1 truncate">{sym}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Question 3 & 4: Onset Timeline & AVPU Consciousness Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Question 3: Onset Time */}
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700 flex items-center justify-center text-[11px] font-bold">3</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Onset Time (कब से तकलीफ है?)
            </label>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {['<15 mins', '15-60 mins', '1-3 hours', '>3 hours'].map((time) => (
                <button
                  key={time}
                  id={`btn-onset-${time.replace(/\s+/g, '-')}`}
                  onClick={() => setOnsetTime(time)}
                  className={`p-1.5 rounded-lg text-xs font-semibold border text-center transition-colors cursor-pointer ${
                    onsetTime === time
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Question 4: AVPU Consciousness Scale */}
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700 flex items-center justify-center text-[11px] font-bold">4</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Consciousness (होश में स्थिति)
            </label>
            <select
              id="select-avpu-scale"
              value={avpuScale}
              onChange={(e) => setAvpuScale(e.target.value as AvpuScale)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500 mt-1"
            >
              <option value="A - Alert">A - Fully Alert & Oriented (पूरा होश)</option>
              <option value="V - Responsive to Voice">V - Voice Responsive (आवाज पर प्रतिक्रिया)</option>
              <option value="P - Responsive to Pain">P - Pain Responsive Only (दर्द/चिकोटी पर)</option>
              <option value="U - Unresponsive">U - Unresponsive (बेहोश - Code Blue)</option>
            </select>
          </div>
        </div>

        {/* Question 5: Patient Demographics & Contact */}
        <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700 flex items-center justify-center text-[11px] font-bold">5</span>
            <User className="w-3.5 h-3.5 text-slate-400" />
            Patient Profile & Emergency Contact (मरीज की जानकारी)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Full Name</span>
              <input
                id="input-patient-name"
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Patient Full Name"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Age & Gender</span>
              <div className="flex gap-1.5">
                <input
                  id="input-patient-age"
                  type="number"
                  min={1}
                  max={120}
                  value={patientAge}
                  onChange={(e) => setPatientAge(Number(e.target.value))}
                  className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:border-cyan-500"
                />
                <select
                  id="select-patient-gender"
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as any)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Contact Phone</span>
              <input
                id="input-patient-phone"
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Question 6: Known Allergies & Pre-Existing Conditions */}
        <div className="space-y-3">
          {/* Allergies */}
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-red-950 text-red-400 border border-red-700 flex items-center justify-center text-[11px] font-bold">6A</span>
              Known Drug Allergies (दवाइयों से एलर्जी)
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {ALLERGY_PRESETS.map((allg) => {
                const isSelected = knownAllergies.includes(allg);
                return (
                  <button
                    key={allg}
                    id={`chip-allergy-${allg.replace(/[^a-zA-Z0-9]/g, '-')}`}
                    onClick={() => toggleAllergy(allg)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-red-500/20 text-red-300 border-red-500/60 font-semibold'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {allg}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pre-existing Conditions */}
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 border border-amber-700 flex items-center justify-center text-[11px] font-bold">6B</span>
              Baseline Medical Conditions (पुरानी बीमारियां)
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PREEXISTING_CONDITION_PRESETS.map((cond) => {
                const isSelected = preExistingConditions.includes(cond);
                return (
                  <button
                    key={cond}
                    id={`chip-condition-${cond.replace(/[^a-zA-Z0-9]/g, '-')}`}
                    onClick={() => toggleCondition(cond)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-semibold'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {cond}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Optional Question 7: Vitals Accordion */}
        <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
          <button
            onClick={() => setIsVitalsOpen(!isVitalsOpen)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-slate-300 hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700 flex items-center justify-center text-[11px] font-bold">7</span>
              <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
              Optional Vitals (BP, HR, SpO2 Oxygen)
            </span>
            {isVitalsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {isVitalsOpen && (
            <div className="p-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/70">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Blood Pressure</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={vitals.systolicBp || ''}
                    onChange={(e) => setVitals((v) => ({ ...v, systolicBp: Number(e.target.value) || undefined }))}
                    placeholder="120"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  />
                  <span className="text-slate-500 text-xs">/</span>
                  <input
                    type="number"
                    value={vitals.diastolicBp || ''}
                    onChange={(e) => setVitals((v) => ({ ...v, diastolicBp: Number(e.target.value) || undefined }))}
                    placeholder="80"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Heart Rate (BPM)</span>
                <input
                  type="number"
                  value={vitals.heartRate || ''}
                  onChange={(e) => setVitals((v) => ({ ...v, heartRate: Number(e.target.value) || undefined }))}
                  placeholder="85"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">SpO2 Oxygen (%)</span>
                <input
                  type="number"
                  value={vitals.spo2 || ''}
                  onChange={(e) => setVitals((v) => ({ ...v, spo2: Number(e.target.value) || undefined }))}
                  placeholder="98"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Resp Rate (/min)</span>
                <input
                  type="number"
                  value={vitals.respiratoryRate || ''}
                  onChange={(e) => setVitals((v) => ({ ...v, respiratoryRate: Number(e.target.value) || undefined }))}
                  placeholder="16"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer & Persistent Emergency Dialers */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2.5">
        {/* Inbound Telemetry Status */}
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Live Synced with {activeHospital.name.split(' ')[0]} ER
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Zero Approval Delay
          </span>
        </div>

        {/* Re-broadcast / Manual Sync Button */}
        <button
          id="btn-dispatch-inbound-alert"
          disabled={isSubmitting}
          onClick={handleDispatch}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all cursor-pointer active:scale-[0.99]"
        >
          <Send className="w-4 h-4 animate-bounce" />
          <span>UPDATE & BROADCAST TELEMETRY TO ER TRAUMA BAY</span>
        </button>

        {/* Secondary Row: Offline QR Pass + Emergency Dialers */}
        <div className="grid grid-cols-3 gap-2">
          <button
            id="btn-open-offline-qr-pass"
            onClick={() => setIsQrModalOpen(true)}
            className="py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span className="truncate">Emergency QR Pass</span>
          </button>

          <a
            id="btn-dial-108"
            href="tel:108"
            className="py-2.5 px-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>Call 108</span>
          </a>

          <a
            id="btn-dial-112"
            href="tel:112"
            className="py-2.5 px-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-600/60 text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-blue-400" />
            <span>Call 112</span>
          </a>
        </div>
      </div>

      {/* Dynamic Offline Encrypted QR Pass Modal */}
      <EmergencyQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        triageData={currentTriageData}
        qrPayloadString={qrPayloadString}
      />
    </div>
  );
};
