import React, { useState, useMemo } from 'react';
import {
  Activity,
  Search,
  Filter,
  CreditCard,
  Building2,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  Stethoscope,
  ChevronRight,
  Printer,
  Download,
  Share2,
  RefreshCw,
  LogOut,
  BedDouble,
  UserCheck,
  Zap,
  ArrowUpRight,
  Shield,
  Heart,
  Wind,
  Check,
  X
} from 'lucide-react';
import { playTactileClick, playConfirmChime, playCodeRedAlert } from '../../lib/audio';
import { PatientEmergencyReportData } from '../citizen/PatientReportModal';

export type ArrivalSource = 'golden_hour_ambulance' | 'fast_track_token' | 'direct_er_walkin' | 'code_red_surge';
export type AdmissionStatus = 'admitted' | 'scheduled_discharge' | 'discharged' | 'transferred_ot';

export interface PatientHistoryRecord {
  id: string;
  caseId: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  arrivalSource: ArrivalSource;
  sourceDetail: string; // e.g. 'ALS-108 Ambulance #UP-78-G-1102' or 'Cashless Counter Slip QR-992'
  priority: 'TRAUMA RED' | 'YELLOW' | 'GREEN';
  condition: string;
  admittedWard: string;
  bedNumber: string;
  floor: string;
  assignedDoctor: string;
  doctorSpecialty: string;
  arrivalTime: string;
  admittedAt: string;
  dischargeTime?: string;
  status: AdmissionStatus;
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
  };
  tokenAmount?: number;
  tokenNumber?: string;
  ambulanceId?: string;
  aiReportSummary: string;
  aiSuggestedActions: string[];
}

interface PatientInboundHistoryViewProps {
  isLightMode?: boolean;
  onViewPatientReport: (reportData: PatientEmergencyReportData) => void;
  onBedCountChange?: (wardType: string, delta: number) => void;
  externalHistory?: PatientHistoryRecord[];
}

