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
  Info,
  FileText
} from 'lucide-react';
import { playTactileClick, playConfirmChime, playCodeRedAlert, playCodeAmberAlert } from '../../lib/audio';
import { PatientReportModal, PatientEmergencyReportData } from '../citizen/PatientReportModal';
import { io } from 'socket.io-client';

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
  clinicalNotes?: string;
  hasAiReport?: boolean;
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

  // 3. In-Queue & In-Transit Live Tracker (Clean state - populated exclusively by real submitted/dispatched AI triage reports)
  const [trackerTab, setTrackerTab] = useState<'in_queue' | 'in_transit'>('in_queue');
  const [patients, setPatients] = useState<PatientQueueItem[]>([]);

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

  // Selected Patient AI Clinical Report for Modal inspection
  const [selectedAiReport, setSelectedAiReport] = useState<PatientEmergencyReportData | null>(null);

  // Dedicated Ram Singh (SA-1047) Stretcher Live Socket Status
  const [ramSinghStatus, setRamSinghStatus] = useState<{
    statusText: string;
    step: 'idle' | 'moving' | 'transporting' | 'completed';
    lastUpdated: string;
    dispatchId?: string;
  }>({
    statusText: 'Duty Active (Shade Shelter – Emergency Block A)',
    step: 'idle',
    lastUpdated: 'Just now'
  });

  // Real-time Socket.io listener for direct AI report & emergency dispatches transferred from citizens/ambulances
  useEffect(() => {
    // Initial fetch of existing dispatches so GSVM Medical College loads all previous and new incoming requests
    const fetchExistingDispatches = async () => {
      try {
        const res = await fetch('/api/dispatches');
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            const mappedPatients: PatientQueueItem[] = list.map((disp: any) => ({
              id: `pt-${disp.dispatchId || disp._id || Date.now()}`,
              caseId: disp.dispatchId || `TNX-2024-${Math.floor(1265 + Math.random() * 100)}`,
              patientName: disp.patientName || disp.patient?.fullName || 'Emergency Inbound Patient',
              ageGender: `${disp.patientAge || disp.patient?.age || 35}Y / ${disp.patientGender || disp.patient?.gender || 'Male'}`,
              type: disp.symptomCategory || disp.patient?.symptomCategory || 'Emergency Triage',
              etaMinutes: disp.etaMinutes || 6,
              status: disp.status || 'In Queue',
              priority: disp.severity === 'RED' ? 'TRAUMA RED' : disp.severity === 'YELLOW' ? 'YELLOW' : 'GREEN',
              ambulanceId: disp.ambulanceId || 'CITIZEN-EMERGENCY',
              lat: disp.originCoords?.lat || 26.4712,
              lng: disp.originCoords?.lng || 80.3211,
              conditionCategory: (disp.symptomCategory || disp.patient?.symptomCategory || '').toLowerCase().includes('trauma')
                ? 'trauma'
                : (disp.symptomCategory || disp.patient?.symptomCategory || '').toLowerCase().includes('cardiac')
                ? 'cardiac'
                : (disp.symptomCategory || disp.patient?.symptomCategory || '').toLowerCase().includes('respiratory')
                ? 'respiratory'
                : 'general',
              vitals: {
                bp: disp.vitals?.bp || disp.patient?.vitals?.bp || '120/80',
                spo2: disp.vitals?.spo2 || disp.patient?.vitals?.spo2 || 96,
                hr: disp.vitals?.heartRate || disp.patient?.vitals?.heartRate || 82
              },
              clinicalNotes: disp.clinicalPriorityNotes || disp.patient?.clinicalPriorityNotes || 'Directly transferred from citizen AI triage.',
              hasAiReport: true
            }));

            setPatients((prev) => {
              const existingIds = new Set(mappedPatients.map((m) => m.caseId));
              const nonDuplicatePrev = prev.filter((p) => !existingIds.has(p.caseId));
              return [...mappedPatients, ...nonDuplicatePrev];
            });
          }
        }
      } catch (err) {
        console.warn('Dispatches initial fetch error', err);
      }
    };

    fetchExistingDispatches();

    const socket = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      socket.emit('join:hospital', { hospitalId: 'gsvm-kanpur' });
      socket.emit('join:hospital', { hospitalId: 'gsvm' });
    });

    const handleInboundDispatch = (dispatch: any) => {
      if (!dispatch) return;
      
      const newPatient: PatientQueueItem = {
        id: `pt-${dispatch.dispatchId || Date.now()}`,
        caseId: dispatch.dispatchId || `TNX-2024-${Math.floor(1265 + Math.random() * 100)}`,
        patientName: dispatch.patientName || dispatch.patient?.fullName || 'Emergency Inbound Patient',
        ageGender: `${dispatch.patientAge || dispatch.patient?.age || 35}Y / ${dispatch.patientGender || dispatch.patient?.gender || 'Male'}`,
        type: dispatch.symptomCategory || dispatch.patient?.symptomCategory || 'Emergency Triage',
        etaMinutes: dispatch.etaMinutes || 6,
        status: dispatch.status || 'In Queue',
        priority: dispatch.severity === 'RED' ? 'TRAUMA RED' : dispatch.severity === 'YELLOW' ? 'YELLOW' : 'GREEN',
        ambulanceId: dispatch.ambulanceId || 'CITIZEN-EMERGENCY',
        lat: dispatch.originCoords?.lat || 26.4712,
        lng: dispatch.originCoords?.lng || 80.3211,
        conditionCategory: (dispatch.symptomCategory || dispatch.patient?.symptomCategory || '').toLowerCase().includes('trauma')
          ? 'trauma'
          : (dispatch.symptomCategory || dispatch.patient?.symptomCategory || '').toLowerCase().includes('cardiac')
          ? 'cardiac'
          : (dispatch.symptomCategory || dispatch.patient?.symptomCategory || '').toLowerCase().includes('respiratory')
          ? 'respiratory'
          : 'general',
        vitals: {
          bp: dispatch.vitals?.bp || dispatch.patient?.vitals?.bp || '120/80',
          spo2: dispatch.vitals?.spo2 || dispatch.patient?.vitals?.spo2 || 96,
          hr: dispatch.vitals?.heartRate || dispatch.patient?.vitals?.heartRate || 82
        },
        clinicalNotes: dispatch.clinicalPriorityNotes || dispatch.patient?.clinicalPriorityNotes || 'Directly transferred from citizen AI triage.',
        hasAiReport: true
      };

      // Prepend to live patients queue
      setPatients((prev) => {
        const filtered = prev.filter((p) => p.caseId !== newPatient.caseId);
        return [newPatient, ...filtered];
      });

      // Auto-decrement bed count upon receiving inbound critical case
      setBedCapacity((prev) => ({
        ...prev,
        icu: {
          ...prev.icu,
          occupied: Math.min(prev.icu.total, prev.icu.occupied + 1)
        }
      }));

      // Play chime/alert
      if (!isMuted) {
        if (newPatient.priority === 'TRAUMA RED') {
          playCodeRedAlert();
        } else {
          playConfirmChime();
        }
      }

      // Add to recent admissions log
      setRecentAdmissionsLog((prev) => [
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          text: `🚨 DIRECT TRANSFER: ${newPatient.caseId} (${newPatient.patientName}) admitted to ER. Live ICU Bed decremented.`,
          type: 'admit'
        },
        ...prev.slice(0, 15)
      ]);
    };

    // Stretcher real-time status update from Ram Singh
    const handleStretcherStatusChanged = (data: any) => {
      if (data && (data.attendantId === 'SA-1047' || !data.attendantId)) {
        setRamSinghStatus({
          statusText: data.statusText || 'Status Updated',
          step: data.step || 'moving',
          lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          dispatchId: data.dispatchId
        });

        setRecentAdmissionsLog((prev) => [
          {
            id: `log-${Date.now()}`,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            text: `🛏️ STRETCHER SYNC (Ram Singh SA-1047): ${data.statusText}`,
            type: 'stretcher'
          },
          ...prev.slice(0, 15)
        ]);
      }
    };

    // Planned Admission and Fast-Track Booking Socket Listeners
    const handleAdmissionBooking = (booking: any) => {
      if (!booking) return;
      setBedCapacity((prev) => ({
        ...prev,
        generalWard: {
          ...prev.generalWard,
          occupied: Math.min(prev.generalWard.total, prev.generalWard.occupied + 1)
        }
      }));

      setRecentAdmissionsLog((prev) => [
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          text: `📋 PLANNED ADMISSION: Token #${booking.bookingId || booking.token || 'ADM-BOOKED'} admitted. Bed decremented.`,
          type: 'admit'
        },
        ...prev.slice(0, 15)
      ]);
    };

    socket.on('patient:inbound_received', handleInboundDispatch);
    socket.on('global:dispatch_update', handleInboundDispatch);
    socket.on('stretcher:status_changed', handleStretcherStatusChanged);
    socket.on('admission:booked', handleAdmissionBooking);
    socket.on('admission:new', handleAdmissionBooking);

    return () => {
      socket.off('patient:inbound_received', handleInboundDispatch);
      socket.off('global:dispatch_update', handleInboundDispatch);
      socket.off('stretcher:status_changed', handleStretcherStatusChanged);
      socket.off('admission:booked', handleAdmissionBooking);
      socket.off('admission:new', handleAdmissionBooking);
      socket.disconnect();
    };
  }, [isMuted]);

  // Dispatch Stretcher Specifically to Ram Singh (SA-1047)
  const handleDispatchToRamSingh = (patient?: PatientQueueItem) => {
    playTactileClick();
    const socket = io({ transports: ['websocket', 'polling'] });
    
    const payload = {
      dispatchId: `disp-${Date.now()}`,
      attendantId: 'SA-1047',
      attendantName: 'Ram Singh',
      patientName: patient?.patientName || 'Emergency Inbound Patient',
      caseId: patient?.caseId || `TNX-2024-${Math.floor(1200 + Math.random() * 100)}`,
      hospitalId: 'gsvm-kanpur',
      hospitalName: 'GSVM Medical College, Kanpur',
      destination: 'Gate 2 – Main Entrance',
      targetBed: 'ICU Bed #4 (Ventilator Bay)',
      reason: patient ? `${patient.type} Transfer` : 'Emergency Patient Transfer',
      priority: patient?.priority === 'TRAUMA RED' ? 'Critical' : 'High',
      etaRequired: 'Within 2 Minutes',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit('stretcher:dispatch', payload);
    
    setRamSinghStatus({
      statusText: `Dispatched to Gate 2 for ${payload.patientName} (Awaiting Ram Singh's Acceptance)`,
      step: 'moving',
      lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      dispatchId: payload.dispatchId
    });

    setRecentAdmissionsLog((prev) => [
      {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text: `⚡ TARGETED DISPATCH: Sent to Ram Singh (SA-1047) for ${payload.patientName} at Gate 2 via Socket.io.`,
        type: 'stretcher'
      },
      ...prev.slice(0, 15)
    ]);

    if (!isMuted) playConfirmChime();
  };

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
        {/* MAIN COMMAND DASHBOARD (Prominent Live Bed Grid + Doctor Left + Live Req & Map Right + Compact Stretcher) */}
        {/* ========================================================================= */}
        <main
          id="reception-main-content"
          className="flex-1 h-full min-h-0 overflow-y-auto p-3.5 lg:p-4 bg-[#070d18] space-y-4"
        >
          {/* ===================================================================== */}
          {/* TOP SECTION: BIG CARDS LIVE BED GRID (ICU, Trauma Bay, Ventilators, NICU, General) */}
          {/* ===================================================================== */}
          <section id="live-bed-grid-section" className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-400" />
                  <span>Live Bed & Critical Care Grid • Real-Time Occupancy</span>
                </h2>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-emerald-400 font-semibold">
                  Total Capacity: {bedCapacity.icu.total + bedCapacity.traumaBay.total + bedCapacity.ventilators.total + bedCapacity.nicu.total + bedCapacity.generalWard.total} Beds
                </span>
                <span className="font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-teal-300">
                  Vacant: {(bedCapacity.icu.total - bedCapacity.icu.occupied) + (bedCapacity.traumaBay.total - bedCapacity.traumaBay.occupied) + (bedCapacity.ventilators.total - bedCapacity.ventilators.inUse) + (bedCapacity.nicu.total - bedCapacity.nicu.occupied) + (bedCapacity.generalWard.total - bedCapacity.generalWard.occupied)} Free
                </span>
              </div>
            </div>

            {/* Prominent Live Bed Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Card 1: ICU Beds */}
              <div
                id="bed-card-icu"
                onClick={() => {
                  playTactileClick();
                  setActiveModal('bed_manager');
                }}
                className="cursor-pointer group relative p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-teal-950/30 border border-teal-500/30 hover:border-teal-400 transition-all shadow-lg hover:shadow-teal-950/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300">ICU BEDS</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-teal-950 border border-teal-500/50 text-teal-300 text-[10px] font-mono font-bold">
                    {Math.round(((bedCapacity.icu.total - bedCapacity.icu.occupied) / bedCapacity.icu.total) * 100)}% Free
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className="text-3xl font-extrabold text-white font-mono">
                    {bedCapacity.icu.total - bedCapacity.icu.occupied}
                    <span className="text-xs text-slate-400 font-normal ml-1">/ {bedCapacity.icu.total} Total</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 text-sm">
                    🛏️
                  </div>
                </div>
                <div className="mt-2.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-400 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(bedCapacity.icu.occupied / bedCapacity.icu.total) * 100}%` }}
                  ></div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Occupied: <strong className="text-slate-200">{bedCapacity.icu.occupied}</strong></span>
                  <span className="text-emerald-400 font-semibold">{bedCapacity.icu.total - bedCapacity.icu.occupied} Ready</span>
                </div>
              </div>

              {/* Card 2: ER Trauma Bay */}
              <div
                id="bed-card-trauma"
                onClick={() => {
                  playTactileClick();
                  setActiveModal('bed_manager');
                }}
                className="cursor-pointer group relative p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-red-950/30 border border-red-500/40 hover:border-red-400 transition-all shadow-lg hover:shadow-red-950/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-red-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                    ER TRAUMA BAY
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-red-950 border border-red-500/50 text-red-300 text-[10px] font-mono font-bold">
                    PRIORITY
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className="text-3xl font-extrabold text-red-300 font-mono">
                    {bedCapacity.traumaBay.total - bedCapacity.traumaBay.occupied}
                    <span className="text-xs text-slate-400 font-normal ml-1">/ {bedCapacity.traumaBay.total} Total</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-sm">
                    🚨
                  </div>
                </div>
                <div className="mt-2.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-red-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(bedCapacity.traumaBay.occupied / bedCapacity.traumaBay.total) * 100}%` }}
                  ></div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Occupied: <strong className="text-slate-200">{bedCapacity.traumaBay.occupied}</strong></span>
                  <span className="text-red-400 font-bold">{bedCapacity.traumaBay.total - bedCapacity.traumaBay.occupied} Available</span>
                </div>
              </div>

              {/* Card 3: Ventilators */}
              <div
                id="bed-card-ventilators"
                onClick={() => {
                  playTactileClick();
                  setActiveModal('bed_manager');
                }}
                className="cursor-pointer group relative p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-blue-950/30 border border-blue-500/30 hover:border-blue-400 transition-all shadow-lg hover:shadow-blue-950/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-300">VENTILATORS</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-blue-950 border border-blue-500/50 text-blue-300 text-[10px] font-mono font-bold">
                    Active
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className="text-3xl font-extrabold text-blue-300 font-mono">
                    {bedCapacity.ventilators.total - bedCapacity.ventilators.inUse}
                    <span className="text-xs text-slate-400 font-normal ml-1">/ {bedCapacity.ventilators.total} Total</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-sm">
                    💨
                  </div>
                </div>
                <div className="mt-2.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(bedCapacity.ventilators.inUse / bedCapacity.ventilators.total) * 100}%` }}
                  ></div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>In-Use: <strong className="text-slate-200">{bedCapacity.ventilators.inUse}</strong></span>
                  <span className="text-blue-400 font-semibold">{bedCapacity.ventilators.total - bedCapacity.ventilators.inUse} Standby</span>
                </div>
              </div>

              {/* Card 4: NICU Warmers */}
              <div
                id="bed-card-nicu"
                onClick={() => {
                  playTactileClick();
                  setActiveModal('bed_manager');
                }}
                className="cursor-pointer group relative p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-purple-950/30 border border-purple-500/30 hover:border-purple-400 transition-all shadow-lg hover:shadow-purple-950/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300">NICU WARMERS</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-purple-950 border border-purple-500/50 text-purple-300 text-[10px] font-mono font-bold">
                    Neo-Natal
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className="text-3xl font-extrabold text-purple-300 font-mono">
                    {bedCapacity.nicu.total - bedCapacity.nicu.occupied}
                    <span className="text-xs text-slate-400 font-normal ml-1">/ {bedCapacity.nicu.total} Total</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 text-sm">
                    👶
                  </div>
                </div>
                <div className="mt-2.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(bedCapacity.nicu.occupied / bedCapacity.nicu.total) * 100}%` }}
                  ></div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Occupied: <strong className="text-slate-200">{bedCapacity.nicu.occupied}</strong></span>
                  <span className="text-purple-300 font-semibold">{bedCapacity.nicu.total - bedCapacity.nicu.occupied} Ready</span>
                </div>
              </div>

              {/* Card 5: General Ward */}
              <div
                id="bed-card-general"
                onClick={() => {
                  playTactileClick();
                  setActiveModal('bed_manager');
                }}
                className="cursor-pointer group relative p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-emerald-950/30 border border-emerald-500/30 hover:border-emerald-400 transition-all shadow-lg hover:shadow-emerald-950/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">GENERAL WARD</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold">
                    Step-Down
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className="text-3xl font-extrabold text-emerald-300 font-mono">
                    {bedCapacity.generalWard.total - bedCapacity.generalWard.occupied}
                    <span className="text-xs text-slate-400 font-normal ml-1">/ {bedCapacity.generalWard.total} Total</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm">
                    🏥
                  </div>
                </div>
                <div className="mt-2.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(bedCapacity.generalWard.occupied / bedCapacity.generalWard.total) * 100}%` }}
                  ></div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Occupied: <strong className="text-slate-200">{bedCapacity.generalWard.occupied}</strong></span>
                  <span className="text-emerald-400 font-semibold">{bedCapacity.generalWard.total - bedCapacity.generalWard.occupied} Vacant</span>
                </div>
              </div>
            </div>
          </section>

          {/* ===================================================================== */}
          {/* MIDDLE SECTION: Doctor Card on Left (4.5 Cols) + Live Incoming Req & Radar Map on Right (7.5 Cols) */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* ------------------------------------------------------------- */}
            {/* LEFT SIDE: Doctor Availability Roster (Full Card with All Details) */}
            {/* ------------------------------------------------------------- */}
            <div
              id="card-doctor-roster-left"
              className="lg:col-span-5 xl:col-span-4 bg-[#0a1324] border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-xl space-y-3"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-teal-500/20 border border-teal-500/50 flex items-center justify-center text-teal-300 text-xs font-bold font-mono">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white tracking-tight">Doctor Availability Roster</h2>
                      <p className="text-[10px] text-slate-400">On-duty specialists & critical departments</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-teal-950/80 border border-teal-600/50 text-teal-300 font-mono text-[10px] font-bold">
                    {doctorRoster.filter(d => d.status === 'Available').length} Active
                  </span>
                </div>

                {/* Full Doctor Roster List */}
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {doctorRoster.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.avatar}
                          alt={item.doctor}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0 group-hover:border-teal-400 transition-colors"
                        />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{item.doctor}</span>
                          </div>
                          <div className="text-[10px] text-teal-400 font-medium">{item.specialist} • <span className="text-slate-400">{item.dept || 'Main ER'}</span></div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            item.status === 'Available'
                              ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/50'
                              : 'text-amber-400 bg-amber-950/60 border border-amber-800/50'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === 'Available' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                            }`}
                          ></span>
                          {item.status}
                        </span>
                        <div className="text-[9px] text-slate-500 font-mono mt-0.5">Till {item.availableTill}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Action: Full Roster & Token Integration */}
              <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => {
                    playTactileClick();
                    setActiveModal('doctor_roster');
                  }}
                  className="text-xs text-teal-400 hover:text-teal-300 font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  <span>View Full Specialist Roster</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    playTactileClick();
                    setTokenHistoryModal(true);
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-mono"
                >
                  ₹500 Tokens
                </button>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* RIGHT SIDE: Live Incoming Requests + Interactive Map View (7.5 Cols) */}
            {/* ------------------------------------------------------------- */}
            <div
              id="card-live-requests-map-right"
              className="lg:col-span-7 xl:col-span-8 bg-[#0a1324] border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-xl space-y-3"
            >
              <div>
                {/* Header & Tabs */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-300 text-xs font-bold font-mono">
                      🚑
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                        <span>Live Inbound Requests & Radar Map</span>
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      </h2>
                      <p className="text-[10px] text-slate-400">GSVM Medical College Kanpur Emergency Influx</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Tabs: IN QUEUE | IN TRANSIT */}
                    <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                      <button
                        onClick={() => {
                          playTactileClick();
                          setTrackerTab('in_queue');
                        }}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                          trackerTab === 'in_queue'
                            ? 'bg-teal-950 border border-teal-500/60 text-teal-300'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        IN QUEUE ({inQueuePatients.length})
                      </button>
                      <button
                        onClick={() => {
                          playTactileClick();
                          setTrackerTab('in_transit');
                        }}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                          trackerTab === 'in_transit'
                            ? 'bg-teal-950 border border-teal-500/60 text-teal-300'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        IN TRANSIT ({inTransitPatients.length})
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        playTactileClick();
                        setActiveModal('live_map');
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-teal-300 hover:text-white text-[10px] font-semibold flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Full Map</span>
                    </button>
                  </div>
                </div>

                {/* Split: Live Patients Table (Left) + Interactive Dark GPS Canvas (Right) */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
                  {/* Table of Inbound Patients */}
                  <div className="xl:col-span-7 overflow-x-auto max-h-[350px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-[#0a1324] z-10">
                        <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800/80">
                          <th className="pb-1.5 font-semibold">Patient / Case ID</th>
                          <th className="pb-1.5 font-semibold">Emergency</th>
                          <th className="pb-1.5 font-semibold">ETA</th>
                          <th className="pb-1.5 font-semibold">Triage</th>
                          <th className="pb-1.5 font-semibold text-right">Dispatch Stretcher / AI Report</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {((trackerTab === 'in_queue' ? inQueuePatients : inTransitPatients).length === 0) ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center">
                              <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
                                <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 text-lg">
                                  📋
                                </div>
                                <div className="text-xs font-bold text-slate-400">
                                  No Active {trackerTab === 'in_queue' ? 'In-Queue' : 'In-Transit'} Dispatches
                                </div>
                                <p className="text-[10px] text-slate-500 max-w-xs">
                                  Reports submitted from Citizen Triage (/patient) or Paramedics will appear here instantly in real-time.
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          (trackerTab === 'in_queue' ? inQueuePatients : inTransitPatients).map((patient) => (
                            <tr key={patient.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-2">
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
                                    <div className="font-mono font-bold text-white text-[11px] flex items-center gap-1">
                                      <span>{patient.caseId}</span>
                                      {patient.hasAiReport && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium">{patient.patientName} • {patient.ageGender}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2 text-slate-300 text-[11px]">
                                <div>{patient.type}</div>
                                <div className="text-[9px] font-mono text-slate-500">SpO2: {patient.vitals?.spo2 || 94}%</div>
                              </td>
                              <td className="py-2 font-mono text-amber-300 font-semibold text-[11px]">
                                {patient.etaMinutes}m
                              </td>
                              <td className="py-2">
                                <span
                                  className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase ${
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
                              <td className="py-2 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Dedicated Dispatch Stretcher to Ram Singh Button */}
                                  <button
                                    onClick={() => handleDispatchToRamSingh(patient)}
                                    className="px-2 py-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-[10px] rounded-lg inline-flex items-center gap-1 transition-all shadow-sm shadow-orange-950/40 cursor-pointer active:scale-95"
                                    title="Dispatch Stretcher specifically to Ram Singh (SA-1047) via Socket.io"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                                    <span>Dispatch Stretcher</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      playTactileClick();
                                      setSelectedAiReport({
                                        reportId: `REP-${patient.caseId}`,
                                        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                                        patientName: patient.patientName,
                                        patientAge: patient.ageGender.split('/')[0].trim() || '32Y',
                                        gender: patient.ageGender.includes('Female') ? 'Female' : 'Male',
                                        inputMethod: 'AI Voice Triage',
                                        emergencyCategory: patient.type,
                                        symptomDuration: '<30 mins',
                                        consciousness: patient.priority === 'TRAUMA RED' ? 'Drowsy' : 'Alert',
                                        vitals: {
                                          spo2: patient.vitals?.spo2 || 94,
                                          pulse: patient.vitals?.hr || 98,
                                          bp: patient.vitals?.bp || '130/85'
                                        },
                                        medicalRedFlags: [
                                          patient.type,
                                          patient.priority === 'TRAUMA RED' ? 'Severe trauma / acute distress' : 'Urgent ER attention required',
                                          'Transferred directly to GSVM Reception Desk'
                                        ],
                                        allergies: 'None recorded',
                                        hospital: {
                                          id: 'gsvm-kanpur',
                                          name: selectedHospital,
                                          address: 'GSVM Medical College Campus, Swaroop Nagar, Kanpur, UP 208002',
                                          travelTime: `${patient.etaMinutes} mins`,
                                          travelTimeMinutes: patient.etaMinutes,
                                          lat: 26.4712,
                                          lng: 80.3211,
                                          availableIcuBeds: bedCapacity.icu.total - bedCapacity.icu.occupied,
                                          availableVentilators: bedCapacity.ventilators.total - bedCapacity.ventilators.inUse,
                                          verifiedStatus: 'Govt Medical College ER (ABDM Verified)'
                                        } as any,
                                        userLocationName: 'Kanpur Urban Emergency Zone',
                                        qrTokenId: patient.caseId,
                                        severityLevel: patient.priority === 'TRAUMA RED'
                                          ? 'RED (Critical / Immediate)'
                                          : 'YELLOW (Urgent)',
                                        clinicalSummary: patient.clinicalNotes || `Emergency patient ${patient.patientName} presenting with acute ${patient.type}. Pre-arrival admission and bed assignment verified on live ER console.`,
                                        aiSuggestedActions: [
                                          'Prepare assigned ER Trauma / Observation bed',
                                          'Dispatch stretcher bearer to Gate 1 ramp',
                                          'Paramedic handover & vitals verification upon arrival'
                                        ]
                                      });
                                    }}
                                    className="px-2 py-1 bg-teal-950/90 hover:bg-teal-900 border border-teal-500/60 text-teal-300 font-bold text-[10px] rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer"
                                    title="View full AI Clinical Report & PDF"
                                  >
                                    <FileText className="w-3 h-3 text-teal-400" />
                                    <span>Report</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Dark Map Canvas with Live Telemetry Nodes */}
                  <div className="xl:col-span-5 h-48 xl:h-[350px] rounded-xl bg-[#060c18] border border-slate-800 relative overflow-hidden flex items-center justify-center p-2 shadow-inner">
                    {/* Background Radar Grid */}
                    <div
                      className="absolute inset-0 opacity-25"
                      style={{
                        backgroundImage:
                          'radial-gradient(#14b8a6 1px, transparent 1px), radial-gradient(#1e293b 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 10px 10px'
                      }}
                    ></div>

                    {/* Concentric Radar Rings */}
                    <div className="absolute w-44 h-44 rounded-full border border-teal-500/20 animate-ping"></div>
                    <div className="absolute w-64 h-64 rounded-full border border-teal-500/15"></div>

                    {/* Central Hospital Beacon */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="relative">
                        <span className="absolute -inset-2 rounded-full bg-teal-500/30 animate-pulse"></span>
                        <div className="w-9 h-9 rounded-full bg-teal-600 border-2 border-teal-300 flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-teal-500/50">
                          🏥
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-teal-300 mt-1 bg-slate-950/90 px-2 py-0.5 rounded border border-teal-700/80 font-mono">
                        GSVM KANPUR ER
                      </span>
                    </div>

                    {/* Ambulance Nodes on Radar */}
                    <div className="absolute top-4 left-6 flex items-center gap-1 z-10">
                      <div className="w-5 h-5 rounded-full bg-red-600 border border-red-300 flex items-center justify-center text-[10px] text-white animate-bounce shadow">
                        🚑
                      </div>
                      <div className="bg-slate-950/90 border border-red-500/60 px-1.5 py-0.5 rounded text-[9px] text-red-300 font-mono font-bold">
                        TNX-1258 (12m)
                      </div>
                    </div>

                    <div className="absolute bottom-6 right-6 flex items-center gap-1 z-10">
                      <div className="w-5 h-5 rounded-full bg-red-600 border border-red-300 flex items-center justify-center text-[10px] text-white animate-pulse shadow">
                        🚑
                      </div>
                      <div className="bg-slate-950/90 border border-red-500/60 px-1.5 py-0.5 rounded text-[9px] text-red-300 font-mono font-bold">
                        TNX-1259 (18m)
                      </div>
                    </div>

                    <div className="absolute top-10 right-8 z-10">
                      <div className="w-4 h-4 rounded-full bg-amber-500 border border-amber-200 flex items-center justify-center text-[8px] text-white">
                        🚑
                      </div>
                    </div>

                    {/* Map Zoom & Controls */}
                    <div className="absolute bottom-2 right-2 flex flex-col gap-1 bg-slate-900/90 border border-slate-700 rounded p-0.5 z-10">
                      <button
                        onClick={() => setActiveModal('live_map')}
                        className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-white text-[10px] font-bold"
                        title="Expand Map"
                      >
                        ⛶
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Summary */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  Active Dispatches: <strong className="text-white font-mono">{patients.length} Inbound</strong>
                </span>
                <button
                  onClick={() => {
                    playTactileClick();
                    setActiveModal('live_map');
                  }}
                  className="text-xs text-teal-400 hover:text-teal-300 font-semibold inline-flex items-center gap-1"
                >
                  <span>Open Full Screen GPS Grid</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* BOTTOM SECTION: COMPACT STRETCHER STAFF WELFARE & RAM SINGH DISPATCH */}
          {/* ===================================================================== */}
          <section
            id="compact-stretcher-staff-section"
            className="bg-[#0a1324] border border-slate-800/90 rounded-2xl p-3.5 shadow-xl space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-orange-300 text-xs font-bold font-mono">
                  🛏️
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Stretcher Attendant Live Dispatch • Ram Singh (SA-1047)
                  </h3>
                  <p className="text-[10px] text-slate-400">Targeted real-time Socket.io dispatch channel directly to Ram Singh's phone</p>
                </div>
              </div>

              {/* Compact Metrics Strip */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-2 py-1 rounded-lg bg-slate-900/90 border border-emerald-800/40 text-[10px]">
                  <span className="text-slate-400 mr-1">Available:</span>
                  <strong className="text-emerald-400 font-mono">{stretcherStats.available}</strong>
                </div>
                <div className="px-2 py-1 rounded-lg bg-slate-900/90 border border-amber-800/40 text-[10px]">
                  <span className="text-slate-400 mr-1">In Use:</span>
                  <strong className="text-amber-400 font-mono">{stretcherStats.inUse}</strong>
                </div>
                <div className="px-2 py-1 rounded-lg bg-slate-900/90 border border-teal-800/40 text-[10px]">
                  <span className="text-slate-400 mr-1">Staff On Duty:</span>
                  <strong className="text-teal-400 font-mono">{stretcherStats.staffOnDuty}</strong>
                </div>
                <button
                  onClick={() => handleDispatchToRamSingh()}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md shadow-orange-950/50 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>⚡ Dispatch to Ram Singh (SA-1047)</span>
                </button>
              </div>
            </div>

            {/* Prominent Live Socket Status Card for Ram Singh SA-1047 */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-orange-950/20 border border-orange-500/40 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="Ram Singh"
                    className="w-10 h-10 rounded-full object-cover border-2 border-orange-400/80 shadow"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse"></span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">Ram Singh</span>
                    <span className="px-1.5 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-700/60 text-[9px] font-mono font-bold">
                      SA-1047
                    </span>
                    <span className="text-[10px] text-slate-400">Emergency Stretcher Bearer</span>
                  </div>
                  <div className="text-[11px] font-semibold text-orange-300 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping"></span>
                    <span>Live Socket Status: {ramSinghStatus.statusText}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">Last Update: {ramSinghStatus.lastUpdated}</span>
                <button
                  onClick={() => handleDispatchToRamSingh()}
                  className="px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/60 text-orange-300 hover:text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Trigger Live Socket Dispatch
                </button>
              </div>
            </div>

            {/* Zones in Horizontal Compact Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              {stretcherZones.map((z) => (
                <div
                  key={z.id}
                  className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200 text-[11px]">{z.zone}</div>
                    <div className="text-[9px] text-slate-400">{z.staffAssigned} Staff • {z.lastUpdate}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-400 text-xs">{z.available} Free</div>
                    <div className="font-mono text-[9px] text-amber-400">{z.inUse} In-Use</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
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
      {/* MODAL: Patient AI Clinical Emergency Report Viewer */}
      {selectedAiReport && (
        <PatientReportModal
          isOpen={!!selectedAiReport}
          report={selectedAiReport}
          onClose={() => setSelectedAiReport(null)}
        />
      )}
    </div>
  );
};
