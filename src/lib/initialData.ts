import { HospitalFacility, PharmacyItem, FloorData } from '../types';
import { generateDynamicVitalHistory, generateAiClinicalReport } from './aiClinicalEngine';

export const INITIAL_PHARMACY_ITEMS: PharmacyItem[] = [
  {
    id: 'ph-1',
    name: 'Epinephrine 1mg/mL (Adrenaline)',
    category: 'Critical Resus',
    stockLevel: 48,
    unit: 'Amps',
    minThreshold: 15,
    status: 'Adequate',
    lastUpdated: 'Just now'
  },
  {
    id: 'ph-2',
    name: 'Norepinephrine 4mg/4mL (Levophed)',
    category: 'Critical Resus',
    stockLevel: 26,
    unit: 'Vials',
    minThreshold: 10,
    status: 'Adequate',
    lastUpdated: '12 mins ago'
  },
  {
    id: 'ph-3',
    name: 'O-Negative Packed RBCs (Uncrossmatched)',
    category: 'Blood Products',
    stockLevel: 8,
    unit: 'Units',
    minThreshold: 5,
    status: 'Adequate',
    lastUpdated: '5 mins ago'
  },
  {
    id: 'ph-4',
    name: 'Tenecteplase 50mg (Thrombolytic)',
    category: 'Cardiology',
    stockLevel: 6,
    unit: 'Kits',
    minThreshold: 4,
    status: 'Adequate',
    lastUpdated: '18 mins ago'
  },
  {
    id: 'ph-5',
    name: 'Heparin Sodium 25,000 IU/5mL',
    category: 'Cardiology',
    stockLevel: 32,
    unit: 'Vials',
    minThreshold: 12,
    status: 'Adequate',
    lastUpdated: '1 hour ago'
  },
  {
    id: 'ph-6',
    name: 'Rapid Sequence Intubation (RSI) Kits',
    category: 'Airway / Trauma',
    stockLevel: 14,
    unit: 'Kits',
    minThreshold: 6,
    status: 'Adequate',
    lastUpdated: '30 mins ago'
  },
  {
    id: 'ph-7',
    name: 'Alteplase (r-tPA) 50mg (Stroke Recombinant)',
    category: 'Neurology',
    stockLevel: 4,
    unit: 'Vials',
    minThreshold: 3,
    status: 'Low',
    lastUpdated: '45 mins ago'
  }
];