export const PatientInboundHistoryView: React.FC<PatientInboundHistoryViewProps> = ({
  isLightMode = true,
  onViewPatientReport,
  onBedCountChange,
  externalHistory = []
}) => {
  // Filters & Search
  const [sourceFilter, setSourceFilter] = useState<'all' | 'golden_hour' | 'token' | 'walkin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'admitted' | 'discharged' | 'transferred_ot'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<PatientHistoryRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial Comprehensive History State (Golden Hour Ambulances, Fast-Track Tokens & Admissions)
  const [records, setRecords] = useState<PatientHistoryRecord[]>([
    {
      id: 'rec-101',
      caseId: 'TNX-2024-1258',
      tokenNumber: 'TNX-2024-1258',
      patientName: 'Rohan Sharma',
      age: 32,
      gender: 'Male',
      arrivalSource: 'golden_hour_ambulance',
      sourceDetail: 'ALS-108 Ambulance #UP-78-G-1102 (Kanpur Highway Trauma Corridor)',
      priority: 'TRAUMA RED',
      condition: 'High-Velocity Road Traffic Collision • Pelvic Fracture & Hemorrhagic Shock',
      admittedWard: 'Trauma ICU Bay 1',
      bedNumber: 'Trauma Bay #02',
      floor: 'Floor Ground • Emergency Trauma Complex',
      assignedDoctor: 'Dr. A. Verma',
      doctorSpecialty: 'Trauma Surgery',
      arrivalTime: 'Today, 10:24 AM',
      admittedAt: '10:27 AM (Instant Bed Allotment)',
      status: 'admitted',
      tokenAmount: 500,
      ambulanceId: 'ALS-108-KANPUR',
      vitals: { bp: '85/50', spo2: 92, pulse: 128, temp: '97.8°F' },
      redFlags: { bloodThinners: true, hypertension: false, diabetes: false, heartDisease: false },
      aiReportSummary: 'Golden Hour Trauma Protocol initiated. High bleeding risk due to active blood thinners. Massive transfusion protocol and pelvic binder active.',
      aiSuggestedActions: [
        'Immediate cross-match 4 units PRBCs.',
        'Urgent CT Angio of Pelvis & Abdomen.',
        'Alert on-call Trauma Surgeon & Orthopedics.'
      ]
    },
    {
      id: 'rec-102',
      caseId: 'TNX-2024-1257',
      tokenNumber: 'TNX-2024-1257',
      patientName: 'Sunita Devi',
      age: 45,
      gender: 'Female',
      arrivalSource: 'fast_track_token',
      sourceDetail: '₹500 Cashless Reception Token Desk (ABDM QR Verified)',
      priority: 'YELLOW',
      condition: 'Severe Acute Exacerbation of Asthma • SpO2 Desaturation',
      admittedWard: 'Emergency HDU Block B',
      bedNumber: 'Ventilator #02 (HDU)',
      floor: 'Floor 1 • HDU Wing',
      assignedDoctor: 'Dr. P. Sharma',
      doctorSpecialty: 'Emergency Medicine',
      arrivalTime: 'Today, 10:05 AM',
      admittedAt: '10:08 AM',
      status: 'admitted',
      tokenAmount: 500,
      vitals: { bp: '135/88', spo2: 94, pulse: 104, temp: '98.6°F' },
      redFlags: { bloodThinners: false, hypertension: true, diabetes: false, heartDisease: false },
      aiReportSummary: 'Patient arrived via Fast-Track Token. Administered continuous nebulization & IV steroids. SpO2 stabilizing at 94% on 4L O2.',
      aiSuggestedActions: [
        'Continue Salbutamol + Ipratropium nebulization Q4H.',
        'Monitor peak expiratory flow (PEFR).',
        'Re-evaluate for Step-down general ward in 4 hours.'
      ]
    },
    {
      id: 'rec-103',
      caseId: 'TNX-2024-1256',
      tokenNumber: 'TNX-2024-1256',
      patientName: 'Harish Varma',
      age: 62,
      gender: 'Male',
      arrivalSource: 'golden_hour_ambulance',
      sourceDetail: 'NHM Cardiac Life Support #UP-78-CR-904',
      priority: 'TRAUMA RED',
      condition: 'Acute Anterior STEMI • ST-Elevation Lead V1-V4',
      admittedWard: 'Cardiac ICU Bay 1',
      bedNumber: 'ICU Bed #01',
      floor: 'Floor 1 • Cardiology Wing',
      assignedDoctor: 'Dr. M. Khanna',
      doctorSpecialty: 'Cardiology',
      arrivalTime: 'Today, 09:40 AM',
      admittedAt: '09:43 AM',
      status: 'transferred_ot',
      tokenAmount: 500,
      ambulanceId: 'CARDIO-ALS-904',
      vitals: { bp: '142/92', spo2: 96, pulse: 94, temp: '98.4°F' },
      redFlags: { bloodThinners: true, hypertension: true, diabetes: true, heartDisease: true },
      aiReportSummary: 'Golden Hour Pre-Hospital ECG detected acute anterior wall myocardial infarction. Cath Lab pre-activated while in transit.',
      aiSuggestedActions: [
        'Primary Percutaneous Coronary Intervention (PCI) in Cath Lab 2.',
        'Administered loading doses of Aspirin 325mg + Ticagrelor 180mg + Atorvastatin 80mg.',
        'Post-angioplasty ICU bed reserved.'
      ]
    },
    {
      id: 'rec-104',
      caseId: 'TNX-2024-1255',
      tokenNumber: 'TNX-2024-1255',
      patientName: 'Deepak Singh',
      age: 19,
      gender: 'Male',
      arrivalSource: 'fast_track_token',
      sourceDetail: '₹500 Fast-Track Token Slip • Sports Injury Center',
      priority: 'YELLOW',
      condition: 'Right Distal Radius Fracture & Superficial Lacerations',
      admittedWard: 'Trauma Observation Ward',
      bedNumber: 'General Ward Bed #12',
      floor: 'Floor Ground • Minor OT Complex',
      assignedDoctor: 'Dr. K. Patel',
      doctorSpecialty: 'Orthopedics',
      arrivalTime: 'Today, 09:15 AM',
      admittedAt: '09:18 AM',
      dischargeTime: 'Today, 11:45 AM (Successfully Discharged)',
      status: 'discharged',
      tokenAmount: 500,
      vitals: { bp: '120/78', spo2: 99, pulse: 76, temp: '98.1°F' },
      redFlags: { bloodThinners: false, hypertension: false, diabetes: false, heartDisease: false },
      aiReportSummary: 'Closed reduction and plaster back-slab applied under local block. Neurovascular examination intact. Analgesics prescribed.',
      aiSuggestedActions: [
        'Discharged with follow-up in Ortho OPD in 7 days.',
        'Post-reduction X-Ray confirmed anatomical alignment.',
        'Patient given ABDM digital discharge summary.'
      ]
    },
    {
      id: 'rec-105',
      caseId: 'TNX-2024-1249',
      patientName: 'Kusum Devi',
      age: 58,
      gender: 'Female',
      arrivalSource: 'golden_hour_ambulance',
      sourceDetail: 'CityCare Ambulance #UP-78-AMB-4412 (Stroke Golden Window)',
      priority: 'TRAUMA RED',
      condition: 'Acute Ischemic Stroke (LVO - Right MCA territory) • Left Hemiparesis',
      admittedWard: 'Neuro ICU Bay 2',
      bedNumber: 'ICU Bed #03 (Neuro)',
      floor: 'Floor 1 • Neurology Critical Wing',
      assignedDoctor: 'Dr. R. Verma',
      doctorSpecialty: 'Neurosurgery / Stroke Unit',
      arrivalTime: 'Today, 08:30 AM',
      admittedAt: '08:35 AM',
      status: 'admitted',
      ambulanceId: 'STROKE-RESCUE-12',
      vitals: { bp: '168/98', spo2: 97, pulse: 82, temp: '98.6°F' },
      redFlags: { bloodThinners: false, hypertension: true, diabetes: true, heartDisease: false },
      aiReportSummary: 'Arrived within 2.5 hours of symptom onset. Non-contrast Head CT ruled out hemorrhage. IV Thrombolysis (Tenecteplase) infused in ER.',
      aiSuggestedActions: [
        'Continuous NIHSS and neurological vitals monitoring Q15M in Neuro ICU.',
        'Maintain systolic BP between 140-160 mmHg.',
        'Repeat MRI Brain at 24 hours.'
      ]
    },
    {
      id: 'rec-106',
      caseId: 'TNX-2024-1240',
      tokenNumber: 'TNX-2024-1240',
      patientName: 'Anil Kumar Mishra',
      age: 52,
      gender: 'Male',
      arrivalSource: 'fast_track_token',
      sourceDetail: '₹500 Fast-Track Token Slip • OPD Fast Corridor',
      priority: 'GREEN',
      condition: 'Acute Gastroenteritis with Moderate Dehydration',
      admittedWard: 'Short Stay Daycare Ward',
      bedNumber: 'Observation Bay #04',
      floor: 'Floor Ground • Daycare Clinic',
      assignedDoctor: 'Dr. P. Sharma',
      doctorSpecialty: 'Emergency Medicine',
      arrivalTime: 'Today, 07:50 AM',
      admittedAt: '07:55 AM',
      dischargeTime: 'Today, 10:30 AM (Discharged)',
      status: 'discharged',
      tokenAmount: 500,
      vitals: { bp: '110/70', spo2: 98, pulse: 86, temp: '99.1°F' },
      redFlags: { bloodThinners: false, hypertension: false, diabetes: false, heartDisease: false },
      aiReportSummary: 'Treated with 2 liters IV Normal Saline, antiemetics, and ORS solution. Electrolytes normalized.',
      aiSuggestedActions: [
        'Discharged home with oral rehydration therapy.',
        'Dietary instructions and prescription provided on mobile app.'
      ]
    },
    {
      id: 'rec-107',
      caseId: 'TNX-2024-1234',
      patientName: 'Baby of Shalini Gupta',
      age: 1, // Days
      gender: 'Female',
      arrivalSource: 'golden_hour_ambulance',
      sourceDetail: 'Neonatal Emergency Transport Service (NETS)',
      priority: 'TRAUMA RED',
      condition: 'Pre-Term (32 Weeks) • Neonatal Respiratory Distress Syndrome (RDS)',
      admittedWard: 'Neo-Natal ICU (NICU)',
      bedNumber: 'NICU Warmer #01',
      floor: 'Floor 2 • Neo-Natal Wing',
      assignedDoctor: 'Dr. P. Sharma',
      doctorSpecialty: 'Neo-Natology',
      arrivalTime: 'Today, 06:10 AM',
      admittedAt: '06:14 AM',
      status: 'admitted',
      ambulanceId: 'NICU-NETS-01',
      vitals: { bp: '65/40', spo2: 95, pulse: 146, temp: '36.8°C' },
      redFlags: { bloodThinners: false, hypertension: false, diabetes: false, heartDisease: false },
      aiReportSummary: 'Pre-term infant transferred with Bubble CPAP and micro-sensor oxygen tracking. Exogenous surfactant instilled.',
      aiSuggestedActions: [
        'Maintain Bubble CPAP 5 cmH2O, FiO2 30%.',
        'Continuous incubator thermal regulation at 36.8°C.',
        'Parenteral nutrition started.'
      ]
    }
  ]);

  // Combine external and internal records, deduplicating by caseId
  const allRecords = useMemo(() => {
    if (!externalHistory || externalHistory.length === 0) return records;
    const existingIds = new Set(records.map(r => r.caseId));
    const newItems = externalHistory.filter(e => !existingIds.has(e.caseId));
    return [...newItems, ...records];
  }, [records, externalHistory]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return allRecords.filter((rec) => {
      // 1. Source filter
      if (sourceFilter === 'golden_hour' && rec.arrivalSource !== 'golden_hour_ambulance') return false;
      if (sourceFilter === 'token' && rec.arrivalSource !== 'fast_track_token') return false;
      if (sourceFilter === 'walkin' && rec.arrivalSource !== 'direct_er_walkin' && rec.arrivalSource !== 'code_red_surge') return false;

      // 2. Status filter
      if (statusFilter === 'admitted' && rec.status !== 'admitted') return false;
      if (statusFilter === 'discharged' && rec.status !== 'discharged') return false;
      if (statusFilter === 'transferred_ot' && rec.status !== 'transferred_ot') return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = rec.patientName.toLowerCase().includes(q);
        const matchCase = rec.caseId.toLowerCase().includes(q) || (rec.tokenNumber && rec.tokenNumber.toLowerCase().includes(q));
        const matchBed = rec.bedNumber.toLowerCase().includes(q) || rec.admittedWard.toLowerCase().includes(q);
        const matchDoctor = rec.assignedDoctor.toLowerCase().includes(q) || rec.doctorSpecialty.toLowerCase().includes(q);
        const matchCondition = rec.condition.toLowerCase().includes(q);
        return matchName || matchCase || matchBed || matchDoctor || matchCondition;
      }

      return true;
    });
  }, [allRecords, sourceFilter, statusFilter, searchQuery]);

  // Metric Computations
  const stats = useMemo(() => {
    const total = allRecords.length;
    const goldenHourCount = allRecords.filter(r => r.arrivalSource === 'golden_hour_ambulance').length;
    const tokenCount = allRecords.filter(r => r.arrivalSource === 'fast_track_token').length;
    const currentlyAdmitted = allRecords.filter(r => r.status === 'admitted' || r.status === 'transferred_ot').length;
    const dischargedToday = allRecords.filter(r => r.status === 'discharged').length;
    return { total, goldenHourCount, tokenCount, currentlyAdmitted, dischargedToday };
  }, [allRecords]);

  // Handler: Execute Discharge of a Patient
  const handleDischargePatient = (recordId: string) => {
    playTactileClick();
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    setRecords(prev => prev.map(rec => {
      if (rec.id === recordId) {
        return {
          ...rec,
          status: 'discharged',
          dischargeTime: `Today, ${nowTime} (Discharged via Reception)`
        };
      }
      return rec;
    }));

    const rec = allRecords.find(r => r.id === recordId);
    if (rec && onBedCountChange) {
      // Determine ward type
      const wt = rec.admittedWard.toLowerCase().includes('icu')
        ? 'icu'
        : rec.admittedWard.toLowerCase().includes('trauma')
        ? 'trauma'
        : rec.admittedWard.toLowerCase().includes('nicu')
        ? 'nicu'
        : 'general';
      onBedCountChange(wt, -1);
    }

    setToastMessage(`Patient ${rec?.patientName || 'Record'} discharged successfully. Bed ${rec?.bedNumber} freed.`);
    playConfirmChime();
    setTimeout(() => setToastMessage(null), 4000);
    setSelectedRecordDetail(null);
  };

  // Helper: Open rich clinical report modal for any history item
  const handleOpenAiReport = (rec: PatientHistoryRecord) => {
    playTactileClick();
    const activeRedFlags: string[] = [];
    if (rec.redFlags.bloodThinners) activeRedFlags.push('Blood Thinners / Anticoagulants (High Bleed Risk)');
    if (rec.redFlags.hypertension) activeRedFlags.push('Hypertension (High BP)');
    if (rec.redFlags.diabetes) activeRedFlags.push('Diabetes Mellitus');
    if (rec.redFlags.heartDisease) activeRedFlags.push('Known Ischemic Heart Disease');

    const reportObj: PatientEmergencyReportData = {
      reportId: rec.caseId,
      timestamp: rec.arrivalTime,
      patientName: rec.patientName,
      patientAge: `${rec.age} Years`,
      gender: rec.gender,
      inputMethod: rec.arrivalSource === 'golden_hour_ambulance' ? 'Paramedic Assisted' : 'Manual Self-Triage',
      emergencyCategory: rec.condition,
      symptomDuration: rec.admittedAt,
      consciousness: rec.priority === 'TRAUMA RED' ? 'Drowsy / Critical' : 'Alert',
      vitals: {
        spo2: rec.vitals.spo2,
        pulse: rec.vitals.pulse,
        bp: rec.vitals.bp
      },
      medicalRedFlags: activeRedFlags,
      allergies: 'No Known Drug Allergies (NKDA)',
      hospital: {
        id: 'gsvm-kanpur',
        name: 'GSVM Medical College & Hospital',
        address: 'Swaroop Nagar, Kanpur, Uttar Pradesh 208002',
        lat: 26.4712,
        lng: 80.3211,
        distance: '0 km',
        distanceKm: 0,
        travelTime: rec.status === 'discharged' ? 'Discharged' : 'Admitted In-Patient',
        travelTimeMinutes: 0,
        phone: '+91 512 253 5483',
        icuBeds: 8,
        generalBeds: 26,
        nicuStatus: 'Available',
        pharmacyOpen: true,
        erStatus: 'Open',
        waitingTime: 'Zero Delay',
        imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
        corridorName: 'Main Medical Corridor',
        category: 'medical_college',
        isVerified: true
      },
      userLocationName: `${rec.bedNumber} • ${rec.admittedWard} (${rec.floor})`,
      qrTokenId: `PRATH-HOSP-${rec.caseId}`,
      severityLevel: rec.priority === 'TRAUMA RED' ? 'RED (Critical / Immediate)' : rec.priority === 'YELLOW' ? 'YELLOW (Urgent)' : 'GREEN (Stable)',
      clinicalSummary: `Inbound History Record: ${rec.patientName} (${rec.gender}, ${rec.age}y). Arrival Method: ${rec.arrivalSource === 'golden_hour_ambulance' ? 'Golden Hour Emergency Ambulance' : '₹500 Fast-Track Token Desk'}. Admitted in ${rec.bedNumber} (${rec.admittedWard}) under ${rec.assignedDoctor} (${rec.doctorSpecialty}). Admission Status: ${rec.status.toUpperCase()} (Admitted: ${rec.admittedAt}${rec.dischargeTime ? `, Discharge: ${rec.dischargeTime}` : ''}). Vitals: BP ${rec.vitals.bp}, Pulse ${rec.vitals.pulse} bpm, SpO2 ${rec.vitals.spo2}%. ${rec.aiReportSummary}`,
      aiSuggestedActions: rec.aiSuggestedActions || [
        `Continuous monitoring in ${rec.bedNumber}.`,
        `Specialist protocol active under ${rec.assignedDoctor}.`,
        `ABDM Health Locker & Digital Discharge Summary ready.`
      ]
    };

    onViewPatientReport(reportObj);
  };

  return (
    <div id="patient-inbound-history-container" className="space-y-4 animate-in fade-in duration-200">
      {/* Toast notification */}
      {toastMessage && (
        <div className={`p-3 rounded-xl border flex items-center justify-between shadow-lg ${
          isLightMode ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-emerald-950/90 border-emerald-600/60 text-emerald-200'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 text-emerald-700 hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Metrics Banner */}
      <section
        id="history-top-metrics-card"
        className={`border rounded-2xl p-4 shadow-md transition-colors ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-[#0a1324] border-slate-800/90'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${
              isLightMode ? 'bg-teal-50 border-teal-300 text-teal-700 shadow-sm' : 'bg-teal-500/20 border-teal-500/50 text-teal-300'
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base font-bold uppercase tracking-wider ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                  Patient Inbound &amp; Admission History
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isLightMode ? 'bg-teal-100 text-teal-800 border-teal-300' : 'bg-teal-950 text-teal-300 border-teal-700'
                }`}>
                  Golden Hour &amp; Token Central Archive
                </span>
              </div>
              <p className={`text-xs ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                Complete registry of all patients arriving via 108 Golden Hour Ambulances, ₹500 Fast-Track Tokens, their admitted ward/bed &amp; discharge records.
              </p>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className={`p-2.5 rounded-xl border text-center ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
            }`}>
              <div className={`text-[10px] font-bold uppercase ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Total Logged</div>
              <div className={`text-lg font-bold font-mono ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{stats.total}</div>
            </div>

            <div className={`p-2.5 rounded-xl border text-center ${
              isLightMode ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/40 border-rose-800/60'
            }`}>
              <div className={`text-[10px] font-bold uppercase ${isLightMode ? 'text-rose-700' : 'text-rose-300'}`}>🚑 Golden Hour</div>
              <div className={`text-lg font-bold font-mono ${isLightMode ? 'text-rose-900' : 'text-rose-200'}`}>{stats.goldenHourCount}</div>
            </div>

            <div className={`p-2.5 rounded-xl border text-center ${
              isLightMode ? 'bg-amber-50 border-amber-200' : 'bg-amber-950/40 border-amber-800/60'
            }`}>
              <div className={`text-[10px] font-bold uppercase ${isLightMode ? 'text-amber-700' : 'text-amber-300'}`}>🎟️ ₹500 Tokens</div>
              <div className={`text-lg font-bold font-mono ${isLightMode ? 'text-amber-900' : 'text-amber-200'}`}>{stats.tokenCount}</div>
            </div>

            <div className={`p-2.5 rounded-xl border text-center ${
              isLightMode ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/40 border-emerald-800/60'
            }`}>
              <div className={`text-[10px] font-bold uppercase ${isLightMode ? 'text-emerald-700' : 'text-emerald-300'}`}>🛏️ Currently In-Bed</div>
              <div className={`text-lg font-bold font-mono ${isLightMode ? 'text-emerald-900' : 'text-emerald-200'}`}>{stats.currentlyAdmitted}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className={`p-3 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm ${
        isLightMode ? 'bg-white border-slate-200' : 'bg-[#0a1324] border-slate-800/90'
      }`}>
        {/* Source Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => { playTactileClick(); setSourceFilter('all'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              sourceFilter === 'all'
                ? isLightMode ? 'bg-teal-600 text-white shadow-xs' : 'bg-teal-500 text-slate-950 font-bold'
                : isLightMode ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            All Sources ({allRecords.length})
          </button>
          <button
            onClick={() => { playTactileClick(); setSourceFilter('golden_hour'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              sourceFilter === 'golden_hour'
                ? isLightMode ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-600 text-white font-bold'
                : isLightMode ? 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200' : 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60'
            }`}
          >
            <span>🚑 Golden Hour Ambulances</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-white/20">
              {stats.goldenHourCount}
            </span>
          </button>
          <button
            onClick={() => { playTactileClick(); setSourceFilter('token'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              sourceFilter === 'token'
                ? isLightMode ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-500 text-slate-950 font-bold'
                : isLightMode ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200' : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60'
            }`}
          >
            <span>🎟️ ₹500 Fast-Track Tokens</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-white/20">
              {stats.tokenCount}
            </span>
          </button>
        </div>

        {/* Status Filter & Search */}
        <div className="flex items-center gap-2 flex-1 md:max-w-md">
          <select
            value={statusFilter}
            onChange={(e) => { playTactileClick(); setStatusFilter(e.target.value as any); }}
            className={`px-2.5 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:border-teal-500 ${
              isLightMode ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
            }`}
          >
            <option value="all">All Admission Status</option>
            <option value="admitted">Currently Admitted (In-Patient)</option>
            <option value="discharged">Discharged (Completed)</option>
            <option value="transferred_ot">Transferred to OT / Procedure</option>
          </select>

          <div className="relative flex-1">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
              isLightMode ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, case ID, bed or diagnosis..."
              className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-teal-500 ${
                isLightMode ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Patient History Grid */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl border ${
            isLightMode ? 'bg-white border-slate-200 text-slate-500' : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}>
            <FileText className="w-12 h-12 mx-auto text-slate-400 mb-3 stroke-[1.5]" />
            <h4 className="font-bold text-sm">No Inbound History Records Found</h4>
            <p className="text-xs mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          filteredRecords.map((rec) => {
            const isGoldenHour = rec.arrivalSource === 'golden_hour_ambulance';
            const isToken = rec.arrivalSource === 'fast_track_token';
            const isAdmitted = rec.status === 'admitted' || rec.status === 'transferred_ot';
            const isDischarged = rec.status === 'discharged';

            return (
              <div
                key={rec.id}
                className={`border rounded-2xl p-4 transition-all hover:shadow-md ${
                  isLightMode
                    ? isAdmitted
                      ? 'bg-white border-slate-200 hover:border-teal-300'
                      : 'bg-slate-50/70 border-slate-200'
                    : isAdmitted
                    ? 'bg-[#0a1324] border-slate-800 hover:border-teal-500/40'
                    : 'bg-slate-950/60 border-slate-900'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Patient Profile & Source Badges */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Arrival Source Pill */}
                      {isGoldenHour ? (
                        <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 ${
                          isLightMode ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-rose-950 text-rose-300 border-rose-700/60'
                        }`}>
                          <Zap className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                          <span>Golden Hour 108 Ambulance Arrival</span>
                        </span>
                      ) : isToken ? (
                        <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 ${
                          isLightMode ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-950 text-amber-300 border-amber-700/60'
                        }`}>
                          <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                          <span>₹500 Fast-Track Token Desk</span>
                        </span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 ${
                          isLightMode ? 'bg-purple-100 text-purple-900 border-purple-300' : 'bg-purple-950 text-purple-300 border-purple-700/60'
                        }`}>
                          <span>Direct ER Walk-In / Surge</span>
                        </span>
                      )}

                      {/* Case ID / Token Number */}
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                        isLightMode ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}>
                        #{rec.caseId}
                      </span>

                      {/* Priority Tag */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        rec.priority === 'TRAUMA RED'
                          ? isLightMode ? 'bg-red-100 text-red-800 border-red-300' : 'bg-red-950 text-red-300 border-red-800'
                          : rec.priority === 'YELLOW'
                          ? isLightMode ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-950 text-amber-300 border-amber-800'
                          : isLightMode ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      }`}>
                        {rec.priority}
                      </span>

                      {/* Blood Thinner / Red Flag Alert */}
                      {rec.redFlags.bloodThinners && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${
                          isLightMode ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold' : 'bg-red-950 text-red-300 border-red-700'
                        }`}>
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Blood Thinners Active</span>
                        </span>
                      )}
                    </div>

                    {/* Patient Name & Condition */}
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className={`text-base font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                          {rec.patientName}
                        </h3>
                        <span className={`text-xs font-medium ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          ({rec.age} Years • {rec.gender})
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 font-medium ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                        {rec.condition}
                      </p>
                      <p className={`text-[11px] mt-0.5 flex items-center gap-1 ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        <Clock className="w-3 h-3" />
                        <span>Source Detail: {rec.sourceDetail}</span>
                      </p>
                    </div>
                  </div>

                  {/* Middle Column: Admitted Bed Location & Doctor */}
                  <div className={`p-3 rounded-xl border flex-1 lg:max-w-sm space-y-1.5 ${
                    isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Admitted Location
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        rec.status === 'admitted'
                          ? isLightMode ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : rec.status === 'transferred_ot'
                          ? isLightMode ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-purple-950 text-purple-300 border-purple-800'
                          : isLightMode ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        ● {rec.status === 'admitted' ? 'Currently Admitted' : rec.status === 'transferred_ot' ? 'Transferred to OT' : 'Discharged'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <BedDouble className={`w-4 h-4 ${isLightMode ? 'text-teal-600' : 'text-teal-400'}`} />
                      <span className={`text-xs font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                        {rec.bedNumber}
                      </span>
                      <span className={`text-[11px] ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        ({rec.admittedWard})
                      </span>
                    </div>

                    <div className={`text-[11px] flex items-center justify-between pt-1 border-t ${
                      isLightMode ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
                    }`}>
                      <span className="flex items-center gap-1">
                        <Stethoscope className="w-3 h-3 text-teal-500" />
                        <strong>{rec.assignedDoctor}</strong> ({rec.doctorSpecialty})
                      </span>
                    </div>

                    <div className={`text-[10px] font-mono flex items-center justify-between ${
                      isLightMode ? 'text-slate-500' : 'text-slate-500'
                    }`}>
                      <span>Admitted: {rec.admittedAt}</span>
                      {rec.dischargeTime && (
                        <span className={isLightMode ? 'text-emerald-700 font-semibold' : 'text-emerald-400 font-semibold'}>
                          {rec.dischargeTime}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: AI Report Viewer & Discharge Action */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch justify-center gap-2 shrink-0">
                    {/* View Full AI Clinical Report Button */}
                    <button
                      onClick={() => handleOpenAiReport(rec)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                        isLightMode
                          ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
                          : 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-teal-500/30'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>View AI Clinical Report</span>
                    </button>

                    {/* Discharge or Status Update Button */}
                    {isAdmitted ? (
                      <button
                        onClick={() => handleDischargePatient(rec.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                          isLightMode
                            ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-800 border-slate-300 hover:border-rose-300'
                            : 'bg-slate-900 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border-slate-700 hover:border-rose-700/60'
                        }`}
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Discharge Patient &amp; Free Bed</span>
                      </button>
                    ) : (
                      <div className={`text-center py-1 text-[11px] font-semibold flex items-center justify-center gap-1 ${
                        isLightMode ? 'text-emerald-700' : 'text-emerald-400'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Discharge Completed</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vitals Telemetry Micro-Bar */}
                <div className={`mt-3 pt-2.5 border-t flex items-center justify-between flex-wrap gap-2 text-xs font-mono ${
                  isLightMode ? 'border-slate-200 text-slate-600' : 'border-slate-800/80 text-slate-400'
                }`}>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-500" />
                      <span>Pulse: <strong>{rec.vitals.pulse} bpm</strong></span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Wind className="w-3 h-3 text-blue-500" />
                      <span>SpO2: <strong className={rec.vitals.spo2 < 94 ? 'text-rose-600' : ''}>{rec.vitals.spo2}%</strong></span>
                    </span>
                    <span>BP: <strong>{rec.vitals.bp} mmHg</strong></span>
                    {rec.vitals.temp && <span>Temp: <strong>{rec.vitals.temp}</strong></span>}
                  </div>

                  <div className="flex items-center gap-2 text-[10px]">
                    <span className={`px-2 py-0.5 rounded border ${
                      isLightMode ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      ABDM Electronic Record ID: PRATH-HIS-{rec.caseId}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
