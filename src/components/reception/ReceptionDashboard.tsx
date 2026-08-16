import React, { useState, useEffect, useMemo } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import {
  Building2,
  Users,
  BedDouble,
  Activity,
  PhoneCall,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Heart,
  Brain,
  Wind,
  Shield,
  Stethoscope,
  Car,
  CreditCard,
  QrCode,
  Search,
  SlidersHorizontal,
  Plus,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Bell,
  Volume2,
  VolumeX,
  Printer,
  Compass,
  Radio,
  Sparkles,
  RefreshCw,
  X,
  MapPin,
  Check,
  UserCheck,
  AlertOctagon,
  CornerDownRight,
  Baby,
  Truck
} from 'lucide-react';
import { playTactileClick, playConfirmChime, playCodeRedAlert } from '../../lib/audio';

// Mock Doctor with Timings and Availability
interface ReceptionDoctor {
  id: string;
  name: string;
  department: string;
  speciality: string;
  status: 'available' | 'in_ot' | 'on_rounds' | 'off_duty';
  location: string;
  currentShift: string;
  returnTime?: string; // Timing when doctor will be available
  phone: string;
  onCallSub?: string;
}

// Initial Doctor Roster
const INITIAL_DOCTORS: ReceptionDoctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Rajesh Sharma, MD, DM',
    department: 'Cardiology',
    speciality: 'Interventional Cardiologist',
    status: 'available',
    location: 'Cath Lab 1 / ER Triage',
    currentShift: '08:00 AM – 04:00 PM',
    phone: '+91 98390 11221'
  },
  {
    id: 'doc-2',
    name: 'Dr. Vivek Mehra, MS, MCh',
    department: 'Trauma & Ortho',
    speciality: 'Trauma Surgery Chief',
    status: 'in_ot',
    location: 'Emergency OT 3 (Major Craniotomy)',
    currentShift: '09:00 AM – 05:00 PM',
    returnTime: '01:45 PM (In ~30 mins)',
    phone: '+91 98390 33442',
    onCallSub: 'Dr. Neha Verma (Available on Floor)'
  },
  {
    id: 'doc-3',
    name: 'Dr. Sneha Kapoor, MD',
    department: 'Pediatrics & NICU',
    speciality: 'Neonatologist & Pediatric Lead',
    status: 'available',
    location: 'NICU Ward – Gate 2 Ramp',
    currentShift: '08:00 AM – 04:00 PM',
    phone: '+91 98390 55663'
  },
  {
    id: 'doc-4',
    name: 'Dr. Alok Nath Tripathi, DM',
    department: 'Neurology',
    speciality: 'Stroke & Neuro Critical Care',
    status: 'on_rounds',
    location: 'Neuro ICU (Bed 104-112)',
    currentShift: '10:00 AM – 06:00 PM',
    returnTime: '01:15 PM (In ~10 mins)',
    phone: '+91 98390 77884'
  },
  {
    id: 'doc-5',
    name: 'Dr. Priya Singhania, MD',
    department: 'Emergency Medicine',
    speciality: 'ER Resus Specialist',
    status: 'available',
    location: 'Trauma Bay 1 (Gate 1)',
    currentShift: '08:00 AM – 04:00 PM',
    phone: '+91 98390 99005'
  },
  {
    id: 'doc-6',
    name: 'Dr. Sanjay Gupta, MS',
    department: 'General & Laparoscopic',
    speciality: 'Emergency Acute Care Surgeon',
    status: 'in_ot',
    location: 'OT Complex 2 (Appendectomy)',
    currentShift: '07:00 AM – 03:00 PM',
    returnTime: '02:30 PM',
    phone: '+91 98390 22336',
    onCallSub: 'Dr. R. K. Dixit'
  },
  {
    id: 'doc-7',
    name: 'Dr. Anita Joshi, MD',
    department: 'Pulmonology',
    speciality: 'Critical Care & Respiratory Lead',
    status: 'available',
    location: 'Respiratory HDU (Floor 2)',
    currentShift: '09:00 AM – 05:00 PM',
    phone: '+91 98390 44557'
  },
  {
    id: 'doc-8',
    name: 'Dr. Manish Rawat, MD',
    department: 'Anesthesia & Critical Care',
    speciality: 'ICU In-Charge',
    status: 'off_duty',
    location: 'Off-Duty / Residential Campus',
    currentShift: 'Night Shift (08:00 PM – 08:00 AM)',
    returnTime: 'Starts at 08:00 PM Today',
    phone: '+91 98390 66778',
    onCallSub: 'Dr. Priya Singhania covering ER'
  }
];

// Mock Ambulance Fleet
interface ReceptionAmbulance {
  id: string;
  vehicleNumber: string;
  type: 'ALS (Advanced Life Support)' | 'BLS (Basic Life Support)' | 'Neonatal NICU Amb';
  status: 'available' | 'on_mission' | 'returning' | 'maintenance';
  driverName: string;
  driverPhone: string;
  bayLocation: string;
  oxygenStatus: string;
  currentLocation?: string;
  etaMinutes?: number;
}