export const INITIAL_FLOORS: FloorData[] = [
  {
    floorId: 0,
    floorLabel: 'Ground Floor (G)',
    name: 'Emergency Resuscitation & Red Trauma Bays',
    department: 'Emergency & Acute Triage',
    colorTheme: 'red',
    totalBeds: 24,
    occupiedBeds: 18,
    availableBeds: 6,
    icuBeds: { total: 8, occupied: 6, available: 2 },
    ventilators: { total: 10, inUse: 7, available: 3 },
    status: 'Operational',
    doctors: [
      {
        id: 'doc-1',
        name: 'Dr. Vivek Mehra, MD (Trauma Lead)',
        role: 'Chief ER Physician',
        specialization: 'Emergency Medicine / ATLS',
        status: 'Present',
        assignedCases: 3,
        phone: '+91 98101 23456'
      },
      {
        id: 'doc-2',
        name: 'Dr. Ananya Roy, MS',
        role: 'Senior Trauma Surgeon',
        specialization: 'Polytrauma / Damage Control Surgery',
        status: 'In OT',
        assignedCases: 2,
        phone: '+91 98102 34567'
      },
      {
        id: 'doc-3',
        name: 'Dr. K. S. Rathore, DNB',
        role: 'Triage Medical Officer',
        specialization: 'Acute Resuscitation',
        status: 'Present',
        assignedCases: 4,
        phone: '+91 98103 45678'
      }
    ],
    bays: [
      { bayId: 'bay-01', name: 'Resus Bay 1 (Red Polytrauma)', status: 'available' },
      { bayId: 'bay-02', name: 'Resus Bay 2 (STEMI / Crash)', status: 'prepped' },
      { bayId: 'bay-03', name: 'Bay 3 (Acute Respiratory)', status: 'occupied', patientName: 'R. K. Gupta', severity: 'RED' },
      { bayId: 'bay-04', name: 'Bay 4 (Trauma Observation)', status: 'available' },
      { bayId: 'bay-05', name: 'Bay 5 (Pediatric Resus)', status: 'available' },
      { bayId: 'bay-06', name: 'Bay 6 (Isolation / Toxic)', status: 'occupied', patientName: 'S. Verma', severity: 'AMBER' }
    ]
  },
  {
    floorId: 1,
    floorLabel: 'Floor 1',
    name: 'Cardiology & Cath Lab Critical Care Suite',
    department: 'Interventional Cardiology & CCU',
    colorTheme: 'cyan',
    totalBeds: 20,
    occupiedBeds: 15,
    availableBeds: 5,
    icuBeds: { total: 12, occupied: 9, available: 3 },
    ventilators: { total: 6, inUse: 4, available: 2 },
    status: 'Operational',
    doctors: [
      {
        id: 'doc-4',
        name: 'Dr. Rajesh Sharma, MD, DM',
        role: 'Director of Interventional Cardiology',
        specialization: 'Primary PCI / STEMI Specialist',
        status: 'Present',
        assignedCases: 2,
        phone: '+91 98104 56789'
      },
      {
        id: 'doc-5',
        name: 'Dr. Priyanka Sen, DM',
        role: 'Associate Cardiologist',
        specialization: 'Coronary Care & Electrophysiology',
        status: 'On Rounds',
        assignedCases: 3,
        phone: '+91 98105 67890'
      }
    ],
    bays: [
      { bayId: 'cath-01', name: 'Cath Lab 1 (Primary Angioplasty)', status: 'available' },
      { bayId: 'cath-02', name: 'Cath Lab 2 (Structural Heart)', status: 'prepped' },
      { bayId: 'ccu-01', name: 'CCU Bed 101 (Post-PCI)', status: 'occupied', patientName: 'A. Singhania', severity: 'RED' },
      { bayId: 'ccu-02', name: 'CCU Bed 102', status: 'available' }
    ]
  },
  {
    floorId: 2,
    floorLabel: 'Floor 2',
    name: 'Intensive Care Unit (ICU) & Neuro-Trauma Hub',
    department: 'Intensive Care & Neurology',
    colorTheme: 'purple',
    totalBeds: 28,
    occupiedBeds: 23,
    availableBeds: 5,
    icuBeds: { total: 20, occupied: 17, available: 3 },
    ventilators: { total: 18, inUse: 14, available: 4 },
    status: 'High Occupancy',
    doctors: [
      {
        id: 'doc-6',
        name: 'Dr. Sunita Deshmukh, MD (Intensivist)',
        role: 'Head of Critical Care (CCM)',
        specialization: 'ARDS / ECMO & Multi-Organ Failure',
        status: 'Present',
        assignedCases: 5,
        phone: '+91 98106 78901'
      },
      {
        id: 'doc-7',
        name: 'Dr. Arvind Nambiar, MCh',
        role: 'Senior Neurosurgeon',
        specialization: 'Acute Stroke & Craniotomy',
        status: 'In OT',
        assignedCases: 1,
        phone: '+91 98107 89012'
      }
    ],
    bays: [
      { bayId: 'icu-201', name: 'Neuro-ICU Bed 201 (Stroke)', status: 'prepped' },
      { bayId: 'icu-202', name: 'SICU Bed 202 (Ventilated)', status: 'occupied', patientName: 'P. Joshi', severity: 'RED' },
      { bayId: 'icu-203', name: 'MICU Bed 203', status: 'available' },
      { bayId: 'icu-204', name: 'Burn ICU Isolation Bed 204', status: 'available' }
    ]
  },
  {
    floorId: 3,
    floorLabel: 'Floor 3',
    name: 'General Inpatient Wards & HDU Stepdown',
    department: 'General Wards & Surgical Recovery',
    colorTheme: 'emerald',
    totalBeds: 40,
    occupiedBeds: 28,
    availableBeds: 12,
    icuBeds: { total: 4, occupied: 2, available: 2 },
    ventilators: { total: 2, inUse: 1, available: 1 },
    status: 'Operational',
    doctors: [
      {
        id: 'doc-8',
        name: 'Dr. Tarun Bannerjee, MD',
        role: 'Lead Hospitalist',
        specialization: 'Internal Medicine',
        status: 'On Rounds',
        assignedCases: 6,
        phone: '+91 98108 90123'
      },
      {
        id: 'doc-9',
        name: 'Dr. Neha Kapoor, MBBS',
        role: 'Resident Medical Officer',
        specialization: 'General Inpatient Care',
        status: 'Present',
        assignedCases: 4,
        phone: '+91 98109 01234'
      }
    ],
    bays: [
      { bayId: 'gen-301', name: 'HDU Bed 301', status: 'available' },
      { bayId: 'gen-302', name: 'HDU Bed 302', status: 'occupied', patientName: 'M. Patel', severity: 'GREEN' },
      { bayId: 'gen-303', name: 'Ward 303 (Stepdown)', status: 'available' },
      { bayId: 'gen-304', name: 'Ward 304 (Stepdown)', status: 'available' }
    ]
  }
];

