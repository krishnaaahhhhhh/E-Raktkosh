import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import {
  Activity,
  Bell,
  ChevronDown,
  Clock,
  Filter,
  MoreVertical,
  Plus,
  ArrowRight,
  Shield,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  MapPin,
  Flame,
  Heart,
  Wind,
  Brain,
  Stethoscope,
  Maximize2,
  Layers,
  Sparkles,
  BedDouble,
  Radio,
  RefreshCw,
  Search,
  Check,
  X,
  Play,
  Pause,
  Printer,
  ChevronRight,
  AlertOctagon,
  Building2,
  Users,
  Compass,
  Volume2,
  VolumeX,
  Share2,
  Info
} from 'lucide-react';
import { playTactileClick, playConfirmChime, playCodeRedAlert, playCodeAmberAlert } from '../../lib/audio';

// Types for Hospital Reception Command Center
interface DoctorItem {
  id: string;
  specialist: string;
  doctor: string;
  avatar: string;
  status: 'Available' | 'On Call' | 'In OT' | 'On Rounds';
  availableTill: string;
  dept: string;
}

interface PatientQueueItem {
  id: string;
  caseId: string;
  ageGender: string;
  patientName: string;
  type: string;
  etaMinutes: number;
  status: 'In Queue' | 'In Transit' | 'Admitted' | 'Discharged';
  priority: 'TRAUMA RED' | 'YELLOW' | 'GREEN';
  ambulanceId: string;
  lat: number;
  lng: number;
  conditionCategory: 'trauma' | 'cardiac' | 'respiratory' | 'pediatric' | 'general';
  assignedBed?: string;
  assignedDoctor?: string;
  admittedAt?: string;
  vitals?: { bp: string; spo2: number; hr: number };
}

interface StretcherZone {
  id: string;
  zone: string;
  available: number;
  inUse: number;
  staffAssigned: number;
  lastUpdate: string;
}

interface StaffDuty {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'On Duty' | 'On Break' | 'Dispatched';
  assignedGate?: string;
}

