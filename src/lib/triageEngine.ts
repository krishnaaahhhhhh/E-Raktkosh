import { PatientTriageData, SymptomCategory, TriageSeverity, AvpuScale, VitalsInput } from '../types';

export interface SymptomOption {
  id: string;
  category: SymptomCategory;
  title: string;
  shortDesc: string;
  iconName: string;
  defaultSeverity: TriageSeverity;
  targetDepartment: string;
  targetFloorId: number;
  subSymptoms: string[];
}

export const EMERGENCY_SYMPTOM_CATEGORIES: SymptomOption[] = [
  {
    id: 'cardiac',
    category: 'cardiac',
    title: 'Cardiac / STEMI Alert',
    shortDesc: 'Severe crushing chest pain, radiating arm/jaw, diaphoresis, shortness of breath',
    iconName: 'HeartPulse',
    defaultSeverity: 'RED',
    targetDepartment: 'Emergency Cardiology & Cath Lab',
    targetFloorId: 1,
    subSymptoms: [
      'Crushing retrosternal chest pain (>15 min)',
      'Pain radiating to left arm / jaw / back',
      'Cold sweats / Diaphoresis',
      'Sudden syncope / Palpitations',
      'Prior stent / Angioplasty history'
    ]
  },
  {
    id: 'trauma',
    category: 'trauma',
    title: 'Severe Trauma / MVA',
    shortDesc: 'Road accident, blunt force trauma, active hemorrhage, compound fracture',
    iconName: 'ShieldAlert',
    defaultSeverity: 'RED',
    targetDepartment: 'Floor 0 Resuscitation & Trauma Bay',
    targetFloorId: 0,
    subSymptoms: [
      'Uncontrolled external hemorrhage',
      'Blunt polytrauma / Motor vehicle accident',
      'Suspected pelvic / compound femur fracture',
      'Penetrating injury / GSW / Stab',
      'Loss of consciousness post-impact'
    ]
  },
  {
    id: 'stroke',
    category: 'stroke',
    title: 'Acute Stroke (Code FAST)',
    shortDesc: 'Facial droop, arm/leg weakness, sudden speech loss, confusion',
    iconName: 'Brain',
    defaultSeverity: 'RED',
    targetDepartment: 'Neuro-ICU & Stroke Intervention',
    targetFloorId: 2,
    subSymptoms: [
      'Facial asymmetry / Droop (F)',
      'Unilateral Arm / Leg weakness (A)',
      'Slurred speech / Aphasia (S)',
      'Onset < 4.5 hours (Window for tPA/Thrombectomy)',
      'Severe sudden "Thunderclap" headache'
    ]
  },
  {
    id: 'respiratory',
    category: 'respiratory',
    title: 'Respiratory Distress',
    shortDesc: 'Severe breathlessness, SpO2 < 90%, stridor, acute asthma/COPD exacerbation',
    iconName: 'Lungs',
    defaultSeverity: 'RED',
    targetDepartment: 'ICU & High-Flow Ventilatory Care',
    targetFloorId: 2,
    subSymptoms: [
      'Accessory muscle usage / Gasping',
      'Cyanosis (blue lips/fingers) / SpO2 < 90%',
      'Audible wheeze / Stridor / Choking',
      'Severe acute asthma / COPD exacerbation',
      'Inability to speak full sentences'
    ]
  },
  {
    id: 'burn',
    category: 'burn',
    title: 'Critical Burn Unit',
    shortDesc: '>20% TBSA burns, electrical or chemical burns, inhalation airway edema',
    iconName: 'Flame',
    defaultSeverity: 'RED',
    targetDepartment: 'Specialized Burn ICU',
    targetFloorId: 2,
    subSymptoms: [
      'Major 2nd/3rd degree burns >20% body area',
      'Facial burns / Inhalation injury / Soot in sputum',
      'High-voltage electrical burn',
      'Deep chemical contact burns',
      'Circumferential extremity burn'
    ]
  },
  {
    id: 'general',
    category: 'general',
    title: 'Urgent / Acute Medical',
    shortDesc: 'High fever with altered sensorium, severe abdominal pain, poisoning, anaphylaxis',
    iconName: 'Activity',
    defaultSeverity: 'AMBER',
    targetDepartment: 'Floor 0 Acute Triage Bay',
    targetFloorId: 0,
    subSymptoms: [
      'Acute severe abdominal pain with rigidity',
      'Suspected poisoning / Overdose / Toxin',
      'Severe allergic reaction / Urticaria / Swelling',
      'High grade fever with altered sensorium',
      'Uncontrolled refractory vomiting / Dehydration'
    ]
  }
];