const INITIAL_AMBULANCES: ReceptionAmbulance[] = [
  {
    id: 'amb-101',
    vehicleNumber: 'UP-78-AG-1081',
    type: 'ALS (Advanced Life Support)',
    status: 'available',
    driverName: 'Ramesh Kumar',
    driverPhone: '+91 94150 12345',
    bayLocation: 'ER Bay 1 (Gate 1 Ramp)',
    oxygenStatus: '100% (2x D-Type Tanks Ready)'
  },
  {
    id: 'amb-102',
    vehicleNumber: 'UP-78-AG-1082',
    type: 'ALS (Advanced Life Support)',
    status: 'available',
    driverName: 'Surendra Pal',
    driverPhone: '+91 94150 23456',
    bayLocation: 'ER Bay 2 (Gate 1 Ramp)',
    oxygenStatus: '100% (Ventilator Onboard)'
  },
  {
    id: 'amb-103',
    vehicleNumber: 'UP-78-AG-1083',
    type: 'BLS (Basic Life Support)',
    status: 'available',
    driverName: 'Amit Yadav',
    driverPhone: '+91 94150 34567',
    bayLocation: 'Bay 4 (Gate 3 Walk-in Bay)',
    oxygenStatus: '95% (O2 Mask & Stretcher Ready)'
  },
  {
    id: 'amb-104',
    vehicleNumber: 'UP-78-AG-1084',
    type: 'Neonatal NICU Amb',
    status: 'available',
    driverName: 'Deepak Shukla',
    driverPhone: '+91 94150 45678',
    bayLocation: 'Gate 2 (NICU Ramp)',
    oxygenStatus: '100% (Transport Incubator Active)'
  },
  {
    id: 'amb-105',
    vehicleNumber: 'UP-78-AG-1085',
    type: 'ALS (Advanced Life Support)',
    status: 'on_mission',
    driverName: 'Mohd. Imran',
    driverPhone: '+91 94150 56789',
    bayLocation: 'En-Route with Cardiac Code Red',
    oxygenStatus: 'Active Flow 8L/min',
    currentLocation: 'Kidwai Nagar Bypass, Kanpur',
    etaMinutes: 4
  },
  {
    id: 'amb-106',
    vehicleNumber: 'UP-78-AG-1086',
    type: 'BLS (Basic Life Support)',
    status: 'on_mission',
    driverName: 'Satish Verma',
    driverPhone: '+91 94150 67890',
    bayLocation: 'Dispatched for Road Trauma',
    oxygenStatus: 'Active',
    currentLocation: 'Rawatganj Crossing',
    etaMinutes: 8
  },
  {
    id: 'amb-107',
    vehicleNumber: 'UP-78-AG-1087',
    type: 'BLS (Basic Life Support)',
    status: 'available',
    driverName: 'Vijay Maurya',
    driverPhone: '+91 94150 78901',
    bayLocation: 'Bay 5 (Reserve Standby)',
    oxygenStatus: '100% Ready'
  },
  {
    id: 'amb-108',
    vehicleNumber: 'UP-78-AG-1088',
    type: 'ALS (Advanced Life Support)',
    status: 'on_mission',
    driverName: 'Ravi Kant',
    driverPhone: '+91 94150 89012',
    bayLocation: 'Returning from Regency Transfer',
    oxygenStatus: '80%',
    currentLocation: 'GT Road Flyover',
    etaMinutes: 12
  }
];

// Mock Inbound Emergency Arrivals for Reception
interface IncomingPatient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  condition: string;
  severity: 'RED' | 'AMBER' | 'GREEN';
  category: string;
  etaMinutes: number;
  distanceKm: number;
  phone: string;
  isTokenDepositPaid: boolean; // ₹500 Pre-Deposit Paid
  tokenNumber?: string;
  paymentMethod?: 'UPI (PhonePe / GPay)' | 'Cash Counter' | 'PMJAY Ayushman';
  assignedGate: 'Gate 1 (Emergency Trauma & Stretcher Ramp)' | 'Gate 2 (Pediatric & NICU Ramp)' | 'Gate 3 (Walk-In ER Triage)' | 'Gate 4 (OT & Cath Lab Bay)';
  assignedBed: string;
  stretcherNeeded: boolean;
  stretcherDispatched: boolean;
  status: 'en_route' | 'arrived' | 'admitted';
  vitals: {
    bp: string;
    spo2: number;
    pulse: number;
    gcs: string;
  };
}

const INITIAL_INCOMING_PATIENTS: IncomingPatient[] = [
  {
    id: 'rec-pat-101',
    name: 'Anil Sharma',
    age: 54,
    gender: 'Male',
    condition: 'Acute Anterior STEMI / Severe Chest Pain',
    severity: 'RED',
    category: 'Cardiac',
    etaMinutes: 3,
    distanceKm: 1.8,
    phone: '+91 98711 00223',
    isTokenDepositPaid: true, // ₹500 paid
    tokenNumber: 'PRATH-₹500-TXN-8841',
    paymentMethod: 'UPI (PhonePe / GPay)',
    assignedGate: 'Gate 1 (Emergency Trauma & Stretcher Ramp)',
    assignedBed: 'Cath Lab 1 Standby / ICU Bed-04',
    stretcherNeeded: true,
    stretcherDispatched: true,
    status: 'en_route',
    vitals: {
      bp: '155/95',
      spo2: 93,
      pulse: 110,
      gcs: 'Alert (15/15)'
    }
  },
  {
    id: 'rec-pat-102',
    name: 'Baby of Sunita Devi',
    age: 0,
    gender: 'Female',
    condition: 'Neonatal Respiratory Distress / Premature 32w',
    severity: 'RED',
    category: 'Pediatric / NICU',
    etaMinutes: 7,
    distanceKm: 4.2,
    phone: '+91 98391 44552',
    isTokenDepositPaid: true, // ₹500 paid
    tokenNumber: 'PRATH-₹500-TXN-9102',
    paymentMethod: 'UPI (PhonePe / GPay)',
    assignedGate: 'Gate 2 (Pediatric & NICU Ramp)',
    assignedBed: 'NICU Warmer Bed-02 (O2 CPAP Ready)',
    stretcherNeeded: true,
    stretcherDispatched: false,
    status: 'en_route',
    vitals: {
      bp: '60/38',
      spo2: 86,
      pulse: 168,
      gcs: 'Drowsy / Grunting'
    }
  },
  {
    id: 'rec-pat-103',
    name: 'Mohit Agnihotri',
    age: 29,
    gender: 'Male',
    condition: 'High-Speed Bike Collision / Polytrauma Hemorrhage',
    severity: 'RED',
    category: 'Trauma',
    etaMinutes: 9,
    distanceKm: 5.6,
    phone: '+91 94500 88771',
    isTokenDepositPaid: false, // Pay at ER
    paymentMethod: 'Cash Counter',
    assignedGate: 'Gate 1 (Emergency Trauma & Stretcher Ramp)',
    assignedBed: 'Resus Bay 1 / Trauma ICU-01',
    stretcherNeeded: true,
    stretcherDispatched: true,
    status: 'en_route',
    vitals: {
      bp: '90/55 Low',
      spo2: 95,
      pulse: 124,
      gcs: 'Voice Responsive (12/15)'
    }
  },
  {
    id: 'rec-pat-104',
    name: 'Meena Saxena',
    age: 62,
    gender: 'Female',
    condition: 'Acute Ischemic Stroke / Left Hemiparesis (Onset 45m)',
    severity: 'RED',
    category: 'Stroke',
    etaMinutes: 14,
    distanceKm: 8.1,
    phone: '+91 98399 22110',
    isTokenDepositPaid: true, // ₹500 paid
    tokenNumber: 'PRATH-₹500-TXN-9430',
    paymentMethod: 'PMJAY Ayushman',
    assignedGate: 'Gate 1 (Emergency Trauma & Stretcher Ramp)',
    assignedBed: 'Stroke ICU Bed-03 / CT Scanner Alerted',
    stretcherNeeded: true,
    stretcherDispatched: false,
    status: 'en_route',
    vitals: {
      bp: '178/104 High',
      spo2: 97,
      pulse: 88,
      gcs: 'Alert with Aphasia'
    }
  }
];

