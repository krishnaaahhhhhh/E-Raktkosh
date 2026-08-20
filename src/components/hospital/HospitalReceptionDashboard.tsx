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
  FileText,
  Sun,
  Moon
} from 'lucide-react';
import { playTactileClick, playConfirmChime, playCodeRedAlert, playCodeAmberAlert } from '../../lib/audio';
import { PatientReportModal, PatientEmergencyReportData } from '../citizen/PatientReportModal';
import { LiveWardPatientOverview } from './LiveWardPatientOverview';
import { PatientInboundHistoryView, PatientHistoryRecord } from './PatientInboundHistoryView';
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
  const [dashboardViewMode, setDashboardViewMode] = useState<'command_grid' | 'ward_patient_locator' | 'patient_history'>('command_grid');
  const [liveHistoryRecords, setLiveHistoryRecords] = useState<PatientHistoryRecord[]>([]);

  // Selected Hospital Facility
  const [selectedHospital, setSelectedHospital] = useState<string>('GSVM Medical College, Kanpur');
  const [isHospitalDropdownOpen, setIsHospitalDropdownOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Audio mute toggle
  const [isMuted, setIsMuted] = useState(false);

  // Theme state: Light Mode default
  const [isLightMode, setIsLightMode] = useState<boolean>(true);

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

  const handleBedCountChange = (wardType: string, delta: number) => {
    setBedCapacity((prev) => {
      if (wardType === 'icu') {
        return { ...prev, icu: { ...prev.icu, occupied: Math.max(0, Math.min(prev.icu.total, prev.icu.occupied + delta)) } };
      } else if (wardType === 'trauma') {
        return { ...prev, traumaBay: { ...prev.traumaBay, occupied: Math.max(0, Math.min(prev.traumaBay.total, prev.traumaBay.occupied + delta)) } };
      } else if (wardType === 'ventilator') {
        return { ...prev, ventilators: { ...prev.ventilators, inUse: Math.max(0, Math.min(prev.ventilators.total, prev.ventilators.inUse + delta)) } };
      } else if (wardType === 'nicu') {
        return { ...prev, nicu: { ...prev.nicu, occupied: Math.max(0, Math.min(prev.nicu.total, prev.nicu.occupied + delta)) } };
      } else if (wardType === 'general') {
        return { ...prev, generalWard: { ...prev.generalWard, occupied: Math.max(0, Math.min(prev.generalWard.total, prev.generalWard.occupied + delta)) } };
      }
      return prev;
    });
  };

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
    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newTok = {
      tokenNumber: randomId,
      priority: 'TRAUMA RED',
      amount: 500,
      patientAgeGender: '29Y / Male',
      bookedBy: 'NHM Fast-Track Desk',
      time: nowTimeStr,
      status: 'Confirmed'
    };
    setCurrentToken(newTok);
    setGenerateTokenModal(false);

    // Auto-record into live history archive
    setLiveHistoryRecords((prev) => [
      {
        id: `rec-${Date.now()}`,
        caseId: randomId,
        tokenNumber: randomId,
        patientName: 'Emergency Walk-In Case',
        age: 29,
        gender: 'Male',
        arrivalSource: 'fast_track_token',
        sourceDetail: '₹500 Fast-Track Counter Slip (Zero-Wait Triage)',
        priority: 'TRAUMA RED',
        condition: 'Acute Emergency Triage • Fast-Track Registration',
        admittedWard: 'ER Trauma Resus Bay',
        bedNumber: 'Trauma Bay #01',
        floor: 'Floor Ground • Emergency Complex',
        assignedDoctor: 'Dr. P. Sharma',
        doctorSpecialty: 'Emergency Medicine',
        arrivalTime: `Today, ${nowTimeStr}`,
        admittedAt: `${nowTimeStr} (Auto-Allotted)`,
        status: 'admitted',
        tokenAmount: 500,
        vitals: { bp: '122/82', spo2: 98, pulse: 84 },
        redFlags: { bloodThinners: false, hypertension: false, diabetes: false, heartDisease: false },
        aiReportSummary: 'Instant fast-track token generated with zero queue delay. Patient priority flagged as Trauma Red.',
        aiSuggestedActions: [
          'Immediate evaluation by emergency physician.',
          'Sync telemetry with central GSVM database.'
        ]
      },
      ...prev
    ]);

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
      className={`w-full h-full min-h-screen flex flex-col font-sans select-none overflow-hidden transition-colors ${
        isLightMode ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#070d18] text-slate-100'
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER (Matching exact screenshot with Live badge & Admin dropdown) */}
      {/* ========================================================================= */}
      <header
        id="reception-top-header"
        className={`w-full border-b px-4 py-2.5 flex items-center justify-between z-30 shrink-0 shadow-sm transition-colors ${
          isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0a1222] border-slate-800/80 text-white'
        }`}
      >
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-9 h-9 rounded-lg border flex items-center justify-center shadow-xs transition-colors ${
              isLightMode
                ? 'bg-teal-50 border-teal-200 text-teal-700'
                : 'bg-emerald-500/20 border-emerald-500/40 text-white shadow-emerald-500/20'
            }`}
          >
            <Activity className={`w-5 h-5 ${isLightMode ? 'text-teal-600' : 'text-emerald-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-bold tracking-tight font-mono ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                Prathmikta
              </span>
            </div>
            <div
              className={`text-[10px] uppercase font-bold tracking-widest -mt-0.5 ${
                isLightMode ? 'text-teal-700 font-extrabold' : 'text-teal-400/90'
              }`}
            >
              RECEPTION COMMAND CENTER
            </div>
          </div>
        </div>

        {/* Live Automatic Bed Status Bar */}
        <div
          className={`hidden xl:flex items-center gap-3 border rounded-lg px-3 py-1.5 shadow-xs transition-colors ${
            isLightMode ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900/90 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs">
            <BedDouble className={`w-3.5 h-3.5 ${isLightMode ? 'text-teal-600' : 'text-emerald-400'}`} />
            <span className={`font-semibold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>Live Bed Grid:</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {/* ICU */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>ICU Free:</span>
              <span className={`font-bold ${isLightMode ? 'text-rose-700' : 'text-red-400'}`}>
                {bedCapacity.icu.total - bedCapacity.icu.occupied} / {bedCapacity.icu.total}
              </span>
            </div>

            {/* Trauma */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>Trauma Bays:</span>
              <span className={`font-bold ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`}>
                {bedCapacity.traumaBay.total - bedCapacity.traumaBay.occupied} / {bedCapacity.traumaBay.total}
              </span>
            </div>

            {/* NICU */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>NICU:</span>
              <span className={`font-bold ${isLightMode ? 'text-purple-700' : 'text-purple-300'}`}>
                {bedCapacity.nicu.total - bedCapacity.nicu.occupied} / {bedCapacity.nicu.total}
              </span>
            </div>

            {/* Ventilators */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>Vents Free:</span>
              <span className={`font-bold ${isLightMode ? 'text-cyan-800' : 'text-cyan-300'}`}>
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
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
              isLightMode
                ? isAutoAdmissionActive
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                : isAutoAdmissionActive
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
            }`}
            title="Toggle Real-Time Automatic Bed Admission Engine"
          >
            {isAutoAdmissionActive ? (
              <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
            ) : (
              <Pause className="w-3 h-3 text-amber-600" />
            )}
            <span>Auto-Bed Sync: {isAutoAdmissionActive ? 'ACTIVE' : 'PAUSED'}</span>
          </button>
        </div>

        {/* Right Nav: LIVE Status, Theme Toggle, Bell, Facility Switcher & Admin Desk */}
        <div className="flex items-center gap-2.5">
          {/* Live Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold tracking-wide ${
              isLightMode
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>LIVE</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => {
              playTactileClick();
              setIsLightMode(!isLightMode);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              isLightMode
                ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200 shadow-xs'
                : 'bg-slate-900 border-slate-700/80 text-slate-200 hover:bg-slate-800'
            }`}
            title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLightMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              playTactileClick();
              setIsMuted(!isMuted);
            }}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isLightMode
                ? 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* Notification Bell with Badge */}
          <div className="relative">
            <button
              onClick={() => {
                playTactileClick();
                setIsNotificationsOpen(!isNotificationsOpen);
              }}
              className={`relative p-2 rounded-lg border transition-colors cursor-pointer ${
                isLightMode
                  ? 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  : 'bg-slate-900 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                3
              </span>
            </button>

            {/* Notification Dropdown */}
            {isNotificationsOpen && (
              <div
                className={`absolute right-0 mt-2 w-80 border rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 ${
                  isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                }`}
              >
                <div className={`flex items-center justify-between pb-2 border-b mb-2 ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
                  <span className={`text-xs font-bold uppercase tracking-wider ${isLightMode ? 'text-slate-800' : 'text-slate-300'}`}>
                    Live ER Alerts
                  </span>
                  <span className={`text-[10px] font-mono ${isLightMode ? 'text-emerald-700 font-bold' : 'text-emerald-400'}`}>3 Unread</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div
                    className={`p-2 rounded-lg border ${
                      isLightMode ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-red-950/40 border-red-800/40 text-red-200'
                    }`}
                  >
                    <p className="font-semibold">🚨 Incoming Red Trauma: TNX-1258</p>
                    <p className={`text-[10px] mt-0.5 ${isLightMode ? 'text-rose-700' : 'text-red-300/80'}`}>
                      ETA: 12 mins • Stretcher Assigned Gate 1
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded-lg border ${
                      isLightMode ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/40 border-amber-800/40 text-amber-200'
                    }`}
                  >
                    <p className="font-semibold">⚠️ Cardiac ICU Bed Allocated</p>
                    <p className={`text-[10px] mt-0.5 ${isLightMode ? 'text-amber-700' : 'text-amber-300/80'}`}>
                      Dr. M. Khanna Cath Lab ready
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded-lg border ${
                      isLightMode ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}
                  >
                    <p className="font-semibold">ℹ️ Shift Rotation Sync</p>
                    <p className={`text-[10px] mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>28 Staff on active duty</p>
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                isLightMode
                  ? 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                  : 'bg-slate-900 border-slate-700/80 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Building2 className={`w-3.5 h-3.5 ${isLightMode ? 'text-teal-600' : 'text-teal-400'}`} />
              <span className="max-w-[150px] truncate">{selectedHospital}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isHospitalDropdownOpen && (
              <div
                className={`absolute right-0 mt-2 w-64 border rounded-xl shadow-2xl py-1 z-50 ${
                  isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
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
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                      isLightMode
                        ? selectedHospital === hosp
                          ? 'text-teal-700 font-semibold bg-teal-50'
                          : 'text-slate-700 hover:bg-slate-50'
                        : selectedHospital === hosp
                        ? 'text-teal-400 font-semibold bg-slate-800/50'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{hosp}</span>
                    {selectedHospital === hosp && (
                      <Check className={`w-3.5 h-3.5 ${isLightMode ? 'text-teal-700' : 'text-teal-400'}`} />
                    )}
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
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                isLightMode
                  ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  : 'bg-slate-900 border-slate-700/80 hover:bg-slate-800'
              }`}
            >
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80"
                alt="Admin avatar"
                className="w-6 h-6 rounded-full object-cover border border-teal-500/50"
              />
              <span className={`text-xs font-medium ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>Admin Desk</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isAdminMenuOpen && (
              <div
                className={`absolute right-0 mt-2 w-48 border rounded-xl shadow-2xl py-1.5 z-50 ${
                  isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className={`px-3 py-2 border-b text-xs ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
                  <p className={`font-semibold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Chief Triage Officer</p>
                  <p className={`text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Desk ID: REC-KANPUR-01</p>
                </div>
                <button
                  onClick={() => {
                    setMode('landing');
                    playTactileClick();
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 cursor-pointer ${
                    isLightMode ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-950' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <ArrowRight className={`w-3.5 h-3.5 ${isLightMode ? 'text-teal-600' : 'text-teal-400'}`} />
                  <span>Go to Public Portal</span>
                </button>
                <button
                  onClick={() => {
                    setMode('partner');
                    playTactileClick();
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 cursor-pointer ${
                    isLightMode ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-950' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Shield className={`w-3.5 h-3.5 ${isLightMode ? 'text-teal-600' : 'text-teal-400'}`} />
                  <span>ABDM Registration (/hb)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auto-Admission Floating Notification Toast */}
      {latestAdmittedToast && (
        <div
          className={`fixed top-14 left-1/2 -translate-x-1/2 z-50 border rounded-xl p-3 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
            isLightMode
              ? 'bg-white border-teal-300 text-slate-900 shadow-teal-500/10'
              : 'bg-gradient-to-r from-red-950 via-slate-900 to-teal-950 border-teal-500/60 shadow-teal-500/20 text-slate-200'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
              isLightMode ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-teal-500/20 border-teal-500/40 text-teal-300'
            }`}
          >
            <Sparkles className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold font-mono ${isLightMode ? 'text-teal-800' : 'text-teal-300'}`}>
                ⚡ LIVE AUTO-ADMISSION
              </span>
              <span className={`text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{latestAdmittedToast.time}</span>
            </div>
            <p className={`text-xs ${isLightMode ? 'text-slate-700' : 'text-slate-200'}`}>
              Patient <strong className={`font-mono ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{latestAdmittedToast.caseId}</strong> ({latestAdmittedToast.type}) admitted to{' '}
              <strong className={isLightMode ? 'text-emerald-700 font-bold' : 'text-emerald-400'}>{latestAdmittedToast.bedAssigned}</strong>.
            </p>
            <p className={`text-[10px] font-medium ${isLightMode ? 'text-teal-700' : 'text-teal-400/90'}`}>
              Bed availability decremented automatically without manual entry.
            </p>
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
          className={`w-56 lg:w-60 border-r flex flex-col justify-between shrink-0 p-3 overflow-y-auto transition-colors ${
            isLightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#08101e] border-slate-800/80'
          }`}
        >
          {/* Main Navigation Links */}
          <div className="space-y-1">
            {[
              { id: 'command_dashboard', label: 'Command Dashboard', icon: Building2 },
              { id: 'ward_patient_overview', label: 'Ward & Bed Locator', icon: BedDouble, badge: 'Live', badgeColor: 'bg-teal-600' },
              { id: 'patient_history', label: 'Patient Inbound & Admission History', icon: FileText, badge: 'Archive', badgeColor: 'bg-indigo-600' },
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
                    if (item.id === 'ward_patient_overview') setDashboardViewMode('ward_patient_locator');
                    if (item.id === 'command_dashboard') setDashboardViewMode('command_grid');
                    if (item.id === 'patient_history') setDashboardViewMode('patient_history');
                    if (item.id === 'reports_analytics') setDashboardViewMode('patient_history');
                    if (item.id === 'doctor_roster') setActiveModal('doctor_roster');
                    if (item.id === 'live_tracker') setActiveModal('live_map');
                    if (item.id === 'token_desk') setTokenHistoryModal(true);
                    if (item.id === 'stretcher_manager') setActiveModal('stretcher_dispatch');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? isLightMode
                        ? 'bg-teal-50 border border-teal-300 text-teal-900 font-bold shadow-xs'
                        : 'bg-teal-950/70 border border-teal-500/40 text-teal-300 font-semibold shadow-md shadow-teal-950/50'
                      : isLightMode
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? (isLightMode ? 'text-teal-700' : 'text-teal-400') : (isLightMode ? 'text-slate-500' : 'text-slate-400')}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white ${item.badgeColor || (isLightMode ? 'bg-slate-600' : 'bg-slate-700')}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Widget: System Status & Emergency Override */}
          <div className={`pt-4 border-t space-y-3 ${isLightMode ? 'border-slate-200' : 'border-slate-800/80'}`}>
            {/* System Status Card */}
            <div
              className={`p-2.5 rounded-xl border text-[11px] space-y-1 ${
                isLightMode ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900/90 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-medium ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>System Status</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className={`font-semibold ${isLightMode ? 'text-emerald-700' : 'text-emerald-400'}`}>All Systems Operational</div>
              <div className={`text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>Last Sync: {currentTime || '10:24:18 AM'}</div>
              <div className={`text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>Uptime: 99.98%</div>
            </div>

            {/* Emergency Override Button */}
            <button
              onClick={() => {
                playTactileClick();
                setActiveModal('emergency_override');
              }}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isLightMode
                  ? 'bg-rose-50 border-rose-300 hover:bg-rose-100 text-rose-800 shadow-xs'
                  : 'bg-red-950/40 border-red-600/50 hover:bg-red-900/50 text-red-300 shadow-md shadow-red-950/50'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${isLightMode ? 'text-rose-600' : 'text-red-400'}`} />
              <span>Emergency Override</span>
            </button>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* MAIN COMMAND DASHBOARD (Prominent Live Bed Grid + Doctor Left + Live Req & Map Right + Compact Stretcher) */}
        {/* ========================================================================= */}
        <main
          id="reception-main-content"
          className={`flex-1 h-full min-h-0 overflow-y-auto p-3.5 lg:p-4 space-y-4 transition-colors ${
            isLightMode ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#070d18] text-slate-100'
          }`}
        >
          {/* Main Dashboard View Selector Strip */}
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-2xl border shadow-sm transition-colors ${
              isLightMode ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-[#0a1324] border-slate-800/90 shadow-md'
            }`}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  playTactileClick();
                  setDashboardViewMode('command_grid');
                  setActiveSidebarNav('command_dashboard');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  dashboardViewMode === 'command_grid'
                    ? isLightMode
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                      : 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/25'
                    : isLightMode
                    ? 'text-slate-700 hover:text-slate-950 bg-slate-100 border border-slate-200'
                    : 'text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Command Matrix View</span>
              </button>

              <button
                onClick={() => {
                  playTactileClick();
                  setDashboardViewMode('ward_patient_locator');
                  setActiveSidebarNav('ward_patient_overview');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  dashboardViewMode === 'ward_patient_locator'
                    ? isLightMode
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                      : 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/25'
                    : isLightMode
                    ? 'text-slate-700 hover:text-slate-950 bg-slate-100 border border-slate-200'
                    : 'text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800'
                }`}
              >
                <BedDouble className="w-4 h-4" />
                <span>Ward &amp; Bed Patient Locator</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </button>

              <button
                onClick={() => {
                  playTactileClick();
                  setDashboardViewMode('patient_history');
                  setActiveSidebarNav('patient_history');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  dashboardViewMode === 'patient_history'
                    ? isLightMode
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                      : 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/25'
                    : isLightMode
                    ? 'text-slate-700 hover:text-slate-950 bg-slate-100 border border-slate-200'
                    : 'text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Inbound &amp; Admission History</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                  dashboardViewMode === 'patient_history'
                    ? 'bg-white/20 text-white'
                    : isLightMode
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-indigo-950 text-indigo-300'
                }`}>
                  Golden Hour &amp; Tokens
                </span>
              </button>
            </div>

            <div className={`text-[11px] flex items-center gap-2 px-2 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
              <span className={`font-mono font-semibold ${isLightMode ? 'text-emerald-700' : 'text-emerald-400'}`}>● Real-time Bed Sync</span>
              <span className={isLightMode ? 'text-slate-300' : 'text-slate-600'}>•</span>
              <span>GSVM Central HIS Grid</span>
            </div>
          </div>

          {dashboardViewMode === 'ward_patient_locator' ? (
            /* Dedicated Full Ward & Bed Patient Locator View */
            <LiveWardPatientOverview
              isLightMode={isLightMode}
              onViewPatientReport={(rep) => setSelectedAiReport(rep)}
              onBedCountChange={handleBedCountChange}
            />
          ) : dashboardViewMode === 'patient_history' ? (
            /* Dedicated Patient Inbound & Admission History View */
            <PatientInboundHistoryView
              isLightMode={isLightMode}
              onViewPatientReport={(rep) => setSelectedAiReport(rep)}
              onBedCountChange={handleBedCountChange}
              externalHistory={liveHistoryRecords}
            />
          ) : (
            <>
              {/* ===================================================================== */}
              {/* TOP SECTION: BIG CARDS LIVE BED GRID (ICU, Trauma Bay, Ventilators, NICU, General) */}
              {/* ===================================================================== */}
              <section id="live-bed-grid-section" className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h2 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                  <Activity className={`w-4 h-4 ${isLightMode ? 'text-teal-600' : 'text-teal-400'}`} />
                  <span>Live Bed & Critical Care Grid • Real-Time Occupancy</span>
                </h2>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span
                  className={`font-mono border px-2 py-0.5 rounded font-semibold ${
                    isLightMode ? 'bg-white border-slate-200 text-emerald-700 shadow-xs' : 'bg-slate-900 border-slate-800 text-emerald-400'
                  }`}
                >
                  Total Capacity: {bedCapacity.icu.total + bedCapacity.traumaBay.total + bedCapacity.ventilators.total + bedCapacity.nicu.total + bedCapacity.generalWard.total} Beds
                </span>
                <span
                  className={`font-mono border px-2 py-0.5 rounded font-semibold ${
                    isLightMode ? 'bg-white border-slate-200 text-teal-800 shadow-xs' : 'bg-slate-900 border-slate-800 text-teal-300'
                  }`}
                >
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
                className={`cursor-pointer group relative p-3.5 rounded-2xl border transition-all shadow-md ${
                  isLightMode
                    ? 'bg-gradient-to-br from-white via-teal-50/40 to-emerald-50/50 border-teal-200 hover:border-teal-400 shadow-teal-500/5'
                    : 'bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-teal-950/30 border-teal-500/30 hover:border-teal-400 hover:shadow-teal-950/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isLightMode ? 'text-teal-800' : 'text-teal-300'}`}>
                    ICU BEDS
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md border text-[10px] font-mono font-bold ${
                      isLightMode
                        ? 'bg-teal-100 border-teal-300 text-teal-900'
                        : 'bg-teal-950 border-teal-500/50 text-teal-300'
                    }`}
                  >
                    {Math.round(((bedCapacity.icu.total - bedCapacity.icu.occupied) / bedCapacity.icu.total) * 100)}% Free
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className={`text-3xl font-extrabold font-mono ${isLightMode ? 'text-slate-950' : 'text-white'}`}>
                    {bedCapacity.icu.total - bedCapacity.icu.occupied}
                    <span className={`text-xs font-normal ml-1 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>/ {bedCapacity.icu.total} Total</span>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm ${
                      isLightMode ? 'bg-teal-100 border-teal-300 text-teal-800' : 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                    }`}
                  >
                    🛏️
                  </div>
                </div>
                <div className={`mt-2.5 w-full rounded-full h-1.5 overflow-hidden ${isLightMode ? 'bg-slate-200' : 'bg-slate-800'}`}>
                  <div
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(bedCapacity.icu.occupied / bedCapacity.icu.total) * 100}%` }}
                  ></div>
                </div>
                <div className={`mt-2 flex items-center justify-between text-[10px] ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  <span>Occupied: <strong className={isLightMode ? 'text-slate-900 font-bold' : 'text-slate-200'}>{bedCapacity.icu.occupied}</strong></span>
                  <span className={`font-semibold ${isLightMode ? 'text-emerald-700' : 'text-emerald-400'}`}>{bedCapacity.icu.total - bedCapacity.icu.occupied} Ready</span>
                </div>
              </div>

              {/* Card 2: ER Trauma Bay */}
              <div
                id="bed-card-trauma"
                onClick={() => {
                  playTactileClick();
                  setActiveModal('bed_manager');
                }}
                className={`cursor-pointer group relative p-3.5 rounded-2xl border transition-all shadow-md ${
                  isLightMode
                    ? 'bg-gradient-to-br from-white via-rose-50/40 to-amber-50/40 border-rose-200 hover:border-rose-400 shadow-rose-500/5'
                    : 'bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-red-950/30 border-red-500/40 hover:border-red-400 hover:shadow-red-950/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${isLightMode ? 'text-rose-700 font-extrabold' : 'text-red-400'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                    ER TRAUMA BAY
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md border text-[10px] font-mono font-bold ${
                      isLightMode
                        ? 'bg-rose-100 border-rose-300 text-rose-900'
                        : 'bg-red-950 border-red-500/50 text-red-300'
                    }`}
                  >
                    PRIORITY
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className={`text-3xl font-extrabold font-mono ${isLightMode ? 'text-rose-700' : 'text-red-300'}`}>
                    {bedCapacity.traumaBay.total - bedCapacity.traumaBay.occupied}
                    <span className={`text-xs font-normal ml-1 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>/ {bedCapacity.traumaBay.total} Total</span>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm ${
                      isLightMode ? 'bg-rose-100 border-rose-300 text-rose-800' : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}
                  >
                    🚨
                  </div>
                </div>
                <div className={`mt-2.5 w-full rounded-full h-1.5 overflow-hidden ${isLightMode ? 'bg-slate-200' : 'bg-slate-800'}`}>
                  <div
                    className="bg-gradient-to-r from-amber-500 to-red-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(bedCapacity.traumaBay.occupied / bedCapacity.traumaBay.total) * 100}%` }}
                  ></div>
                </div>
                <div className={`mt-2 flex items-center justify-between text-[10px] ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  <span>Occupied: <strong className={isLightMode ? 'text-slate-900 font-bold' : 'text-slate-200'}>{bedCapacity.traumaBay.occupied}</strong></span>
                  <span className={`font-bold ${isLightMode ? 'text-rose-700' : 'text-red-400'}`}>{bedCapacity.traumaBay.total - bedCapacity.traumaBay.occupied} Available</span>
                </div>
              </div>

              {/* Card 3: Ventilators */}
              <div
                id="bed-card-ventilators"
                onClick={() => {
                  playTactileClick();
                  setActiveModal('bed_manager');
                }}
                className={`cursor-pointer group relative p-3.5 rounded-2xl border transition-all shadow-md ${
                  isLightMode
                    ? 'bg-gradient-to-br from-white via-cyan-50/40 to-blue-50/40 border-cyan-200 hover:border-cyan-400 shadow-cyan-500/5'
                    : 'bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-blue-950/30 border-blue-500/30 hover:border-blue-400 hover:shadow-blue-950/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isLightMode ? 'text-cyan-800' : 'text-blue-300'}`}>
                    VENTILATORS
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md border text-[10px] font-mono font-bold ${
                      isLightMode
                        ? 'bg-cyan-100 border-cyan-300 text-cyan-900'
                        : 'bg-blue-950 border-blue-500/50 text-blue-300'
                    }`}
                  >
                    Active
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className={`text-3xl font-extrabold font-mono ${isLightMode ? 'text-cyan-800' : 'text-blue-300'}`}>
                    {bedCapacity.ventilators.total - bedCapacity.ventilators.inUse}
                    <span className={`text-xs font-normal ml-1 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>/ {bedCapacity.ventilators.total} Total</span>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm ${
                      isLightMode ? 'bg-cyan-100 border-cyan-300 text-cyan-800' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    }`}
                  >
                    💨
                  </div>
                </div>
                <div className={`mt-2.5 w-full rounded-full h-1.5 overflow-hidden ${isLightMode ? 'bg-slate-200' : 'bg-slate-800'}`}>
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(bedCapacity.ventilators.inUse / bedCapacity.ventilators.total) * 100}%` }}
                  ></div>
                </div>
                <div className={`mt-2 flex items-center justify-between text-[10px] ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  <span>In-Use: <strong className={isLightMode ? 'text-slate-900 font-bold' : 'text-slate-200'}>{bedCapacity.ventilators.inUse}</strong></span>
                  <span className={`font-semibold ${isLightMode ? 'text-cyan-700' : 'text-blue-400'}`}>{bedCapacity.ventilators.total - bedCapacity.ventilators.inUse} Standby</span>
                </div>
              </div>

              {/* Card 4: NICU Warmers */}
              <div
                id="bed-card-nicu"
                onClick={() => {
                  playTactileClick();
                  setActiveModal('bed_manager');
                }}
                className={`cursor-pointer group relative p-3.5 rounded-2xl border transition-all shadow-md ${
                  isLightMode
                    ? 'bg-gradient-to-br from-white via-purple-50/40 to-pink-50/40 border-purple-200 hover:border-purple-400 shadow-purple-500/5'
                    : 'bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-purple-950/30 border-purple-500/30 hover:border-purple-400 hover:shadow-purple-950/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isLightMode ? 'text-purple-800' : 'text-purple-300'}`}>
                    NICU WARMERS
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md border text-[10px] font-mono font-bold ${
                      isLightMode
                        ? 'bg-purple-100 border-purple-300 text-purple-900'
                        : 'bg-purple-950 border-purple-500/50 text-purple-300'
                    }`}
                  >
                    Neo-Natal
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className={`text-3xl font-extrabold font-mono ${isLightMode ? 'text-purple-800' : 'text-purple-300'}`}>
                    {bedCapacity.nicu.total - bedCapacity.nicu.occupied}
                    <span className={`text-xs font-normal ml-1 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>/ {bedCapacity.nicu.total} Total</span>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm ${
                      isLightMode ? 'bg-purple-100 border-purple-300 text-purple-800' : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                    }`}
                  >
                    👶
                  </div>
                </div>
                <div className={`mt-2.5 w-full rounded-full h-1.5 overflow-hidden ${isLightMode ? 'bg-slate-200' : 'bg-slate-800'}`}>
                  <div
                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(bedCapacity.nicu.occupied / bedCapacity.nicu.total) * 100}%` }}
                  ></div>
                </div>
                <div className={`mt-2 flex items-center justify-between text-[10px] ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  <span>Occupied: <strong className={isLightMode ? 'text-slate-900 font-bold' : 'text-slate-200'}>{bedCapacity.nicu.occupied}</strong></span>
                  <span className={`font-semibold ${isLightMode ? 'text-purple-700' : 'text-purple-300'}`}>{bedCapacity.nicu.total - bedCapacity.nicu.occupied} Ready</span>
                </div>
              </div>

              {/* Card 5: General Ward */}
              <div
                id="bed-card-general"
                onClick={() => {
                  playTactileClick();
                  setActiveModal('bed_manager');
                }}
                className={`cursor-pointer group relative p-3.5 rounded-2xl border transition-all shadow-md ${
                  isLightMode
                    ? 'bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/40 border-emerald-200 hover:border-emerald-400 shadow-emerald-500/5'
                    : 'bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-emerald-950/30 border-emerald-500/30 hover:border-emerald-400 hover:shadow-emerald-950/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isLightMode ? 'text-emerald-800' : 'text-emerald-300'}`}>
                    GENERAL WARD
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md border text-[10px] font-mono font-bold ${
                      isLightMode
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                        : 'bg-emerald-950 border-emerald-500/50 text-emerald-300'
                    }`}
                  >
                    Step-Down
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className={`text-3xl font-extrabold font-mono ${isLightMode ? 'text-emerald-800' : 'text-emerald-300'}`}>
                    {bedCapacity.generalWard.total - bedCapacity.generalWard.occupied}
                    <span className={`text-xs font-normal ml-1 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>/ {bedCapacity.generalWard.total} Total</span>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm ${
                      isLightMode ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}
                  >
                    🏥
                  </div>
                </div>
                <div className={`mt-2.5 w-full rounded-full h-1.5 overflow-hidden ${isLightMode ? 'bg-slate-200' : 'bg-slate-800'}`}>
                  <div
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(bedCapacity.generalWard.occupied / bedCapacity.generalWard.total) * 100}%` }}
                  ></div>
                </div>
                <div className={`mt-2 flex items-center justify-between text-[10px] ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  <span>Occupied: <strong className={isLightMode ? 'text-slate-900 font-bold' : 'text-slate-200'}>{bedCapacity.generalWard.occupied}</strong></span>
                  <span className={`font-semibold ${isLightMode ? 'text-emerald-700' : 'text-emerald-400'}`}>{bedCapacity.generalWard.total - bedCapacity.generalWard.occupied} Vacant</span>
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
              className={`lg:col-span-5 xl:col-span-4 border rounded-2xl p-4 flex flex-col justify-between shadow-lg space-y-3 transition-colors ${
                isLightMode ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-[#0a1324] border-slate-800/90 shadow-xl'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-bold font-mono ${
                        isLightMode ? 'bg-teal-100 border-teal-300 text-teal-800' : 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                      }`}
                    >
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className={`text-sm font-bold tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                        Doctor Availability Roster
                      </h2>
                      <p className={`text-[10px] ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        On-duty specialists & critical departments
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md border font-mono text-[10px] font-bold ${
                      isLightMode
                        ? 'bg-teal-50 border-teal-200 text-teal-800'
                        : 'bg-teal-950/80 border-teal-600/50 text-teal-300'
                    }`}
                  >
                    {doctorRoster.filter(d => d.status === 'Available').length} Active
                  </span>
                </div>

                {/* Full Doctor Roster List */}
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {doctorRoster.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between group ${
                        isLightMode
                          ? 'bg-slate-50/80 border-slate-200 hover:border-teal-400 hover:bg-teal-50/30'
                          : 'bg-slate-900/90 border-slate-800 hover:border-teal-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.avatar}
                          alt={item.doctor}
                          className={`w-8 h-8 rounded-full object-cover border shrink-0 transition-colors ${
                            isLightMode ? 'border-slate-300 group-hover:border-teal-500' : 'border-slate-700 group-hover:border-teal-400'
                          }`}
                        />
                        <div>
                          <div className={`text-xs font-bold flex items-center gap-1.5 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                            <span>{item.doctor}</span>
                          </div>
                          <div className={`text-[10px] font-medium ${isLightMode ? 'text-teal-700' : 'text-teal-400'}`}>
                            {item.specialist} • <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>{item.dept || 'Main ER'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            item.status === 'Available'
                              ? isLightMode
                                ? 'text-emerald-800 bg-emerald-100 border border-emerald-300'
                                : 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/50'
                              : isLightMode
                              ? 'text-amber-800 bg-amber-100 border border-amber-300'
                              : 'text-amber-400 bg-amber-950/60 border border-amber-800/50'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === 'Available' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                            }`}
                          ></span>
                          {item.status}
                        </span>
                        <div className={`text-[9px] font-mono mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>
                          Till {item.availableTill}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Action: Full Roster & Token Integration */}
              <div className={`pt-2.5 border-t flex items-center justify-between ${isLightMode ? 'border-slate-200' : 'border-slate-800/80'}`}>
                <button
                  onClick={() => {
                    playTactileClick();
                    setActiveModal('doctor_roster');
                  }}
                  className={`text-xs font-semibold inline-flex items-center gap-1 transition-colors ${
                    isLightMode ? 'text-teal-700 hover:text-teal-900' : 'text-teal-400 hover:text-teal-300'
                  }`}
                >
                  <span>View Full Specialist Roster</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    playTactileClick();
                    setTokenHistoryModal(true);
                  }}
                  className={`px-2 py-1 rounded-lg border text-[10px] font-mono transition-colors ${
                    isLightMode
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                  }`}
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
              className={`lg:col-span-7 xl:col-span-8 border rounded-2xl p-4 flex flex-col justify-between shadow-lg space-y-3 transition-colors ${
                isLightMode ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-[#0a1324] border-slate-800/90 shadow-xl'
              }`}
            >
              <div>
                {/* Header & Tabs */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-bold font-mono ${
                        isLightMode ? 'bg-rose-100 border-rose-300 text-rose-800' : 'bg-red-500/20 border-red-500/50 text-red-300'
                      }`}
                    >
                      🚑
                    </div>
                    <div>
                      <h2 className={`text-sm font-bold tracking-tight flex items-center gap-1.5 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                        <span>Live Inbound Requests & Radar Map</span>
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      </h2>
                      <p className={`text-[10px] ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        GSVM Medical College Kanpur Emergency Influx
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Tabs: IN QUEUE | IN TRANSIT */}
                    <div
                      className={`flex items-center gap-1 p-0.5 rounded-lg border ${
                        isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <button
                        onClick={() => {
                          playTactileClick();
                          setTrackerTab('in_queue');
                        }}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                          trackerTab === 'in_queue'
                            ? isLightMode
                              ? 'bg-teal-600 text-white shadow-xs'
                              : 'bg-teal-950 border border-teal-500/60 text-teal-300'
                            : isLightMode
                            ? 'text-slate-600 hover:text-slate-900'
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
                            ? isLightMode
                              ? 'bg-teal-600 text-white shadow-xs'
                              : 'bg-teal-950 border border-teal-500/60 text-teal-300'
                            : isLightMode
                            ? 'text-slate-600 hover:text-slate-900'
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
                      className={`px-2 py-1 rounded-lg border text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                        isLightMode
                          ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-teal-800'
                          : 'bg-slate-900 border-slate-700 text-teal-300 hover:text-white'
                      }`}
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
                      <thead className={`sticky top-0 z-10 ${isLightMode ? 'bg-white' : 'bg-[#0a1324]'}`}>
                        <tr className={`text-[10px] uppercase font-bold border-b ${isLightMode ? 'text-slate-600 border-slate-200' : 'text-slate-400 border-slate-800/80'}`}>
                          <th className="pb-1.5 font-semibold">Patient / Case ID</th>
                          <th className="pb-1.5 font-semibold">Emergency</th>
                          <th className="pb-1.5 font-semibold">ETA</th>
                          <th className="pb-1.5 font-semibold">Triage</th>
                          <th className="pb-1.5 font-semibold text-right">Dispatch Stretcher / AI Report</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isLightMode ? 'divide-slate-200' : 'divide-slate-800/50'}`}>
                        {((trackerTab === 'in_queue' ? inQueuePatients : inTransitPatients).length === 0) ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center">
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <div
                                  className={`w-10 h-10 rounded-2xl border flex items-center justify-center text-lg ${
                                    isLightMode ? 'bg-slate-100 border-slate-300 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  📋
                                </div>
                                <div className={`text-xs font-bold ${isLightMode ? 'text-slate-700' : 'text-slate-400'}`}>
                                  No Active {trackerTab === 'in_queue' ? 'In-Queue' : 'In-Transit'} Dispatches
                                </div>
                                <p className={`text-[10px] max-w-xs ${isLightMode ? 'text-slate-600' : 'text-slate-500'}`}>
                                  Reports submitted from Citizen Triage (/patient) or Paramedics will appear here instantly in real-time.
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          (trackerTab === 'in_queue' ? inQueuePatients : inTransitPatients).map((patient) => (
                            <tr
                              key={patient.id}
                              className={`transition-colors ${isLightMode ? 'hover:bg-teal-50/50' : 'hover:bg-slate-800/40'}`}
                            >
                              <td className="py-2">
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                                      patient.priority === 'TRAUMA RED'
                                        ? isLightMode ? 'bg-red-100 border border-red-300 text-red-700' : 'bg-red-950 border border-red-600/60 text-red-400'
                                        : patient.priority === 'YELLOW'
                                        ? isLightMode ? 'bg-amber-100 border border-amber-300 text-amber-700' : 'bg-amber-950 border border-amber-600/60 text-amber-400'
                                        : isLightMode ? 'bg-emerald-100 border border-emerald-300 text-emerald-700' : 'bg-emerald-950 border border-emerald-600/60 text-emerald-400'
                                    }`}
                                  >
                                    🚑
                                  </div>
                                  <div>
                                    <div className={`font-mono font-bold text-[11px] flex items-center gap-1 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                                      <span>{patient.caseId}</span>
                                      {patient.hasAiReport && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                      )}
                                    </div>
                                    <div className={`text-[10px] font-medium ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                      {patient.patientName} • {patient.ageGender}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className={`py-2 text-[11px] ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                                <div>{patient.type}</div>
                                <div className={`text-[9px] font-mono ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>SpO2: {patient.vitals?.spo2 || 94}%</div>
                              </td>
                              <td className={`py-2 font-mono font-semibold text-[11px] ${isLightMode ? 'text-amber-700' : 'text-amber-300'}`}>
                                {patient.etaMinutes}m
                              </td>
                              <td className="py-2">
                                <span
                                  className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase ${
                                    patient.priority === 'TRAUMA RED'
                                      ? isLightMode ? 'bg-red-100 border border-red-300 text-red-800' : 'bg-red-900/60 border border-red-500/80 text-red-300'
                                      : patient.priority === 'YELLOW'
                                      ? isLightMode ? 'bg-amber-100 border border-amber-300 text-amber-800' : 'bg-amber-900/60 border border-amber-500/80 text-amber-300'
                                      : isLightMode ? 'bg-emerald-100 border border-emerald-300 text-emerald-800' : 'bg-emerald-900/60 border border-emerald-500/80 text-emerald-300'
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
                                    className="px-2 py-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-[10px] rounded-lg inline-flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
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
                                    className={`px-2 py-1 font-bold text-[10px] rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer border ${
                                      isLightMode
                                        ? 'bg-teal-50 hover:bg-teal-100 border-teal-300 text-teal-800'
                                        : 'bg-teal-950/90 hover:bg-teal-900 border-teal-500/60 text-teal-300'
                                    }`}
                                    title="View full AI Clinical Report & PDF"
                                  >
                                    <FileText className={`w-3 h-3 ${isLightMode ? 'text-teal-700' : 'text-teal-400'}`} />
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

                  {/* Dark/Light Map Canvas with Live Telemetry Nodes */}
                  <div
                    className={`xl:col-span-5 h-48 xl:h-[350px] rounded-xl relative overflow-hidden flex items-center justify-center p-2 shadow-inner border transition-colors ${
                      isLightMode ? 'bg-[#0f172a] border-slate-700' : 'bg-[#060c18] border-slate-800'
                    }`}
                  >
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
              <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${isLightMode ? 'border-slate-200' : 'border-slate-800/80'}`}>
                <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>
                  Active Dispatches: <strong className={`font-mono ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{patients.length} Inbound</strong>
                </span>
                <button
                  onClick={() => {
                    playTactileClick();
                    setActiveModal('live_map');
                  }}
                  className={`text-xs font-semibold inline-flex items-center gap-1 ${isLightMode ? 'text-teal-700 hover:text-teal-900' : 'text-teal-400 hover:text-teal-300'}`}
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
            className={`border rounded-2xl p-3.5 shadow-lg space-y-3 transition-colors ${
              isLightMode ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-[#0a1324] border-slate-800/90 shadow-xl'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold font-mono ${
                    isLightMode ? 'bg-orange-100 border-orange-300 text-orange-800' : 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                  }`}
                >
                  🛏️
                </div>
                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                    Stretcher Attendant Live Dispatch • Ram Singh (SA-1047)
                  </h3>
                  <p className={`text-[10px] ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    Targeted real-time Socket.io dispatch channel directly to Ram Singh's phone
                  </p>
                </div>
              </div>

              {/* Compact Metrics Strip */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`px-2 py-1 rounded-lg border text-[10px] ${isLightMode ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-900/90 border-emerald-800/40'}`}>
                  <span className={`mr-1 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>Available:</span>
                  <strong className={`font-mono ${isLightMode ? 'text-emerald-700' : 'text-emerald-400'}`}>{stretcherStats.available}</strong>
                </div>
                <div className={`px-2 py-1 rounded-lg border text-[10px] ${isLightMode ? 'bg-amber-50 border-amber-200' : 'bg-slate-900/90 border-amber-800/40'}`}>
                  <span className={`mr-1 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>In Use:</span>
                  <strong className={`font-mono ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`}>{stretcherStats.inUse}</strong>
                </div>
                <div className={`px-2 py-1 rounded-lg border text-[10px] ${isLightMode ? 'bg-teal-50 border-teal-200' : 'bg-slate-900/90 border-teal-800/40'}`}>
                  <span className={`mr-1 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>Staff On Duty:</span>
                  <strong className={`font-mono ${isLightMode ? 'text-teal-700' : 'text-teal-400'}`}>{stretcherStats.staffOnDuty}</strong>
                </div>
                <button
                  onClick={() => handleDispatchToRamSingh()}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md shadow-orange-950/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>⚡ Dispatch to Ram Singh (SA-1047)</span>
                </button>
              </div>
            </div>

            {/* Prominent Live Socket Status Card for Ram Singh SA-1047 */}
            <div
              className={`p-3 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm ${
                isLightMode
                  ? 'bg-gradient-to-r from-orange-50/70 via-amber-50/50 to-white border-orange-300'
                  : 'bg-gradient-to-r from-slate-900 via-slate-900/90 to-orange-950/20 border-orange-500/40 shadow-inner'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="Ram Singh"
                    className="w-10 h-10 rounded-full object-cover border-2 border-orange-400/80 shadow"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse"></span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-xs ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Ram Singh</span>
                    <span
                      className={`px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold ${
                        isLightMode ? 'bg-orange-100 text-orange-900 border-orange-300' : 'bg-orange-950 text-orange-300 border-orange-700/60'
                      }`}
                    >
                      SA-1047
                    </span>
                    <span className={`text-[10px] ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>Emergency Stretcher Bearer</span>
                  </div>
                  <div className={`text-[11px] font-semibold flex items-center gap-1.5 mt-0.5 ${isLightMode ? 'text-orange-800' : 'text-orange-300'}`}>
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                    <span>Live Socket Status: {ramSinghStatus.statusText}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  Last Update: {ramSinghStatus.lastUpdated}
                </span>
                <button
                  onClick={() => handleDispatchToRamSingh()}
                  className={`px-3 py-1 border rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                    isLightMode
                      ? 'bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-900'
                      : 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/60 text-orange-300 hover:text-white'
                  }`}
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
                  className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div>
                    <div className={`font-semibold text-[11px] ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>{z.zone}</div>
                    <div className={`text-[9px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{z.staffAssigned} Staff • {z.lastUpdate}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono font-bold text-xs ${isLightMode ? 'text-emerald-700' : 'text-emerald-400'}`}>{z.available} Free</div>
                    <div className={`font-mono text-[9px] ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`}>{z.inUse} In-Use</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Continuous Live Ward & Bed Locator Overview */}
          <section id="command-mode-ward-overview-section" className="pt-2">
            <LiveWardPatientOverview
              isLightMode={isLightMode}
              onViewPatientReport={(rep) => setSelectedAiReport(rep)}
              onBedCountChange={handleBedCountChange}
            />
          </section>
        </>
      )}
    </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODALS & SUB-SCREENS */}
      {/* ========================================================================= */}

      {/* MODAL: Full Hospital Bed Manager & Patient Locator */}
      {activeModal === 'bed_manager' && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-3 lg:p-6 overflow-y-auto ${
          isLightMode ? 'bg-slate-900/60' : 'bg-slate-950/85'
        }`}>
          <div className={`rounded-3xl w-full max-w-6xl max-h-[92vh] overflow-y-auto p-4 lg:p-6 shadow-2xl space-y-4 border ${
            isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#070d18] border-teal-500/40 text-white'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                  isLightMode ? 'bg-teal-100 border-teal-300 text-teal-800' : 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                }`}>
                  <BedDouble className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold uppercase tracking-wider ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                    Full Hospital Ward &amp; Bed Patient Matrix
                  </h3>
                  <p className={`text-xs ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    GSVM Central HIS • Live Patient Location, Department &amp; Vitals Telemetry
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className={`p-2 rounded-xl transition-colors ${
                  isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <LiveWardPatientOverview
              isLightMode={isLightMode}
              onViewPatientReport={(rep) => setSelectedAiReport(rep)}
              onBedCountChange={handleBedCountChange}
            />
          </div>
        </div>
      )}

      {/* MODAL: Full Doctor Availability Roster */}
      {activeModal === 'doctor_roster' && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${
          isLightMode ? 'bg-slate-900/60' : 'bg-slate-950/80'
        }`}>
          <div className={`border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-5 shadow-2xl ${
            isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b mb-4 ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
              <div>
                <h3 className={`text-base font-bold flex items-center gap-2 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                  <Stethoscope className={`w-5 h-5 ${isLightMode ? 'text-teal-600' : 'text-teal-400'}`} />
                  <span>Full Hospital Specialist Doctor Roster</span>
                </h3>
                <p className={`text-xs ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  GSVM Medical College • Live Shift Status & Department OT Assignments
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {doctorRoster.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={doc.avatar}
                      alt={doc.doctor}
                      className={`w-10 h-10 rounded-full object-cover border ${isLightMode ? 'border-teal-400' : 'border-teal-500/40'}`}
                    />
                    <div>
                      <h4 className={`text-sm font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{doc.doctor}</h4>
                      <p className={`text-xs font-medium ${isLightMode ? 'text-teal-700' : 'text-teal-400'}`}>{doc.specialist} • {doc.dept}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      doc.status === 'Available'
                        ? isLightMode ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : isLightMode ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      ● {doc.status}
                    </span>
                    <p className={`text-[11px] mt-1 font-mono ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Until {doc.availableTill}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Generate New ₹500 Fast-Track Token */}
      {generateTokenModal && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${
          isLightMode ? 'bg-slate-900/60' : 'bg-slate-950/80'
        }`}>
          <div className={`border rounded-2xl w-full max-w-md p-5 shadow-2xl ${
            isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b mb-4 ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                <CreditCard className={`w-5 h-5 ${isLightMode ? 'text-teal-600' : 'text-teal-400'}`} />
                <span>Fast-Track ER Care Token</span>
              </h3>
              <button
                onClick={() => setGenerateTokenModal(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className={`p-3 rounded-xl border text-center ${
                isLightMode ? 'bg-teal-50 border-teal-200' : 'bg-teal-950/40 border-teal-800/60'
              }`}>
                <span className={`text-[10px] uppercase font-bold ${isLightMode ? 'text-teal-800' : 'text-teal-300'}`}>
                  TOKEN REGISTRATION CHARGE
                </span>
                <div className={`text-3xl font-extrabold mt-1 font-mono ${isLightMode ? 'text-teal-900' : 'text-white'}`}>₹ 500</div>
                <p className={`text-[10px] mt-1 ${isLightMode ? 'text-teal-700' : 'text-teal-400'}`}>
                  Instant Cashless Zero-Wait Triage Slip (ABDM QR Enabled)
                </p>
              </div>

              <div>
                <label className={`block font-medium mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-400'}`}>
                  Patient Name or Case ID
                </label>
                <input
                  type="text"
                  defaultValue="Walk-in Emergency / Ambulance Case"
                  className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-500 ${
                    isLightMode ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-medium mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-400'}`}>
                  Priority Classification
                </label>
                <select className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-500 ${
                  isLightMode ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                }`}>
                  <option>TRAUMA RED (Immediate ER Resus)</option>
                  <option>YELLOW (Urgent Within 30 min)</option>
                  <option>GREEN (Non-Critical Fast Track)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCreateToken}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-950/20"
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
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${
          isLightMode ? 'bg-slate-900/60' : 'bg-slate-950/80'
        }`}>
          <div className={`border rounded-2xl w-full max-w-lg p-5 shadow-2xl ${
            isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b mb-4 ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                <CreditCard className={`w-5 h-5 ${isLightMode ? 'text-teal-600' : 'text-teal-400'}`} />
                <span>Recent ₹500 Emergency Tokens</span>
              </h3>
              <button
                onClick={() => setTokenHistoryModal(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
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
                <div
                  key={t.token}
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  <div>
                    <div className={`font-mono font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{t.token}</div>
                    <div className={`text-[11px] ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>{t.patient}</div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      isLightMode ? 'bg-red-100 text-red-800 border-red-300' : 'bg-red-950 text-red-300 border-red-800'
                    }`}>
                      {t.priority}
                    </span>
                    <div className={`font-mono font-bold mt-0.5 ${isLightMode ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      {t.amt} • {t.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Emergency Override */}
      {activeModal === 'emergency_override' && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${
          isLightMode ? 'bg-slate-900/60' : 'bg-slate-950/85'
        }`}>
          <div className={`border-2 rounded-2xl w-full max-w-md p-5 shadow-2xl text-xs ${
            isLightMode ? 'bg-white border-red-500 text-slate-900' : 'bg-slate-900 border-red-700/80 text-white'
          }`}>
            <div className={`flex items-center gap-3 pb-3 border-b mb-3 ${
              isLightMode ? 'text-red-700 border-slate-200' : 'text-red-400 border-slate-800'
            }`}>
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className={`text-base font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Emergency Bed & Code Red Override</h3>
                <p className={`text-[11px] ${isLightMode ? 'text-red-700 font-semibold' : 'text-red-300'}`}>National Disaster & Mass Casualty Protocol</p>
              </div>
            </div>

            <p className={`mb-3 leading-relaxed ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
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
                className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors shadow-sm"
              >
                🚨 ACTIVATE CODE RED SURGE BEDS (+10 ICU)
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className={`w-full py-2 rounded-xl font-semibold transition-colors ${
                  isLightMode
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
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