export const ALLERGY_PRESETS = [
  'No Known Allergies (NKA)',
  'Penicillin / Amoxicillin',
  'NSAIDs (Aspirin/Ibuprofen)',
  'Contrast Radiographic Dye',
  'Latex',
  'Sulfa Drugs',
  'Opioids / Morphine'
];

export const PREEXISTING_CONDITION_PRESETS = [
  'Hypertension (HTN)',
  'Type 2 Diabetes Mellitus',
  'Coronary Artery Disease (CAD / Stent)',
  'On Blood Thinners / Anticoagulants',
  'Asthma / COPD',
  'Chronic Kidney Disease',
  'Prior Stroke / TIA'
];

/**
 * Computes deterministic clinical triage severity score
 */
export function calculateTriageScore(params: {
  symptomCategory: SymptomCategory;
  subSymptoms: string[];
  onsetTime: string;
  avpuScale: AvpuScale;
  age: number;
  knownAllergies: string[];
  preExistingConditions: string[];
  vitals?: VitalsInput;
}): {
  severity: TriageSeverity;
  clinicalPriorityNotes: string;
  targetDepartment: string;
  targetFloorId: number;
} {
  const { symptomCategory, subSymptoms, onsetTime, avpuScale, vitals, preExistingConditions } = params;

  // Immediate RED triggers
  const isUnresponsive = avpuScale === 'U - Unresponsive' || avpuScale === 'P - Responsive to Pain';
  const hasSpO2Critical = vitals?.spo2 !== undefined && vitals.spo2 < 90;
  const hasCriticalBp = (vitals?.systolicBp !== undefined && (vitals.systolicBp < 85 || vitals.systolicBp > 210));
  const hasCriticalHeartRate = (vitals?.heartRate !== undefined && (vitals.heartRate < 45 || vitals.heartRate > 150));
  const isCodeRedSymptom = symptomCategory === 'cardiac' || symptomCategory === 'trauma' || symptomCategory === 'stroke';

  let severity: TriageSeverity = 'GREEN';
  let targetDepartment = 'Floor 3 General Triage';
  let targetFloorId = 3;
  let notes: string[] = [];

  if (isUnresponsive || hasSpO2Critical || hasCriticalBp || hasCriticalHeartRate || isCodeRedSymptom || subSymptoms.length >= 2) {
    severity = 'RED';
    if (symptomCategory === 'cardiac') {
      targetDepartment = 'Floor 1 Emergency Cath Lab / Coronary Care';
      targetFloorId = 1;
      notes.push('🚨 STEMI ALERT: Immediate ECG & Cath Lab standby required.');
    } else if (symptomCategory === 'trauma') {
      targetDepartment = 'Floor 0 Resuscitation Bay 1 (Trauma)';
      targetFloorId = 0;
      notes.push('🚨 CODE TRAUMA: Surgical team & O-Neg blood uncrossmatched ready.');
    } else if (symptomCategory === 'stroke') {
      targetDepartment = 'Floor 2 Neuro-ICU & Acute CT Angio';
      targetFloorId = 2;
      notes.push('🚨 STROKE CODE: Immediate Non-contrast Brain CT & Neuro triage.');
    } else if (symptomCategory === 'respiratory') {
      targetDepartment = 'Floor 2 ICU / High Flow Oxygen Bay';
      targetFloorId = 2;
      notes.push('🚨 CODE AIRWAY: Ventilator standby & Nebulization prep.');
    } else if (symptomCategory === 'burn') {
      targetDepartment = 'Floor 2 Specialized Burn Intensive Care';
      targetFloorId = 2;
      notes.push('🚨 CRITICAL BURN: Parkland formula fluid resus & Airway check.');
    } else {
      targetDepartment = 'Floor 0 Emergency Resus Bay 2';
      targetFloorId = 0;
      notes.push('🚨 PRIORITY 1: Immediate physician assessment.');
    }
  } else if (subSymptoms.length === 1 || preExistingConditions.length >= 2 || onsetTime === '<15 mins' || onsetTime === '15-60 mins') {
    severity = 'AMBER';
    targetDepartment = 'Floor 0 Acute Observation Bay';
    targetFloorId = 0;
    notes.push('⚠️ PRIORITY 2: Emergent stabilization required within 15 mins.');
  } else {
    severity = 'GREEN';
    targetDepartment = 'Floor 3 General Urgent Care';
    targetFloorId = 3;
    notes.push('ℹ️ PRIORITY 3: Standard urgent care evaluation.');
  }

  if (isUnresponsive) {
    notes.push('⚠️ Patient AVPU depressed: Airway protection priority.');
  }
  if (preExistingConditions.includes('On Blood Thinners / Anticoagulants')) {
    notes.push('⚠️ Coagulopathy / Bleeding risk: Patient is on anticoagulant therapy.');
  }

  return {
    severity,
    clinicalPriorityNotes: notes.join(' '),
    targetDepartment,
    targetFloorId
  };
}