export const ReceptionDashboard: React.FC = () => {
  const { setMode, hospitals, activeHospitalId, setActiveHospitalId } = usePrathmikta();

  // Hospital Name & Details
  const activeHospital = hospitals[activeHospitalId] || {
    id: 'hosp-gsvm',
    name: 'GSVM Medical College & Hospital',
    city: 'Kanpur',
    phone: '0512-2535483',
    emergencyHotline: '108 / 112'
  };

  // State
  const [activeTab, setActiveTab] = useState<'incoming' | 'beds' | 'doctors' | 'ambulances' | 'gates'>('incoming');
  const [incomingPatients, setIncomingPatients] = useState<IncomingPatient[]>(INITIAL_INCOMING_PATIENTS);
  const [doctors, setDoctors] = useState<ReceptionDoctor[]>(INITIAL_DOCTORS);
  const [ambulances, setAmbulances] = useState<ReceptionAmbulance[]>(INITIAL_AMBULANCES);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [doctorFilter, setDoctorFilter] = useState<'all' | 'available' | 'in_ot' | 'on_rounds' | 'off_duty'>('all');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [selectedPatientForPass, setSelectedPatientForPass] = useState<IncomingPatient | null>(null);
  const [isWalkinModalOpen, setIsWalkinModalOpen] = useState<boolean>(false);
  const [newWalkinName, setNewWalkinName] = useState<string>('');
  const [newWalkinAge, setNewWalkinAge] = useState<number>(45);
  const [newWalkinGender, setNewWalkinGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [newWalkinEmergency, setNewWalkinEmergency] = useState<string>('Cardiac');
  const [newWalkinDepositPaid, setNewWalkinDepositPaid] = useState<boolean>(true);
  const [newWalkinGate, setNewWalkinGate] = useState<any>('Gate 1 (Emergency Trauma & Stretcher Ramp)');

  // Live Real-Time Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Bed Counts State
  const [bedMatrix, setBedMatrix] = useState({
    icu: { total: 20, occupied: 15, vacant: 5 },
    nicu: { total: 14, occupied: 8, vacant: 6 },
    emergency: { total: 30, occupied: 22, vacant: 8 },
    hdu: { total: 16, occupied: 12, vacant: 4 },
    ventilators: { total: 18, inUse: 13, ready: 5 },
    general: { total: 80, occupied: 58, vacant: 22 }
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Dispatch Stretcher Team to Gate Handler
  const handleToggleStretcherDispatch = (patientId: string) => {
    playTactileClick();
    setIncomingPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const updated = !p.stretcherDispatched;
          if (updated) {
            playConfirmChime();
            showToast(`🚑 Stretcher & ER Wardens dispatched to ${p.assignedGate} for ${p.name}!`);
          } else {
            showToast(`Stretcher team recalled for ${p.name}`);
          }
          return { ...p, stretcherDispatched: updated };
        }
        return p;
      })
    );
  };

  // Admit Patient / Mark Arrived Handler
  const handleAdmitPatient = (patientId: string) => {
    playConfirmChime();
    setIncomingPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          showToast(`✅ Patient ${p.name} admitted to ${p.assignedBed}! Bed status locked.`);
          return { ...p, status: 'admitted', etaMinutes: 0 };
        }
        return p;
      })
    );
    // Decrement vacant bed
    setBedMatrix((prev) => ({
      ...prev,
      emergency: {
        ...prev.emergency,
        occupied: Math.min(prev.emergency.total, prev.emergency.occupied + 1),
        vacant: Math.max(0, prev.emergency.vacant - 1)
      }
    }));
  };

  // Page Doctor to ER
  const handlePageDoctor = (docName: string, location: string) => {
    playConfirmChime();
    showToast(`📢 Paged ${docName} to Reception / ER Triage Desk! Location: ${location}`);
  };

  // Create Walk-in Patient
  const handleCreateWalkin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalkinName.trim()) return;

    playConfirmChime();
    const newPat: IncomingPatient = {
      id: `walkin-${Date.now().toString().slice(-4)}`,
      name: newWalkinName.trim(),
      age: newWalkinAge,
      gender: newWalkinGender,
      condition: `${newWalkinEmergency} Emergency Walk-in`,
      severity: 'RED',
      category: newWalkinEmergency,
      etaMinutes: 0,
      distanceKm: 0,
      phone: '+91 Walk-in Counter',
      isTokenDepositPaid: newWalkinDepositPaid,
      tokenNumber: newWalkinDepositPaid ? `PRATH-₹500-WALKIN-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      paymentMethod: newWalkinDepositPaid ? 'UPI (PhonePe / GPay)' : 'Cash Counter',
      assignedGate: newWalkinGate,
      assignedBed: newWalkinEmergency === 'NICU' ? 'NICU Bed-03' : 'Trauma Bay 2',
      stretcherNeeded: true,
      stretcherDispatched: true,
      status: 'arrived',
      vitals: {
        bp: '130/85',
        spo2: 96,
        pulse: 98,
        gcs: 'Alert (15/15)'
      }
    };

    setIncomingPatients((prev) => [newPat, ...prev]);
    setIsWalkinModalOpen(false);
    setNewWalkinName('');
    showToast(`✅ Walk-in Patient ${newPat.name} registered and sent to ${newPat.assignedGate}!`);
  };

  // Filtered Doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.speciality.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      if (doctorFilter === 'all') return true;
      return doc.status === doctorFilter;
    });
  }, [doctors, searchQuery, doctorFilter]);

  // Total Summary Stats
  const totalIncoming = incomingPatients.filter((p) => p.status !== 'admitted').length;
  const totalPaidToken = incomingPatients.filter((p) => p.isTokenDepositPaid && p.status !== 'admitted').length;
  const availableAmbulanceCount = ambulances.filter((a) => a.status === 'available').length;
  const availableDoctorsCount = doctors.filter((d) => d.status === 'available').length;

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 text-slate-100 font-sans selection:bg-red-500 selection:text-white flex flex-col">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP HEADER: RECEPTION & ER TRIAGE COMMAND BAR */}
      {/* ========================================================================= */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 sticky top-0 z-30 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Left: Brand Identity + Reception In-Charge Badge */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => setMode('landing')}
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30 cursor-pointer hover:scale-105 transition-transform shrink-0"
              title="Return to Home"
            >
              <Activity className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-black text-white tracking-tight">
                  Prathmikta <span className="text-red-500">Reception Desk</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  ER Front-Desk Triage
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {activeHospital.name} &bull; <span className="text-slate-300">Shift Officer: Priyanka Saxena</span>
              </p>
            </div>
          </div>

          {/* Right: Real-Time Clock, Quick Walk-in Button & Hotline */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {/* Live Clock */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs font-black text-emerald-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
              <span>{currentTime || '12:00:00 PM'}</span>
            </div>

            {/* Quick New Walk-In Patient Button */}
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setIsWalkinModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/30 cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ Register Walk-In</span>
            </button>

            {/* Hotline Call */}
            <a
              href="tel:108"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              <span>108 / 112 Hotline</span>
            </a>

            {/* Switch to Citizen or Hospital View */}
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setMode('hospital');
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>Command Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 5 CRITICAL KPI STATS BAR */}
      {/* ========================================================================= */}
      <section className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 py-3.5 shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          
          {/* Stat 1: Incoming Emergency En-Route */}
          <div
            onClick={() => setActiveTab('incoming')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'incoming'
                ? 'bg-red-950/40 border-red-500/50 shadow-md shadow-red-500/10'
                : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-red-400">
              <span>Incoming Patients</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            </div>
            <div className="text-2xl font-black text-white pt-1">
              {totalIncoming} <span className="text-xs text-slate-400 font-medium">Inbound</span>
            </div>
            <div className="text-[10px] text-red-300/80 font-medium pt-0.5 truncate">
              Nearest in 3 mins (Cardiac)
            </div>
          </div>

          {/* Stat 2: ₹500 Pre-Deposit Paid (Token Secured Fast-Track) */}
          <div
            onClick={() => setActiveTab('incoming')}
            className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-blue-400">
              <span>₹500 Pre-Deposit Paid</span>
              <CreditCard className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400 pt-1">
              {totalPaidToken} <span className="text-xs text-slate-400 font-medium">Fast-Track</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-medium pt-0.5">
              ✓ Direct to Bed (Zero Counter Lag)
            </div>
          </div>

          {/* Stat 3: Vacant ICU & Emergency Beds */}
          <div
            onClick={() => setActiveTab('beds')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'beds'
                ? 'bg-emerald-950/40 border-emerald-500/50'
                : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
              <span>ICU &amp; NICU Beds</span>
              <BedDouble className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 pt-1">
              {bedMatrix.icu.vacant + bedMatrix.nicu.vacant}{' '}
              <span className="text-xs text-slate-400 font-medium">
                Vacant / {bedMatrix.icu.total + bedMatrix.nicu.total}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium pt-0.5">
              ICU: {bedMatrix.icu.vacant} &bull; NICU: {bedMatrix.nicu.vacant} Free
            </div>
          </div>

          {/* Stat 4: Ambulances at ER Bay */}
          <div
            onClick={() => setActiveTab('ambulances')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'ambulances'
                ? 'bg-amber-950/40 border-amber-500/50'
                : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
              <span>Ambulances at Bay</span>
              <Truck className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 pt-1">
              {availableAmbulanceCount}{' '}
              <span className="text-xs text-slate-400 font-medium">
                Ready / {ambulances.length} Fleet
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium pt-0.5">
              2 ALS + 1 NICU Standby
            </div>
          </div>

          {/* Stat 5: Doctors on Floor & Available */}
          <div
            onClick={() => setActiveTab('doctors')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
              activeTab === 'doctors'
                ? 'bg-purple-950/40 border-purple-500/50'
                : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-purple-400">
              <span>Doctors On Floor</span>
              <Stethoscope className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400 pt-1">
              {availableDoctorsCount}{' '}
              <span className="text-xs text-slate-400 font-medium">
                Available / {doctors.length} Total
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium pt-0.5">
              2 In OT &bull; 1 On Rounds
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* TAB NAVIGATION: RECEPTION MODULES */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/40 border-b border-slate-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4 overflow-x-auto py-2.5">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('incoming');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'incoming'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Incoming Patients ({incomingPatients.filter((p) => p.status !== 'admitted').length})</span>
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('beds');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'beds'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BedDouble className="w-4 h-4" />
            <span>Bed Live Matrix (ICU / NICU / Wards)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('doctors');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'doctors'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor Roster &amp; Timings ({doctors.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('ambulances');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'ambulances'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Ambulance Fleet ({availableAmbulanceCount} Available)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab('gates');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'gates'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Gate &amp; Stretcher Ramp Dispatch</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN VIEW CONTENT CONTAINER */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* ===================================================================== */}
        {/* TAB 1: INCOMING PATIENTS & ₹500 PRE-DEPOSIT QUEUE */}
        {/* ===================================================================== */}
        {activeTab === 'incoming' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                  Live Inbound Emergency Arrivals
                </h2>
                <p className="text-xs text-slate-400">
                  Pre-triage telemetry, real-time ETA, deposit verification, and direct Gate ramp allocation.
                </p>
              </div>

              {/* Fast Filter Pills */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Filter:</span>
                <span className="px-2.5 py-1 rounded-lg bg-red-900/40 text-red-300 font-bold border border-red-500/30">
                  Code Red ({incomingPatients.filter((p) => p.severity === 'RED').length})
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-900/40 text-blue-300 font-bold border border-blue-500/30">
                  ₹500 Paid Tokens ({incomingPatients.filter((p) => p.isTokenDepositPaid).length})
                </span>
              </div>
            </div>

            {/* Patient Cards List */}
            <div className="grid grid-cols-1 gap-4">
              {incomingPatients.map((patient) => (
                <div
                  key={patient.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    patient.status === 'admitted'
                      ? 'bg-slate-900/40 border-slate-800 opacity-60'
                      : patient.severity === 'RED'
                      ? 'bg-gradient-to-r from-red-950/30 via-slate-900/90 to-slate-900/90 border-red-500/40 shadow-xl shadow-red-950/20'
                      : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Left: Patient Emergency Identity & Vitals */}
                    <div className="space-y-3 flex-1">
                      
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* ETA Countdown Badge */}
                        <div className="px-3 py-1 rounded-xl bg-red-600 text-white text-xs font-black flex items-center gap-1.5 animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {patient.status === 'admitted'
                              ? 'ADMITTED ON BED'
                              : patient.etaMinutes === 0
                              ? 'ARRIVED AT BAY'
                              : `ETA: ${patient.etaMinutes} MINS (${patient.distanceKm} km)`}
                          </span>
                        </div>

                        {/* Severity Code */}
                        <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-red-500/20 text-red-400 border border-red-500/30">
                          {patient.category.toUpperCase()} &bull; CODE {patient.severity}
                        </span>

                        {/* ₹500 Pre-Deposit Paid Badge vs Unpaid */}
                        {patient.isTokenDepositPaid ? (
                          <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>₹500 PRE-DEPOSIT PAID (FAST-TRACK BED LOCKED)</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            <span>Pay at Counter ({patient.paymentMethod})</span>
                          </span>
                        )}

                        {patient.tokenNumber && (
                          <span className="px-2.5 py-1 rounded-xl text-[11px] font-mono text-slate-300 bg-slate-800 border border-slate-700">
                            Token: {patient.tokenNumber}
                          </span>
                        )}
                      </div>

                      {/* Patient Name, Age, Phone */}
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-black text-white tracking-tight">
                            {patient.name}
                          </h3>
                          <span className="text-sm text-slate-400 font-bold">
                            {patient.age} yrs &bull; {patient.gender}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            📞 {patient.phone}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-red-300 pt-0.5">
                          {patient.condition}
                        </p>
                      </div>

                      {/* Vitals Summary Pill Grid */}
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-300">
                        <div className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                          BP: <span className="text-emerald-400">{patient.vitals.bp}</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                          SpO2: <span className="text-blue-400">{patient.vitals.spo2}%</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                          Pulse: <span className="text-rose-400">{patient.vitals.pulse} bpm</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                          Consciousness: <span className="text-purple-400">{patient.vitals.gcs}</span>
                        </div>
                      </div>

                      {/* Allocated Gate & Bed Destination */}
                      <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <Compass className="w-4 h-4 text-blue-400 shrink-0" />
                          <div>
                            <span className="text-slate-400 font-medium">Routing Gate: </span>
                            <span className="text-white font-bold">{patient.assignedGate}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <BedDouble className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <span className="text-slate-400 font-medium">Pre-Allocated Bed: </span>
                            <span className="text-emerald-300 font-bold">{patient.assignedBed}</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right: Reception Action Controls */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                      
                      {/* Stretcher Dispatch Trigger */}
                      <button
                        type="button"
                        onClick={() => handleToggleStretcherDispatch(patient.id)}
                        className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          patient.stretcherDispatched
                            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600/40'
                            : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25'
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>
                          {patient.stretcherDispatched
                            ? '✓ Stretcher Team Dispatched'
                            : '⚡ Send Stretcher to Gate'}
                        </span>
                      </button>

                      {/* Print Gate Pass & Token */}
                      <button
                        type="button"
                        onClick={() => setSelectedPatientForPass(patient)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Printer className="w-4 h-4 text-slate-400" />
                        <span>Print Gate Token Pass</span>
                      </button>

                      {/* Admit & Bed Occupy Action */}
                      {patient.status !== 'admitted' ? (
                        <button
                          type="button"
                          onClick={() => handleAdmitPatient(patient.id)}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer transition-all active:scale-95"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Admit to Bed</span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 py-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Admitted in Ward
                        </span>
                      )}

                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 2: BED LIVE AVAILABILITY MATRIX (ICU, NICU, EMERGENCY, WARDS) */}
        {/* ===================================================================== */}
        {activeTab === 'beds' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-emerald-400" />
                  Hospital Real-Time Bed Availability &amp; Occupancy
                </h2>
                <p className="text-xs text-slate-400">
                  Live synced counts of critical ICU, NICU, Ventilators, and Emergency Observation units.
                </p>
              </div>
            </div>

            {/* 6 Category Bed Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* 1. ICU Beds */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center font-black">
                      ICU
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">Intensive Care (ICU)</h3>
                      <p className="text-xs text-slate-400 font-medium">Floor 1 &bull; Critical Care Unit</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {bedMatrix.icu.vacant} Free
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Occupancy: {bedMatrix.icu.occupied} / {bedMatrix.icu.total} Beds</span>
                    <span>{Math.round((bedMatrix.icu.occupied / bedMatrix.icu.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-red-500 h-2.5 rounded-full transition-all"
                      style={{ width: `${(bedMatrix.icu.occupied / bedMatrix.icu.total) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs text-slate-400">
                  <span>Cath Lab Standby: Active</span>
                  <span className="text-emerald-400 font-bold">5 Beds Available Now</span>
                </div>
              </div>

              {/* 2. NICU Beds (Neonatal ICU) */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">
                      <Baby className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">Neonatal ICU (NICU)</h3>
                      <p className="text-xs text-slate-400 font-medium">Gate 2 Ramp &bull; Pediatric Ward</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {bedMatrix.nicu.vacant} Free
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Occupancy: {bedMatrix.nicu.occupied} / {bedMatrix.nicu.total} Warmers</span>
                    <span>{Math.round((bedMatrix.nicu.occupied / bedMatrix.nicu.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full transition-all"
                      style={{ width: `${(bedMatrix.nicu.occupied / bedMatrix.nicu.total) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs text-slate-400">
                  <span>Incubator Support: Ready</span>
                  <span className="text-emerald-400 font-bold">6 Warmers Available</span>
                </div>
              </div>

              {/* 3. Emergency / Trauma Observation Beds */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                      ER
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">Trauma &amp; ER Bays</h3>
                      <p className="text-xs text-slate-400 font-medium">Gate 1 Ramp &bull; Resuscitation</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {bedMatrix.emergency.vacant} Free
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Occupancy: {bedMatrix.emergency.occupied} / {bedMatrix.emergency.total} Beds</span>
                    <span>{Math.round((bedMatrix.emergency.occupied / bedMatrix.emergency.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2.5 rounded-full transition-all"
                      style={{ width: `${(bedMatrix.emergency.occupied / bedMatrix.emergency.total) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs text-slate-400">
                  <span>Resus Bay 1 &amp; 2: Ready</span>
                  <span className="text-emerald-400 font-bold">8 Beds Available</span>
                </div>
              </div>

              {/* 4. Ventilator Units */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black">
                      <Wind className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">Life Support Ventilators</h3>
                      <p className="text-xs text-slate-400 font-medium">Mechanical Invasive / CPAP</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {bedMatrix.ventilators.ready} Ready
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>In-Use: {bedMatrix.ventilators.inUse} / {bedMatrix.ventilators.total} Units</span>
                    <span>{Math.round((bedMatrix.ventilators.inUse / bedMatrix.ventilators.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-purple-500 h-2.5 rounded-full transition-all"
                      style={{ width: `${(bedMatrix.ventilators.inUse / bedMatrix.ventilators.total) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs text-slate-400">
                  <span>Central O2 Pipeline: 100%</span>
                  <span className="text-emerald-400 font-bold">5 Machines Ready</span>
                </div>
              </div>

              {/* 5. HDU (High Dependency Unit) */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
                      HDU
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">High Dependency (HDU)</h3>
                      <p className="text-xs text-slate-400 font-medium">Step-Down Post-Crisis Ward</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {bedMatrix.hdu.vacant} Free
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Occupancy: {bedMatrix.hdu.occupied} / {bedMatrix.hdu.total} Beds</span>
                    <span>{Math.round((bedMatrix.hdu.occupied / bedMatrix.hdu.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-cyan-500 h-2.5 rounded-full transition-all"
                      style={{ width: `${(bedMatrix.hdu.occupied / bedMatrix.hdu.total) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs text-slate-400">
                  <span>Monitored Cardiac Telemetry</span>
                  <span className="text-emerald-400 font-bold">4 Beds Available</span>
                </div>
              </div>

              {/* 6. General Wards */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-700 text-slate-300 flex items-center justify-center font-black">
                      GEN
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">General In-Patient Wards</h3>
                      <p className="text-xs text-slate-400 font-medium">Floors 3 &amp; 4</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {bedMatrix.general.vacant} Free
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Occupancy: {bedMatrix.general.occupied} / {bedMatrix.general.total} Beds</span>
                    <span>{Math.round((bedMatrix.general.occupied / bedMatrix.general.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-slate-500 h-2.5 rounded-full transition-all"
                      style={{ width: `${(bedMatrix.general.occupied / bedMatrix.general.total) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs text-slate-400">
                  <span>Male &amp; Female Wards</span>
                  <span className="text-emerald-400 font-bold">22 Beds Available</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 3: DOCTOR ROSTER, AVAILABILITY & TIMINGS */}
        {/* ===================================================================== */}
        {activeTab === 'doctors' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-purple-400" />
                  Doctor &amp; Specialist Live Duty Roster
                </h2>
                <p className="text-xs text-slate-400">
                  Track who is currently available on floor and return timings for doctors in OT / Rounds / Shifts.
                </p>
              </div>

              {/* Doctor Search & Filter Tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search doctor or specialty..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Filter Dropdown/Pills */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                  {(['all', 'available', 'in_ot', 'on_rounds', 'off_duty'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setDoctorFilter(filter)}
                      className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                        doctorFilter === filter
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {filter.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Doctor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    doc.status === 'available'
                      ? 'bg-slate-900/90 border-emerald-500/30'
                      : doc.status === 'in_ot'
                      ? 'bg-slate-900/90 border-red-500/30'
                      : doc.status === 'on_rounds'
                      ? 'bg-slate-900/90 border-amber-500/30'
                      : 'bg-slate-900/50 border-slate-800 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-white">{doc.name}</h3>
                        
                        {/* Status Badge */}
                        {doc.status === 'available' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            AVAILABLE NOW
                          </span>
                        )}
                        {doc.status === 'in_ot' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            IN EMERGENCY OT
                          </span>
                        )}
                        {doc.status === 'on_rounds' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            ON ICU ROUNDS
                          </span>
                        )}
                        {doc.status === 'off_duty' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            OFF DUTY
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-purple-400">
                        {doc.speciality} &bull; <span className="text-slate-300">{doc.department}</span>
                      </div>

                      <div className="text-xs text-slate-400 pt-1 space-y-0.5">
                        <div>
                          📍 <span className="text-slate-300 font-medium">{doc.location}</span>
                        </div>
                        <div>
                          ⏰ Shift: <span className="text-slate-300 font-medium">{doc.currentShift}</span>
                        </div>
                        {doc.returnTime && (
                          <div className="text-amber-300 font-bold pt-0.5">
                            ⏳ Next Available Timing:{' '}
                            <span className="text-white bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
                              {doc.returnTime}
                            </span>
                          </div>
                        )}
                        {doc.onCallSub && (
                          <div className="text-slate-400 text-[11px] pt-0.5">
                            On-Call Sub: <span className="text-slate-300">{doc.onCallSub}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Page Doctor Action */}
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => handlePageDoctor(doc.name, doc.location)}
                        className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold transition-all cursor-pointer"
                      >
                        📢 Page to ER
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 4: AMBULANCE FLEET READINESS (KITNI AMBULANCE BACHI HAIN) */}
        {/* ===================================================================== */}
        {activeTab === 'ambulances' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-400" />
                  Hospital Ambulance Fleet Readiness &amp; Bay Tracker
                </h2>
                <p className="text-xs text-slate-400">
                  Live availability of ALS, BLS, and Neonatal Incubator response vehicles.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {availableAmbulanceCount} Ready at Bay
                </span>
                <span className="px-3 py-1 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                  {ambulances.length - availableAmbulanceCount} En-Route / Dispatched
                </span>
              </div>
            </div>

            {/* Ambulance Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ambulances.map((amb) => (
                <div
                  key={amb.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    amb.status === 'available'
                      ? 'bg-slate-900/90 border-emerald-500/30'
                      : 'bg-slate-900/90 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black text-white tracking-wide">
                          {amb.vehicleNumber}
                        </span>
                        
                        {amb.status === 'available' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            READY AT BAY
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            ON MISSION (ETA: {amb.etaMinutes}m)
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-amber-400">
                        {amb.type}
                      </div>

                      <div className="text-xs text-slate-300 space-y-1 pt-1">
                        <div>
                          👨‍✈️ Driver: <span className="font-bold text-white">{amb.driverName}</span> &bull; 📞 {amb.driverPhone}
                        </div>
                        <div>
                          📍 Bay Location: <span className="font-medium text-slate-200">{amb.bayLocation}</span>
                        </div>
                        {amb.currentLocation && (
                          <div className="text-amber-300 font-medium">
                            🚨 Live Position: {amb.currentLocation}
                          </div>
                        )}
                        <div className="text-emerald-400 font-bold text-[11px]">
                          ⚡ Oxygen &amp; Kit: {amb.oxygenStatus}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {amb.status === 'available' ? (
                        <button
                          type="button"
                          onClick={() => {
                            playConfirmChime();
                            showToast(`🚑 Dispatched ${amb.vehicleNumber} (${amb.driverName}) for emergency call!`);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/30 transition-all cursor-pointer"
                        >
                          Dispatch Ambulance
                        </button>
                      ) : (
                        <a
                          href={`tel:${amb.driverPhone}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-700"
                        >
                          <PhoneCall className="w-3 h-3 text-amber-400" />
                          Call Driver
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 5: GATE & STRETCHER RAMP ALLOCATION GUIDE */}
        {/* ===================================================================== */}
        {activeTab === 'gates' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-400" />
                Hospital Emergency Gate &amp; Stretcher Ramp Dispatch
              </h2>
              <p className="text-xs text-slate-400">
                Direct ambulance drivers, stretchers, and incoming families to the designated emergency gates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Gate 1 */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-red-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-red-600/30">
                      G1
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Gate 1: Emergency Trauma &amp; Stretcher Ramp</h3>
                      <p className="text-xs text-red-400 font-bold">CRITICAL CODE RED &bull; STRETCHER PRIORITY</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-red-500/20 text-red-400 border border-red-500/30">
                    RAMP CLEAR
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Direct ramp access for ALS ambulances, Severe Polytrauma, Cardiac STEMI arrests, and Stretcher arrivals. Direct connectivity to Resus Bays and Floor 1 Cath Lab.
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                  <span className="text-slate-400 font-medium">Stretcher Wardens on Duty: 4 Ready</span>
                  <button
                    type="button"
                    onClick={() => {
                      playConfirmChime();
                      showToast('📢 All Stretcher Teams alerted to stand by at Gate 1 Ramp!');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                  >
                    Alert Gate 1 Stretcher Bay
                  </button>
                </div>
              </div>

              {/* Gate 2 */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-blue-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
                      G2
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Gate 2: Pediatric &amp; NICU Maternity Ramp</h3>
                      <p className="text-xs text-blue-400 font-bold">NEONATAL &bull; PREGNANCY &bull; CHILD ER</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    CLEAR
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Dedicated warm-corridor ramp directly entering the Neonatal Intensive Care Unit (NICU), Labor Suites, and Pediatric emergency beds.
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                  <span className="text-slate-400 font-medium">Transport Incubators: 2 Standby</span>
                  <button
                    type="button"
                    onClick={() => {
                      playConfirmChime();
                      showToast('📢 NICU Nursing team notified for incoming Gate 2 arrival!');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    Alert Gate 2 NICU Team
                  </button>
                </div>
              </div>

              {/* Gate 3 */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-200 font-black text-lg flex items-center justify-center">
                      G3
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Gate 3: Walk-In Triage &amp; Registration Desks</h3>
                      <p className="text-xs text-slate-400 font-bold">AMBER &amp; GREEN WALK-IN PATIENTS</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    3 COUNTERS OPEN
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  For ambulatory patients, non-critical fever/fractures, family inquiries, and fast-track token validation.
                </p>
              </div>

              {/* Gate 4 */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-purple-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-lg flex items-center justify-center">
                      G4
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Gate 4: Emergency OT &amp; Isolation Corridor</h3>
                      <p className="text-xs text-purple-400 font-bold">DIRECT OT SURGERY &bull; BURN CARE</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    RESTRICTED
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Restricted sterile access elevator leading straight to OT Complex 1 &amp; 2 and Burn Unit ICU.
                </p>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL: PRINT FAST-TRACK GATE PASS & BED TOKEN */}
      {/* ========================================================================= */}
      {selectedPatientForPass && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-600">
                  Prathmikta Emergency Protocol
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  ER Fast-Track Gate &amp; Bed Slip
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatientForPass(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Content */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Hospital:</span>
                <span className="font-bold text-slate-900">{activeHospital.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold text-slate-900">{selectedPatientForPass.name} ({selectedPatientForPass.age}y/{selectedPatientForPass.gender})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Triage Severity:</span>
                <span className="font-black text-red-600">CODE {selectedPatientForPass.severity} &bull; {selectedPatientForPass.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Gate:</span>
                <span className="font-black text-blue-700">{selectedPatientForPass.assignedGate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Allocated Bed:</span>
                <span className="font-black text-emerald-700">{selectedPatientForPass.assignedBed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deposit Status:</span>
                <span className="font-bold text-emerald-600">
                  {selectedPatientForPass.isTokenDepositPaid ? '₹500 PRE-PAID TOKEN VERIFIED' : 'Pay at ER Counter'}
                </span>
              </div>
              {selectedPatientForPass.tokenNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Token ID:</span>
                  <span className="font-bold text-slate-800">{selectedPatientForPass.tokenNumber}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPatientForPass(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  playConfirmChime();
                  showToast('🖨️ Gate Pass sent to Reception Slip Thermal Printer!');
                  setSelectedPatientForPass(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Thermal Slip</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTER SUDDEN WALK-IN PATIENT */}
      {/* ========================================================================= */}
      {isWalkinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-500">
                  Instant ER Intake
                </span>
                <h3 className="text-lg font-black text-white">
                  Register Sudden Walk-In / Stretcher Patient
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWalkinModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWalkin} className="space-y-4 text-xs font-bold text-slate-300">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-slate-400">Patient Full Name:</label>
                <input
                  type="text"
                  required
                  value={newWalkinName}
                  onChange={(e) => setNewWalkinName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-red-500 text-sm font-semibold"
                />
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Age (Years):</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={newWalkinAge}
                    onChange={(e) => setNewWalkinAge(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-red-500 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Gender:</label>
                  <select
                    value={newWalkinGender}
                    onChange={(e: any) => setNewWalkinGender(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-red-500 font-semibold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Emergency Category */}
              <div className="space-y-1">
                <label className="text-slate-400">Emergency Condition Category:</label>
                <select
                  value={newWalkinEmergency}
                  onChange={(e) => setNewWalkinEmergency(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-red-500 font-semibold"
                >
                  <option value="Cardiac">Cardiac / Chest Pain</option>
                  <option value="Trauma">Severe Trauma / Hemorrhage</option>
                  <option value="Stroke">Stroke / Paralysis</option>
                  <option value="Pediatric / NICU">Pediatric / Neonatal NICU</option>
                  <option value="Respiratory">Breathing / Asthma</option>
                </select>
              </div>

              {/* Gate Assignment */}
              <div className="space-y-1">
                <label className="text-slate-400">Designated Arrival Gate:</label>
                <select
                  value={newWalkinGate}
                  onChange={(e: any) => setNewWalkinGate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-red-500 font-semibold"
                >
                  <option value="Gate 1 (Emergency Trauma & Stretcher Ramp)">Gate 1 (Emergency Trauma &amp; Stretcher Ramp)</option>
                  <option value="Gate 2 (Pediatric & NICU Ramp)">Gate 2 (Pediatric &amp; NICU Ramp)</option>
                  <option value="Gate 3 (Walk-In ER Triage)">Gate 3 (Walk-In ER Triage)</option>
                  <option value="Gate 4 (OT & Cath Lab Bay)">Gate 4 (OT &amp; Cath Lab Bay)</option>
                </select>
              </div>

              {/* ₹500 Pre-Deposit Toggle */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-black text-white">₹500 Pre-Admission Deposit Collected?</div>
                  <div className="text-[11px] text-slate-400 font-normal">Locks bed &amp; fast-tracks triage immediately</div>
                </div>
                <input
                  type="checkbox"
                  checked={newWalkinDepositPaid}
                  onChange={(e) => setNewWalkinDepositPaid(e.target.checked)}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsWalkinModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black shadow-lg shadow-red-600/30"
                >
                  Confirm &amp; Dispatch to Gate
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
