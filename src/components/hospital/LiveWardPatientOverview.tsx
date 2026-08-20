import React, { useState, useMemo } from 'react';
import {
  Activity,
  Heart,
  Wind,
  Shield,
  Search,
  Filter,
  UserCheck,
  Building2,
  AlertTriangle,
  FileText,
  ArrowRightLeft,
  CheckCircle2,
  Plus,
  X,
  Clock,
  Sparkles,
  Stethoscope,
  ChevronRight,
  Maximize2,
  Download,
  Share2,
  RefreshCw,
  LogOut,
  BedDouble
} from 'lucide-react';
import { playTactileClick, playConfirmChime, playCodeRedAlert } from '../../lib/audio';
import { PatientEmergencyReportData } from '../citizen/PatientReportModal';

export interface WardBedItem {
  id: string;
  bedNumber: string;
  wardType: 'icu' | 'trauma' | 'ventilator' | 'nicu' | 'general';
  wardLabel: string;
  floor: string;
  status: 'Occupied' | 'Available' | 'Cleaning';
  equipment: string[];
  patient?: {
    caseId: string;
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    admittedAt: string;
    timeAgo: string;
    diagnosis: string;
    severity: 'RED' | 'YELLOW' | 'GREEN';
    assignedDoctor: string;
    specialty: string;
    vitals: {
      bp: string;
      spo2: number;
      pulse: number;
      temp?: string;
    };
    redFlags: {
      bloodThinners: boolean;
      hypertension: boolean;
      diabetes: boolean;
      heartDisease: boolean;
      pregnancy?: boolean;
    };
    consciousness: 'Alert' | 'Drowsy' | 'Unconscious';
    allergies: string;
    notes?: string;
  };
}

interface LiveWardPatientOverviewProps {
  onViewPatientReport?: (reportData: PatientEmergencyReportData) => void;
  onBedCountChange?: (wardType: string, delta: number) => void;
  isLightMode?: boolean;
}

