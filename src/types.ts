export type TriageSeverity = 'RED' | 'AMBER' | 'GREEN';

export type SymptomCategory = 'cardiac' | 'trauma' | 'stroke' | 'respiratory' | 'burn' | 'general';

export type AvpuScale = 'A - Alert' | 'V - Responsive to Voice' | 'P - Responsive to Pain' | 'U - Unresponsive';

export interface VitalsInput {
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  spo2?: number;
  respiratoryRate?: number;
  temperature?: number;
  gcs?: number; // Glasgow Coma Scale 3-15
}

export interface VitalSample {
  timestamp: string; // e.g. "12:05 PM"
  phase: 'Onset / Baseline' | 'In-Transit T+3m' | 'In-Transit T+7m' | 'Live Telemetry';
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  spo2: number;
  respiratoryRate: number;
  gcs: number;
  notes?: string;
}

export interface VitalDeltaSummary {
  bpChange: {
    initial: string; // e.g. "165/98"
    current: string; // e.g. "140/88"
    deltaSystolic: number; // -25
    deltaDiastolic: number; // -10
    trend: 'critical_surge' | 'hypertensive' | 'stabilizing' | 'hypotensive_drop' | 'stable';
    summary: string;
  };
  spo2Change: {
    initial: number; // 89
    current: number; // 94
    deltaPercent: number; // +5
    trend: 'critical_hypoxia' | 'desaturating' | 'improving' | 'stable';
    summary: string;
  };
  heartRateChange: {
    initial: number;
    current: number;
    deltaBpm: number;
    trend: 'tachycardia' | 'bradycardia' | 'normalizing' | 'stable';
    summary: string;
  };
}

export interface AiClinicalReport {
  reportId: string;
  generatedAt: string;
  confidenceScore: number; // 0-100 (e.g. 96)
  urgencyLevel: 'CRITICAL_IMMEDIATE_OT' | 'HIGH_EMERGENCY' | 'URGENT_OBSERVATION';
  suspectedCondition: string; // e.g. "Acute Anterior STEMI with Hypoxia & Diaphoresis"
  clinicalRationale: string;
  vitalDelta: VitalDeltaSummary;
  riskStratification: {
    airwayRisk: 'High' | 'Moderate' | 'Low';
    cardiacArrestRisk: 'High' | 'Moderate' | 'Low';
    organFailureRisk: 'High' | 'Moderate' | 'Low';
    recommendation: string;
  };
  suggestedActionProtocols: {
    immediateMeds: string[];
    bayPreps: string[];
    specialistCallouts: string[];
  };
  diagnosticHypotheses: Array<{
    diagnosis: string;
    probability: number;
    keyDriver: string;
  }>;
}

export interface PatientTriageData {
  id: string;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  contactPhone: string;
  emergencyContact?: string;
  symptomCategory: SymptomCategory;
  primaryComplaint: string;
  subSymptoms: string[];
  onsetTime: string; // e.g. "<15 mins", "15-60 mins", "1-3 hours", ">3 hours"
  knownAllergies: string[];
  preExistingConditions: string[];
  avpuScale: AvpuScale;
  vitals?: VitalsInput;
  vitalHistory?: VitalSample[];
  aiReport?: AiClinicalReport;
  severity: TriageSeverity;
  clinicalPriorityNotes: string;
  targetDepartment: string;
  targetFloorId: number;
  isOfflineGenerated?: boolean;
  generatedAt: string;
  payloadHash: string;
}

export type DispatchStatus = 
  | 'dispatched'
  | 'en_route'
  | 'acknowledged'
  | 'bay_ready'
  | 'cath_lab_prepped'
  | 'arrived'
  | 'admitted';

