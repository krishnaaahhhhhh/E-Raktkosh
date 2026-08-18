import mongoose, { Document, Model } from 'mongoose';

// Primary MongoDB connection URI provided for Alex Cluster
const DEFAULT_MONGODB_URI =
  'mongodb+srv://krishna17429_db_user:TmJp5wp1r5EJy024@alex.qzksix9.mongodb.net/prathmikta_db?retryWrites=true&w=majority&appName=Alex';

export const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

let isConnected = false;

export async function connectToDatabase(): Promise<boolean> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    console.log('[MongoDB] Connecting to MongoDB Atlas cluster...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    isConnected = true;
    console.log('[MongoDB] Successfully connected to MongoDB Atlas (prathmikta_db)');
    return true;
  } catch (error) {
    console.warn('[MongoDB] MongoDB Atlas connection warning:', (error as Error).message);
    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// =========================================================================
// 1. SCHEMAS & MODELS
// =========================================================================

// A. Facility Registration Schema (/hb route - Hospitals, Blood Banks, Ambulances)
export interface IFacility extends Document {
  facilityId: string;
  facilityType: 'hospital' | 'blood_bank' | 'ambulance';
  facilityName: string;
  registrationNumber?: string;
  state?: string;
  city?: string;
  coordinates?: { lat: number; lng: number };
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  nodalOfficerName?: string;
  nodalOfficerContact?: string;
  apiKey?: string;
  abdmStatus?: string;
  verificationStatus?: string;
  hospitalCapacity?: Record<string, any>;
  bloodBankData?: Record<string, any>;
  ambulanceFleetData?: Record<string, any>;
  meta?: any;
}

const FacilitySchema = new mongoose.Schema<IFacility>(
  {
    facilityId: { type: String, required: true, index: true },
    facilityType: {
      type: String,
      enum: ['hospital', 'blood_bank', 'ambulance'],
      required: true,
      index: true
    },
    facilityName: { type: String, required: true },
    registrationNumber: { type: String },
    state: { type: String },
    city: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    address: { type: String },
    contactPhone: { type: String },
    contactEmail: { type: String },
    nodalOfficerName: { type: String },
    nodalOfficerContact: { type: String },
    apiKey: { type: String },
    abdmStatus: { type: String, default: 'COMPLIANT' },
    verificationStatus: { type: String, default: 'VERIFIED' },
    hospitalCapacity: { type: mongoose.Schema.Types.Mixed },
    bloodBankData: { type: mongoose.Schema.Types.Mixed },
    ambulanceFleetData: { type: mongoose.Schema.Types.Mixed },
    meta: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const FacilityModel: Model<IFacility> =
  mongoose.models.Facility || mongoose.model<IFacility>('Facility', FacilitySchema);

// B. Inbound Emergency Dispatch Schema (Citizen Triage / Paramedic / Split)
export interface IDispatch extends Document {
  dispatchId: string;
  hospitalId: string;
  hospitalName?: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  contactPhone?: string;
  severity?: string;
  symptomCategory?: string;
  subSymptoms?: string[];
  onsetTime?: string;
  avpuScale?: string;
  vitals?: any;
  etaMinutes?: number;
  ambulanceId?: string;
  paramedicName?: string;
  status?: string;
  assignedBay?: string;
  assignedDoctor?: string;
  assignedBed?: string;
  targetDepartment?: string;
  clinicalPriorityNotes?: string;
  originCoords?: { lat: number; lng: number };
  currentCoords?: { lat: number; lng: number };
  transitProgress?: number;
  qrPayload?: string;
}

const DispatchSchema = new mongoose.Schema<IDispatch>(
  {
    dispatchId: { type: String, required: true, unique: true, index: true },
    hospitalId: { type: String, required: true, index: true },
    hospitalName: { type: String },
    patientName: { type: String },
    patientAge: { type: Number },
    patientGender: { type: String },
    contactPhone: { type: String },
    severity: { type: String, default: 'RED' },
    symptomCategory: { type: String },
    subSymptoms: [{ type: String }],
    onsetTime: { type: String },
    avpuScale: { type: String },
    vitals: { type: mongoose.Schema.Types.Mixed },
    etaMinutes: { type: Number },
    ambulanceId: { type: String },
    paramedicName: { type: String },
    status: { type: String, default: 'In Transit' },
    assignedBay: { type: String },
    assignedDoctor: { type: String },
    assignedBed: { type: String },
    targetDepartment: { type: String },
    clinicalPriorityNotes: { type: String },
    originCoords: {
      lat: { type: Number },
      lng: { type: Number }
    },
    currentCoords: {
      lat: { type: Number },
      lng: { type: Number }
    },
    transitProgress: { type: Number, default: 0 },
    qrPayload: { type: String }
  },
  { timestamps: true }
);

export const DispatchModel: Model<IDispatch> =
  mongoose.models.Dispatch || mongoose.model<IDispatch>('Dispatch', DispatchSchema);

// C. Fast-Track ₹500 Token Schema (/h route)
export interface IToken extends Document {
  tokenNumber: string;
  hospitalId: string;
  patientAgeGender?: string;
  patientName?: string;
  priority?: string;
  amount?: number;
  bookedBy?: string;
  paymentStatus?: string;
  issuedAtTime?: string;
  assignedBed?: string;
  qrCodeString?: string;
}

const TokenSchema = new mongoose.Schema<IToken>(
  {
    tokenNumber: { type: String, required: true, unique: true, index: true },
    hospitalId: { type: String, default: 'gsvm-kanpur', index: true },
    patientAgeGender: { type: String },
    patientName: { type: String },
    priority: { type: String, default: 'TRAUMA RED' },
    amount: { type: Number, default: 500 },
    bookedBy: { type: String, default: 'CityCare Ambulance' },
    paymentStatus: { type: String, default: 'Confirmed' },
    issuedAtTime: { type: String },
    assignedBed: { type: String },
    qrCodeString: { type: String }
  },
  { timestamps: true }
);

export const TokenModel: Model<IToken> =
  mongoose.models.Token || mongoose.model<IToken>('Token', TokenSchema);

// D. Planned Admission / OPD Booking Schema (/planned-admission route)
export interface IPlannedAdmission extends Document {
  bookingId: string;
  patientName: string;
  age?: number;
  gender?: string;
  contactPhone?: string;
  abhaId?: string;
  hospitalId: string;
  hospitalName?: string;
  department?: string;
  doctorName?: string;
  scheduledDate?: string;
  timeSlot?: string;
  admissionType?: string;
  preAdmissionDeposit?: number;
  status?: string;
}

const PlannedAdmissionSchema = new mongoose.Schema<IPlannedAdmission>(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    patientName: { type: String, required: true },
    age: { type: Number },
    gender: { type: String },
    contactPhone: { type: String },
    abhaId: { type: String },
    hospitalId: { type: String, required: true },
    hospitalName: { type: String },
    department: { type: String },
    doctorName: { type: String },
    scheduledDate: { type: String },
    timeSlot: { type: String },
    admissionType: { type: String, default: 'Planned Day Care / OPD' },
    preAdmissionDeposit: { type: Number, default: 0 },
    status: { type: String, default: 'CONFIRMED' }
  },
  { timestamps: true }
);

export const PlannedAdmissionModel: Model<IPlannedAdmission> =
  mongoose.models.PlannedAdmission ||
  mongoose.model<IPlannedAdmission>('PlannedAdmission', PlannedAdmissionSchema);

// E. Live Hospital Bed State Schema (/h & /hospital routes)
export interface IHospitalBedState extends Document {
  hospitalId: string;
  hospitalName?: string;
  city?: string;
  totalFacilityBeds?: number;
  occupiedFacilityBeds?: number;
  icuBeds?: { total: number; occupied: number };
  nicuWarmers?: { total: number; occupied: number };
  erTraumaBays?: { total: number; occupied: number };
  ventilators?: { total: number; inUse: number };
  generalWard?: { total: number; occupied: number };
  lastUpdatedBy?: string;
  floors?: any[];
}

const HospitalBedStateSchema = new mongoose.Schema<IHospitalBedState>(
  {
    hospitalId: { type: String, required: true, unique: true, index: true },
    hospitalName: { type: String },
    city: { type: String },
    totalFacilityBeds: { type: Number, default: 150 },
    occupiedFacilityBeds: { type: Number, default: 110 },
    icuBeds: {
      total: { type: Number, default: 24 },
      occupied: { type: Number, default: 16 }
    },
    nicuWarmers: {
      total: { type: Number, default: 12 },
      occupied: { type: Number, default: 7 }
    },
    erTraumaBays: {
      total: { type: Number, default: 8 },
      occupied: { type: Number, default: 5 }
    },
    ventilators: {
      total: { type: Number, default: 18 },
      inUse: { type: Number, default: 12 }
    },
    generalWard: {
      total: { type: Number, default: 120 },
      occupied: { type: Number, default: 94 }
    },
    lastUpdatedBy: { type: String, default: 'Auto-Triage Engine' },
    floors: [{ type: mongoose.Schema.Types.Mixed }]
  },
  { timestamps: true }
);

export const HospitalBedStateModel: Model<IHospitalBedState> =
  mongoose.models.HospitalBedState ||
  mongoose.model<IHospitalBedState>('HospitalBedState', HospitalBedStateSchema);

// F. Stretcher & Auto-Admission Telemetry Logs Schema
export interface ITelemetryLog extends Document {
  logId: string;
  hospitalId?: string;
  eventType: string;
  caseId?: string;
  description: string;
  zone?: string;
  staffAssigned?: string;
  bedAssigned?: string;
  timestampStr?: string;
}

const TelemetryLogSchema = new mongoose.Schema<ITelemetryLog>(
  {
    logId: { type: String, required: true, index: true },
    hospitalId: { type: String, default: 'gsvm-kanpur', index: true },
    eventType: { type: String, required: true },
    caseId: { type: String },
    description: { type: String, required: true },
    zone: { type: String },
    staffAssigned: { type: String },
    bedAssigned: { type: String },
    timestampStr: { type: String }
  },
  { timestamps: true }
);

export const TelemetryLogModel: Model<ITelemetryLog> =
  mongoose.models.TelemetryLog ||
  mongoose.model<ITelemetryLog>('TelemetryLog', TelemetryLogSchema);

// G. Stretcher Attendant Duty & Dispatch Schema (/stretcher route)
export interface IStretcherAttendant extends Document {
  attendantId: string;
  name: string;
  employeeId: string;
  dutyStatus: string;
  shiftHours: string;
  heatIndexNow: number;
  shadeCompliance: number;
  hydrationLogs: number;
  totalTrips: number;
  activeDutyMinutes: number;
  currentLocation: string;
  onBreak: boolean;
}

const StretcherAttendantSchema = new mongoose.Schema<IStretcherAttendant>(
  {
    attendantId: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: 'Ram Singh' },
    employeeId: { type: String, default: 'SA-1047' },
    dutyStatus: { type: String, default: 'Shade Shelter Active' },
    shiftHours: { type: String, default: '08:00 AM to 04:00 PM' },
    heatIndexNow: { type: Number, default: 42.8 },
    shadeCompliance: { type: Number, default: 98 },
    hydrationLogs: { type: Number, default: 3 },
    totalTrips: { type: Number, default: 6 },
    activeDutyMinutes: { type: Number, default: 165 },
    currentLocation: { type: String, default: 'Indoor Shade Shelter – Emergency Block A' },
    onBreak: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const StretcherAttendantModel: Model<IStretcherAttendant> =
  mongoose.models.StretcherAttendant ||
  mongoose.model<IStretcherAttendant>('StretcherAttendant', StretcherAttendantSchema);

// H. Stretcher Dispatch Alerts Schema
export interface IStretcherDispatch extends Document {
  dispatchId: string;
  attendantId: string;
  time: string;
  destination: string;
  reason: string;
  priority: string;
  etaRequired: string;
  status: string;
}

const StretcherDispatchSchema = new mongoose.Schema<IStretcherDispatch>(
  {
    dispatchId: { type: String, required: true, unique: true, index: true },
    attendantId: { type: String, default: 'SA-1047', index: true },
    time: { type: String, required: true },
    destination: { type: String, required: true },
    reason: { type: String, default: 'Emergency Patient Transfer' },
    priority: { type: String, default: 'High' },
    etaRequired: { type: String, default: 'Within 3 Minutes' },
    status: { type: String, default: 'Pending' }
  },
  { timestamps: true }
);

export const StretcherDispatchModel: Model<IStretcherDispatch> =
  mongoose.models.StretcherDispatch ||
  mongoose.model<IStretcherDispatch>('StretcherDispatch', StretcherDispatchSchema);

