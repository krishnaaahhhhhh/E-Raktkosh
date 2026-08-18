import {
  TransferRequestState,
  TransferStatus,
  PatientData,
  ClinicalData,
  TimelineEvent,
  ConsentRecord,
} from '../types/transfer';
import { MOCK_HIGHER_CENTERS } from './hospitalService';
import { INITIAL_AMBULANCE_UNIT } from './ambulanceService';

const MASTER_ENCOUNTER_ID = 'PRK-2026-0818-00427';

const INITIAL_PATIENT: PatientData = {
  id: 'RK-5402',
  name: 'Rajesh Kumar',
  age: 54,
  gender: 'M',
  bloodGroup: 'B+ Positive',
  abhaId: '91-8291-0391-4412',
  abhaLinked: true,
  contactNumber: '+91 98390 12345',
  emergencyContact: {
    name: 'Sunita Kumar',
    relationship: 'Spouse',
    phone: '+91 98390 54321',
  },
  encounterId: MASTER_ENCOUNTER_ID,
  admitTime: '18:04',
  currentHospital: 'District Hospital, Kanpur',
  currentLocation: 'Emergency Resuscitation Bay 02',
  attendingDoctor: 'Dr. Ananya Sharma, MD (Emergency Medicine)',
  attendingRegNumber: 'UP-MED-44912',
  condition: 'Acute STEMI (Anteroseptal ST-Elevation Myocardial Infarction)',
  stabilizationStatus: 'Stabilized',
  stabilizationSummary: 'Aspirin 325mg + Ticagrelor 180mg + IV Unfractionated Heparin 5000 IU administered. Pain reduced from 9/10 to 3/10. Hemodynamically stabilized on 2L O2 nasal cannula. Primary PCI mandatory within transfer window.',
  allergies: ['Penicillin (Mild Rash)'],
};

const INITIAL_CLINICAL: ClinicalData = {
  chiefComplaint: 'Severe retrosternal squeezing chest pain radiating to left arm & jaw with diaphoresis (duration: 75 mins prior to arrival).',
  diagnosis: 'Acute Anteroseptal ST-Elevation Myocardial Infarction (Killip Class I)',
  icd10Code: 'I21.0',
  historyOfPresentIllness: '54-year-old male with known hypertension (5 yrs on Telmisartan 40mg), non-diabetic. Sudden onset severe crushing substernal chest discomfort at 16:45 while climbing stairs. Diaphoretic, nauseous, arrived at Emergency at 18:04.',
  stabilizationInterventions: [
    { time: '18:08', intervention: 'High-flow Oxygen via nasal cannula @ 2 L/min', performedBy: 'Nurse R. Singh', response: 'SpO2 improved from 92% to 98%' },
    { time: '18:14', intervention: 'Dual Antiplatelet Loading: Aspirin 325mg (chewed) + Ticagrelor 180mg stat', performedBy: 'Dr. Ananya Sharma', response: 'Tolerated without GI distress' },
    { time: '18:22', intervention: 'Sublingual Nitroglycerin 0.4mg (BP monitored: 138/84)', performedBy: 'Dr. Ananya Sharma', response: 'Chest pain scale decreased from 9/10 to 4/10' },
    { time: '18:30', intervention: 'IV Unfractionated Heparin 5000 IU stat bolus', performedBy: 'Nurse R. Singh', response: 'Completed uneventfully' },
    { time: '18:34', intervention: 'Atorvastatin 80mg oral stat', performedBy: 'Nurse R. Singh', response: 'Administered' },
  ],
  vitals: {
    heartRate: 84,
    spO2: 98,
    bloodPressure: '128/82 mmHg',
    temperature: '98.4 °F',
    respiratoryRate: 18,
    rhythm: 'Sinus Rhythm with ST elevations V1-V4',
    gcs: '15/15 (Alert & Oriented)',
    painScore: '3/10 (Post-NTG)',
  },
  investigations: [
    {
      type: 'ECG',
      name: '12-Lead Electrocardiogram',
      time: '18:17',
      findings: 'Sinus rhythm @ 88 bpm. 3.5mm ST-segment elevation in leads V1, V2, V3, V4. Reciprocal ST depressions in II, III, aVF. Hyperacute T waves in precordial leads.',
      status: 'Critical',
      criticalValue: 'STEMI ALERT: Anteroseptal Occlusion',
    },
    {
      type: 'PointOfCare',
      name: 'Qualitative Cardiac Troponin-I',
      time: '18:25',
      findings: 'Strongly Positive (> 4.8 ng/mL) [Ref: < 0.04 ng/mL]',
      status: 'Critical',
      criticalValue: '4.8 ng/mL (High Positive)',
    },
    {
      type: 'Lab',
      name: 'Random Blood Glucose (RBG)',
      time: '18:10',
      findings: '134 mg/dL [Normoglycemic in acute stress]',
      status: 'Normal',
    },
    {
      type: 'Lab',
      name: 'Serum Creatinine & Potassium',
      time: '18:32',
      findings: 'Creatinine: 0.9 mg/dL, K+: 4.1 mEq/L (Adequate for contrast PCI)',
      status: 'Normal',
    },
    {
      type: 'PointOfCare',
      name: 'Focused Bedside Echo (POCUS)',
      time: '18:36',
      findings: 'Anterior wall hypokinesia. No pericardial effusion. LVEF estimated 45%. Aortic root normal.',
      status: 'Abnormal',
    },
  ],
  medications: [
    { drugName: 'Aspirin (Dispirin)', dose: '325 mg', route: 'Oral (Chewed)', timeAdministered: '18:14', administeredBy: 'Nurse R. Singh', category: 'Dual Antiplatelet' },
    { drugName: 'Ticagrelor (Brilinta)', dose: '180 mg', route: 'Oral stat', timeAdministered: '18:14', administeredBy: 'Nurse R. Singh', category: 'Dual Antiplatelet' },
    { drugName: 'Nitroglycerin (Sorbitrate)', dose: '0.4 mg', route: 'Sublingual', timeAdministered: '18:22', administeredBy: 'Dr. Ananya Sharma', category: 'Analgesic' },
    { drugName: 'Unfractionated Heparin', dose: '5000 IU', route: 'IV Bolus', timeAdministered: '18:30', administeredBy: 'Nurse R. Singh', category: 'Anticoagulant' },
    { drugName: 'Atorvastatin (Atorva)', dose: '80 mg', route: 'Oral', timeAdministered: '18:34', administeredBy: 'Nurse R. Singh', category: 'Statin' },
  ],
};