export interface InboundDispatch {
  dispatchId: string;
  hospitalId: string;
  hospitalName: string;
  patient: PatientTriageData;
  severity: TriageSeverity;
  status: DispatchStatus;
  originCoords: { lat: number; lng: number };
  currentCoords: { lat: number; lng: number };
  destinationCoords: { lat: number; lng: number };
  etaMinutes: number;
  etaDistanceKm: number;
  assignedFloor: number;
  assignedBay?: string;
  assignedDoctor?: string;
  vitalHistory?: VitalSample[];
  aiReport?: AiClinicalReport;
  dispatchTimestamp: string;
  updatedTimestamp: string;
}

export interface DoctorRoster {
  id: string;
  name: string;
  role: string;
  specialization: string;
  status: 'Present' | 'In OT' | 'On Rounds' | 'Off Duty';
  assignedCases: number;
  phone: string;
}

export interface FloorBay {
  bayId: string;
  name: string;
  status: 'available' | 'occupied' | 'prepped' | 'maintenance';
  currentPatientId?: string;
  patientName?: string;
  severity?: TriageSeverity;
}

export interface FloorData {
  floorId: number;
  floorLabel: string;
  name: string;
  department: string;
  colorTheme: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  icuBeds: { total: number; occupied: number; available: number };
  ventilators: { total: number; inUse: number; available: number };
  status: 'Operational' | 'High Occupancy' | 'Code Surge' | 'Standby';
  doctors: DoctorRoster[];
  bays: FloorBay[];
}

export interface PharmacyItem {
  id: string;
  name: string;
  category: 'Critical Resus' | 'Blood Products' | 'Cardiology' | 'Neurology' | 'Airway / Trauma';
  stockLevel: number;
  unit: string;
  minThreshold: number;
  status: 'Adequate' | 'Low' | 'Critical Stock';
  lastUpdated: string;
}

export interface PharmacyState {
  isOpen24x7: boolean;
  onDutyPharmacist: string;
  contactNumber: string;
  currentShift: string;
  items: PharmacyItem[];
  lastRestocked: string;
}

export interface HospitalFacility {
  id: string;
  name: string;
  tagline: string;
  state: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  emergencyHotline: string;
  traumaLevel: 'Level 1 Trauma Center' | 'Level 2 Trauma Center' | 'Apex Super Specialty';
  cathLabActive: boolean;
  strokeReady: boolean;
  burnUnitReady: boolean;
  totalFacilityBeds: number;
  occupiedFacilityBeds: number;
  floors: FloorData[];
  pharmacy: PharmacyState;
  specialties: string[];
  activeDispatches: InboundDispatch[];
}

export interface EmergencyTier {
  id: AppViewMode;
  tierNumber: number;
  name: string;
  hindiName: string;
  roleTitle: string;
  description: string;
  iconName: string;
  badgeColor: string;
  isPrimary?: boolean;
}

export interface StateInfo {
  id: string;
  name: string;
  hindiName: string;
  code: string;
  majorEmergencyHotline?: string;
  cities: CityInfo[];
}

export interface CityInfo {
  id: string;
  name: string;
  hindiName: string;
  stateId?: string;
  lat: number;
  lng: number;
  tier?: 'Tier-1' | 'Tier-2' | 'Metro';
  ambulanceNetwork?: string;
  isPopular?: boolean;
}

export interface DiseaseCondition {
  id: string;
  name: string;
  hindiName: string;
  category: SymptomCategory;
  urgency?: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'URGENT';
  urgencyCode?: 'CODE_RED' | 'CODE_AMBER' | 'CODE_GREEN';
  description?: string;
  hindiDescription?: string;
  iconName?: string;
  requiredFeatures?: string[];
  recommendedDepartment?: string;
  goldenHourWindow?: string;
  icon?: string;
  primaryQuestions?: string[];
  criticalSpecialtyRequired?: string;
  immediateFirstAidTip?: string;
  defaultSeverity?: TriageSeverity;
}

export type AppViewMode =
  | 'landing'
  | 'patient'
  | 'planned_admission'
  | 'hospital'
  | 'coordinate'
  | 'paramedic'
  | 'citizen'
  | 'tv_command'
  | 'regional_deoc'
  | 'dual_split';
