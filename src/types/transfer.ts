export type TransferStatus =
  | 'STABILIZED_READY'
  | 'DESTINATION_SELECTED'
  | 'DOSSIER_PREPARED'
  | 'CONSENT_PENDING'
  | 'CONSENT_GRANTED'
  | 'OVERRIDE_LOGGED'
  | 'TRANSFER_REQUESTED'
  | 'RECEIVING_ACCEPTED'
  | 'AMBULANCE_ASSIGNED'
  | 'AMBULANCE_DISPATCHED'
  | 'EN_ROUTE'
  | 'ARRIVED_AT_DESTINATION'
  | 'TRANSFER_FAILED';

export interface VitalsData {
  heartRate: number;
  spO2: number;
  bloodPressure: string;
  temperature: string;
  respiratoryRate: number;
  rhythm: string;
  gcs: string;
  painScore: string;
}

export interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  bloodGroup: string;
  abhaId: string;
  abhaLinked: boolean;
  contactNumber: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  encounterId: string;
  admitTime: string;
  currentHospital: string;
  currentLocation: string;
  attendingDoctor: string;
  attendingRegNumber: string;
  condition: string;
  stabilizationStatus: 'Stabilized' | 'Critical Unstable' | 'Pending Intervention';
  stabilizationSummary: string;
  allergies: string[];
}

export interface ClinicalData {
  chiefComplaint: string;
  diagnosis: string;
  icd10Code: string;
  historyOfPresentIllness: string;
  stabilizationInterventions: {
    time: string;
    intervention: string;
    performedBy: string;
    response: string;
  }[];
  vitals: VitalsData;
  investigations: {
    type: 'ECG' | 'Lab' | 'Imaging' | 'PointOfCare';
    name: string;
    time: string;
    findings: string;
    status: 'Normal' | 'Critical' | 'Abnormal' | 'Pending';
    criticalValue?: string;
  }[];
  medications: {
    drugName: string;
    dose: string;
    route: string;
    timeAdministered: string;
    administeredBy: string;
    category: 'Dual Antiplatelet' | 'Anticoagulant' | 'Analgesic' | 'Statin' | 'Emergency Inotrope';
  }[];
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  category: 'clinical' | 'transit' | 'consent' | 'acceptance' | 'dispatch';
  badge?: string;
  status: 'completed' | 'in_progress' | 'pending';
  actor?: string;
}

export interface HigherCenter {
  id: string;
  name: string;
  city: string;
  distanceKm: number;
  estimatedTravelTime: string;
  cardiologyStatus: 'AVAILABLE' | 'ON_CALL' | 'LIMITED' | 'UNAVAILABLE';
  cathLabStatus: 'AVAILABLE' | 'SOFT_LOCKED' | 'OCCUPIED' | 'UNAVAILABLE';
  cathLabNumber?: string;
  icuStatus: 'AVAILABLE' | 'LIMITED' | 'FULL' | 'CRITICAL';
  icuBedsAvailable: number;
  transferAcceptanceStatus: 'READY TO RECEIVE' | 'ACCEPTING (PRIORITY ONLY)' | 'DIVERSION RECOMMENDED';
  overallReadinessScore: number; // 0-100
  receivingDoctor: string;
  receivingDoctorSpecialty: string;
  contactEmergencyLine: string;
  recommendedReason: string;
  facilities: string[];
}

export interface ConsentRecord {
  type: 'ABDM_CONSENT' | 'EMERGENCY_OVERRIDE';
  status: 'PENDING' | 'GRANTED' | 'OVERRIDDEN' | 'DENIED';
  timestamp: string;
  purpose: string;
  consentArtifactId?: string;
  patientOrProxyName?: string;
  overrideStaffName?: string;
  overrideStaffReg?: string;
  overrideReason?: string;
  auditHash: string;
}

export interface AmbulanceUnit {
  id: string;
  vehicleNumber: string;
  type: 'ALS (Advanced Life Support)' | 'BLS' | 'Critical Care Mobile ICU';
  driver: string;
  paramedic: string;
  emt: string;
  baseStation: string;
  contactPhone: string;
  status: 'READY' | 'DISPATCHED' | 'EN_ROUTE' | 'AT_SCENE' | 'COMPLETED';
  equipmentStatus: {
    defibrillator: 'ONLINE' | 'STANDBY' | 'FAULT';
    ventilator: 'ONLINE' | 'STANDBY' | 'FAULT';
    oxygenLiters: number;
    telemedicineLink: 'CONNECTED (5G)' | 'CONNECTING' | 'OFFLINE';
  };
  currentLocationName: string;
  speedKmH: number;
  etaString: string;
  distanceRemainingKm: number;
  latitude: number;
  longitude: number;
  routeProgressPercent: number;
}

export interface TransferRequestState {
  encounterId: string;
  patient: PatientData;
  clinical: ClinicalData;
  selectedHospitalId: string;
  hospitals: HigherCenter[];
  status: TransferStatus;
  consent: ConsentRecord;
  ambulance: AmbulanceUnit;
  timeline: TimelineEvent[];
  dossierHash: string;
  isSimulatedError: boolean;
  simulatedErrorMessage?: string;
  networkOfflineFallback: boolean;
  receivingClarificationNotes?: string;
  receivingCathLabReserved: boolean;
  receivingCardiologyNotified: boolean;
  receivingDoctorAccepted: boolean;
  dispatchTimestamp?: string;
}

export interface FHIRResource {
  resourceType: 'Patient' | 'Encounter' | 'Condition' | 'Observation' | 'MedicationAdministration' | 'DiagnosticReport' | 'Composition';
  id: string;
  meta: {
    versionId: string;
    lastUpdated: string;
    profile?: string[];
  };
  [key: string]: any;
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  id: string;
  type: 'document' | 'collection';
  timestamp: string;
  identifier: {
    system: string;
    value: string;
  };
  entry: {
    fullUrl: string;
    resource: FHIRResource;
  }[];
}