const INITIAL_TIMELINE: TimelineEvent[] = [
  {
    id: 'tl-1',
    time: '18:04',
    title: 'Patient Admitted to Emergency',
    description: 'Arrived at District Hospital Kanpur with 75m history of acute crushing chest pain.',
    category: 'clinical',
    status: 'completed',
    actor: 'Triage Desk',
  },
  {
    id: 'tl-2',
    time: '18:09',
    title: 'Initial Assessment & ABHA Linkage',
    description: 'Patient identity matched to ABHA 91-8291-0391-4412. Immediate code yellow triage.',
    category: 'clinical',
    status: 'completed',
    actor: 'Dr. Ananya Sharma',
  },
  {
    id: 'tl-3',
    time: '18:17',
    title: '12-Lead ECG Completed',
    description: 'Confirmed ST elevation in leads V1-V4. Urgent Primary PCI indicated.',
    category: 'clinical',
    badge: 'STEMI ALERT',
    status: 'completed',
    actor: 'Cardio Tech',
  },
  {
    id: 'tl-4',
    time: '18:23',
    title: 'Golden-Hour Stabilization Initiated',
    description: 'Loading doses of Aspirin 325mg, Ticagrelor 180mg, Nitroglycerin and Heparin 5000 IU administered.',
    category: 'clinical',
    status: 'completed',
    actor: 'Dr. Ananya Sharma',
  },
  {
    id: 'tl-5',
    time: '18:41',
    title: 'Higher-Center Transfer Recommended',
    description: 'Patient stabilized. District center lacks dedicated catheterization lab. Transfer to SGPGI Lucknow initiated.',
    category: 'transit',
    status: 'completed',
    actor: 'Emergency Command',
  },
];

const INITIAL_CONSENT: ConsentRecord = {
  type: 'ABDM_CONSENT',
  status: 'PENDING',
  timestamp: '18 Aug 2026, 18:45',
  purpose: 'Emergency treatment / inter-hospital transfer',
  consentArtifactId: 'AR-CONSENT-829104-EMERGENCY',
  patientOrProxyName: 'Rajesh Kumar (Patient)',
  auditHash: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
};