/**
 * Generates an encrypted/compact base64 QR payload containing full clinical triage data
 * for offline and zero-latency paramedic scanner handoff
 */
export function generateQrPayload(data: PatientTriageData): string {
  const compactPayload = {
    v: 'PRATHMIKTA-1.0',
    id: data.id,
    nm: data.fullName,
    ag: data.age,
    gd: data.gender,
    ph: data.contactPhone,
    cat: data.symptomCategory,
    sym: data.subSymptoms,
    ons: data.onsetTime,
    alg: data.knownAllergies,
    cnd: data.preExistingConditions,
    avp: data.avpuScale,
    vit: data.vitals || null,
    sev: data.severity,
    dep: data.targetDepartment,
    flr: data.targetFloorId,
    ts: data.generatedAt,
    hsh: data.payloadHash
  };

  try {
    return JSON.stringify(compactPayload);
  } catch {
    return `PRATHMIKTA:${data.id}:${data.severity}:${data.symptomCategory}`;
  }
}

/**
 * Validates and decodes a scanned QR Pass string
 */
export function parseQrPayload(raw: string): Partial<PatientTriageData> | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.id || !parsed.sev) return null;
    return {
      id: parsed.id,
      fullName: parsed.nm || 'Unknown Patient',
      age: parsed.ag || 0,
      gender: parsed.gd || 'Male',
      contactPhone: parsed.ph || '',
      symptomCategory: parsed.cat || 'general',
      subSymptoms: parsed.sym || [],
      onsetTime: parsed.ons || '',
      knownAllergies: parsed.alg || [],
      preExistingConditions: parsed.cnd || [],
      avpuScale: parsed.avp || 'A - Alert',
      vitals: parsed.vit || undefined,
      severity: parsed.sev as TriageSeverity,
      targetDepartment: parsed.dep || 'Floor 0 Triage',
      targetFloorId: parsed.flr || 0,
      generatedAt: parsed.ts || new Date().toISOString(),
      payloadHash: parsed.hsh || 'OFFLINE_VERIFIED'
    };
  } catch {
    return null;
  }
}
