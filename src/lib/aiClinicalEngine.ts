import {
  PatientTriageData,
  VitalsInput,
  VitalSample,
  VitalDeltaSummary,
  AiClinicalReport,
  SymptomCategory
} from '../types';

/**
 * Generates realistic temporal vital progression samples for in-transit telemetry tracking
 */
export function generateDynamicVitalHistory(
  currentVitals?: VitalsInput,
  category: SymptomCategory = 'cardiac',
  onsetTime: string = '<15 mins'
): VitalSample[] {
  const currentSys = currentVitals?.systolicBp ?? (category === 'cardiac' ? 160 : category === 'trauma' ? 95 : 140);
  const currentDia = currentVitals?.diastolicBp ?? (category === 'cardiac' ? 98 : category === 'trauma' ? 60 : 88);
  const currentHr = currentVitals?.heartRate ?? (category === 'cardiac' ? 108 : category === 'trauma' ? 122 : 92);
  const currentSpo2 = currentVitals?.spo2 ?? (category === 'respiratory' ? 88 : category === 'cardiac' ? 94 : 97);
  const currentRr = currentVitals?.respiratoryRate ?? (category === 'respiratory' ? 28 : 20);
  const currentGcs = currentVitals?.gcs ?? 15;

  const now = new Date();

  // Baseline / Onset Sample (T-10m)
  let baseSys = currentSys;
  let baseDia = currentDia;
  let baseHr = currentHr;
  let baseSpo2 = currentSpo2;

  if (category === 'cardiac') {
    // Cardiac often has hyper-acute sympathetic spike initially then drops or stabilizes with sublingual spray/aspirin
    baseSys = currentSys + 18;
    baseDia = currentDia + 8;
    baseHr = currentHr + 14;
    baseSpo2 = Math.max(89, currentSpo2 - 3);
  } else if (category === 'trauma') {
    // Trauma hemorrhage: BP starts higher and drops progressively
    baseSys = currentSys + 25;
    baseDia = currentDia + 15;
    baseHr = Math.max(80, currentHr - 18);
    baseSpo2 = Math.min(99, currentSpo2 + 2);
  } else if (category === 'respiratory') {
    // Respiratory: starts with severe hypoxia, improves slightly on high-flow mask
    baseSys = currentSys + 12;
    baseDia = currentDia + 6;
    baseHr = currentHr + 16;
    baseSpo2 = Math.max(82, currentSpo2 - 6);
  } else if (category === 'stroke') {
    baseSys = currentSys + 10;
    baseDia = currentDia + 5;
    baseHr = currentHr + 6;
    baseSpo2 = currentSpo2;
  }

  // Mid-transit Sample (T-5m)
  const midSys = Math.round((baseSys + currentSys) / 2);
  const midDia = Math.round((baseDia + currentDia) / 2);
  const midHr = Math.round((baseHr + currentHr) / 2);
  const midSpo2 = Math.round((baseSpo2 + currentSpo2) / 2);
  const midRr = Math.round((currentRr + (category === 'respiratory' ? 32 : 22)) / 2);

  const tMinus10 = new Date(now.getTime() - 10 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const tMinus5 = new Date(now.getTime() - 5 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const tLive = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return [
    {
      timestamp: `${tMinus10} (Onset Baseline)`,
      phase: 'Onset / Baseline',
      systolicBp: baseSys,
      diastolicBp: baseDia,
      heartRate: baseHr,
      spo2: baseSpo2,
      respiratoryRate: category === 'respiratory' ? 32 : 22,
      gcs: category === 'stroke' ? 13 : currentGcs,
      notes: 'Initial incident assessment / Citizen call'
    },
    {
      timestamp: `${tMinus5} (In-Transit T+5m)`,
      phase: 'In-Transit T+3m',
      systolicBp: midSys,
      diastolicBp: midDia,
      heartRate: midHr,
      spo2: midSpo2,
      respiratoryRate: midRr,
      gcs: currentGcs,
      notes: 'Paramedic O2 administration / Green corridor en-route'
    },
    {
      timestamp: `${tLive} (Live Telemetry)`,
      phase: 'Live Telemetry',
      systolicBp: currentSys,
      diastolicBp: currentDia,
      heartRate: currentHr,
      spo2: currentSpo2,
      respiratoryRate: currentRr,
      gcs: currentGcs,
      notes: 'Live pre-hospital monitor feed synced to hospital'
    }
  ];
}

/**
 * Computes exact mathematical delta metrics for BP, SpO2, and Heart Rate
 */
export function calculateVitalDelta(vitalHistory: VitalSample[]): VitalDeltaSummary {
  if (!vitalHistory || vitalHistory.length === 0) {
    return {
      bpChange: {
        initial: '140/90',
        current: '140/90',
        deltaSystolic: 0,
        deltaDiastolic: 0,
        trend: 'stable',
        summary: 'Blood pressure constant across transit window'
      },
      spo2Change: {
        initial: 96,
        current: 96,
        deltaPercent: 0,
        trend: 'stable',
        summary: 'Oxygen saturation normal & stable at 96%'
      },
      heartRateChange: {
        initial: 80,
        current: 80,
        deltaBpm: 0,
        trend: 'stable',
        summary: 'Normal sinus rhythm'
      }
    };
  }

  const initial = vitalHistory[0];
  const current = vitalHistory[vitalHistory.length - 1];

  const deltaSys = current.systolicBp - initial.systolicBp;
  const deltaDia = current.diastolicBp - initial.diastolicBp;
  const deltaSpo2 = current.spo2 - initial.spo2;
  const deltaHr = current.heartRate - initial.heartRate;

  // BP Trend Determination
  let bpTrend: VitalDeltaSummary['bpChange']['trend'] = 'stable';
  let bpSummary = '';

  if (current.systolicBp < 90 || deltaSys <= -25) {
    bpTrend = 'hypotensive_drop';
    bpSummary = `🚨 CRITICAL DROP: Systolic BP fell by ${Math.abs(deltaSys)} mmHg (${initial.systolicBp} ➔ ${current.systolicBp}). Risk of cardiogenic/hypovolemic shock.`;
  } else if (current.systolicBp > 180 || deltaSys >= +20) {
    bpTrend = 'critical_surge';
    bpSummary = `⚠️ HYPERTENSIVE SURGE: Systolic rose by +${deltaSys} mmHg (${initial.systolicBp} ➔ ${current.systolicBp}). Acute intracranial/cardiac afterload strain.`;
  } else if (deltaSys < 0) {
    bpTrend = 'stabilizing';
    bpSummary = `📉 BP Stabilizing: Systolic declined moderately by ${Math.abs(deltaSys)} mmHg (${initial.systolicBp}/${initial.diastolicBp} ➔ ${current.systolicBp}/${current.diastolicBp}).`;
  } else {
    bpTrend = 'stable';
    bpSummary = `✅ BP Hemodynamically Stable at ${current.systolicBp}/${current.diastolicBp} mmHg (Delta: ${deltaSys >= 0 ? '+' : ''}${deltaSys} mmHg).`;
  }

  // SpO2 Trend Determination
  let spo2Trend: VitalDeltaSummary['spo2Change']['trend'] = 'stable';
  let spo2Summary = '';

  if (current.spo2 < 90) {
    spo2Trend = 'critical_hypoxia';
    spo2Summary = `🚨 REFRACTORY HYPOXIA: SpO2 critical at ${current.spo2}% (${deltaSpo2 >= 0 ? '+' : ''}${deltaSpo2}%). Urgent high-flow FiO2 / Intubation standby.`;
  } else if (deltaSpo2 < -3) {
    spo2Trend = 'desaturating';
    spo2Summary = `⚠️ Desaturating: SpO2 dropped from ${initial.spo2}% ➔ ${current.spo2}% (${deltaSpo2}%). Airway compromise alert.`;
  } else if (deltaSpo2 > 0) {
    spo2Trend = 'improving';
    spo2Summary = `📈 Oxygenation Improving: SpO2 elevated from ${initial.spo2}% ➔ ${current.spo2}% (+${deltaSpo2}%) with in-transit oxygen support.`;
  } else {
    spo2Trend = 'stable';
    spo2Summary = `✅ Oxygen Saturation Stable at ${current.spo2}% throughout transit.`;
  }

  // Heart Rate Trend Determination
  let hrTrend: VitalDeltaSummary['heartRateChange']['trend'] = 'stable';
  let hrSummary = '';

  if (current.heartRate > 120) {
    hrTrend = 'tachycardia';
    hrSummary = `⚠️ Tachycardic at ${current.heartRate} bpm (Delta: ${deltaHr >= 0 ? '+' : ''}${deltaHr} bpm).`;
  } else if (current.heartRate < 50) {
    hrTrend = 'bradycardia';
    hrSummary = `🚨 Critical Bradycardia at ${current.heartRate} bpm (Delta: ${deltaHr} bpm). Atropine standby.`;
  } else if (deltaHr < 0) {
    hrTrend = 'normalizing';
    hrSummary = `📉 Heart rate settling from ${initial.heartRate} ➔ ${current.heartRate} bpm.`;
  } else {
    hrTrend = 'stable';
    hrSummary = `✅ Pulse regular at ${current.heartRate} bpm.`;
  }

  return {
    bpChange: {
      initial: `${initial.systolicBp}/${initial.diastolicBp}`,
      current: `${current.systolicBp}/${current.diastolicBp}`,
      deltaSystolic: deltaSys,
      deltaDiastolic: deltaDia,
      trend: bpTrend,
      summary: bpSummary
    },
    spo2Change: {
      initial: initial.spo2,
      current: current.spo2,
      deltaPercent: deltaSpo2,
      trend: spo2Trend,
      summary: spo2Summary
    },
    heartRateChange: {
      initial: initial.heartRate,
      current: current.heartRate,
      deltaBpm: deltaHr,
      trend: hrTrend,
      summary: hrSummary
    }
  };
}

/**
 * Generates a comprehensive AI Clinical Synthesis & Triage Pre-Hospital Report
 */
export function generateAiClinicalReport(
  patient: Partial<PatientTriageData>,
  vitalHistory: VitalSample[]
): AiClinicalReport {
  const cat = patient.symptomCategory || 'cardiac';
  const vitalDelta = calculateVitalDelta(vitalHistory);
  const now = new Date().toISOString();

  let suspectedCondition = '';
  let urgencyLevel: AiClinicalReport['urgencyLevel'] = 'HIGH_EMERGENCY';
  let confidenceScore = 94;
  let clinicalRationale = '';
  let immediateMeds: string[] = [];
  let bayPreps: string[] = [];
  let specialistCallouts: string[] = [];
  let diagnosticHypotheses: AiClinicalReport['diagnosticHypotheses'] = [];

  const airwayRisk: 'High' | 'Moderate' | 'Low' =
    patient.avpuScale !== 'A - Alert' || (vitalDelta.spo2Change.current < 90) ? 'High' : 'Low';
  const cardiacArrestRisk: 'High' | 'Moderate' | 'Low' =
    cat === 'cardiac' || vitalDelta.bpChange.current.startsWith('8') ? 'High' : 'Moderate';
  const organFailureRisk: 'High' | 'Moderate' | 'Low' =
    patient.age && patient.age > 65 ? 'Moderate' : 'Low';

  if (cat === 'cardiac') {
    suspectedCondition = 'Acute STEMI / Anterior Coronary Thrombosis with Sympathetic Hyper-reactivity';
    urgencyLevel = 'CRITICAL_IMMEDIATE_OT';
    confidenceScore = 96;
    clinicalRationale = `Patient exhibits classic acute coronary syndrome profile: retrosternal crushing pain, diaphoresis with ${patient.age || 54}y age and CAD risk factors. BP delta shows initial hypertensive surge of ${vitalDelta.bpChange.initial} easing to ${vitalDelta.bpChange.current}. SpO2 is currently ${vitalDelta.spo2Change.current}%. Immediate door-to-balloon Cath Lab trajectory mandated.`;
    immediateMeds = [
      'Aspirin 325 mg (Chewable non-enteric stat)',
      'Ticagrelor 180 mg stat / Clopidogrel 600 mg',
      'Unfractionated Heparin 5000 IU IV Bolus',
      'Sublingual Nitroglycerin (if SBP > 100 mmHg)',
      'High-flow O2 via nasal cannula (maintain SpO2 > 95%)'
    ];
    bayPreps = [
      'Activate Floor 1 Primary PCI Cath Lab Team (24x7)',
      'Direct-to-Cath-Lab Bypass from Ambulance Bay',
      'Defibrillator Pads Pre-Attached on Gurney',
      '12-Lead ECG Acquisition within <3 mins of Door'
    ];
    specialistCallouts = [
      'Dr. Rajesh Sharma, MD, DM (Lead Interventional Cardiologist)',
      'Cath Lab Nursing Supervisor (On Alert)',
      'CCU Intensivist on Standby'
    ];
    diagnosticHypotheses = [
      { diagnosis: 'Acute ST-Elevation Myocardial Infarction (STEMI)', probability: 88, keyDriver: 'Substernal crushing pain + Diaphoresis + CAD history' },
      { diagnosis: 'Acute Non-STEMI / Unstable Angina', probability: 9, keyDriver: 'Troponin-T pending verification' },
      { diagnosis: 'Acute Aortic Dissection Type A', probability: 3, keyDriver: 'Differential rule-out due to initial SBP surge' }
    ];
  } else if (cat === 'stroke') {
    suspectedCondition = 'Acute Ischemic Stroke (LVO / Middle Cerebral Artery Territory)';
    urgencyLevel = 'CRITICAL_IMMEDIATE_OT';
    confidenceScore = 93;
    clinicalRationale = `Acute focal neurological deficit conforming to Code FAST criteria with onset within Golden Hour (<4.5 hrs). Blood pressure tracked at ${vitalDelta.bpChange.current} (delta: ${vitalDelta.bpChange.deltaSystolic} mmHg). Urgent Non-Contrast Brain CT Angio required immediately for thrombolytic / mechanical thrombectomy eligibility.`;
    immediateMeds = [
      'Hold all antiplatelets & anticoagulants until CT exclusion of hemorrhage',
      'IV Normal Saline maintenance (Avoid hypotonic fluids)',
      'Blood Glucose capillary stat check (Target: 140-180 mg/dL)',
      'IV Labetalol on standby if BP > 185/110 mmHg prior to tPA'
    ];
    bayPreps = [
      'Direct-to-CT Scanner Gurney Transfer protocol',
      'Pre-mix Recombinant Alteplase (r-tPA) / Tenecteplase',
      'Neuro-Interventional Thrombectomy Suite on Yellow Alert',
      'Fingerstick point-of-care INR/Coagulation panel'
    ];
    specialistCallouts = [
      'Dr. Priya Nair, MD, DM (Lead Stroke Neurologist)',
      'Interventional Neuro-Radiology On-Call'
    ];
    diagnosticHypotheses = [
      { diagnosis: 'Acute Ischemic Cerebrovascular Accident (CVA)', probability: 86, keyDriver: 'Unilateral deficit + sudden onset <4.5h' },
      { diagnosis: 'Intracerebral Hemorrhagic Stroke (ICH)', probability: 11, keyDriver: 'Initial severe BP elevation' },
      { diagnosis: 'Complex Hemiplegic Migraine / Todd\'s Paresis', probability: 3, keyDriver: 'Alternative non-vascular etiology' }
    ];
  } else if (cat === 'trauma') {
    suspectedCondition = 'High-Energy Polytrauma with Hemorrhagic Shock Risk';
    urgencyLevel = 'CRITICAL_IMMEDIATE_OT';
    confidenceScore = 95;
    clinicalRationale = `Severe blunt force impact with hemodynamic instability. BP delta shows progressive hypotension (${vitalDelta.bpChange.initial} ➔ ${vitalDelta.bpChange.current} mmHg) and tachycardia (${vitalDelta.heartRateChange.current} bpm). Massive transfusion protocol (MTP) readiness indicated.`;
    immediateMeds = [
      'Tranexamic Acid (TXA) 1g IV over 10 min stat',
      'Warm crystalloid fluids (limited permissive hypotension ~90 SBP)',
      'O-Negative Uncrossmatched PRBCs 2 Units on Standby',
      'Tetanus Toxoid 0.5 mL IM + Cefazolin 2g IV'
    ];
    bayPreps = [
      'Trauma Resuscitation Bay 1 Trauma Red Team Assembly',
      'Level 1 Rapid Blood Infuser & Fluid Warmer Primed',
      'eFAST Ultrasound probe prepped at bedside',
      'Emergency Surgical Thoracostomy & Pelvic Binder at Door'
    ];
    specialistCallouts = [
      'Dr. Vivek Mehra, MD (Trauma Surgeon Lead)',
      'Blood Bank Officer (MTP Activation)',
      'Anesthesia Trauma Airway Specialist'
    ];
    diagnosticHypotheses = [
      { diagnosis: 'Hypovolemic / Hemorrhagic Shock Class II-III', probability: 84, keyDriver: 'Tachycardia + Drop in SBP post-impact' },
      { diagnosis: 'Closed Internal Abdominal Visceral Laceration (Spleen/Liver)', probability: 12, keyDriver: 'Blunt torso deceleration vector' },
      { diagnosis: 'Pneumothorax / Hemothorax', probability: 4, keyDriver: 'Chest wall compromise' }
    ];
  } else if (cat === 'respiratory') {
    suspectedCondition = 'Acute Hypoxemic Respiratory Failure / Severe Bronchospasm';
    urgencyLevel = 'CRITICAL_IMMEDIATE_OT';
    confidenceScore = 92;
    clinicalRationale = `Severe acute dyspnea with accessory muscle recruitment. Initial SpO2 desaturation was critical at ${vitalDelta.spo2Change.initial}%, responding to in-transit oxygen at ${vitalDelta.spo2Change.current}% (${vitalDelta.spo2Change.summary}). Tachypneic at ${vitalDelta.heartRateChange.current} bpm.`;
    immediateMeds = [
      'Duolin (Ipratropium 0.5mg + Levosalbutamol 1.25mg) continuous nebulization',
      'IV Hydrocortisone 100 mg / Methylprednisolone 40 mg',
      'Magnesium Sulfate 2g IV in 100ml NS over 20 mins',
      'High-Flow Nasal Cannula (HFNC) / BiPAP trial'
    ];
    bayPreps = [
      'Floor 2 ICU Isolation Bay 201 Ready',
      'Video Laryngoscope & Rapid Sequence Intubation Kit at Bedside',
      'Portable Bedside Chest X-Ray on arrival',
      'Arterial Blood Gas (ABG) cartridge loaded in cartridge analyzer'
    ];
    specialistCallouts = [
      'Dr. Aris Thorne, MD (Pulmonary Critical Care)',
      'Respiratory Therapist On-Duty'
    ];
    diagnosticHypotheses = [
      { diagnosis: 'Acute Status Asthmaticus / COPD Exacerbation', probability: 79, keyDriver: 'Wheeze + Hypoxia + Tachypnea' },
      { diagnosis: 'Acute Pulmonary Embolism (PE)', probability: 14, keyDriver: 'Refractory hypoxia with sudden onset' },
      { diagnosis: 'Acute Cardiogenic Pulmonary Edema', probability: 7, keyDriver: 'Co-existing cardiac load' }
    ];
  } else {
    suspectedCondition = 'Acute Medical Emergency / Sepsis & Hemodynamic Shift';
    urgencyLevel = 'HIGH_EMERGENCY';
    confidenceScore = 90;
    clinicalRationale = `Acute onset systemic crisis with altered vitals. Baseline BP was ${vitalDelta.bpChange.initial}, currently measuring ${vitalDelta.bpChange.current}. SpO2 is ${vitalDelta.spo2Change.current}%. Immediate physician review and serial lactate workup indicated.`;
    immediateMeds = [
      'IV Ringer Lactate 30 mL/kg fluid challenge',
      'Broad-spectrum IV Piperacillin-Tazobactam 4.5g post blood cultures',
      'Antipyretic / Analgesia IV'
    ];
    bayPreps = [
      'Floor 0 Acute Observation Bay 2 Prepped',
      'Point-of-care Lactate & Sepsis biomarker panel',
      'Blood culture bottles ready at gurney arrival'
    ];
    specialistCallouts = [
      'Dr. Tarun Bannerjee, MD (Internal Medicine Lead)'
    ];
    diagnosticHypotheses = [
      { diagnosis: 'Systemic Inflammatory Response / Severe Sepsis', probability: 75, keyDriver: 'Vitals instability + acute complaint' },
      { diagnosis: 'Acute Metabolic Derangement', probability: 20, keyDriver: 'Altered sensorium/vitals' },
      { diagnosis: 'Undifferentiated Acute Abdomen', probability: 5, keyDriver: 'Symptom constellation' }
    ];
  }

  return {
    reportId: `AI-REP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    generatedAt: now,
    confidenceScore,
    urgencyLevel,
    suspectedCondition,
    clinicalRationale,
    vitalDelta,
    riskStratification: {
      airwayRisk,
      cardiacArrestRisk,
      organFailureRisk,
      recommendation: `Immediate priority corridor bed reserved on Floor ${patient.targetFloorId ?? 1}. All vital deltas synced to ER nursing station.`
    },
    suggestedActionProtocols: {
      immediateMeds,
      bayPreps,
      specialistCallouts
    },
    diagnosticHypotheses
  };
}