class TransferServiceStore {
  private state: TransferRequestState;
  private listeners: Set<(state: TransferRequestState) => void> = new Set();

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): TransferRequestState {
    return {
      encounterId: MASTER_ENCOUNTER_ID,
      patient: { ...INITIAL_PATIENT },
      clinical: { ...INITIAL_CLINICAL },
      selectedHospitalId: 'hosp-sgpgi-lko',
      hospitals: [...MOCK_HIGHER_CENTERS],
      status: 'STABILIZED_READY',
      consent: { ...INITIAL_CONSENT },
      ambulance: { ...INITIAL_AMBULANCE_UNIT },
      timeline: [...INITIAL_TIMELINE],
      dossierHash: 'FHIR-SHA256-e9c40219bd741498b8c29015ba6a05e2',
      isSimulatedError: false,
      networkOfflineFallback: false,
      receivingCathLabReserved: false,
      receivingCardiologyNotified: false,
      receivingDoctorAccepted: false,
    };
  }

  public getState(): TransferRequestState {
    return this.state;
  }

  public subscribe(listener: (state: TransferRequestState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  public selectDestinationHospital(hospitalId: string) {
    this.state.selectedHospitalId = hospitalId;
    if (this.state.status === 'STABILIZED_READY') {
      this.state.status = 'DESTINATION_SELECTED';
    }
    this.notify();
  }

  public generateEDossier() {
    const selectedHosp = this.state.hospitals.find((h) => h.id === this.state.selectedHospitalId);
    this.state.status = 'DOSSIER_PREPARED';
    
    // Add timeline event if not already present
    if (!this.state.timeline.some((t) => t.id === 'tl-dossier')) {
      this.state.timeline.push({
        id: 'tl-dossier',
        time: '18:45',
        title: 'E-Dossier Generated & FHIR Bundle Sealed',
        description: `Clinical handoff bundle compiled for ${selectedHosp?.name || 'Higher Center'}. Encrypted hash generated.`,
        category: 'clinical',
        status: 'completed',
        actor: 'Prathmikta FHIR Engine',
      });
    }
    this.notify();
  }

  public validateConsent(isEmergencyOverride = false, overrideData?: { staffName: string; staffReg: string; reason: string }) {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (isEmergencyOverride && overrideData) {
      this.state.consent = {
        type: 'EMERGENCY_OVERRIDE',
        status: 'OVERRIDDEN',
        timestamp: `18 Aug 2026, ${timeStr}`,
        purpose: 'Emergency life-saving STEMI transfer override',
        overrideStaffName: overrideData.staffName,
        overrideStaffReg: overrideData.staffReg,
        overrideReason: overrideData.reason,
        auditHash: `SHA256-OVR-${Date.now().toString(16)}`,
      };
      this.state.status = 'OVERRIDE_LOGGED';

      this.state.timeline.push({
        id: `tl-consent-${Date.now()}`,
        time: timeStr,
        title: 'Emergency Consent Override Logged & Audited',
        description: `Authorized by ${overrideData.staffName} (${overrideData.staffReg}). Reason: ${overrideData.reason}`,
        category: 'consent',
        badge: 'OVERRIDE AUDIT',
        status: 'completed',
        actor: overrideData.staffName,
      });
    } else {
      this.state.consent = {
        type: 'ABDM_CONSENT',
        status: 'GRANTED',
        timestamp: `18 Aug 2026, ${timeStr}`,
        purpose: 'Emergency treatment / inter-hospital transfer',
        consentArtifactId: `AR-CONSENT-${Math.floor(100000 + Math.random() * 900000)}`,
        patientOrProxyName: 'Rajesh Kumar (Patient Signature Captured)',
        auditHash: `SHA256-AUTH-${Date.now().toString(16)}`,
      };
      this.state.status = 'CONSENT_GRANTED';

      this.state.timeline.push({
        id: `tl-consent-${Date.now()}`,
        time: timeStr,
        title: 'ABDM Patient Consent Verified',
        description: 'Electronic authorization validated. Purpose: Emergency inter-hospital cardiac transit.',
        category: 'consent',
        status: 'completed',
        actor: 'ABDM Gateway Node',
      });
    }

    this.notify();
  }

  public sendTransferRequest() {
    const selectedHosp = this.state.hospitals.find((h) => h.id === this.state.selectedHospitalId);
    this.state.status = 'TRANSFER_REQUESTED';
    
    // Soft lock receiving hospital resources
    this.state.receivingCardiologyNotified = true;
    this.state.hospitals = this.state.hospitals.map((h) => {
      if (h.id === this.state.selectedHospitalId) {
        return {
          ...h,
          cathLabStatus: 'SOFT_LOCKED',
          cardiologyStatus: 'ON_CALL',
        };
      }
      return h;
    });

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    this.state.timeline.push({
      id: `tl-send-${Date.now()}`,
      time: timeStr,
      title: `Transfer Request Dispatched to ${selectedHosp?.name || 'Higher Center'}`,
      description: 'E-Dossier payload sent with Cath Lab priority flag. Awaiting receiving physician acceptance.',
      category: 'transit',
      badge: 'DISPATCHED',
      status: 'completed',
      actor: 'Emergency Transit Hub',
    });

    this.notify();
  }

  public acceptTransfer(clarificationNotes?: string) {
    const selectedHosp = this.state.hospitals.find((h) => h.id === this.state.selectedHospitalId);
    this.state.status = 'RECEIVING_ACCEPTED';
    this.state.receivingDoctorAccepted = true;
    this.state.receivingCathLabReserved = true;
    this.state.receivingCardiologyNotified = true;
    if (clarificationNotes) {
      this.state.receivingClarificationNotes = clarificationNotes;
    }

    // Update hospital status
    this.state.hospitals = this.state.hospitals.map((h) => {
      if (h.id === this.state.selectedHospitalId) {
        return {
          ...h,
          cathLabStatus: 'AVAILABLE',
          cathLabNumber: 'Cath Lab 02 (CONFIRMED RESERVED FOR PRK-2026-0818-00427)',
          transferAcceptanceStatus: 'READY TO RECEIVE',
        };
      }
      return h;
    });

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    this.state.timeline.push({
      id: `tl-accept-${Date.now()}`,
      time: timeStr,
      title: `Transfer Accepted by ${selectedHosp?.name || 'Receiving Hospital'}`,
      description: `Accepted by ${selectedHosp?.receivingDoctor}. Cath Lab reserved. Standby team paged. Direct ER-to-Lab bypass authorized.`,
      category: 'acceptance',
      badge: 'ACCEPTED',
      status: 'completed',
      actor: selectedHosp?.receivingDoctor,
    });

    this.notify();
  }

  public dispatchAmbulance() {
    this.state.status = 'AMBULANCE_DISPATCHED';
    this.state.dispatchTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.state.ambulance.status = 'DISPATCHED';
    this.state.ambulance.speedKmH = 45;
    this.state.ambulance.routeProgressPercent = 5;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    this.state.timeline.push({
      id: `tl-amb-dispatch-${Date.now()}`,
      time: timeStr,
      title: 'ALS Ambulance Dispatched',
      description: `Unit ALS-042 departs District Hospital Kanpur. Paramedic Arjun Nair and EMT Priya Verma onboard with real-time 5G tele-link.`,
      category: 'dispatch',
      badge: 'ALS DISPATCHED',
      status: 'completed',
      actor: 'District Fleet Control',
    });

    this.notify();

    // Transition to EN_ROUTE
    setTimeout(() => {
      if (this.state.status === 'AMBULANCE_DISPATCHED') {
        this.state.status = 'EN_ROUTE';
        this.state.ambulance.status = 'EN_ROUTE';
        this.state.ambulance.speedKmH = 78;
        this.state.ambulance.currentLocationName = 'NH-27 Corridor near Unnao Toll';
        this.state.ambulance.routeProgressPercent = 25;
        this.notify();
      }
    }, 1200);
  }

  public updateTransitProgress(progressPercent: number) {
    this.state.ambulance.routeProgressPercent = Math.min(100, Math.max(0, progressPercent));
    const totalKm = 88;
    const remaining = totalKm * (1 - this.state.ambulance.routeProgressPercent / 100);
    this.state.ambulance.distanceRemainingKm = parseFloat(remaining.toFixed(1));
    
    if (this.state.ambulance.routeProgressPercent >= 100) {
      this.state.status = 'ARRIVED_AT_DESTINATION';
      this.state.ambulance.status = 'COMPLETED';
      this.state.ambulance.speedKmH = 0;
      this.state.ambulance.currentLocationName = 'SGPGI Lucknow (Cath Lab Bay 2)';
    } else {
      this.state.ambulance.speedKmH = Math.floor(70 + Math.random() * 18);
      const hoursRemaining = (remaining / 75).toFixed(1);
      const mins = Math.round(parseFloat(hoursRemaining) * 60);
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      this.state.ambulance.etaString = `${hrs.toString().padStart(2, '0')}h ${remMins.toString().padStart(2, '0')}m`;
    }
    this.notify();
  }

  public simulateError(errorType: 'network_fail' | 'hospital_busy' | 'consent_denied') {
    this.state.isSimulatedError = true;
    if (errorType === 'network_fail') {
      this.state.simulatedErrorMessage = 'Connection Interrupted: Primary ABDM Gateway node timeout (Kanpur-Lucknow fiber link packet drop).';
      this.state.networkOfflineFallback = true;
    } else if (errorType === 'hospital_busy') {
      this.state.simulatedErrorMessage = 'Cath Lab Overcapacity: Emergency STEMI case already on table. Diversion to secondary center suggested.';
    } else {
      this.state.simulatedErrorMessage = 'Consent Signature Verification Failed: Proxy authorization required or use Emergency Override.';
    }
    this.notify();
  }

  public resolveError() {
    this.state.isSimulatedError = false;
    this.state.simulatedErrorMessage = undefined;
    this.state.networkOfflineFallback = false;
    this.notify();
  }

  public resetDemo() {
    this.state = this.getInitialState();
    this.notify();
  }
}

export const transferService = new TransferServiceStore();