export const LiveWardPatientOverview: React.FC<LiveWardPatientOverviewProps> = ({
  onViewPatientReport,
  onBedCountChange,
  isLightMode = true
}) => {
  // Ward category filter
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'occupied' | 'available' | 'blood_thinners'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Bed for Detail / Action Modal
  const [activeBedDetail, setActiveBedDetail] = useState<WardBedItem | null>(null);
  const [transferModalBed, setTransferModalBed] = useState<WardBedItem | null>(null);
  const [targetTransferWard, setTargetTransferWard] = useState<string>('general');
  const [admitModalBed, setAdmitModalBed] = useState<WardBedItem | null>(null);
  
  // New Admit Form state
  const [newAdmitData, setNewAdmitData] = useState({
    name: '',
    age: '45',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    diagnosis: 'Acute Chest Pain / Angina',
    doctor: 'Dr. M. Khanna (Cardiology)',
    bp: '135/85',
    spo2: 97,
    pulse: 88,
    bloodThinners: false,
    hypertension: true,
    diabetes: false,
    consciousness: 'Alert' as 'Alert' | 'Drowsy' | 'Unconscious'
  });

  // Master Initial Bed Matrix
  const [bedList, setBedList] = useState<WardBedItem[]>([
    // --- 1. ICU BEDS (Floor 1 / Floor 2) ---
    {
      id: 'bed-icu-1',
      bedNumber: 'ICU Bed #01',
      wardType: 'icu',
      wardLabel: 'Cardiac ICU Bay 1',
      floor: 'Floor 1 • Cardiology Wing',
      status: 'Occupied',
      equipment: ['Multipara Monitor', 'Syringe Pump', 'Defibrillator Standby', 'Arterial Line'],
      patient: {
        caseId: 'TNX-2024-1201',
        name: 'Rameshwar Prasad',
        age: 58,
        gender: 'Male',
        admittedAt: '09:40 AM',
        timeAgo: '45m ago',
        diagnosis: 'Acute Inferior Wall STEMI (Post-PTCA)',
        severity: 'RED',
        assignedDoctor: 'Dr. M. Khanna',
        specialty: 'Cardiology',
        vitals: { bp: '142/92', spo2: 96, pulse: 104, temp: '98.6°F' },
        redFlags: { bloodThinners: true, hypertension: true, diabetes: true, heartDisease: true },
        consciousness: 'Alert',
        allergies: 'Penicillin Allergy',
        notes: 'Stat loading dose of Dual Antiplatelets given. Heparin drip continuous.'
      }
    },
    {
      id: 'bed-icu-2',
      bedNumber: 'ICU Bed #02',
      wardType: 'icu',
      wardLabel: 'Neuro ICU Bay',
      floor: 'Floor 2 • Neuro Critical Care',
      status: 'Occupied',
      equipment: ['ICP Monitor', 'Multipara Vitals', 'Cooling Blanket'],
      patient: {
        caseId: 'TNX-2024-1204',
        name: 'Vikram Malhotra',
        age: 62,
        gender: 'Male',
        admittedAt: '08:15 AM',
        timeAgo: '2h 10m ago',
        diagnosis: 'Acute Ischemic Stroke (Thrombolyzed)',
        severity: 'RED',
        assignedDoctor: 'Dr. R. Verma',
        specialty: 'Neurosurgery',
        vitals: { bp: '155/98', spo2: 95, pulse: 84, temp: '99.1°F' },
        redFlags: { bloodThinners: true, hypertension: true, diabetes: false, heartDisease: false },
        consciousness: 'Drowsy',
        allergies: 'NKDA',
        notes: 'Post-rTPA monitoring. Neuro-vitals q15m.'
      }
    },
    {
      id: 'bed-icu-3',
      bedNumber: 'ICU Bed #03',
      wardType: 'icu',
      wardLabel: 'Medical ICU',
      floor: 'Floor 1 • Critical Care',
      status: 'Occupied',
      equipment: ['Multipara Monitor', 'Bipap Unit'],
      patient: {
        caseId: 'TNX-2024-1209',
        name: 'Meena Devi',
        age: 67,
        gender: 'Female',
        admittedAt: '10:05 AM',
        timeAgo: '20m ago',
        diagnosis: 'Severe COPD Exacerbation with Hypercapnia',
        severity: 'YELLOW',
        assignedDoctor: 'Dr. S. Iyer',
        specialty: 'Critical Care',
        vitals: { bp: '130/85', spo2: 93, pulse: 110, temp: '98.4°F' },
        redFlags: { bloodThinners: false, hypertension: true, diabetes: true, heartDisease: false },
        consciousness: 'Alert',
        allergies: 'Sulfa Drugs',
        notes: 'Non-invasive ventilation ongoing. ABG sent.'
      }
    },
    {
      id: 'bed-icu-4',
      bedNumber: 'ICU Bed #04',
      wardType: 'icu',
      wardLabel: 'Surgical ICU',
      floor: 'Floor 1 • OT Recovery',
      status: 'Available',
      equipment: ['Multipara Monitor', 'Suction Machine', 'Emergency Crash Cart'],
    },
    {
      id: 'bed-icu-5',
      bedNumber: 'ICU Bed #05',
      wardType: 'icu',
      wardLabel: 'Trauma ICU',
      floor: 'Floor 1 • Emergency Trauma',
      status: 'Available',
      equipment: ['Multipara Monitor', 'Infusion Pump'],
    },

    // --- 2. ER TRAUMA BAYS (Ground Floor) ---
    {
      id: 'bed-trauma-1',
      bedNumber: 'Trauma Bay #01',
      wardType: 'trauma',
      wardLabel: 'Resuscitation Bay A (Code Red)',
      floor: 'Ground Floor • ER Trauma Center',
      status: 'Occupied',
      equipment: ['Rapid Transfusion Infuser', 'C-Arm X-Ray', 'Ultrasound FAST', 'Crash Cart'],
      patient: {
        caseId: 'TNX-2024-1258',
        name: 'Sunita Sharma',
        age: 34,
        gender: 'Female',
        admittedAt: '10:12 AM',
        timeAgo: '15m ago',
        diagnosis: 'High-Velocity Road Traffic Accident (Pelvic & Femur Fracture)',
        severity: 'RED',
        assignedDoctor: 'Dr. A. Singh',
        specialty: 'Trauma Surgery',
        vitals: { bp: '95/60', spo2: 94, pulse: 122, temp: '97.9°F' },
        redFlags: { bloodThinners: false, hypertension: false, diabetes: false, heartDisease: false },
        consciousness: 'Alert',
        allergies: 'None',
        notes: 'Active hemorrhage protocol. 2 Units O-Negative PRBC initiated.'
      }
    },
    {
      id: 'bed-trauma-2',
      bedNumber: 'Trauma Bay #02',
      wardType: 'trauma',
      wardLabel: 'Trauma Bay B',
      floor: 'Ground Floor • ER Trauma Center',
      status: 'Occupied',
      equipment: ['Multipara Monitor', 'Splint Station', 'Oxygen Manifold'],
      patient: {
        caseId: 'TNX-2024-1262',
        name: 'Rajesh Verma',
        age: 48,
        gender: 'Male',
        admittedAt: '09:20 AM',
        timeAgo: '1h 05m ago',
        diagnosis: 'Industrial Crush Injury (Right Hand & Forearm)',
        severity: 'YELLOW',
        assignedDoctor: 'Dr. K. Patel',
        specialty: 'Orthopedics',
        vitals: { bp: '138/88', spo2: 98, pulse: 92, temp: '98.8°F' },
        redFlags: { bloodThinners: false, hypertension: true, diabetes: false, heartDisease: false },
        consciousness: 'Alert',
        allergies: 'NSAIDs',
        notes: 'Wound debridement scheduled in Trauma OT 1.'
      }
    },
    {
      id: 'bed-trauma-3',
      bedNumber: 'Trauma Bay #03',
      wardType: 'trauma',
      wardLabel: 'Trauma Bay C',
      floor: 'Ground Floor • ER Trauma Center',
      status: 'Available',
      equipment: ['Multipara Monitor', 'Crash Cart', 'Oxygen Concentrator'],
    },
    {
      id: 'bed-trauma-4',
      bedNumber: 'Trauma Bay #04',
      wardType: 'trauma',
      wardLabel: 'Trauma Bay D',
      floor: 'Ground Floor • ER Trauma Center',
      status: 'Available',
      equipment: ['Multipara Monitor', 'Suction Machine'],
    },

    // --- 3. VENTILATOR UNITS (HDU / ICU) ---
    {
      id: 'bed-vent-1',
      bedNumber: 'Ventilator #01 (Hamilton C6)',
      wardType: 'ventilator',
      wardLabel: 'Invasive Mechanical Ventilator',
      floor: 'Floor 1 • Critical HDU',
      status: 'Occupied',
      equipment: ['Hamilton C6 Invasive Ventilator', 'Multipara Vitals', 'End-Tidal CO2'],
      patient: {
        caseId: 'TNX-2024-1188',
        name: 'Amit Kumar Dubey',
        age: 52,
        gender: 'Male',
        admittedAt: '07:30 AM',
        timeAgo: '2h 55m ago',
        diagnosis: 'Acute Respiratory Distress Syndrome (ARDS) / Sepsis',
        severity: 'RED',
        assignedDoctor: 'Dr. S. Iyer',
        specialty: 'Anesthesiology & Critical Care',
        vitals: { bp: '110/70', spo2: 96, pulse: 98, temp: '100.4°F' },
        redFlags: { bloodThinners: true, hypertension: true, diabetes: true, heartDisease: false },
        consciousness: 'Unconscious',
        allergies: 'None Known',
        notes: 'SIMV mode, PEEP 10 cmH2O, FiO2 55%. Sedation active.'
      }
    },
    {
      id: 'bed-vent-2',
      bedNumber: 'Ventilator #02 (Dräger Evita)',
      wardType: 'ventilator',
      wardLabel: 'Invasive Ventilator Unit 2',
      floor: 'Floor 1 • Critical HDU',
      status: 'Occupied',
      equipment: ['Dräger Evita V500', 'Multipara Vitals', 'Closed Suction'],
      patient: {
        caseId: 'TNX-2024-1194',
        name: 'Kavita Saxena',
        age: 41,
        gender: 'Female',
        admittedAt: '08:50 AM',
        timeAgo: '1h 35m ago',
        diagnosis: 'Post-Cardiac Arrest Hypoxic Encephalopathy',
        severity: 'RED',
        assignedDoctor: 'Dr. P. Sharma',
        specialty: 'Emergency Medicine',
        vitals: { bp: '125/80', spo2: 98, pulse: 88, temp: '98.2°F' },
        redFlags: { bloodThinners: false, hypertension: false, diabetes: false, heartDisease: true },
        consciousness: 'Unconscious',
        allergies: 'NKDA',
        notes: 'Targeted Temperature Management ongoing at 36°C.'
      }
    },
    {
      id: 'bed-vent-3',
      bedNumber: 'Ventilator #03 (Maquet Servo-I)',
      wardType: 'ventilator',
      wardLabel: 'Standby Mechanical Ventilator',
      floor: 'Floor 1 • Emergency HDU',
      status: 'Available',
      equipment: ['Servo-I Mechanical Ventilator', 'Sterilized Tubing Ready', 'Test Lung Calibrated'],
    },
    {
      id: 'bed-vent-4',
      bedNumber: 'Ventilator #04 (Philips V60)',
      wardType: 'ventilator',
      wardLabel: 'NIV & High-Flow Standby',
      floor: 'Floor 1 • Emergency HDU',
      status: 'Available',
      equipment: ['Philips V60 Non-Invasive Unit', 'High-Flow Nasal Cannula (HFNC)'],
    },

    // --- 4. NICU WARMERS (Floor 2 - Neo-Natal Wing) ---
    {
      id: 'bed-nicu-1',
      bedNumber: 'NICU Warmer #01',
      wardType: 'nicu',
      wardLabel: 'Giraffe Radiant Warmer A',
      floor: 'Floor 2 • Neo-Natal ICU',
      status: 'Occupied',
      equipment: ['GE Giraffe Warmer', 'Neo-Natal SpO2 Micro-Sensor', 'Bubble CPAP Unit'],
      patient: {
        caseId: 'TNX-2024-1215',
        name: 'Baby of Shalini Gupta',
        age: 1, // Days
        gender: 'Female',
        admittedAt: '06:10 AM',
        timeAgo: '4h 15m ago',
        diagnosis: 'Pre-Term (32 Weeks) • Respiratory Distress Syndrome',
        severity: 'RED',
        assignedDoctor: 'Dr. P. Sharma',
        specialty: 'Pediatrics / Neo-Natology',
        vitals: { bp: '65/40', spo2: 95, pulse: 146, temp: '36.8°C' },
        redFlags: { bloodThinners: false, hypertension: false, diabetes: false, heartDisease: false },
        consciousness: 'Alert',
        allergies: 'None',
        notes: 'Surfactant therapy completed. Bubble CPAP 5 cmH2O.'
      }
    },
    {
      id: 'bed-nicu-2',
      bedNumber: 'NICU Warmer #02',
      wardType: 'nicu',
      wardLabel: 'Phototherapy Warmer B',
      floor: 'Floor 2 • Neo-Natal ICU',
      status: 'Occupied',
      equipment: ['LED Phototherapy Unit', 'Infant Radiant Warmer'],
      patient: {
        caseId: 'TNX-2024-1221',
        name: 'Baby of Priyanka Yadav',
        age: 3, // Days
        gender: 'Male',
        admittedAt: '09:00 AM',
        timeAgo: '1h 25m ago',
        diagnosis: 'Neonatal Hyperbilirubinemia (Jaundice)',
        severity: 'YELLOW',
        assignedDoctor: 'Dr. P. Sharma',
        specialty: 'Pediatrics',
        vitals: { bp: '70/45', spo2: 99, pulse: 138, temp: '37.0°C' },
        redFlags: { bloodThinners: false, hypertension: false, diabetes: false, heartDisease: false },
        consciousness: 'Alert',
        allergies: 'None',
        notes: 'Double surface intensive phototherapy underway. Serum bilirubin 17.2 mg/dL.'
      }
    },
    {
      id: 'bed-nicu-3',
      bedNumber: 'NICU Warmer #03',
      wardType: 'nicu',
      wardLabel: 'Sterile Incubator C',
      floor: 'Floor 2 • Neo-Natal ICU',
      status: 'Available',
      equipment: ['Atom Isolette Incubator', 'Sterilized Nest Ready'],
    },

    // --- 5. GENERAL WARD (Floor 3) ---
    {
      id: 'bed-gen-1',
      bedNumber: 'General Bed #101',
      wardType: 'general',
      wardLabel: 'Medical Step-Down Ward A',
      floor: 'Floor 3 • General Medical Ward',
      status: 'Occupied',
      equipment: ['Oxygen Flowmeter', 'IV Infusion Stand', 'Nurse Call Bell'],
      patient: {
        caseId: 'TNX-2024-1170',
        name: 'Hari Om Mishra',
        age: 54,
        gender: 'Male',
        admittedAt: 'Yesterday 04:00 PM',
        timeAgo: '18h ago',
        diagnosis: 'Dengue with Thrombocytopenia (Stabilized)',
        severity: 'GREEN',
        assignedDoctor: 'Dr. P. Sharma',
        specialty: 'Internal Medicine',
        vitals: { bp: '120/78', spo2: 98, pulse: 76, temp: '98.6°F' },
        redFlags: { bloodThinners: false, hypertension: false, diabetes: false, heartDisease: false },
        consciousness: 'Alert',
        allergies: 'None',
        notes: 'Platelet count improved to 92,000/mcL. Planned discharge tomorrow.'
      }
    },
    {
      id: 'bed-gen-2',
      bedNumber: 'General Bed #102',
      wardType: 'general',
      wardLabel: 'Surgical Recovery Ward B',
      floor: 'Floor 3 • Post-Op Recovery',
      status: 'Occupied',
      equipment: ['DVT Pump', 'Spirometer', 'Oxygen Port'],
      patient: {
        caseId: 'TNX-2024-1175',
        name: 'Santosh Devi',
        age: 49,
        gender: 'Female',
        admittedAt: 'Yesterday 08:30 PM',
        timeAgo: '14h ago',
        diagnosis: 'Post-Lap Cholecystectomy Day 1',
        severity: 'GREEN',
        assignedDoctor: 'Dr. A. Singh',
        specialty: 'General Surgery',
        vitals: { bp: '128/82', spo2: 97, pulse: 82, temp: '98.4°F' },
        redFlags: { bloodThinners: false, hypertension: true, diabetes: true, heartDisease: false },
        consciousness: 'Alert',
        allergies: 'Ciprofloxacin',
        notes: 'Oral liquids tolerated well. Ambulated in corridor.'
      }
    },
    {
      id: 'bed-gen-3',
      bedNumber: 'General Bed #103',
      wardType: 'general',
      wardLabel: 'General Medical Ward C',
      floor: 'Floor 3 • General Ward',
      status: 'Available',
      equipment: ['Clean Linens Prepped', 'Oxygen Port Ready'],
    },
    {
      id: 'bed-gen-4',
      bedNumber: 'General Bed #104',
      wardType: 'general',
      wardLabel: 'General Medical Ward D',
      floor: 'Floor 3 • General Ward',
      status: 'Available',
      equipment: ['Standard Hospital Bed', 'IV Drip Stand'],
    }
  ]);

  // Statistics
  const stats = useMemo(() => {
    const total = bedList.length;
    const occupied = bedList.filter(b => b.status === 'Occupied').length;
    const available = bedList.filter(b => b.status === 'Available').length;
    const bloodThinnersCount = bedList.filter(b => b.status === 'Occupied' && b.patient?.redFlags.bloodThinners).length;
    const criticalRed = bedList.filter(b => b.status === 'Occupied' && b.patient?.severity === 'RED').length;

    const icuTotal = bedList.filter(b => b.wardType === 'icu').length;
    const icuOccupied = bedList.filter(b => b.wardType === 'icu' && b.status === 'Occupied').length;

    const traumaTotal = bedList.filter(b => b.wardType === 'trauma').length;
    const traumaOccupied = bedList.filter(b => b.wardType === 'trauma' && b.status === 'Occupied').length;

    const ventTotal = bedList.filter(b => b.wardType === 'ventilator').length;
    const ventOccupied = bedList.filter(b => b.wardType === 'ventilator' && b.status === 'Occupied').length;

    const nicuTotal = bedList.filter(b => b.wardType === 'nicu').length;
    const nicuOccupied = bedList.filter(b => b.wardType === 'nicu' && b.status === 'Occupied').length;

    const genTotal = bedList.filter(b => b.wardType === 'general').length;
    const genOccupied = bedList.filter(b => b.wardType === 'general' && b.status === 'Occupied').length;

    return {
      total,
      occupied,
      available,
      bloodThinnersCount,
      criticalRed,
      icu: { total: icuTotal, occupied: icuOccupied },
      trauma: { total: traumaTotal, occupied: traumaOccupied },
      ventilator: { total: ventTotal, occupied: ventOccupied },
      nicu: { total: nicuTotal, occupied: nicuOccupied },
      general: { total: genTotal, occupied: genOccupied }
    };
  }, [bedList]);

  // Filtered Beds
  const filteredBeds = useMemo(() => {
    return bedList.filter((bed) => {
      // 1. Ward Type filter
      if (selectedWard !== 'all' && bed.wardType !== selectedWard) {
        return false;
      }

      // 2. Status filter
      if (statusFilter === 'occupied' && bed.status !== 'Occupied') return false;
      if (statusFilter === 'available' && bed.status !== 'Available') return false;
      if (statusFilter === 'blood_thinners' && (!bed.patient || !bed.patient.redFlags.bloodThinners)) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const bedMatch = bed.bedNumber.toLowerCase().includes(query) || bed.wardLabel.toLowerCase().includes(query);
        const patientMatch = bed.patient && (
          bed.patient.name.toLowerCase().includes(query) ||
          bed.patient.caseId.toLowerCase().includes(query) ||
          bed.patient.diagnosis.toLowerCase().includes(query) ||
          bed.patient.assignedDoctor.toLowerCase().includes(query)
        );
        return bedMatch || patientMatch;
      }

      return true;
    });
  }, [bedList, selectedWard, statusFilter, searchQuery]);

  // Handler: Discharge / Free Bed
  const handleDischargeBed = (bedId: string) => {
    playTactileClick();
    const bedToFree = bedList.find(b => b.id === bedId);
    if (!bedToFree) return;

    setBedList(prev => prev.map(b => {
      if (b.id === bedId) {
        return {
          ...b,
          status: 'Available',
          patient: undefined
        };
      }
      return b;
    }));

    if (onBedCountChange) {
      onBedCountChange(bedToFree.wardType, -1);
    }
    playConfirmChime();
    setActiveBedDetail(null);
  };

  // Handler: Execute Patient Bed Transfer
  const handleExecuteTransfer = () => {
    if (!transferModalBed || !transferModalBed.patient) return;
    playTactileClick();

    const targetBed = bedList.find(b => b.wardType === targetTransferWard && b.status === 'Available');

    if (!targetBed) {
      alert(`No available bed in ${targetTransferWard.toUpperCase()} ward right now.`);
      return;
    }

    const patientData = { ...transferModalBed.patient };

    setBedList(prev => prev.map(b => {
      if (b.id === transferModalBed.id) {
        // Free old bed
        return { ...b, status: 'Available', patient: undefined };
      }
      if (b.id === targetBed.id) {
        // Occupy new bed
        return {
          ...b,
          status: 'Occupied',
          patient: {
            ...patientData,
            notes: `${patientData.notes || ''} [Transferred from ${transferModalBed.bedNumber} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]`
          }
        };
      }
      return b;
    }));

    playConfirmChime();
    setTransferModalBed(null);
    setActiveBedDetail(null);
  };

  // Handler: Admit new patient into selected available bed
  const handleConfirmNewAdmit = () => {
    if (!admitModalBed) return;
    if (!newAdmitData.name.trim()) {
      alert('Please enter patient name');
      return;
    }
    playTactileClick();

    const newPatient = {
      caseId: `TNX-2024-${Math.floor(1300 + Math.random() * 800)}`,
      name: newAdmitData.name.trim(),
      age: parseInt(newAdmitData.age) || 45,
      gender: newAdmitData.gender,
      admittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeAgo: 'Just now',
      diagnosis: newAdmitData.diagnosis,
      severity: (newAdmitData.bloodThinners || newAdmitData.diagnosis.toLowerCase().includes('cardiac') || newAdmitData.diagnosis.toLowerCase().includes('trauma')) ? 'RED' as const : 'YELLOW' as const,
      assignedDoctor: newAdmitData.doctor,
      specialty: 'Emergency Medicine',
      vitals: {
        bp: newAdmitData.bp,
        spo2: newAdmitData.spo2,
        pulse: newAdmitData.pulse
      },
      redFlags: {
        bloodThinners: newAdmitData.bloodThinners,
        hypertension: newAdmitData.hypertension,
        diabetes: newAdmitData.diabetes,
        heartDisease: newAdmitData.diagnosis.toLowerCase().includes('heart') || newAdmitData.diagnosis.toLowerCase().includes('chest')
      },
      consciousness: newAdmitData.consciousness,
      allergies: 'NKDA (No Known Drug Allergies)',
      notes: 'Direct hospital admission via ER bed allocator.'
    };

    setBedList(prev => prev.map(b => {
      if (b.id === admitModalBed.id) {
        return {
          ...b,
          status: 'Occupied',
          patient: newPatient
        };
      }
      return b;
    }));

    if (onBedCountChange) {
      onBedCountChange(admitModalBed.wardType, 1);
    }

    playConfirmChime();
    setAdmitModalBed(null);
  };

  // Helper: Open Clinical Pass Report
  const triggerOpenReportModal = (bed: WardBedItem) => {
    if (!bed.patient || !onViewPatientReport) return;
    playTactileClick();

    const activeRedFlags: string[] = [];
    if (bed.patient.redFlags.bloodThinners) activeRedFlags.push('Blood Thinners (Anticoagulants / High Bleeding Risk)');
    if (bed.patient.redFlags.hypertension) activeRedFlags.push('Hypertension (High BP)');
    if (bed.patient.redFlags.diabetes) activeRedFlags.push('Diabetes Mellitus');
    if (bed.patient.redFlags.heartDisease) activeRedFlags.push('Known Heart Disease');

    const reportObj: PatientEmergencyReportData = {
      reportId: bed.patient.caseId,
      timestamp: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      patientName: bed.patient.name,
      patientAge: `${bed.patient.age} Years`,
      gender: bed.patient.gender,
      inputMethod: 'Paramedic Assisted',
      emergencyCategory: bed.patient.diagnosis,
      symptomDuration: bed.patient.timeAgo,
      consciousness: bed.patient.consciousness,
      vitals: {
        spo2: bed.patient.vitals.spo2,
        pulse: bed.patient.vitals.pulse,
        bp: bed.patient.vitals.bp
      },
      medicalRedFlags: activeRedFlags,
      allergies: bed.patient.allergies,
      hospital: {
        id: 'gsvm-kanpur',
        name: 'GSVM Medical College & Hospital',
        address: 'Swaroop Nagar, Kanpur, Uttar Pradesh 208002',
        lat: 26.4712,
        lng: 80.3211,
        distance: '0 km',
        distanceKm: 0,
        travelTime: 'Admitted',
        travelTimeMinutes: 0,
        phone: '+91 512 253 5483',
        icuBeds: stats.icu.total - stats.icu.occupied,
        generalBeds: stats.general.total - stats.general.occupied,
        nicuStatus: 'Available',
        pharmacyOpen: true,
        erStatus: 'Open',
        waitingTime: 'Zero Delay',
        imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
        corridorName: 'Main Medical Corridor',
        category: 'medical_college',
        isVerified: true
      },
      userLocationName: `${bed.bedNumber} • ${bed.wardLabel} (${bed.floor})`,
      qrTokenId: `PRATH-HOSP-${bed.patient.caseId}`,
      severityLevel: bed.patient.severity === 'RED' ? 'RED (Critical / Immediate)' : 'YELLOW (Urgent)',
      clinicalSummary: `In-Patient Bed Record: ${bed.patient.name} (${bed.patient.gender}, ${bed.patient.age}Y) admitted in ${bed.bedNumber} (${bed.wardLabel}) under ${bed.patient.assignedDoctor}. Clinical condition: ${bed.patient.diagnosis}. Synchronized vitals: Blood Pressure ${bed.patient.vitals.bp} mmHg, Pulse ${bed.patient.vitals.pulse} bpm, SpO2 ${bed.patient.vitals.spo2}%. Critical risk profile: ${activeRedFlags.join(', ') || 'No chronic alerts'}.`,
      aiSuggestedActions: [
        `Maintain continuous hemodynamic surveillance at ${bed.bedNumber}.`,
        `Specialist protocol active under ${bed.patient.assignedDoctor}.`,
        `Emergency fast-track alert for Blood Thinning / Bleeding precautions if surgery planned.`,
        `ABHA Electronic Health Record linked & synced with GSVM Central HIS.`
      ]
    };

    onViewPatientReport(reportObj);
  };

  return (
    <div id="live-ward-patient-overview-section" className="space-y-4">
      {/* ========================================================================= */}
      {/* 1. SECTION HEADER WITH LIVE COUNTS & OVERVIEW CONTROLS */}
      {/* ========================================================================= */}
      <div
        className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl shadow-sm border transition-colors ${
          isLightMode ? 'bg-white border-slate-200/90 text-slate-900' : 'bg-[#0a1324] border-slate-800/90 text-white'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <h2
              className={`text-sm sm:text-base font-black uppercase tracking-wider flex items-center gap-2 ${
                isLightMode ? 'text-slate-900' : 'text-white'
              }`}
            >
              <BedDouble className={`w-5 h-5 ${isLightMode ? 'text-teal-600' : 'text-teal-400'}`} />
              <span>Ward &amp; Bed Patient Locator • Live Occupancy Overview</span>
            </h2>
          </div>
          <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Real-time tracking of which patient is admitted in which ICU Bed, Trauma Bay, Ventilator, NICU Warmer, or General Ward.
          </p>
        </div>

        {/* Global Overview Metrics Strip */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono ${
              isLightMode ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            <span className={isLightMode ? 'text-slate-500 font-semibold' : 'text-slate-400'}>Total Tracked:</span>
            <strong className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{stats.total} Beds</strong>
          </div>

          <div
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono ${
              isLightMode
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-rose-950/60 border-rose-600/50 text-rose-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="font-semibold">Occupied:</span>
            <strong className="font-bold">{stats.occupied}</strong>
          </div>

          <div
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono ${
              isLightMode
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300'
            }`}
          >
            <span className="font-semibold">Available:</span>
            <strong className="font-bold">{stats.available}</strong>
          </div>

          <div
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono ${
              isLightMode
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-amber-950/60 border-amber-600/50 text-amber-300'
            }`}
          >
            <span className="font-semibold">🩸 Blood Thinners:</span>
            <strong className="font-bold">{stats.bloodThinnersCount} Patients</strong>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. WARD FILTER TABS & SEARCH BAR */}
      {/* ========================================================================= */}
      <div
        className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-2xl border shadow-sm ${
          isLightMode ? 'bg-white border-slate-200/90' : 'bg-[#0a1324] border-slate-800/90'
        }`}
      >
        {/* Ward Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none text-xs">
          <button
            onClick={() => {
              playTactileClick();
              setSelectedWard('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold uppercase whitespace-nowrap transition-all cursor-pointer ${
              selectedWard === 'all'
                ? isLightMode
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/25'
                : isLightMode
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Wards ({stats.total})
          </button>

          <button
            onClick={() => {
              playTactileClick();
              setSelectedWard('icu');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold uppercase whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedWard === 'icu'
                ? 'bg-teal-600 text-white shadow-sm'
                : isLightMode
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                : 'bg-slate-900 text-slate-400 hover:text-teal-300 border border-slate-800'
            }`}
          >
            <span>🛏️ ICU Beds</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                isLightMode ? 'bg-teal-100 text-teal-900' : 'bg-slate-950/80 text-teal-300'
              }`}
            >
              {stats.icu.occupied}/{stats.icu.total}
            </span>
          </button>

          <button
            onClick={() => {
              playTactileClick();
              setSelectedWard('trauma');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold uppercase whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedWard === 'trauma'
                ? 'bg-rose-600 text-white shadow-sm'
                : isLightMode
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                : 'bg-slate-900 text-slate-400 hover:text-rose-300 border border-slate-800'
            }`}
          >
            <span>🚨 ER Trauma</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                isLightMode ? 'bg-rose-100 text-rose-900' : 'bg-slate-950/80 text-rose-300'
              }`}
            >
              {stats.trauma.occupied}/{stats.trauma.total}
            </span>
          </button>

          <button
            onClick={() => {
              playTactileClick();
              setSelectedWard('ventilator');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold uppercase whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedWard === 'ventilator'
                ? 'bg-blue-600 text-white shadow-sm'
                : isLightMode
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                : 'bg-slate-900 text-slate-400 hover:text-blue-300 border border-slate-800'
            }`}
          >
            <span>💨 Ventilators</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                isLightMode ? 'bg-blue-100 text-blue-900' : 'bg-slate-950/80 text-blue-300'
              }`}
            >
              {stats.ventilator.occupied}/{stats.ventilator.total}
            </span>
          </button>

          <button
            onClick={() => {
              playTactileClick();
              setSelectedWard('nicu');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold uppercase whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedWard === 'nicu'
                ? 'bg-purple-600 text-white shadow-sm'
                : isLightMode
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                : 'bg-slate-900 text-slate-400 hover:text-purple-300 border border-slate-800'
            }`}
          >
            <span>👶 NICU Warmers</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                isLightMode ? 'bg-purple-100 text-purple-900' : 'bg-slate-950/80 text-purple-300'
              }`}
            >
              {stats.nicu.occupied}/{stats.nicu.total}
            </span>
          </button>

          <button
            onClick={() => {
              playTactileClick();
              setSelectedWard('general');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold uppercase whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedWard === 'general'
                ? 'bg-emerald-600 text-white shadow-sm'
                : isLightMode
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                : 'bg-slate-900 text-slate-400 hover:text-emerald-300 border border-slate-800'
            }`}
          >
            <span>🏥 General Ward</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                isLightMode ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-950/80 text-emerald-300'
              }`}
            >
              {stats.general.occupied}/{stats.general.total}
            </span>
          </button>
        </div>

        {/* Search & Quick Sub-Filters */}
        <div className="flex items-center gap-2">
          {/* Quick Sub-Filter */}
          <div
            className={`flex items-center gap-1 p-1 rounded-xl border text-[11px] ${
              isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <button
              onClick={() => {
                playTactileClick();
                setStatusFilter('all');
              }}
              className={`px-2 py-0.5 rounded-lg font-semibold transition-all ${
                statusFilter === 'all'
                  ? isLightMode
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'bg-slate-800 text-white'
                  : isLightMode
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                playTactileClick();
                setStatusFilter('occupied');
              }}
              className={`px-2 py-0.5 rounded-lg font-semibold transition-all ${
                statusFilter === 'occupied'
                  ? isLightMode
                    ? 'bg-rose-100 text-rose-800 font-bold'
                    : 'bg-rose-900/60 text-rose-300'
                  : isLightMode
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Occupied
            </button>
            <button
              onClick={() => {
                playTactileClick();
                setStatusFilter('available');
              }}
              className={`px-2 py-0.5 rounded-lg font-semibold transition-all ${
                statusFilter === 'available'
                  ? isLightMode
                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                    : 'bg-emerald-900/60 text-emerald-300'
                  : isLightMode
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => {
                playTactileClick();
                setStatusFilter('blood_thinners');
              }}
              className={`px-2 py-0.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                statusFilter === 'blood_thinners'
                  ? isLightMode
                    ? 'bg-amber-100 text-amber-900 font-bold'
                    : 'bg-amber-900/60 text-amber-300'
                  : isLightMode
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Filter patients taking Blood Thinning medicines"
            >
              <span>🩸 Thinners</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLightMode ? 'text-slate-400' : 'text-slate-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, bed, doctor..."
              className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs transition-colors focus:outline-none ${
                isLightMode
                  ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-teal-500'
                  : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-teal-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE BED PATIENT MATRIX GRID */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {filteredBeds.map((bed) => {
          const isOccupied = bed.status === 'Occupied' && bed.patient;

          return (
            <div
              key={bed.id}
              id={`bed-overview-card-${bed.id}`}
              className={`rounded-2xl border p-4 transition-all relative flex flex-col justify-between gap-3 ${
                isLightMode
                  ? isOccupied
                    ? bed.patient?.severity === 'RED'
                      ? 'bg-white border-rose-300 hover:border-rose-500 shadow-sm hover:shadow-md'
                      : 'bg-white border-slate-200 hover:border-teal-500 shadow-sm hover:shadow-md'
                    : 'bg-slate-50/70 border-slate-200 hover:border-emerald-500 shadow-xs'
                  : isOccupied
                  ? bed.patient?.severity === 'RED'
                    ? 'bg-gradient-to-br from-slate-900 via-slate-900/95 to-rose-950/30 border-rose-500/40 hover:border-rose-400 shadow-xl'
                    : 'bg-gradient-to-br from-slate-900 via-slate-900/95 to-teal-950/30 border-teal-500/30 hover:border-teal-400 shadow-xl'
                  : 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/50 shadow-xl'
              }`}
            >
              {/* Bed Top Header */}
              <div className={`flex items-center justify-between border-b pb-2.5 ${isLightMode ? 'border-slate-100' : 'border-slate-800'}`}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
                      isLightMode
                        ? isOccupied
                          ? bed.wardType === 'trauma'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : bed.wardType === 'ventilator'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : bed.wardType === 'nicu'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-teal-100 text-teal-800 border border-teal-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                        : isOccupied
                        ? bed.wardType === 'trauma'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : bed.wardType === 'ventilator'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : bed.wardType === 'nicu'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {bed.wardType === 'trauma' ? '🚨' : bed.wardType === 'ventilator' ? '💨' : bed.wardType === 'nicu' ? '👶' : '🛏️'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-black font-mono ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                        {bed.bedNumber}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          isLightMode
                            ? bed.wardType === 'trauma'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : bed.wardType === 'ventilator'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : bed.wardType === 'nicu'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-teal-100 text-teal-800 border border-teal-200'
                            : bed.wardType === 'trauma'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : bed.wardType === 'ventilator'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : bed.wardType === 'nicu'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-teal-950 text-teal-300 border border-teal-800'
                        }`}
                      >
                        {bed.wardType}
                      </span>
                    </div>
                    <div className={`text-[10px] font-medium truncate max-w-[180px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {bed.wardLabel} • <span className={isLightMode ? 'text-slate-400' : 'text-slate-500'}>{bed.floor}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isLightMode
                        ? isOccupied
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isOccupied
                        ? 'bg-rose-950 text-rose-300 border border-rose-600/60 shadow-sm shadow-rose-950'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-600/60'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isOccupied ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`}></span>
                    {isOccupied ? 'OCCUPIED' : 'AVAILABLE'}
                  </span>
                  {isOccupied && (
                    <div className={`text-[9px] font-mono mt-0.5 ${isLightMode ? 'text-slate-400' : 'text-slate-400'}`}>
                      {bed.patient?.timeAgo}
                    </div>
                  )}
                </div>
              </div>

              {/* Occupied State: Patient Details */}
              {isOccupied && bed.patient ? (
                <div className="space-y-2.5">
                  {/* Patient Name & Primary Diagnosis */}
                  <div
                    className={`p-2.5 rounded-xl border space-y-1 ${
                      isLightMode ? 'bg-slate-50/90 border-slate-200/90 text-slate-900' : 'bg-slate-950/80 border-slate-800 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{bed.patient.name}</span>
                        <span className={`text-[10px] font-mono ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {bed.patient.age}Y • {bed.patient.gender}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-bold ${
                          isLightMode ? 'bg-white text-teal-800 border-slate-200' : 'bg-slate-900 text-teal-300 border-slate-700'
                        }`}
                      >
                        {bed.patient.caseId}
                      </span>
                    </div>

                    <div className={`text-[11px] font-bold flex items-center gap-1.5 ${isLightMode ? 'text-rose-700' : 'text-rose-300'}`}>
                      <Activity className={`w-3.5 h-3.5 shrink-0 ${isLightMode ? 'text-rose-600' : 'text-rose-400'}`} />
                      <span className="truncate">{bed.patient.diagnosis}</span>
                    </div>

                    <div className={`flex items-center justify-between text-[10px] pt-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      <span className="flex items-center gap-1">
                        <Stethoscope className={`w-3 h-3 ${isLightMode ? 'text-teal-600' : 'text-teal-400'}`} />
                        <span>
                          Doctor:{' '}
                          <strong className={isLightMode ? 'text-slate-800 font-bold' : 'text-slate-200'}>
                            {bed.patient.assignedDoctor}
                          </strong>
                        </span>
                      </span>
                      <span>
                        Admitted:{' '}
                        <strong className={`font-mono ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                          {bed.patient.admittedAt}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Vitals Strip */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className={`p-2 rounded-xl border text-center ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                      <div className={`text-[9px] uppercase font-bold ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>Blood Pressure</div>
                      <div className={`text-xs font-black font-mono mt-0.5 ${isLightMode ? 'text-emerald-700' : 'text-emerald-400'}`}>
                        {bed.patient.vitals.bp} <span className={`text-[8px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>mmHg</span>
                      </div>
                    </div>

                    <div className={`p-2 rounded-xl border text-center ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                      <div className={`text-[9px] uppercase font-bold ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>SpO2 Oxygen</div>
                      <div className={`text-xs font-black font-mono mt-0.5 ${isLightMode ? 'text-blue-700' : 'text-blue-400'}`}>
                        {bed.patient.vitals.spo2}%
                      </div>
                    </div>

                    <div className={`p-2 rounded-xl border text-center ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                      <div className={`text-[9px] uppercase font-bold ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>Heart Pulse</div>
                      <div className={`text-xs font-black font-mono mt-0.5 ${isLightMode ? 'text-rose-700' : 'text-rose-400'}`}>
                        {bed.patient.vitals.pulse} <span className={`text-[8px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>bpm</span>
                      </div>
                    </div>
                  </div>

                  {/* Red Flags Chips (Blood Thinners, HTN, Diabetes, etc.) */}
                  <div className="flex flex-wrap gap-1">
                    {bed.patient.redFlags.bloodThinners ? (
                      <span
                        className={`px-2 py-0.5 rounded-md border text-[10px] font-black flex items-center gap-1 shadow-xs ${
                          isLightMode
                            ? 'bg-rose-50 border-rose-300 text-rose-800'
                            : 'bg-rose-950 border border-rose-500/70 text-rose-300'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                        <span>🩸 Blood Thinners: ACTIVE</span>
                      </span>
                    ) : (
                      <span
                        className={`px-1.5 py-0.5 rounded-md border text-[9px] ${
                          isLightMode ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        No Blood Thinners
                      </span>
                    )}

                    {bed.patient.redFlags.hypertension && (
                      <span
                        className={`px-1.5 py-0.5 rounded-md border text-[9px] font-bold ${
                          isLightMode ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/70 border border-amber-600/40 text-amber-300'
                        }`}
                      >
                        HTN History
                      </span>
                    )}

                    {bed.patient.redFlags.diabetes && (
                      <span
                        className={`px-1.5 py-0.5 rounded-md border text-[9px] font-bold ${
                          isLightMode ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/70 border border-amber-600/40 text-amber-300'
                        }`}
                      >
                        Diabetic
                      </span>
                    )}

                    <span
                      className={`px-1.5 py-0.5 rounded-md border text-[9px] ${
                        isLightMode ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-950 text-slate-300 border border-slate-800'
                      }`}
                    >
                      Consciousness: <strong>{bed.patient.consciousness}</strong>
                    </span>
                  </div>
                </div>
              ) : (
                /* Available State: Clean Standby Display */
                <div
                  className={`p-4 rounded-xl border border-dashed text-center space-y-2 my-auto ${
                    isLightMode ? 'bg-slate-50 border-slate-300' : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                      isLightMode ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    ✓
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isLightMode ? 'text-slate-800' : 'text-slate-300'}`}>Ready for Immediate Admission</div>
                    <p className={`text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      Sanitized, monitored &amp; synchronized with city emergency grid
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1 pt-1">
                    {bed.equipment.map((eq, i) => (
                      <span
                        key={i}
                        className={`text-[9px] px-1.5 py-0.5 rounded border ${
                          isLightMode ? 'bg-white text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bed Bottom Actions */}
              <div className={`pt-2 border-t flex items-center justify-between gap-2 ${isLightMode ? 'border-slate-100' : 'border-slate-800'}`}>
                {isOccupied ? (
                  <>
                    <button
                      onClick={() => triggerOpenReportModal(bed)}
                      className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isLightMode
                          ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800'
                          : 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/40 text-blue-300 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Clinical Pass</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          playTactileClick();
                          setTransferModalBed(bed);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                          isLightMode
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                            : 'bg-slate-800 hover:bg-slate-700 border-transparent text-slate-300'
                        }`}
                        title="Transfer patient to another ward/bed"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Transfer</span>
                      </button>

                      <button
                        onClick={() => handleDischargeBed(bed.id)}
                        className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                          isLightMode
                            ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                            : 'bg-red-950/40 hover:bg-red-900/60 border border-red-600/40 text-red-300'
                        }`}
                        title="Discharge patient and free this bed"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Free Bed</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      playTactileClick();
                      setAdmitModalBed(bed);
                    }}
                    className={`w-full py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isLightMode
                        ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                        : 'bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-500/40 text-emerald-300 hover:text-white'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Admit Patient to {bed.bedNumber}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 4. BED TRANSFER MODAL */}
      {/* ========================================================================= */}
      {transferModalBed && transferModalBed.patient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4 border animate-in fade-in zoom-in duration-200 ${
              isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b1329] border-slate-700 text-white'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center gap-2">
                <ArrowRightLeft className={`w-5 h-5 ${isLightMode ? 'text-teal-600' : 'text-teal-400'}`} />
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                  Transfer Patient Bed Location
                </h3>
              </div>
              <button
                onClick={() => setTransferModalBed(null)}
                className={isLightMode ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-3 rounded-xl border space-y-1 text-xs ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Current Patient:</div>
              <div className={`text-sm font-black ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                {transferModalBed.patient.name} ({transferModalBed.patient.caseId})
              </div>
              <div className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>
                Current Bed:{' '}
                <span className={`font-bold ${isLightMode ? 'text-teal-700' : 'text-teal-300'}`}>{transferModalBed.bedNumber}</span> (
                {transferModalBed.wardLabel})
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-bold ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>Select Target Ward:</label>
              <select
                value={targetTransferWard}
                onChange={(e) => setTargetTransferWard(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-teal-500 ${
                  isLightMode ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              >
                <option value="icu">ICU Critical Care ({stats.icu.total - stats.icu.occupied} Free)</option>
                <option value="trauma">ER Trauma Bay ({stats.trauma.total - stats.trauma.occupied} Free)</option>
                <option value="ventilator">Ventilator Unit ({stats.ventilator.total - stats.ventilator.occupied} Free)</option>
                <option value="nicu">NICU Neo-Natal ({stats.nicu.total - stats.nicu.occupied} Free)</option>
                <option value="general">General Ward Step-Down ({stats.general.total - stats.general.occupied} Free)</option>
              </select>
            </div>

            <div className={`flex items-center justify-end gap-2 pt-2 border-t ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
              <button
                onClick={() => setTransferModalBed(null)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteTransfer}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Confirm Transfer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ADMIT PATIENT MODAL */}
      {/* ========================================================================= */}
      {admitModalBed && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-2xl p-5 shadow-2xl space-y-4 border animate-in fade-in zoom-in duration-200 ${
              isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b1329] border-slate-700 text-white'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center gap-2">
                <Plus className={`w-5 h-5 ${isLightMode ? 'text-emerald-600' : 'text-emerald-400'}`} />
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                    Direct Patient Admission
                  </h3>
                  <p className={`text-[10px] font-semibold ${isLightMode ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    Allocating {admitModalBed.bedNumber} ({admitModalBed.wardLabel})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAdmitModalBed(null)}
                className={isLightMode ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className={`text-[11px] font-bold ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>Patient Full Name *</label>
                <input
                  type="text"
                  value={newAdmitData.name}
                  onChange={(e) => setNewAdmitData({ ...newAdmitData, name: e.target.value })}
                  placeholder="e.g. Anand Prakash"
                  className={`w-full p-2 rounded-xl border text-xs focus:outline-none focus:border-teal-500 ${
                    isLightMode ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className={`text-[11px] font-bold ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>Age (Yrs)</label>
                  <input
                    type="number"
                    value={newAdmitData.age}
                    onChange={(e) => setNewAdmitData({ ...newAdmitData, age: e.target.value })}
                    className={`w-full p-2 rounded-xl border text-xs focus:outline-none focus:border-teal-500 ${
                      isLightMode ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-[11px] font-bold ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>Gender</label>
                  <select
                    value={newAdmitData.gender}
                    onChange={(e) => setNewAdmitData({ ...newAdmitData, gender: e.target.value as any })}
                    className={`w-full p-2 rounded-xl border text-xs focus:outline-none focus:border-teal-500 ${
                      isLightMode ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className={`text-[11px] font-bold ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>Primary Emergency / Diagnosis</label>
                <input
                  type="text"
                  value={newAdmitData.diagnosis}
                  onChange={(e) => setNewAdmitData({ ...newAdmitData, diagnosis: e.target.value })}
                  placeholder="e.g. Acute Chest Pain / Respiratory Distress"
                  className={`w-full p-2 rounded-xl border text-xs focus:outline-none focus:border-teal-500 ${
                    isLightMode ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`text-[11px] font-bold ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>Blood Pressure (BP)</label>
                <input
                  type="text"
                  value={newAdmitData.bp}
                  onChange={(e) => setNewAdmitData({ ...newAdmitData, bp: e.target.value })}
                  placeholder="140/90"
                  className={`w-full p-2 rounded-xl border text-xs focus:outline-none focus:border-teal-500 ${
                    isLightMode ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className={`text-[11px] font-bold ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>SpO2 %</label>
                  <input
                    type="number"
                    value={newAdmitData.spo2}
                    onChange={(e) => setNewAdmitData({ ...newAdmitData, spo2: parseInt(e.target.value) || 98 })}
                    className={`w-full p-2 rounded-xl border text-xs focus:outline-none focus:border-teal-500 ${
                      isLightMode ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-[11px] font-bold ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>Pulse (bpm)</label>
                  <input
                    type="number"
                    value={newAdmitData.pulse}
                    onChange={(e) => setNewAdmitData({ ...newAdmitData, pulse: parseInt(e.target.value) || 84 })}
                    className={`w-full p-2 rounded-xl border text-xs focus:outline-none focus:border-teal-500 ${
                      isLightMode ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Red Flags Toggle */}
              <div
                className={`sm:col-span-2 p-3 rounded-xl border space-y-2 ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className={`text-[11px] font-bold ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>Medical History &amp; Red Flags:</div>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAdmitData.bloodThinners}
                      onChange={(e) => setNewAdmitData({ ...newAdmitData, bloodThinners: e.target.checked })}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span className={`text-xs font-bold ${isLightMode ? 'text-rose-700' : 'text-rose-300'}`}>
                      🩸 Blood Thinning (Anticoagulant)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAdmitData.hypertension}
                      onChange={(e) => setNewAdmitData({ ...newAdmitData, hypertension: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className={`text-xs font-semibold ${isLightMode ? 'text-amber-800' : 'text-amber-300'}`}>
                      Hypertension (High BP)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAdmitData.diabetes}
                      onChange={(e) => setNewAdmitData({ ...newAdmitData, diabetes: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className={`text-xs font-semibold ${isLightMode ? 'text-amber-800' : 'text-amber-300'}`}>
                      Diabetes Mellitus
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className={`flex items-center justify-end gap-2 pt-2 border-t ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
              <button
                onClick={() => setAdmitModalBed(null)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmNewAdmit}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Confirm Admission</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