export const HospitalReceptionDashboard: React.FC = () => {
  const { setMode, emitBedSync, emitTelemetryLog, emitTokenCreate, liveTokens } = usePrathmikta();

  // Active Navigation Tab on Left Sidebar
  const [activeSidebarNav, setActiveSidebarNav] = useState<string>('command_dashboard');

  // Selected Hospital Facility
  const [selectedHospital, setSelectedHospital] = useState<string>('GSVM Medical College, Kanpur');
  const [isHospitalDropdownOpen, setIsHospitalDropdownOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Audio mute toggle
  const [isMuted, setIsMuted] = useState(false);

  // Live System Clock
  const [currentTime, setCurrentTime] = useState<string>('');
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

  // 1. Doctor Availability Roster
  const [doctorRoster, setDoctorRoster] = useState<DoctorItem[]>([
    {
      id: 'doc-1',
      specialist: 'Trauma Surgery',
      doctor: 'Dr. A. Singh',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80',
      status: 'Available',
      availableTill: '02:00 PM',
      dept: 'Trauma OT 1'
    },
    {
      id: 'doc-2',
      specialist: 'Emergency Medicine',
      doctor: 'Dr. P. Sharma',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80',
      status: 'Available',
      availableTill: '01:30 PM',
      dept: 'ER Resus Bay'
    },
    {
      id: 'doc-3',
      specialist: 'Neurosurgery',
      doctor: 'Dr. R. Verma',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop&q=80',
      status: 'On Call',
      availableTill: 'On Call',
      dept: 'Neuro ICU'
    },
    {
      id: 'doc-4',
      specialist: 'Cardiology',
      doctor: 'Dr. M. Khanna',
      avatar: 'https://images.unsplash.com/photo-1594824813590-785d0d8bb1bb?w=100&auto=format&fit=crop&q=80',
      status: 'Available',
      availableTill: '12:45 PM',
      dept: 'Cath Lab 2'
    },
    {
      id: 'doc-5',
      specialist: 'Anesthesiology',
      doctor: 'Dr. S. Iyer',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&auto=format&fit=crop&q=80',
      status: 'Available',
      availableTill: '01:15 PM',
      dept: 'Emergency Critical'
    },
    {
      id: 'doc-6',
      specialist: 'Orthopedics',
      doctor: 'Dr. K. Patel',
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&auto=format&fit=crop&q=80',
      status: 'On Call',
      availableTill: 'On Call',
      dept: 'Trauma Ward 3'
    }
  ]);

  // 2. LIVE BED INVENTORY (Automatically decrements upon auto-admission)
  const [bedCapacity, setBedCapacity] = useState({
    icu: { total: 24, occupied: 16, label: 'ICU Beds' },
    nicu: { total: 12, occupied: 7, label: 'NICU Warmers' },
    traumaBay: { total: 8, occupied: 5, label: 'ER Trauma Bays' },
    ventilators: { total: 18, inUse: 12, label: 'Ventilators' },
    generalWard: { total: 120, occupied: 94, label: 'General Beds' }
  });

  // Recent Auto-Admission Log
  const [recentAdmissionsLog, setRecentAdmissionsLog] = useState<
    Array<{ id: string; time: string; text: string; type: 'admit' | 'discharge' | 'stretcher' }>
  >([
    {
      id: 'log-1',
      time: '10:22:15 AM',
      text: 'Auto-Triage synced with NHM Emergency Dispatch (Kanpur Grid)',
      type: 'admit'
    },
    {
      id: 'log-2',
      time: '10:20:04 AM',
      text: 'Patient TNX-2024-1255 stabilized & transferred to Step-Down Unit (ICU bed freed)',
      type: 'discharge'
    }
  ]);

  // 3. In-Queue & In-Transit Live Tracker
  const [trackerTab, setTrackerTab] = useState<'in_queue' | 'in_transit'>('in_queue');
  const [patients, setPatients] = useState<PatientQueueItem[]>([
    {
      id: 'pt-1',
      caseId: 'TNX-2024-1258',
      ageGender: '32Y / Male',
      patientName: 'Rohan Sharma',
      type: 'Road Traffic Accident',
      etaMinutes: 12,
      status: 'In Queue',
      priority: 'TRAUMA RED',
      ambulanceId: 'UP-78-AMB-101',
      lat: 26.852,
      lng: 80.938,
      conditionCategory: 'trauma',
      vitals: { bp: '85/55', spo2: 88, hr: 132 }
    },
    {
      id: 'pt-2',
      caseId: 'TNX-2024-1259',
      ageGender: '26Y / Female',
      patientName: 'Pooja Verma',
      type: 'Fall Injury',
      etaMinutes: 18,
      status: 'In Queue',
      priority: 'TRAUMA RED',
      ambulanceId: 'UP-78-AMB-204',
      lat: 26.839,
      lng: 80.952,
      conditionCategory: 'trauma',
      vitals: { bp: '100/65', spo2: 93, hr: 110 }
    },
    {
      id: 'pt-3',
      caseId: 'TNX-2024-1260',
      ageGender: '45Y / Male',
      patientName: 'Anil Kumar Gupta',
      type: 'Chest Pain',
      etaMinutes: 25,
      status: 'In Queue',
      priority: 'YELLOW',
      ambulanceId: 'UP-78-AMB-309',
      lat: 26.865,
      lng: 80.925,
      conditionCategory: 'cardiac',
      vitals: { bp: '165/100', spo2: 95, hr: 104 }
    },
    {
      id: 'pt-4',
      caseId: 'TNX-2024-1261',
      ageGender: '60Y / Female',
      patientName: 'Kamla Devi',
      type: 'Breathlessness',
      etaMinutes: 28,
      status: 'In Queue',
      priority: 'YELLOW',
      ambulanceId: 'UP-78-AMB-412',
      lat: 26.828,
      lng: 80.968,
      conditionCategory: 'respiratory',
      vitals: { bp: '135/88', spo2: 89, hr: 98 }
    },
    {
      id: 'pt-5',
      caseId: 'TNX-2024-1262',
      ageGender: '10Y / Male',
      patientName: 'Aarav Dixit',
      type: 'Fever & Dehydration',
      etaMinutes: 35,
      status: 'In Queue',
      priority: 'GREEN',
      ambulanceId: 'UP-78-AMB-515',
      lat: 26.872,
      lng: 80.912,
      conditionCategory: 'pediatric',
      vitals: { bp: '105/70', spo2: 98, hr: 92 }
    }
  ]);

  // In Transit Patients
  const inTransitPatients = useMemo(() => {
    return patients.filter((p) => p.status === 'In Transit' || p.etaMinutes <= 20);
  }, [patients]);

  const inQueuePatients = useMemo(() => {
    return patients.filter((p) => p.status === 'In Queue');
  }, [patients]);

  // 4. Token Desk State
  const [currentToken, setCurrentToken] = useState({
    tokenNumber: 'TNX-2024-1258',
    priority: 'TRAUMA RED',
    amount: 500,
    patientAgeGender: '32Y / Male',
    bookedBy: 'CityCare Ambulance',
    time: '10:24:18 AM',
    status: 'Confirmed'
  });
  const [tokenHistoryModal, setTokenHistoryModal] = useState(false);
  const [generateTokenModal, setGenerateTokenModal] = useState(false);

  // 5. Stretcher Staff Welfare Matrix
  const [stretcherStats, setStretcherStats] = useState({
    available: 12,
    inUse: 8,
    inMaintenance: 2,
    staffOnDuty: 28
  });

  const [stretcherZones, setStretcherZones] = useState<StretcherZone[]>([
    { id: 'zone-1', zone: 'Emergency Gate', available: 4, inUse: 2, staffAssigned: 6, lastUpdate: '10:23 AM' },
    { id: 'zone-2', zone: 'OPD Block', available: 3, inUse: 1, staffAssigned: 5, lastUpdate: '10:22 AM' },
    { id: 'zone-3', zone: 'Trauma Center', available: 2, inUse: 3, staffAssigned: 7, lastUpdate: '10:24 AM' },
    { id: 'zone-4', zone: 'Radiology Block', available: 2, inUse: 1, staffAssigned: 4, lastUpdate: '10:21 AM' },
    { id: 'zone-5', zone: 'ICU Block', available: 1, inUse: 1, staffAssigned: 3, lastUpdate: '10:20 AM' }
  ]);

  const [activeStaffList, setActiveStaffList] = useState<StaffDuty[]>([
    {
      id: 'st-1',
      name: 'Ramesh Yadav',
      role: 'Team Lead',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      status: 'On Duty'
    },
    {
      id: 'st-2',
      name: 'Sanjay Kumar',
      role: 'Stretcher Bearer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      status: 'On Duty'
    },
    {
      id: 'st-3',
      name: 'Amit Singh',
      role: 'Stretcher Bearer',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
      status: 'On Duty'
    },
    {
      id: 'st-4',
      name: 'Vikram Patel',
      role: 'Stretcher Bearer',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
      status: 'On Duty'
    }
  ]);

  // Auto-admission & ETA countdown simulation engine
  const [isAutoAdmissionActive, setIsAutoAdmissionActive] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState<'1x' | '3x'>('1x');
  const [latestAdmittedToast, setLatestAdmittedToast] = useState<{
    caseId: string;
    type: string;
    bedAssigned: string;
    time: string;
  } | null>(null);

  // Active Modals
  const [activeModal, setActiveModal] = useState<
    'doctor_roster' | 'live_map' | 'stretcher_dispatch' | 'emergency_override' | 'new_patient' | 'bed_manager' | null
  >(null);

  // ==========================================
  // CORE ENGINE: AUTOMATIC BED DEDUCTION LOGIC
  // ==========================================
  const performAutoAdmission = (patient: PatientQueueItem) => {
    let targetBedName = '';
    let targetBedType: 'icu' | 'traumaBay' | 'nicu' | 'generalWard' = 'generalWard';
    let needsVentilator = false;

    // Categorize bed allocation automatically based on clinical triage condition
    if (patient.conditionCategory === 'trauma' || patient.priority === 'TRAUMA RED') {
      if (bedCapacity.traumaBay.occupied < bedCapacity.traumaBay.total) {
        targetBedType = 'traumaBay';
        targetBedName = `Trauma Bay #${bedCapacity.traumaBay.occupied + 1}`;
      } else {
        targetBedType = 'icu';
        targetBedName = `ICU Bed #${bedCapacity.icu.occupied + 1}`;
      }
      needsVentilator = true;
    } else if (patient.conditionCategory === 'cardiac') {
      targetBedType = 'icu';
      targetBedName = `Cardiac ICU Bed #${bedCapacity.icu.occupied + 1}`;
      needsVentilator = true;
    } else if (patient.conditionCategory === 'respiratory') {
      targetBedType = 'icu';
      targetBedName = `Respiratory HDU #${bedCapacity.icu.occupied + 1}`;
      needsVentilator = true;
    } else if (patient.conditionCategory === 'pediatric') {
      targetBedType = 'nicu';
      targetBedName = `NICU Warmer #${bedCapacity.nicu.occupied + 1}`;
    } else {
      targetBedType = 'generalWard';
      targetBedName = `General Ward Bed #${bedCapacity.generalWard.occupied + 1}`;
    }

    // 1. Automatically increment occupied count (reduces available capacity)
    setBedCapacity((prev) => ({
      ...prev,
      [targetBedType]: {
        ...prev[targetBedType],
        occupied: Math.min(prev[targetBedType].total, prev[targetBedType].occupied + 1)
      },
      ventilators: needsVentilator
        ? {
            ...prev.ventilators,
            inUse: Math.min(prev.ventilators.total, prev.ventilators.inUse + 1)
          }
        : prev.ventilators
    }));

    // 2. Mark patient as Admitted in queue and assign bed
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patient.id
          ? {
              ...p,
              status: 'Admitted',
              assignedBed: targetBedName,
              admittedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            }
          : p
      )
    );

    // 3. Stretcher auto-dispatch to Emergency Gate
    setStretcherStats((prev) => ({
      ...prev,
      available: Math.max(0, prev.available - 1),
      inUse: prev.inUse + 1
    }));

    setStretcherZones((prev) =>
      prev.map((z) =>
        z.id === 'zone-1' // Emergency Gate
          ? {
              ...z,
              available: Math.max(0, z.available - 1),
              inUse: z.inUse + 1,
              lastUpdate: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            }
          : z
      )
    );

    // 4. Play audio alert & add to log
    if (!isMuted) {
      if (patient.priority === 'TRAUMA RED') {
        playCodeRedAlert();
      } else {
        playConfirmChime();
      }
    }

    const logEntry = {
      id: `log-${Date.now()}`,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text: `⚡ AUTO-ADMISSION: ${patient.caseId} (${patient.type}) admitted to ${targetBedName}. Live available beds auto-decremented.`,
      type: 'admit' as const
    };
    setRecentAdmissionsLog((prev) => [logEntry, ...prev.slice(0, 15)]);

    // Show toast for visual feedback
    setLatestAdmittedToast({
      caseId: patient.caseId,
      type: patient.type,
      bedAssigned: targetBedName,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });

    // Persist bed status and auto-admission log to MongoDB Atlas and emit via Socket.io
    try {
      emitBedSync({
        hospitalId: 'gsvm-kanpur',
        hospitalName: 'GSVM Medical College, Kanpur',
        icuBeds: { total: bedCapacity.icu.total, occupied: bedCapacity.icu.occupied + 1 },
        traumaBays: { total: bedCapacity.traumaBay.total, occupied: bedCapacity.traumaBay.occupied + 1 },
        nicuWarmers: { total: bedCapacity.nicu.total, occupied: bedCapacity.nicu.occupied },
        ventilators: { total: bedCapacity.ventilators.total, inUse: bedCapacity.ventilators.inUse + (needsVentilator ? 1 : 0) },
        lastUpdatedBy: `Auto-Admission: ${patient.caseId}`
      });

      emitTelemetryLog({
        id: `log-${Date.now()}`,
        eventType: 'auto_admission',
        caseId: patient.caseId,
        text: `Auto-Admission: ${patient.caseId} (${patient.type}) admitted to ${targetBedName}. Live bed decremented.`,
        bedAssigned: targetBedName,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setLatestAdmittedToast(null);
    }, 5000);
  };

  // Automatic ETA countdown and spontaneous admission ticker
  useEffect(() => {
    if (!isAutoAdmissionActive) return;

    const intervalMs = simulationSpeed === '3x' ? 3000 : 8000;
    const timer = setInterval(() => {
      setPatients((prev) => {
        const next = prev.map((p) => {
          if (p.status === 'In Queue' || p.status === 'In Transit') {
            const nextEta = Math.max(0, p.etaMinutes - 1);
            return {
              ...p,
              etaMinutes: nextEta
            };
          }
          return p;
        });

        // If any patient has hit ETA <= 2, trigger automatic admission if still in queue
        const readyPatient = next.find((p) => p.status === 'In Queue' && p.etaMinutes <= 3);
        if (readyPatient) {
          setTimeout(() => performAutoAdmission(readyPatient), 500);
        }

        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isAutoAdmissionActive, simulationSpeed, bedCapacity, isMuted]);

  // Interactive dispatch stretcher
  const handleDispatchStretcher = (zoneId: string = 'zone-1') => {
    playTactileClick();
    if (stretcherStats.available <= 0) return;

    setStretcherStats((prev) => ({
      ...prev,
      available: Math.max(0, prev.available - 1),
      inUse: prev.inUse + 1
    }));

    setStretcherZones((prev) =>
      prev.map((z) =>
        z.id === zoneId
          ? {
              ...z,
              available: Math.max(0, z.available - 1),
              inUse: z.inUse + 1,
              lastUpdate: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            }
          : z
      )
    );

    if (!isMuted) playConfirmChime();

    setRecentAdmissionsLog((prev) => [
      {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text: '🚑 Emergency Stretcher dispatched to Emergency Gate Ramp 1 with staff.',
        type: 'stretcher'
      },
      ...prev.slice(0, 15)
    ]);
  };

  // Generate ₹500 Token
  const handleCreateToken = async () => {
    playTactileClick();
    const randomId = `TNX-2024-${Math.floor(1263 + Math.random() * 100)}`;
    const newTok = {
      tokenNumber: randomId,
      priority: 'TRAUMA RED',
      amount: 500,
      patientAgeGender: '29Y / Male',
      bookedBy: 'NHM Fast-Track Desk',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'Confirmed'
    };
    setCurrentToken(newTok);
    setGenerateTokenModal(false);

    try {
      await emitTokenCreate({
        tokenNumber: randomId,
        hospitalId: 'gsvm-kanpur',
        patientAgeGender: '29Y / Male',
        priority: 'TRAUMA RED',
        amount: 500,
        bookedBy: 'NHM Fast-Track Desk',
        paymentStatus: 'Confirmed',
        issuedAtTime: new Date().toISOString()
      });
    } catch {
      // offline fallback
    }

    if (!isMuted) playConfirmChime();
  };

  return (
    <div
      id="hospital-reception-command-center"
      className="w-full h-full min-h-screen bg-[#070d18] text-slate-100 flex flex-col font-sans select-none overflow-hidden"
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER (Matching exact screenshot with Live badge & Admin dropdown) */}
      {/* ========================================================================= */}
      <header
        id="reception-top-header"
        className="w-full bg-[#0a1222] border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between z-30 shrink-0 shadow-lg"
      >
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-mono">Prathmikta</span>
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-teal-400/90 -mt-0.5">
              RECEPTION COMMAND CENTER
            </div>
          </div>
        </div>

        {/* Live Automatic Bed Status Bar */}
        <div className="hidden xl:flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 shadow-inner">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <BedDouble className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-200">Live Bed Grid:</span>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-mono">
            {/* ICU */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-slate-400">ICU Free:</span>
              <span className="font-bold text-red-400">
                {bedCapacity.icu.total - bedCapacity.icu.occupied} / {bedCapacity.icu.total}
              </span>
            </div>

            {/* Trauma */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-slate-400">Trauma Bays:</span>
              <span className="font-bold text-amber-400">
                {bedCapacity.traumaBay.total - bedCapacity.traumaBay.occupied} / {bedCapacity.traumaBay.total}
              </span>
            </div>

            {/* NICU */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span className="text-slate-400">NICU:</span>
              <span className="font-bold text-purple-300">
                {bedCapacity.nicu.total - bedCapacity.nicu.occupied} / {bedCapacity.nicu.total}
              </span>
            </div>

            {/* Ventilators */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span className="text-slate-400">Vents Free:</span>
              <span className="font-bold text-cyan-300">
                {bedCapacity.ventilators.total - bedCapacity.ventilators.inUse} / {bedCapacity.ventilators.total}
              </span>
            </div>
          </div>

          {/* Auto-Admission Engine Status Pill */}
          <button
            onClick={() => {
              playTactileClick();
              setIsAutoAdmissionActive(!isAutoAdmissionActive);
            }}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border transition-all ${
              isAutoAdmissionActive
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
            }`}
            title="Toggle Real-Time Automatic Bed Admission Engine"
          >
            {isAutoAdmissionActive ? <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
            <span>Auto-Bed Sync: {isAutoAdmissionActive ? 'ACTIVE' : 'PAUSED'}</span>
          </button>
        </div>

        {/* Right Nav: LIVE Status, Bell, Facility Switcher & Admin Desk */}
        <div className="flex items-center gap-3">
          {/* Live Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>LIVE</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              playTactileClick();
              setIsMuted(!isMuted);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Notification Bell with Badge */}
          <div className="relative">
            <button
              onClick={() => {
                playTactileClick();
                setIsNotificationsOpen(!isNotificationsOpen);
              }}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-700/60 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                3
              </span>
            </button>

            {/* Notification Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Live ER Alerts</span>
                  <span className="text-[10px] text-emerald-400 font-mono">3 Unread</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-red-950/40 border border-red-800/40 text-red-200">
                    <p className="font-semibold">🚨 Incoming Red Trauma: TNX-1258</p>
                    <p className="text-[10px] text-red-300/80 mt-0.5">ETA: 12 mins • Stretcher Assigned Gate 1</p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-200">
                    <p className="font-semibold">⚠️ Cardiac ICU Bed Allocated</p>
                    <p className="text-[10px] text-amber-300/80 mt-0.5">Dr. M. Khanna Cath Lab ready</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300">
                    <p className="font-semibold">ℹ️ Shift Rotation Sync</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">28 Staff on active duty</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hospital Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                playTactileClick();
                setIsHospitalDropdownOpen(!isHospitalDropdownOpen);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-teal-400" />
              <span className="max-w-[150px] truncate">{selectedHospital}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isHospitalDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50">
                {[
                  'GSVM Medical College, Kanpur',
                  'KGMU Trauma Center, Lucknow',
                  'SGPGI Super Specialty, Lucknow',
                  'Apollo Hospital, Emergency Bay'
                ].map((hosp) => (
                  <button
                    key={hosp}
                    onClick={() => {
                      setSelectedHospital(hosp);
                      setIsHospitalDropdownOpen(false);
                      playTactileClick();
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 ${
                      selectedHospital === hosp ? 'text-teal-400 font-semibold bg-slate-800/50' : 'text-slate-300'
                    }`}
                  >
                    <span>{hosp}</span>
                    {selectedHospital === hosp && <Check className="w-3.5 h-3.5 text-teal-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile / Admin Desk */}
          <div className="relative">
            <button
              onClick={() => {
                playTactileClick();
                setIsAdminMenuOpen(!isAdminMenuOpen);
              }}
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 hover:bg-slate-800 transition-colors"
            >
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80"
                alt="Admin avatar"
                className="w-6 h-6 rounded-full object-cover border border-teal-500/50"
              />
              <span className="text-xs font-medium text-slate-200">Admin Desk</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isAdminMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50">
                <div className="px-3 py-2 border-b border-slate-800 text-xs">
                  <p className="font-semibold text-white">Chief Triage Officer</p>
                  <p className="text-[10px] text-slate-400">Desk ID: REC-KANPUR-01</p>
                </div>
                <button
                  onClick={() => {
                    setMode('landing');
                    playTactileClick();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                  <span>Go to Public Portal</span>
                </button>
                <button
                  onClick={() => {
                    setMode('partner');
                    playTactileClick();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-teal-400" />
                  <span>ABDM Registration (/hb)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auto-Admission Floating Notification Toast */}
      {latestAdmittedToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-red-950 via-slate-900 to-teal-950 border border-teal-500/60 rounded-xl p-3 shadow-2xl shadow-teal-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0">
            <Sparkles className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-300 font-mono">⚡ LIVE AUTO-ADMISSION</span>
              <span className="text-[10px] text-slate-400">{latestAdmittedToast.time}</span>
            </div>
            <p className="text-xs text-slate-200">
              Patient <strong className="text-white font-mono">{latestAdmittedToast.caseId}</strong> ({latestAdmittedToast.type}) admitted to{' '}
              <strong className="text-emerald-400">{latestAdmittedToast.bedAssigned}</strong>.
            </p>
            <p className="text-[10px] text-teal-400/90 font-medium">Bed availability decremented automatically without manual entry.</p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MAIN LAYOUT: Left Sidebar + Main 4-Card Command Grid */}
      {/* ========================================================================= */}
      <div className="flex-1 flex w-full h-full min-h-0 overflow-hidden">
        {/* ========================================== */}
        {/* LEFT SIDEBAR (Matching screenshot exactly) */}
        {/* ========================================== */}
        <aside
          id="reception-sidebar"
          className="w-56 lg:w-60 bg-[#08101e] border-r border-slate-800/80 flex flex-col justify-between shrink-0 p-3 overflow-y-auto"
        >
          {/* Main Navigation Links */}
          <div className="space-y-1">
            {[
              { id: 'command_dashboard', label: 'Command Dashboard', icon: Building2 },
              { id: 'doctor_roster', label: 'Doctor Roster', icon: Stethoscope },
              { id: 'live_tracker', label: 'Live Tracker', icon: MapPin },
              { id: 'token_desk', label: 'Token Desk', icon: CreditCard },
              { id: 'stretcher_manager', label: 'Stretcher Manager', icon: Layers },
              { id: 'alerts_notifications', label: 'Alerts & Notifications', icon: Bell, badge: '12', badgeColor: 'bg-red-600' },
              { id: 'reports_analytics', label: 'Reports & Analytics', icon: Activity },
              { id: 'settings', label: 'Settings', icon: Filter }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSidebarNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    playTactileClick();
                    setActiveSidebarNav(item.id);
                    if (item.id === 'doctor_roster') setActiveModal('doctor_roster');
                    if (item.id === 'live_tracker') setActiveModal('live_map');
                    if (item.id === 'token_desk') setTokenHistoryModal(true);
                    if (item.id === 'stretcher_manager') setActiveModal('stretcher_dispatch');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-teal-950/70 border border-teal-500/40 text-teal-300 font-semibold shadow-md shadow-teal-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white ${item.badgeColor || 'bg-slate-700'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Widget: System Status & Emergency Override */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            {/* System Status Card */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">System Status</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <div className="font-semibold text-emerald-400">All Systems Operational</div>
              <div className="text-[10px] text-slate-500">Last Sync: {currentTime || '10:24:18 AM'}</div>
              <div className="text-[10px] text-slate-500">Uptime: 99.98%</div>
            </div>

            {/* Emergency Override Button */}
            <button
              onClick={() => {
                playTactileClick();
                setActiveModal('emergency_override');
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-950/40 border border-red-600/50 hover:bg-red-900/50 text-red-300 text-xs font-semibold transition-all shadow-md shadow-red-950/50"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Emergency Override</span>
            </button>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* MAIN COMMAND DASHBOARD GRID (4 Quadrant Cards: 1, 2, 3, 4) */}
        {/* ========================================================================= */}
        <main
          id="reception-main-content"
          className="flex-1 h-full min-h-0 overflow-y-auto p-4 lg:p-5 bg-[#070d18] grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5"
        >
          {/* ===================================================================== */}
          {/* CARD 1: Doctor Availability Roster (Top Left - 5 Cols) */}
          {/* ===================================================================== */}
          <div
            id="card-1-doctor-roster"
            className="lg:col-span-5 bg-[#0a1324] border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-xl"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/50 flex items-center justify-center text-teal-300 text-xs font-bold font-mono">
                    1
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">Doctor Availability Roster</h2>
                    <p className="text-[11px] text-slate-400">Real-time specialist availability</p>
                  </div>
                </div>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800/80">
                      <th className="pb-2 font-semibold">Specialist</th>
                      <th className="pb-2 font-semibold">Doctor</th>
                      <th className="pb-2 font-semibold">Status</th>
                      <th className="pb-2 font-semibold text-right">Available Till</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {doctorRoster.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2 text-slate-300 font-medium text-[11px]">{item.specialist}</td>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={item.avatar}
                              alt={item.doctor}
                              className="w-5 h-5 rounded-full object-cover border border-slate-700 shrink-0"
                            />
                            <span className="text-white font-medium text-[11px]">{item.doctor}</span>
                          </div>
                        </td>
                        <td className="py-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.status === 'Available'
                                ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/50'
                                : 'text-amber-400 bg-amber-950/60 border border-amber-800/50'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.status === 'Available' ? 'bg-emerald-400' : 'bg-amber-400'
                              }`}
                            ></span>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2 text-right text-slate-400 font-mono text-[11px]">{item.availableTill}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Link CTA */}
            <div className="pt-3 border-t border-slate-800/80 text-center">
              <button
                onClick={() => {
                  playTactileClick();
                  setActiveModal('doctor_roster');
                }}
                className="text-xs text-slate-400 hover:text-teal-300 font-medium inline-flex items-center gap-1 transition-colors"
              >
                <span>View Full Doctor Roster</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* CARD 2: In-Queue & In-Transit Live Tracker (Top Right - 7 Cols) */}
          {/* ===================================================================== */}
          <div
            id="card-2-live-tracker"
            className="lg:col-span-7 bg-[#0a1324] border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-xl"
          >
            <div>
              {/* Header & Tabs */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/50 flex items-center justify-center text-teal-300 text-xs font-bold font-mono">
                    2
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">In-Queue & In-Transit Live Tracker</h2>
                    <p className="text-[11px] text-slate-400">Ambulances & patients in real-time</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playTactileClick();
                      setActiveModal('live_map');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs"
                  >
                    <Filter className="w-3 h-3" />
                    <span>Filter</span>
                  </button>
                  <button className="p-1 rounded-lg text-slate-400 hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tabs: IN QUEUE (5) | IN TRANSIT (3) */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => {
                    playTactileClick();
                    setTrackerTab('in_queue');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
                    trackerTab === 'in_queue'
                      ? 'bg-teal-950 border border-teal-500/60 text-teal-300 shadow'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                  }`}
                >
                  IN QUEUE ({inQueuePatients.length})
                </button>
                <button
                  onClick={() => {
                    playTactileClick();
                    setTrackerTab('in_transit');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
                    trackerTab === 'in_transit'
                      ? 'bg-teal-950 border border-teal-500/60 text-teal-300 shadow'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                  }`}
                >
                  IN TRANSIT ({inTransitPatients.length})
                </button>
              </div>

              {/* Split View: Table on Left, Interactive Dark Map Canvas on Right */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
                {/* Table: Patients */}
                <div className="xl:col-span-7 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800/80">
                        <th className="pb-2 font-semibold">Patient / Case ID</th>
                        <th className="pb-2 font-semibold">Type</th>
                        <th className="pb-2 font-semibold">ETA / Wait</th>
                        <th className="pb-2 font-semibold">Status</th>
                        <th className="pb-2 font-semibold text-right">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {(trackerTab === 'in_queue' ? inQueuePatients : inTransitPatients).map((patient) => (
                        <tr key={patient.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5">
                            <div className="flex items-center gap-1.5">
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                                  patient.priority === 'TRAUMA RED'
                                    ? 'bg-red-950 border border-red-600/60 text-red-400'
                                    : patient.priority === 'YELLOW'
                                    ? 'bg-amber-950 border border-amber-600/60 text-amber-400'
                                    : 'bg-emerald-950 border border-emerald-600/60 text-emerald-400'
                                }`}
                              >
                                🚑
                              </div>
                              <div>
                                <div className="font-mono font-bold text-white text-[11px]">{patient.caseId}</div>
                                <div className="text-[10px] text-slate-400">{patient.ageGender}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 text-slate-300 text-[11px]">{patient.type}</td>
                          <td className="py-2.5 font-mono text-slate-200 font-semibold text-[11px]">
                            {patient.etaMinutes} min
                          </td>
                          <td className="py-2.5">
                            <span className="text-slate-400 text-[11px]">{patient.status}</span>
                          </td>
                          <td className="py-2.5 text-right">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
                                patient.priority === 'TRAUMA RED'
                                  ? 'bg-red-900/60 border border-red-500/80 text-red-300'
                                  : patient.priority === 'YELLOW'
                                  ? 'bg-amber-900/60 border border-amber-500/80 text-amber-300'
                                  : 'bg-emerald-900/60 border border-emerald-500/80 text-emerald-300'
                              }`}
                            >
                              {patient.priority}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Right: Dark GPS Telemetry Map Graphic */}
                <div className="xl:col-span-5 h-44 xl:h-auto rounded-xl bg-[#060c18] border border-slate-800 relative overflow-hidden flex items-center justify-center p-2 shadow-inner">
                  {/* Subtle Grid Lines */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        'radial-gradient(#14b8a6 1px, transparent 1px), radial-gradient(#1e293b 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 10px 10px'
                    }}
                  ></div>

                  {/* Central Hospital Beacon */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="relative">
                      <span className="absolute -inset-2 rounded-full bg-teal-500/20 animate-ping"></span>
                      <span className="absolute -inset-4 rounded-full bg-teal-500/10 animate-pulse"></span>
                      <div className="w-8 h-8 rounded-full bg-teal-600 border-2 border-teal-300 flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-teal-500/50">
                        H
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold text-teal-300 mt-1 bg-slate-950/80 px-1.5 py-0.5 rounded border border-teal-800">
                      GSVM ER GATE
                    </span>
                  </div>

                  {/* Ambulance Nodes on Radar */}
                  {/* Node 1: Red Trauma */}
                  <div className="absolute top-4 left-6 flex items-center gap-1">
                    <div className="w-5 h-5 rounded-full bg-red-600/90 border border-red-300 flex items-center justify-center text-[10px] text-white animate-bounce shadow">
                      🚑
                    </div>
                    <div className="bg-slate-950/90 border border-red-500/50 px-1.5 py-0.5 rounded text-[9px] text-red-300 font-mono font-bold">
                      TNX-1258 (12m)
                    </div>
                  </div>

                  {/* Node 2: Red Trauma */}
                  <div className="absolute bottom-6 right-6 flex items-center gap-1">
                    <div className="w-5 h-5 rounded-full bg-red-600/90 border border-red-300 flex items-center justify-center text-[10px] text-white animate-pulse shadow">
                      🚑
                    </div>
                    <div className="bg-slate-950/90 border border-red-500/50 px-1.5 py-0.5 rounded text-[9px] text-red-300 font-mono font-bold">
                      TNX-1259 (18m)
                    </div>
                  </div>

                  {/* Node 3: Yellow */}
                  <div className="absolute bottom-4 left-10">
                    <div className="w-4 h-4 rounded-full bg-amber-500 border border-amber-200 flex items-center justify-center text-[8px] text-white">
                      🚑
                    </div>
                  </div>

                  {/* Node 4: Green */}
                  <div className="absolute top-12 right-12">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 border border-emerald-200 flex items-center justify-center text-[8px] text-white">
                      🚑
                    </div>
                  </div>

                  {/* Zoom Controls on map */}
                  <div className="absolute bottom-2 right-2 flex flex-col gap-1 bg-slate-900/90 border border-slate-700 rounded p-0.5">
                    <button className="w-4 h-4 flex items-center justify-center text-slate-300 hover:text-white text-[10px] font-bold">
                      +
                    </button>
                    <button className="w-4 h-4 flex items-center justify-center text-slate-300 hover:text-white text-[10px] font-bold">
                      -
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Link CTA */}
            <div className="pt-3 border-t border-slate-800/80 text-center mt-2">
              <button
                onClick={() => {
                  playTactileClick();
                  setActiveModal('live_map');
                }}
                className="text-xs text-slate-400 hover:text-teal-300 font-medium inline-flex items-center gap-1 transition-colors"
              >
                <span>View Live Tracker Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* CARD 3: ₹500 Token Booking (Bottom Left - 5 Cols) */}
          {/* ===================================================================== */}
          <div
            id="card-3-token-booking"
            className="lg:col-span-5 bg-[#0a1324] border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-xl"
          >
            <div>
              {/* Header */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/50 flex items-center justify-center text-teal-300 text-xs font-bold font-mono">
                  3
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">₹500 Token Booking</h2>
                  <p className="text-[11px] text-slate-400">Fast-track emergency care token</p>
                </div>
              </div>

              {/* Token Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Left: Token Amount Card */}
                <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 to-teal-950/40 border border-teal-800/50 flex flex-col justify-between shadow-md">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TOKEN AMOUNT</span>
                    <div className="text-2xl font-extrabold text-teal-300 mt-1 font-mono">₹ 500</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-teal-950 border border-teal-600/60 text-teal-400 text-[10px] font-semibold">
                      Cashless Ready
                    </span>
                  </div>

                  {/* Card Graphic */}
                  <div className="mt-3 flex items-center justify-end text-teal-500/40">
                    <CreditCard className="w-9 h-9" />
                  </div>
                </div>

                {/* Right: Current Token Details */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between text-xs">
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">CURRENT TOKEN</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-white text-xs">{currentToken.tokenNumber}</span>
                        <span className="px-1.5 py-0.2 rounded bg-red-950 border border-red-600 text-red-300 text-[8px] font-bold">
                          {currentToken.priority}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">PATIENT</span>
                      <div className="text-slate-200 font-medium text-[11px]">{currentToken.patientAgeGender}</div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">BOOKED BY</span>
                      <div className="text-slate-300 text-[11px]">{currentToken.bookedBy}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">TIME: {currentToken.time}</span>
                    <span className="text-emerald-400 font-semibold">STATUS: {currentToken.status}</span>
                  </div>
                </div>
              </div>

              {/* Action Button: Generate New Token */}
              <button
                onClick={() => {
                  playTactileClick();
                  setGenerateTokenModal(true);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-900/40 transition-all active:scale-[0.99]"
              >
                <span>Generate New Token ₹500</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Link CTA */}
            <div className="pt-3 border-t border-slate-800/80 text-center mt-3">
              <button
                onClick={() => {
                  playTactileClick();
                  setTokenHistoryModal(true);
                }}
                className="text-xs text-slate-400 hover:text-teal-300 font-medium inline-flex items-center gap-1 transition-colors"
              >
                <span>View Token History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* CARD 4: Stretcher Staff Welfare Matrix (Bottom Right - 7 Cols) */}
          {/* ===================================================================== */}
          <div
            id="card-4-stretcher-matrix"
            className="lg:col-span-7 bg-[#0a1324] border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-xl"
          >
            <div>
              {/* Header */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/50 flex items-center justify-center text-teal-300 text-xs font-bold font-mono">
                  4
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">Stretcher Staff Welfare Matrix</h2>
                  <p className="text-[11px] text-slate-400">Live stretcher availability & staff status</p>
                </div>
              </div>

              {/* Metric Badges Header */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="p-2 rounded-xl bg-slate-900/90 border border-emerald-800/40 text-center">
                  <div className="text-[9px] uppercase font-bold text-slate-400">AVAILABLE</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{stretcherStats.available}</div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/90 border border-amber-800/40 text-center">
                  <div className="text-[9px] uppercase font-bold text-slate-400">IN USE</div>
                  <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">{stretcherStats.inUse}</div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/90 border border-red-800/40 text-center">
                  <div className="text-[9px] uppercase font-bold text-slate-400">IN MAINTENANCE</div>
                  <div className="text-lg font-bold text-red-400 font-mono mt-0.5">{stretcherStats.inMaintenance}</div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/90 border border-teal-800/40 text-center">
                  <div className="text-[9px] uppercase font-bold text-slate-400">STAFF ON DUTY</div>
                  <div className="text-lg font-bold text-teal-400 font-mono mt-0.5">{stretcherStats.staffOnDuty}</div>
                </div>
              </div>

              {/* Split: Stretcher Zones Table + Active Staff */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
                {/* Zone Breakdown Table */}
                <div className="xl:col-span-8 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800/80">
                        <th className="pb-1.5 font-semibold">Stretcher Zone</th>
                        <th className="pb-1.5 font-semibold text-center">Available</th>
                        <th className="pb-1.5 font-semibold text-center">In Use</th>
                        <th className="pb-1.5 font-semibold text-center">Staff</th>
                        <th className="pb-1.5 font-semibold text-right">Last Update</th>
                        <th className="pb-1.5 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {stretcherZones.map((z) => (
                        <tr key={z.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-2 text-slate-200 font-medium text-[11px]">{z.zone}</td>
                          <td className="py-2 text-center text-emerald-400 font-bold font-mono text-[11px]">
                            {z.available}
                          </td>
                          <td className="py-2 text-center text-amber-400 font-bold font-mono text-[11px]">{z.inUse}</td>
                          <td className="py-2 text-center text-teal-300 font-semibold font-mono text-[11px]">
                            {z.staffAssigned}
                          </td>
                          <td className="py-2 text-right text-slate-400 font-mono text-[10px]">{z.lastUpdate}</td>
                          <td className="py-2 text-right">
                            <button
                              onClick={() => handleDispatchStretcher(z.id)}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-teal-900 border border-slate-700 text-teal-300 text-[10px] transition-colors"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Right: Active Staff On Duty List */}
                <div className="xl:col-span-4 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">ACTIVE STAFF ON DUTY</div>
                    <div className="space-y-1.5">
                      {activeStaffList.map((staff) => (
                        <div key={staff.id} className="flex items-center justify-between py-0.5">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={staff.avatar}
                              alt={staff.name}
                              className="w-5 h-5 rounded-full object-cover border border-slate-700 shrink-0"
                            />
                            <div>
                              <div className="text-[11px] font-medium text-white">{staff.name}</div>
                              <div className="text-[9px] text-slate-400">{staff.role}</div>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800/60 text-emerald-400 text-[9px] font-semibold">
                            {staff.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      playTactileClick();
                      setActiveModal('stretcher_dispatch');
                    }}
                    className="mt-2 text-[10px] text-center text-slate-400 hover:text-teal-300 font-medium block transition-colors"
                  >
                    View All Staff
                  </button>
                </div>
              </div>

              {/* Big Bottom Action: Dispatch Stretcher to Gate */}
              <button
                onClick={() => handleDispatchStretcher('zone-1')}
                className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all active:scale-[0.99]"
              >
                <span>🛏️ Dispatch Stretcher to Gate</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODALS & SUB-SCREENS */}
      {/* ========================================================================= */}

      {/* MODAL: Full Doctor Availability Roster */}
      {activeModal === 'doctor_roster' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-teal-400" />
                  <span>Full Hospital Specialist Doctor Roster</span>
                </h3>
                <p className="text-xs text-slate-400">GSVM Medical College • Live Shift Status & Department OT Assignments</p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {doctorRoster.map((doc) => (
                <div key={doc.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={doc.avatar} alt={doc.doctor} className="w-10 h-10 rounded-full object-cover border border-teal-500/40" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{doc.doctor}</h4>
                      <p className="text-xs text-teal-400 font-medium">{doc.specialist} • {doc.dept}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      doc.status === 'Available' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      ● {doc.status}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">Until {doc.availableTill}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Generate New ₹500 Fast-Track Token */}
      {generateTokenModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-400" />
                <span>Fast-Track ER Care Token</span>
              </h3>
              <button
                onClick={() => setGenerateTokenModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800/60 text-center">
                <span className="text-[10px] uppercase font-bold text-teal-300">TOKEN REGISTRATION CHARGE</span>
                <div className="text-3xl font-extrabold text-white mt-1 font-mono">₹ 500</div>
                <p className="text-[10px] text-teal-400 mt-1">Instant Cashless Zero-Wait Triage Slip (ABDM QR Enabled)</p>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Patient Name or Case ID</label>
                <input
                  type="text"
                  defaultValue="Walk-in Emergency / Ambulance Case"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Priority Classification</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500">
                  <option>TRAUMA RED (Immediate ER Resus)</option>
                  <option>YELLOW (Urgent Within 30 min)</option>
                  <option>GREEN (Non-Critical Fast Track)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCreateToken}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-950"
                >
                  <Printer className="w-4 h-4" />
                  <span>Issue & Print ₹500 Token Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Token History */}
      {tokenHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-400" />
                <span>Recent ₹500 Emergency Tokens</span>
              </h3>
              <button
                onClick={() => setTokenHistoryModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { token: 'TNX-2024-1258', patient: '32Y / Male (Rohan Sharma)', priority: 'TRAUMA RED', time: '10:24 AM', amt: '₹500' },
                { token: 'TNX-2024-1257', patient: '45Y / Female (Sunita Devi)', priority: 'YELLOW', time: '10:05 AM', amt: '₹500' },
                { token: 'TNX-2024-1256', patient: '62Y / Male (Harish Varma)', priority: 'YELLOW', time: '09:40 AM', amt: '₹500' },
                { token: 'TNX-2024-1255', patient: '19Y / Male (Deepak Singh)', priority: 'TRAUMA RED', time: '09:15 AM', amt: '₹500' }
              ].map((t) => (
                <div key={t.token} className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="font-mono font-bold text-white">{t.token}</div>
                    <div className="text-slate-400 text-[11px]">{t.patient}</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
                      {t.priority}
                    </span>
                    <div className="text-emerald-400 font-mono font-bold mt-0.5">{t.amt} • {t.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Emergency Override */}
      {activeModal === 'emergency_override' && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-700/80 rounded-2xl w-full max-w-md p-5 shadow-2xl text-xs">
            <div className="flex items-center gap-3 text-red-400 pb-3 border-b border-slate-800 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-white">Emergency Bed & Code Red Override</h3>
                <p className="text-[11px] text-red-300">National Disaster & Mass Casualty Protocol</p>
              </div>
            </div>

            <p className="text-slate-300 mb-3 leading-relaxed">
              Activating Emergency Override will convert 10 step-down observation beds into Surge ICU Trauma Bays and summon on-call medical specialists.
            </p>

            <div className="space-y-2 mb-4">
              <button
                onClick={() => {
                  setBedCapacity((prev) => ({
                    ...prev,
                    icu: { ...prev.icu, total: prev.icu.total + 10 },
                    traumaBay: { ...prev.traumaBay, total: prev.traumaBay.total + 6 }
                  }));
                  setActiveModal(null);
                  playCodeRedAlert();
                }}
                className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors"
              >
                🚨 ACTIVATE CODE RED SURGE BEDS (+10 ICU)
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