export const INITIAL_HOSPITALS: Record<string, HospitalFacility> = {
  'hosp-apex': {
    id: 'hosp-apex',
    name: 'Prathmikta Apex Trauma & Emergency Institute',
    tagline: 'Apex Level-1 Emergency & Golden Hour Resuscitation Network',
    state: 'Delhi NCR',
    city: 'New Delhi / South Delhi',
    address: 'Ring Road, Sector 4, R.K. Puram, New Delhi',
    lat: 28.5672,
    lng: 77.1865,
    phone: '+91 11 2658 8500',
    emergencyHotline: '108 / 011-2659-8888',
    traumaLevel: 'Level 1 Trauma Center',
    cathLabActive: true,
    strokeReady: true,
    burnUnitReady: true,
    totalFacilityBeds: 112,
    occupiedFacilityBeds: 84,
    floors: INITIAL_FLOORS,
    specialties: ['Cardiac CCU', 'Polytrauma', 'Stroke Ready', 'Burn Unit', '24x7 Pharmacy'],
    pharmacy: {
      isOpen24x7: true,
      onDutyPharmacist: 'Alok Verma (Reg. Ph. #DEL-9842)',
      contactNumber: 'Ext. 4022 / +91 98110 55443',
      currentShift: 'Night/Emergency 24x7 Continuous Roster',
      items: INITIAL_PHARMACY_ITEMS,
      lastRestocked: 'Today at 08:30 IST'
    },
    activeDispatches: [
      (() => {
        const patientData = {
          id: 'pat-901',
          fullName: 'Mohan Lal Verma',
          age: 58,
          gender: 'Male' as const,
          contactPhone: '+91 98765 43210',
          emergencyContact: '+91 98765 11223',
          symptomCategory: 'cardiac' as const,
          primaryComplaint: 'Severe retrosternal pressure, radiating left jaw, diaphoresis',
          subSymptoms: [
            'Crushing retrosternal chest pain (>15 min)',
            'Cold sweats / Diaphoresis',
            'Prior stent / Angioplasty history'
          ],
          onsetTime: '<15 mins',
          knownAllergies: ['Penicillin / Amoxicillin'],
          preExistingConditions: ['Hypertension (HTN)', 'Coronary Artery Disease (CAD / Stent)'],
          avpuScale: 'A - Alert' as const,
          vitals: {
            systolicBp: 155,
            diastolicBp: 92,
            heartRate: 104,
            spo2: 94
          },
          severity: 'RED' as const,
          clinicalPriorityNotes: '🚨 STEMI ALERT: Immediate ECG & Cath Lab standby required.',
          targetDepartment: 'Floor 1 Emergency Cath Lab / CCU',
          targetFloorId: 1,
          generatedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
          payloadHash: 'PRATH-STEMI-901'
        };
        const vitHist = generateDynamicVitalHistory(patientData.vitals, 'cardiac', '<15 mins');
        const aiRep = generateAiClinicalReport(patientData, vitHist);
        return {
          dispatchId: 'disp-live-101',
          hospitalId: 'hosp-apex',
          hospitalName: 'Prathmikta Apex Trauma Institute',
          patient: { ...patientData, vitalHistory: vitHist, aiReport: aiRep },
          severity: 'RED' as const,
          status: 'en_route' as const,
          originCoords: { lat: 28.5355, lng: 77.2090 },
          currentCoords: { lat: 28.5520, lng: 77.1970 },
          destinationCoords: { lat: 28.5672, lng: 77.1865 },
          etaMinutes: 4.2,
          etaDistanceKm: 2.8,
          assignedFloor: 1,
          assignedBay: 'Cath Lab 1 Standby',
          assignedDoctor: 'Dr. Rajesh Sharma, MD, DM',
          vitalHistory: vitHist,
          aiReport: aiRep,
          dispatchTimestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
          updatedTimestamp: new Date().toISOString()
        };
      })(),
      (() => {
        const patientData = {
          id: 'pat-902',
          fullName: 'Kavita Sundaram',
          age: 34,
          gender: 'Female' as const,
          contactPhone: '+91 99887 76655',
          symptomCategory: 'trauma' as const,
          primaryComplaint: 'Motorcycle collision, right femur deformity, active bleeding',
          subSymptoms: [
            'Blunt polytrauma / Motor vehicle accident',
            'Suspected pelvic / compound femur fracture',
            'Loss of consciousness post-impact'
          ],
          onsetTime: '15-60 mins',
          knownAllergies: ['No Known Allergies (NKA)'],
          preExistingConditions: ['Asthma / COPD'],
          avpuScale: 'V - Responsive to Voice' as const,
          vitals: {
            systolicBp: 92,
            diastolicBp: 60,
            heartRate: 118,
            spo2: 96
          },
          severity: 'RED' as const,
          clinicalPriorityNotes: '🚨 CODE TRAUMA: Surgical team & O-Neg blood uncrossmatched ready.',
          targetDepartment: 'Floor 0 Resuscitation Bay 1 (Trauma)',
          targetFloorId: 0,
          generatedAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
          payloadHash: 'PRATH-TRM-902'
        };
        const vitHist = generateDynamicVitalHistory(patientData.vitals, 'trauma', '15-60 mins');
        const aiRep = generateAiClinicalReport(patientData, vitHist);
        return {
          dispatchId: 'disp-live-102',
          hospitalId: 'hosp-apex',
          hospitalName: 'Prathmikta Apex Trauma Institute',
          patient: { ...patientData, vitalHistory: vitHist, aiReport: aiRep },
          severity: 'RED' as const,
          status: 'bay_ready' as const,
          originCoords: { lat: 28.6139, lng: 77.2090 },
          currentCoords: { lat: 28.5810, lng: 77.1920 },
          destinationCoords: { lat: 28.5672, lng: 77.1865 },
          etaMinutes: 7.5,
          etaDistanceKm: 4.6,
          assignedFloor: 0,
          assignedBay: 'Resus Bay 1 (Red Polytrauma)',
          assignedDoctor: 'Dr. Vivek Mehra, MD (Trauma Lead)',
          vitalHistory: vitHist,
          aiReport: aiRep,
          dispatchTimestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
          updatedTimestamp: new Date().toISOString()
        };
      })()
    ]
  },
  'hosp-city-trauma': {
    id: 'hosp-city-trauma',
    name: 'City Metropolitan Emergency & Burn Center',
    tagline: '24/7 Regional Advanced Burn & Toxicological Unit',
    state: 'Delhi NCR',
    city: 'New Delhi / East Delhi',
    address: 'Vikas Marg, Preet Vihar, Delhi',
    lat: 28.6385,
    lng: 77.2930,
    phone: '+91 11 2244 5566',
    emergencyHotline: '108 / 011-2244-9999',
    traumaLevel: 'Level 2 Trauma Center',
    cathLabActive: true,
    strokeReady: false,
    burnUnitReady: true,
    totalFacilityBeds: 80,
    occupiedFacilityBeds: 62,
    floors: INITIAL_FLOORS,
    specialties: ['Burn Resuscitation', 'Toxicology', 'Emergency Surgery', 'Dialysis Backup'],
    pharmacy: {
      isOpen24x7: true,
      onDutyPharmacist: 'M. S. Negi',
      contactNumber: '+91 98112 33221',
      currentShift: 'Emergency 24x7 Roster',
      items: INITIAL_PHARMACY_ITEMS,
      lastRestocked: 'Today at 06:00 IST'
    },
    activeDispatches: []
  },
  'hosp-noida-emergency': {
    id: 'hosp-noida-emergency',
    name: 'Noida Metro Superspeciality & Trauma Center',
    tagline: '24x7 Expressway Critical Resuscitation & Emergency Unit',
    state: 'Uttar Pradesh',
    city: 'Noida / Greater Noida',
    address: 'Sector 62, Expressway Corridor, Noida, UP',
    lat: 28.6280,
    lng: 77.3649,
    phone: '+91 120 240 0222',
    emergencyHotline: '108 / 0120-240-9999',
    traumaLevel: 'Level 1 Trauma Center',
    cathLabActive: true,
    strokeReady: true,
    burnUnitReady: true,
    totalFacilityBeds: 95,
    occupiedFacilityBeds: 68,
    floors: INITIAL_FLOORS,
    specialties: ['Expressway Trauma', 'Primary PCI', 'Neuro Stroke Resus'],
    pharmacy: {
      isOpen24x7: true,
      onDutyPharmacist: 'Rakesh Shukla (Reg #UP-4412)',
      contactNumber: '+91 98711 44332',
      currentShift: 'Night Continuous',
      items: INITIAL_PHARMACY_ITEMS,
      lastRestocked: 'Today at 09:00 IST'
    },
    activeDispatches: []
  },
  'hosp-lucknow-kgmu': {
    id: 'hosp-lucknow-kgmu',
    name: 'KGMU Apex Emergency & Trauma Center Lucknow',
    tagline: 'Centenary King George Trauma & Golden Hour Life Support',
    state: 'Uttar Pradesh',
    city: 'Lucknow',
    address: 'Shah Mina Road, Chowk, Lucknow, Uttar Pradesh',
    lat: 26.8687,
    lng: 80.9167,
    phone: '+91 522 225 7450',
    emergencyHotline: '108 / 0522-225-8888',
    traumaLevel: 'Level 1 Trauma Center',
    cathLabActive: true,
    strokeReady: true,
    burnUnitReady: true,
    totalFacilityBeds: 140,
    occupiedFacilityBeds: 108,
    floors: INITIAL_FLOORS,
    specialties: ['Apex Level-1 Trauma', 'Comprehensive Stroke Center', 'Cardiology Cath Lab', 'Severe Burns'],
    pharmacy: {
      isOpen24x7: true,
      onDutyPharmacist: 'S. K. Srivastava (Reg #UP-8821)',
      contactNumber: '+91 94150 11223',
      currentShift: '24/7 Red Alert Pharmacy',
      items: INITIAL_PHARMACY_ITEMS,
      lastRestocked: 'Today at 07:15 IST'
    },
    activeDispatches: []
  },
  'hosp-lucknow-sgpgi': {
    id: 'hosp-lucknow-sgpgi',
    name: 'SGPGI Apex Critical Care & Emergency Medicine',
    tagline: 'Super Speciality Resuscitation & Organ Support Institute',
    state: 'Uttar Pradesh',
    city: 'Lucknow',
    address: 'Raebareli Road, Lucknow, Uttar Pradesh',
    lat: 26.7458,
    lng: 80.9385,
    phone: '+91 522 266 8700',
    emergencyHotline: '108 / 0522-266-9999',
    traumaLevel: 'Level 1 Trauma Center',
    cathLabActive: true,
    strokeReady: true,
    burnUnitReady: false,
    totalFacilityBeds: 120,
    occupiedFacilityBeds: 92,
    floors: INITIAL_FLOORS,
    specialties: ['Organ Support ICU', 'Cardiac Critical Care', 'Nephrology Dialysis ER'],
    pharmacy: {
      isOpen24x7: true,
      onDutyPharmacist: 'D. N. Mishra',
      contactNumber: '+91 94151 33445',
      currentShift: 'Night Shift',
      items: INITIAL_PHARMACY_ITEMS,
      lastRestocked: 'Today at 08:00 IST'
    },
    activeDispatches: []
  },
  'hosp-mumbai-kem': {
    id: 'hosp-mumbai-kem',
    name: 'KEM & Seth GS Apex Emergency Medical Center Mumbai',
    tagline: 'Mumbai 24x7 Disaster, Polytrauma & Cardiac Emergency Hub',
    state: 'Maharashtra',
    city: 'Mumbai (South & Central)',
    address: 'Acharya Donde Marg, Parel, Mumbai, Maharashtra',
    lat: 19.0022,
    lng: 72.8427,
    phone: '+91 22 2410 7000',
    emergencyHotline: '108 / 022-2413-6051',
    traumaLevel: 'Level 1 Trauma Center',
    cathLabActive: true,
    strokeReady: true,
    burnUnitReady: true,
    totalFacilityBeds: 150,
    occupiedFacilityBeds: 122,
    floors: INITIAL_FLOORS,
    specialties: ['Disaster Response', 'Cath Lab 24x7', 'Severe Polytrauma', 'Toxicology'],
    pharmacy: {
      isOpen24x7: true,
      onDutyPharmacist: 'Nitin Sawant (Reg #MH-1092)',
      contactNumber: '+91 98200 44556',
      currentShift: 'Continuous 24x7',
      items: INITIAL_PHARMACY_ITEMS,
      lastRestocked: 'Today at 09:30 IST'
    },
    activeDispatches: []
  },
  'hosp-pune-ruby': {
    id: 'hosp-pune-ruby',
    name: 'Pune Ruby Hall Apex Critical Care & Trauma',
    tagline: 'Comprehensive Heart, Neuro & Accident Emergency Center',
    state: 'Maharashtra',
    city: 'Pune',
    address: 'Sassoon Road, Pune, Maharashtra',
    lat: 18.5312,
    lng: 73.8743,
    phone: '+91 20 6645 5100',
    emergencyHotline: '108 / 020-2612-3391',
    traumaLevel: 'Level 1 Trauma Center',
    cathLabActive: true,
    strokeReady: true,
    burnUnitReady: true,
    totalFacilityBeds: 110,
    occupiedFacilityBeds: 82,
    floors: INITIAL_FLOORS,
    specialties: ['STEMI Rapid Angioplasty', 'Neurovascular Interventions', 'Trauma ICU'],
    pharmacy: {
      isOpen24x7: true,
      onDutyPharmacist: 'Anand Deshmukh',
      contactNumber: '+91 98220 99881',
      currentShift: 'Emergency Night Roster',
      items: INITIAL_PHARMACY_ITEMS,
      lastRestocked: 'Today at 07:45 IST'
    },
    activeDispatches: []
  },
  'hosp-bengaluru-victoria': {
    id: 'hosp-bengaluru-victoria',
    name: 'Victoria & Bowring Apex Emergency Hospital Bengaluru',
    tagline: 'Bengaluru Golden Hour Emergency & Advanced Burn Institute',
    state: 'Karnataka',
    city: 'Bengaluru (Central & Victoria)',
    address: 'Fort Road, near City Market, Bengaluru, Karnataka',
    lat: 12.9629,
    lng: 77.5753,
    phone: '+91 80 2670 1150',
    emergencyHotline: '108 / 080-2670-3333',
    traumaLevel: 'Level 1 Trauma Center',
    cathLabActive: true,
    strokeReady: true,
    burnUnitReady: true,
    totalFacilityBeds: 130,
    occupiedFacilityBeds: 98,
    floors: INITIAL_FLOORS,
    specialties: ['Apex Burn Care', 'Polytrauma', 'Emergency Surgery', 'Cardiac ICU'],
    pharmacy: {
      isOpen24x7: true,
      onDutyPharmacist: 'Manjunath K. (Reg #KA-7781)',
      contactNumber: '+91 98450 11223',
      currentShift: '24/7 Resus Pharmacy',
      items: INITIAL_PHARMACY_ITEMS,
      lastRestocked: 'Today at 08:15 IST'
    },
    activeDispatches: []
  },
  'hosp-jaipur-sms': {
    id: 'hosp-jaipur-sms',
    name: 'SMS Apex Trauma & Emergency Medical Hospital Jaipur',
    tagline: 'Rajasthan Premier Level-1 Emergency & Golden Hour Network',
    state: 'Rajasthan',
    city: 'Jaipur (SMS Trauma / Eternal)',
    address: 'JLN Marg, Ashok Nagar, Jaipur, Rajasthan',
    lat: 26.8973,
    lng: 75.8155,
    phone: '+91 141 251 8224',
    emergencyHotline: '108 / 0141-256-0291',
    traumaLevel: 'Level 1 Trauma Center',
    cathLabActive: true,
    strokeReady: true,
    burnUnitReady: true,
    totalFacilityBeds: 145,
    occupiedFacilityBeds: 112,
    floors: INITIAL_FLOORS,
    specialties: ['State Apex Trauma', 'Cardiac CCU', 'Plastic Surgery Burns', 'Neuro ICU'],
    pharmacy: {
      isOpen24x7: true,
      onDutyPharmacist: 'Govind Rathore',
      contactNumber: '+91 94140 55667',
      currentShift: 'Emergency 24x7 Roster',
      items: INITIAL_PHARMACY_ITEMS,
      lastRestocked: 'Today at 06:45 IST'
    },
    activeDispatches: []
  },
  'hosp-hyderabad-nims': {
    id: 'hosp-hyderabad-nims',
    name: 'NIMS Apex Emergency & Trauma Institute Hyderabad',
    tagline: 'Nizam Institute 24/7 Advanced Resuscitation & Code STEMI',
    state: 'Telangana',
    city: 'Hyderabad (NIMS / Osmania / Secunderabad)',
    address: 'Punjagutta Main Road, Hyderabad, Telangana',
    lat: 17.4223,
    lng: 78.4526,
    phone: '+91 40 2348 9000',
    emergencyHotline: '108 / 040-2348-9100',
    traumaLevel: 'Level 1 Trauma Center',
    cathLabActive: true,
    strokeReady: true,
    burnUnitReady: true,
    totalFacilityBeds: 125,
    occupiedFacilityBeds: 96,
    floors: INITIAL_FLOORS,
    specialties: ['Code STEMI Angioplasty', 'Acute Stroke', 'Polytrauma', 'Organ ICU'],
    pharmacy: {
      isOpen24x7: true,
      onDutyPharmacist: 'Venkatesh Rao (Reg #TS-5541)',
      contactNumber: '+91 98490 22334',
      currentShift: '24/7 Continuous Store',
      items: INITIAL_PHARMACY_ITEMS,
      lastRestocked: 'Today at 08:45 IST'
    },
    activeDispatches: []
  },
  'hosp-kolkata-sskm': {
    id: 'hosp-kolkata-sskm',
    name: 'IPGMER & SSKM Apex Emergency Hospital Kolkata',
    tagline: 'Eastern India Premier Multi-Super-Speciality Emergency',
    state: 'West Bengal',
    city: 'Kolkata (SSKM / IPGMER / Medical College)',
    address: '244 AJC Bose Road, Bhowanipore, Kolkata, West Bengal',
    lat: 22.5385,
    lng: 88.3429,
    phone: '+91 33 2223 1589',
    emergencyHotline: '108 / 033-2223-1590',
    traumaLevel: 'Level 1 Trauma Center',
    cathLabActive: true,
    strokeReady: true,
    burnUnitReady: true,
    totalFacilityBeds: 135,
    occupiedFacilityBeds: 104,
    floors: INITIAL_FLOORS,
    specialties: ['Regional Trauma Center', 'Emergency Cardiology', 'Burn Resus', 'Toxicology'],
    pharmacy: {
      isOpen24x7: true,
      onDutyPharmacist: 'Subhashish Das (Reg #WB-9912)',
      contactNumber: '+91 98300 77889',
      currentShift: '24x7 Emergency Shift',
      items: INITIAL_PHARMACY_ITEMS,
      lastRestocked: 'Today at 07:30 IST'
    },
    activeDispatches: []
  },
  'hosp-chennai-rggh': {
    id: 'hosp-chennai-rggh',
    name: 'Rajiv Gandhi GH & MMC Apex Emergency Chennai',
    tagline: 'Madras Medical College Golden Hour Trauma & CCU Network',
    state: 'Tamil Nadu',
    city: 'Chennai (MMC / Rajiv Gandhi GH / Apollo)',
    address: 'EVR Periyar Salai, Park Town, Chennai, Tamil Nadu',
    lat: 13.0810,
    lng: 80.2785,
    phone: '+91 44 2530 5000',
    emergencyHotline: '108 / 044-2530-5108',
    traumaLevel: 'Level 1 Trauma Center',
    cathLabActive: true,
    strokeReady: true,
    burnUnitReady: true,
    totalFacilityBeds: 140,
    occupiedFacilityBeds: 110,
    floors: INITIAL_FLOORS,
    specialties: ['Comprehensive Trauma', 'Emergency Primary PCI', 'Neuro Resus', 'Burn ICU'],
    pharmacy: {
      isOpen24x7: true,
      onDutyPharmacist: 'M. Senthil Kumar (Reg #TN-3321)',
      contactNumber: '+91 94440 66778',
      currentShift: 'Night Continuous',
      items: INITIAL_PHARMACY_ITEMS,
      lastRestocked: 'Today at 09:15 IST'
    },
    activeDispatches: []
  },
  'hosp-ahmedabad-civil': {
    id: 'hosp-ahmedabad-civil',
    name: 'Ahmedabad Civil & UN Mehta Emergency Institute',
    tagline: 'Asia Largest Super Speciality Emergency & Heart Hospital',
    state: 'Gujarat',
    city: 'Ahmedabad (Civil / UN Mehta)',
    address: 'Asarwa, Ahmedabad, Gujarat',
    lat: 23.0525,
    lng: 72.6028,
    phone: '+91 79 2268 0074',
    emergencyHotline: '108 / 079-2268-6550',
    traumaLevel: 'Level 1 Trauma Center',
    cathLabActive: true,
    strokeReady: true,
    burnUnitReady: true,
    totalFacilityBeds: 160,
    occupiedFacilityBeds: 125,
    floors: INITIAL_FLOORS,
    specialties: ['UN Mehta Cardiac Emergency', 'Civil Polytrauma OT', 'Comprehensive Burn Unit'],
    pharmacy: {
      isOpen24x7: true,
      onDutyPharmacist: 'Prakash Patel (Reg #GJ-8874)',
      contactNumber: '+91 98250 33445',
      currentShift: '24/7 Continuous Store',
      items: INITIAL_PHARMACY_ITEMS,
      lastRestocked: 'Today at 08:20 IST'
    },
    activeDispatches: []
  },
  'hosp-chandigarh-pgi': {
    id: 'hosp-chandigarh-pgi',
    name: 'PGIMER Apex Emergency & Advanced Trauma Chandigarh',
    tagline: 'Postgraduate Institute National Apex Emergency Life Support',
    state: 'Punjab & Chandigarh',
    city: 'Chandigarh (PGIMER / GMCH 32)',
    address: 'Sector 12, Chandigarh',
    lat: 30.7673,
    lng: 76.7770,
    phone: '+91 172 274 6018',
    emergencyHotline: '108 / 0172-274-7585',
    traumaLevel: 'Level 1 Trauma Center',
    cathLabActive: true,
    strokeReady: true,
    burnUnitReady: true,
    totalFacilityBeds: 155,
    occupiedFacilityBeds: 126,
    floors: INITIAL_FLOORS,
    specialties: ['Apex Level-1 Trauma Center', 'Code STEMI Cath Lab', 'Stroke Interventions', 'Advanced Burn ICU'],
    pharmacy: {
      isOpen24x7: true,
      onDutyPharmacist: 'Gurpreet Singh (Reg #PB-4491)',
      contactNumber: '+91 98760 11223',
      currentShift: 'Continuous 24x7 Roster',
      items: INITIAL_PHARMACY_ITEMS,
      lastRestocked: 'Today at 07:00 IST'
    },
    activeDispatches: []
  }
};
