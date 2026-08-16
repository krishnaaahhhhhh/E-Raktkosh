import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  HospitalFacility,
  InboundDispatch,
  PatientTriageData,
  SymptomCategory,
  TriageSeverity,
  AvpuScale,
  VitalsInput,
  FloorData,
  AppViewMode
} from '../types';
import { INITIAL_HOSPITALS } from '../lib/initialData';
import { calculateTriageScore, generateQrPayload, EMERGENCY_SYMPTOM_CATEGORIES } from '../lib/triageEngine';
import { INDIAN_STATES, EMERGENCY_DISEASE_CONDITIONS } from '../lib/locationData';
import { generateDynamicVitalHistory, generateAiClinicalReport } from '../lib/aiClinicalEngine';
import { playCodeRedAlert, playCodeAmberAlert, playConfirmChime, playTactileClick } from '../lib/audio';

export type { AppViewMode };

interface PrathmiktaContextType {
  mode: AppViewMode;
  setMode: (mode: AppViewMode) => void;
  hospitals: Record<string, HospitalFacility>;
  activeHospitalId: string;
  setActiveHospitalId: (id: string) => void;
  activeHospital: HospitalFacility;
  isConnected: boolean;
  
  // Location & Disease Intake Wizard
  selectedState: string;
  setSelectedState: (s: string) => void;
  selectedCity: string;
  setSelectedCity: (c: string) => void;
  selectedDisease: string;
  setSelectedDisease: (d: string) => void;
  isWizardCompleted: boolean;
  setIsWizardCompleted: (completed: boolean) => void;
  resetWizard: () => void;
  selectHospitalAndOpenMap: (hospitalId: string) => void;

  // Citizen Triage Form State
  patientName: string;
  setPatientName: (name: string) => void;
  patientAge: number;
  setPatientAge: (age: number) => void;
  patientGender: 'Male' | 'Female' | 'Other';
  setPatientGender: (g: 'Male' | 'Female' | 'Other') => void;
  contactPhone: string;
  setContactPhone: (p: string) => void;
  symptomCategory: SymptomCategory;
  setSymptomCategory: (cat: SymptomCategory) => void;
  subSymptoms: string[];
  toggleSubSymptom: (sym: string) => void;
  onsetTime: string;
  setOnsetTime: (time: string) => void;
  knownAllergies: string[];
  toggleAllergy: (allg: string) => void;
  preExistingConditions: string[];
  toggleCondition: (cond: string) => void;
  avpuScale: AvpuScale;
  setAvpuScale: (avpu: AvpuScale) => void;
  vitals: VitalsInput;
  setVitals: React.Dispatch<React.SetStateAction<VitalsInput>>;
  
  // Computed Triage Outputs
  currentSeverity: TriageSeverity;
  targetDepartment: string;
  targetFloorId: number;
  clinicalPriorityNotes: string;
  qrPayloadString: string;
  currentTriageData: PatientTriageData;
  
  // Geolocation & Active Dispatch
  citizenCoords: { lat: number; lng: number };
  setCitizenCoords: (coords: { lat: number; lng: number }) => void;
  activeCitizenDispatch: InboundDispatch | null;
  setActiveCitizenDispatch: (d: InboundDispatch | null) => void;
  isTransitActive: boolean;
  setIsTransitActive: (active: boolean) => void;
  transitProgress: number;
  setTransitProgress: React.Dispatch<React.SetStateAction<number>>;
  
  // Actions
  dispatchInboundEmergency: (overridePatient?: PatientTriageData) => Promise<InboundDispatch>;
  syncTransitTelemetry: () => void;
  cancelCitizenDispatch: () => void;
  updateFloorBeds: (floorId: number, type: 'occupied' | 'total' | 'icu_occupied' | 'vent_inuse', delta: number) => void;
  updatePharmacyStock: (itemId: string, newStockLevel: number) => void;
  updatePatientDispatchStatus: (dispatchId: string, status: string, assignedBay?: string, assignedDoctor?: string) => void;
  updateDoctorStatus: (floorId: number, doctorId: string, status: 'Present' | 'In OT' | 'On Rounds' | 'Off Duty') => void;
  resetTriageForm: () => void;
  
  // Sound
  isAudioEnabled: boolean;
  toggleAudio: () => void;
}

function getInitialRouteMode(): AppViewMode {
  try {
    const path = (window.location.pathname || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();

    if (path.includes('/reception') || hash.includes('reception') || hash.includes('frontdesk')) {
      return 'reception';
    }
    if (path.includes('/hospital') || hash.includes('hospital') || hash.includes('tv_command')) {
      return 'hospital';
    }
    if (path.includes('/coordinate') || hash.includes('coordinate') || hash.includes('regional_deoc') || hash.includes('admin')) {
      return 'coordinate';
    }
    if (path.includes('/planned-admission') || path.includes('/booking') || hash.includes('planned-admission') || hash.includes('booking')) {
      return 'planned_admission';
    }
    if (path.includes('/patient') || hash.includes('patient') || hash.includes('citizen')) {
      return 'patient';
    }
    if (path.includes('/paramedic') || hash.includes('paramedic')) {
      return 'paramedic';
    }
    if (path.includes('/split') || hash.includes('dual_split') || hash.includes('split')) {
      return 'dual_split';
    }
    return 'landing';
  } catch {
    return 'landing';
  }
}

const PrathmiktaContext = createContext<PrathmiktaContextType | null>(null);

export const PrathmiktaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<AppViewMode>(getInitialRouteMode);

  // Sync mode changes with URL hash and path
  const setMode = useCallback((newMode: AppViewMode) => {
    const canonicalMode: AppViewMode =
      newMode === 'citizen' ? 'patient'
      : newMode === 'tv_command' ? 'hospital'
      : newMode === 'regional_deoc' ? 'coordinate'
      : newMode;

    setModeState(canonicalMode);

    try {
      const targetRoute =
        canonicalMode === 'landing' ? '/'
        : canonicalMode === 'planned_admission' ? '/planned-admission'
        : canonicalMode === 'reception' ? '/reception'
        : canonicalMode === 'patient' ? '/patient'
        : canonicalMode === 'hospital' ? '/hospital'
        : canonicalMode === 'coordinate' ? '/coordinate'
        : canonicalMode === 'paramedic' ? '/paramedic'
        : '/split';

      // Update hash for preview iframe resilience and pushState for full URL
      if (window.location.hash !== `#${targetRoute}`) {
        window.location.hash = targetRoute;
      }
      if (window.history && window.history.pushState && window.location.pathname !== targetRoute) {
        window.history.pushState(null, '', targetRoute);
      }
    } catch {
      // ignore
    }
  }, []);

  // Listen to browser popstate and hashchange
  useEffect(() => {
    const handleUrlChange = () => {
      const detected = getInitialRouteMode();
      setModeState(detected);
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);
  const [hospitals, setHospitals] = useState<Record<string, HospitalFacility>>(INITIAL_HOSPITALS);
  const [activeHospitalId, setActiveHospitalId] = useState<string>('hosp-apex');
  const [isConnected, setIsConnected] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // State, City, Disease Onboarding Wizard
  const [selectedState, setSelectedState] = useState<string>('delhi-ncr');
  const [selectedCity, setSelectedCity] = useState<string>('delhi');
  const [selectedDisease, setSelectedDisease] = useState<string>('heart-attack');
  const [isWizardCompleted, setIsWizardCompleted] = useState<boolean>(false);

  // Citizen Triage Draft State
  const [patientName, setPatientName] = useState('Anil Sharma');
  const [patientAge, setPatientAge] = useState(54);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [contactPhone, setContactPhone] = useState('+91 98711 00223');
  const [symptomCategory, setSymptomCategory] = useState<SymptomCategory>('cardiac');
  const [subSymptoms, setSubSymptoms] = useState<string[]>([
    'Crushing retrosternal chest pain (>15 min)',
    'Cold sweats / Diaphoresis'
  ]);
  const [onsetTime, setOnsetTime] = useState('<15 mins');
  const [knownAllergies, setKnownAllergies] = useState<string[]>(['Penicillin / Amoxicillin']);
  const [preExistingConditions, setPreExistingConditions] = useState<string[]>([
    'Hypertension (HTN)',
    'Coronary Artery Disease (CAD / Stent)'
  ]);
  const [avpuScale, setAvpuScale] = useState<AvpuScale>('A - Alert');
  const [vitals, setVitals] = useState<VitalsInput>({
    systolicBp: 155,
    diastolicBp: 95,
    heartRate: 110,
    spo2: 93
  });

  // Geolocation
  const [citizenCoords, setCitizenCoords] = useState<{ lat: number; lng: number }>({
    lat: 28.5480,
    lng: 77.2010
  });

  const [activeCitizenDispatch, setActiveCitizenDispatch] = useState<InboundDispatch | null>(null);
  const [isTransitActive, setIsTransitActive] = useState<boolean>(false);
  const [transitProgress, setTransitProgress] = useState<number>(0);

  const socketRef = useRef<Socket | null>(null);

  // When selectedDisease changes, sync category & defaults
  const handleSelectDisease = (diseaseId: string) => {
    setSelectedDisease(diseaseId);
    const diseaseObj = EMERGENCY_DISEASE_CONDITIONS.find(d => d.id === diseaseId);
    if (diseaseObj) {
      setSymptomCategory(diseaseObj.category);
      const catObj = EMERGENCY_SYMPTOM_CATEGORIES.find(c => c.category === diseaseObj.category);
      if (catObj && catObj.subSymptoms.length > 0) {
        setSubSymptoms([catObj.subSymptoms[0]]);
      }
    }
  };

  // Zero-Wait Immediate Emergency Transit & Map Start upon hospital selection
  const selectHospitalAndOpenMap = (hospitalId: string) => {
    setActiveHospitalId(hospitalId);
    const targetHosp = hospitals[hospitalId] || INITIAL_HOSPITALS[hospitalId] || INITIAL_HOSPITALS['hosp-apex'];
    
    // Position citizen at realistic distance
    const citizenLoc = {
      lat: targetHosp.lat - 0.020 + (Math.random() * 0.004),
      lng: targetHosp.lng + 0.016 + (Math.random() * 0.004)
    };
    setCitizenCoords(citizenLoc);
    setIsWizardCompleted(true);
    setIsTransitActive(true);
    setTransitProgress(0.03);
    playTactileClick();

    // Immediate Zero-Wait Emergency Dispatch Broadcast (No hospital approval gate)
    setTimeout(() => {
      const dest = { lat: targetHosp.lat, lng: targetHosp.lng };
      const R = 6371;
      const dLat = ((dest.lat - citizenLoc.lat) * Math.PI) / 180;
      const dLon = ((dest.lng - citizenLoc.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((citizenLoc.lat * Math.PI) / 180) *
          Math.cos((dest.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distKm = Number(Math.max(0.8, R * c).toFixed(1));
      const etaMins = Number(Math.max(2.5, (distKm / 35) * 60).toFixed(1));

      const newDispatch: InboundDispatch = {
        dispatchId: `disp-${Date.now().toString().slice(-6)}`,
        hospitalId: targetHosp.id,
        hospitalName: targetHosp.name,
        patient: currentTriageData,
        severity: currentTriageData.severity,
        status: 'en_route',
        originCoords: citizenLoc,
        currentCoords: citizenLoc,
        destinationCoords: dest,
        etaMinutes: etaMins,
        etaDistanceKm: distKm,
        assignedFloor: currentTriageData.targetFloorId,
        assignedBay: currentTriageData.severity === 'RED' ? (currentTriageData.symptomCategory === 'cardiac' ? 'Cath Lab 1 Standby' : 'Resus Bay 1') : 'Triage Bay 3',
        assignedDoctor: currentTriageData.targetFloorId === 1 ? 'Dr. Rajesh Sharma, MD, DM' : 'Dr. Vivek Mehra, MD (Trauma Lead)',
        vitalHistory: liveVitalHistory,
        aiReport: liveAiReport,
        dispatchTimestamp: new Date().toISOString(),
        updatedTimestamp: new Date().toISOString()
      };

      setActiveCitizenDispatch(newDispatch);

      if (socketRef.current && isConnected) {
        socketRef.current.emit('patient:dispatch_inbound', newDispatch);
      } else {
        fetch('/api/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newDispatch)
        }).catch(err => console.warn('Fallback dispatch error:', err));
      }

      if (isAudioEnabled) {
        if (newDispatch.severity === 'RED') {
          playCodeRedAlert();
        } else {
          playConfirmChime();
        }
      }
    }, 150);
  };

  const resetWizard = () => {
    setIsWizardCompleted(false);
    setIsTransitActive(false);
    setTransitProgress(0);
    playTactileClick();
  };

  // Auto Geolocation on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCitizenCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.log('Using default New Delhi emergency coordinates', err.message);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Compute live triage assessment
  const triageResult = calculateTriageScore({
    symptomCategory,
    subSymptoms,
    onsetTime,
    avpuScale,
    age: patientAge,
    knownAllergies,
    preExistingConditions,
    vitals
  });

  const liveVitalHistory = generateDynamicVitalHistory(vitals, symptomCategory, onsetTime);
  const liveAiReport = generateAiClinicalReport(
    {
      fullName: patientName,
      age: patientAge,
      gender: patientGender,
      symptomCategory,
      primaryComplaint: subSymptoms.join('; ') || 'Emergency Triage Alert',
      subSymptoms,
      onsetTime,
      avpuScale,
      vitals,
      severity: triageResult.severity,
      targetFloorId: triageResult.targetFloorId
    },
    liveVitalHistory
  );

  const currentTriageData: PatientTriageData = {
    id: `pat-${Date.now().toString().slice(-4)}`,
    fullName: patientName.trim() || 'Unidentified Patient',
    age: Number(patientAge) || 40,
    gender: patientGender,
    contactPhone: contactPhone || '108-EMERGENCY',
    symptomCategory,
    primaryComplaint: subSymptoms.join('; ') || 'Acute emergency symptoms',
    subSymptoms,
    onsetTime,
    knownAllergies,
    preExistingConditions,
    avpuScale,
    vitals,
    vitalHistory: liveVitalHistory,
    aiReport: liveAiReport,
    severity: triageResult.severity,
    clinicalPriorityNotes: triageResult.clinicalPriorityNotes,
    targetDepartment: triageResult.targetDepartment,
    targetFloorId: triageResult.targetFloorId,
    generatedAt: new Date().toISOString(),
    payloadHash: `PRATH-${symptomCategory.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
  };

  const qrPayloadString = generateQrPayload(currentTriageData);

  // Socket Connection Lifecycle
  useEffect(() => {
    const socket = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join:hospital', { hospitalId: activeHospitalId });
      socket.emit('join:city', { cityName: 'New Delhi / NCR' });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('hospital:state_sync', (hospital: HospitalFacility) => {
      setHospitals(prev => ({
        ...prev,
        [hospital.id]: hospital
      }));
    });

    socket.on('patient:inbound_received', (dispatch: InboundDispatch) => {
      setHospitals(prev => {
        const hosp = prev[dispatch.hospitalId];
        if (!hosp) return prev;
        const exists = hosp.activeDispatches.some(d => d.dispatchId === dispatch.dispatchId);
        const updatedDispatches = exists
          ? hosp.activeDispatches.map(d => d.dispatchId === dispatch.dispatchId ? dispatch : d)
          : [dispatch, ...hosp.activeDispatches];

        return {
          ...prev,
          [dispatch.hospitalId]: {
            ...hosp,
            activeDispatches: updatedDispatches
          }
        };
      });

      // Trigger audio alarm on inbound case
      if (isAudioEnabled) {
        if (dispatch.severity === 'RED') {
          playCodeRedAlert();
        } else if (dispatch.severity === 'AMBER') {
          playCodeAmberAlert();
        }
      }
    });

    socket.on('floor:beds_updated', (data: { hospitalId: string; floorId: number; floor: FloorData; totalFacilityBeds: number; occupiedFacilityBeds: number }) => {
      setHospitals(prev => {
        const hosp = prev[data.hospitalId];
        if (!hosp) return prev;
        const updatedFloors = hosp.floors.map(f => f.floorId === data.floorId ? data.floor : f);
        return {
          ...prev,
          [data.hospitalId]: {
            ...hosp,
            floors: updatedFloors,
            totalFacilityBeds: data.totalFacilityBeds,
            occupiedFacilityBeds: data.occupiedFacilityBeds
          }
        };
      });
    });

    socket.on('pharmacy:stock_updated', (data: { hospitalId: string; pharmacy: any }) => {
      setHospitals(prev => {
        const hosp = prev[data.hospitalId];
        if (!hosp) return prev;
        return {
          ...prev,
          [data.hospitalId]: {
            ...hosp,
            pharmacy: data.pharmacy
          }
        };
      });
    });

    socket.on('patient:status_updated', (dispatch: InboundDispatch) => {
      setHospitals(prev => {
        const hosp = prev[dispatch.hospitalId];
        if (!hosp) return prev;
        const updated = hosp.activeDispatches.map(d => d.dispatchId === dispatch.dispatchId ? dispatch : d);
        return {
          ...prev,
          [dispatch.hospitalId]: {
            ...hosp,
            activeDispatches: updated
          }
        };
      });

      setActiveCitizenDispatch(prev => {
        if (prev && prev.dispatchId === dispatch.dispatchId) {
          return dispatch;
        }
        return prev;
      });
    });

    socket.on('doctor:status_updated', (data: { hospitalId: string; floorId: number; doctorId: string; status: any; floor: FloorData }) => {
      setHospitals(prev => {
        const hosp = prev[data.hospitalId];
        if (!hosp) return prev;
        const updatedFloors = hosp.floors.map(f => f.floorId === data.floorId ? data.floor : f);
        return {
          ...prev,
          [data.hospitalId]: {
            ...hosp,
            floors: updatedFloors
          }
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [activeHospitalId, isAudioEnabled]);

  // Handle hospital room switch
  useEffect(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join:hospital', { hospitalId: activeHospitalId });
    }
  }, [activeHospitalId, isConnected]);

  const activeHospital = hospitals[activeHospitalId] || INITIAL_HOSPITALS['hosp-apex'];

  // Toggle helpers
  const toggleSubSymptom = (sym: string) => {
    setSubSymptoms(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const toggleAllergy = (allg: string) => {
    if (allg === 'No Known Allergies (NKA)') {
      setKnownAllergies(['No Known Allergies (NKA)']);
      return;
    }
    setKnownAllergies(prev => {
      const filtered = prev.filter(a => a !== 'No Known Allergies (NKA)');
      return filtered.includes(allg) ? filtered.filter(a => a !== allg) : [...filtered, allg];
    });
  };

  const toggleCondition = (cond: string) => {
    setPreExistingConditions(prev =>
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  // Dispatch Action
  const dispatchInboundEmergency = async (overridePatient?: PatientTriageData): Promise<InboundDispatch> => {
    const patientData = overridePatient || currentTriageData;
    const dest = { lat: activeHospital.lat, lng: activeHospital.lng };
    const origin = citizenCoords;

    // Approximate distance in km (Haversine formula)
    const R = 6371;
    const dLat = ((dest.lat - origin.lat) * Math.PI) / 180;
    const dLon = ((dest.lng - origin.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((origin.lat * Math.PI) / 180) *
        Math.cos((dest.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distKm = Number(Math.max(0.8, R * c).toFixed(1));
    const etaMins = Number(Math.max(2.5, (distKm / 35) * 60).toFixed(1)); // 35 km/h urban emergency speed

    const vitHist = patientData.vitalHistory || generateDynamicVitalHistory(patientData.vitals, patientData.symptomCategory, patientData.onsetTime);
    const aiRep = patientData.aiReport || generateAiClinicalReport(patientData, vitHist);

    const newDispatch: InboundDispatch = {
      dispatchId: `disp-${Date.now().toString().slice(-6)}`,
      hospitalId: activeHospital.id,
      hospitalName: activeHospital.name,
      patient: { ...patientData, vitalHistory: vitHist, aiReport: aiRep },
      severity: patientData.severity,
      status: 'dispatched',
      originCoords: origin,
      currentCoords: origin,
      destinationCoords: dest,
      etaMinutes: etaMins,
      etaDistanceKm: distKm,
      assignedFloor: patientData.targetFloorId,
      assignedBay: patientData.severity === 'RED' ? (patientData.symptomCategory === 'cardiac' ? 'Cath Lab 1 Standby' : 'Resus Bay 1') : 'Triage Bay 3',
      assignedDoctor: patientData.targetFloorId === 1 ? 'Dr. Rajesh Sharma, MD, DM' : 'Dr. Vivek Mehra, MD (Trauma Lead)',
      vitalHistory: vitHist,
      aiReport: aiRep,
      dispatchTimestamp: new Date().toISOString(),
      updatedTimestamp: new Date().toISOString()
    };

    setActiveCitizenDispatch(newDispatch);

    // Emit over socket
    if (socketRef.current && isConnected) {
      socketRef.current.emit('patient:dispatch_inbound', newDispatch);
    } else {
      // Direct REST fallback
      try {
        await fetch('/api/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newDispatch)
        });
      } catch (err) {
        console.warn('Fallback dispatch to local storage', err);
      }
    }

    if (isAudioEnabled) {
      playConfirmChime();
    }

    return newDispatch;
  };

  const syncTransitTelemetry = () => {
    setActiveCitizenDispatch((prev) => {
      if (!prev) return null;
      const updated: InboundDispatch = {
        ...prev,
        patient: currentTriageData,
        severity: currentTriageData.severity,
        assignedFloor: currentTriageData.targetFloorId,
        vitalHistory: currentTriageData.vitalHistory,
        aiReport: currentTriageData.aiReport,
        updatedTimestamp: new Date().toISOString()
      };
      if (socketRef.current && isConnected) {
        socketRef.current.emit('patient:dispatch_inbound', updated);
      }
      return updated;
    });
  };

  // Live auto-sync when in-transit triage answers change
  useEffect(() => {
    if (activeCitizenDispatch) {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('patient:dispatch_inbound', {
          ...activeCitizenDispatch,
          patient: currentTriageData,
          severity: currentTriageData.severity,
          assignedFloor: currentTriageData.targetFloorId,
          vitalHistory: currentTriageData.vitalHistory,
          aiReport: currentTriageData.aiReport,
          updatedTimestamp: new Date().toISOString()
        });
      }
    }
  }, [
    patientName,
    patientAge,
    patientGender,
    contactPhone,
    symptomCategory,
    subSymptoms,
    onsetTime,
    knownAllergies,
    preExistingConditions,
    avpuScale,
    vitals
  ]);

  const cancelCitizenDispatch = () => {
    setActiveCitizenDispatch(null);
    setIsTransitActive(false);
    setTransitProgress(0);
  };

  // Bed adjustments stepper
  const updateFloorBeds = (floorId: number, type: 'occupied' | 'total' | 'icu_occupied' | 'vent_inuse', delta: number) => {
    playTactileClick();
    if (socketRef.current && isConnected) {
      socketRef.current.emit('floor:update_beds', {
        hospitalId: activeHospitalId,
        floorId,
        type,
        delta
      });
    } else {
      // Optimistic update
      setHospitals(prev => {
        const hosp = prev[activeHospitalId];
        if (!hosp) return prev;
        const updatedFloors = hosp.floors.map(f => {
          if (f.floorId !== floorId) return f;
          const updated = { ...f };
          if (type === 'occupied') {
            updated.occupiedBeds = Math.max(0, Math.min(updated.totalBeds, updated.occupiedBeds + delta));
            updated.availableBeds = updated.totalBeds - updated.occupiedBeds;
          } else if (type === 'icu_occupied') {
            updated.icuBeds = {
              ...updated.icuBeds,
              occupied: Math.max(0, Math.min(updated.icuBeds.total, updated.icuBeds.occupied + delta)),
              available: updated.icuBeds.total - Math.max(0, Math.min(updated.icuBeds.total, updated.icuBeds.occupied + delta))
            };
          } else if (type === 'vent_inuse') {
            updated.ventilators = {
              ...updated.ventilators,
              inUse: Math.max(0, Math.min(updated.ventilators.total, updated.ventilators.inUse + delta)),
              available: updated.ventilators.total - Math.max(0, Math.min(updated.ventilators.total, updated.ventilators.inUse + delta))
            };
          }
          return updated;
        });

        const totalOcc = updatedFloors.reduce((acc, fl) => acc + fl.occupiedBeds, 0);
        return {
          ...prev,
          [activeHospitalId]: {
            ...hosp,
            floors: updatedFloors,
            occupiedFacilityBeds: totalOcc
          }
        };
      });
    }
  };

  const updatePharmacyStock = (itemId: string, newStockLevel: number) => {
    playTactileClick();
    if (socketRef.current && isConnected) {
      socketRef.current.emit('pharmacy:update_status', {
        hospitalId: activeHospitalId,
        itemId,
        newStockLevel
      });
    }
  };

  const updatePatientDispatchStatus = (dispatchId: string, status: string, assignedBay?: string, assignedDoctor?: string) => {
    playTactileClick();
    if (socketRef.current && isConnected) {
      socketRef.current.emit('patient:update_status', {
        hospitalId: activeHospitalId,
        dispatchId,
        status,
        assignedBay,
        assignedDoctor
      });
    }
  };

  const updateDoctorStatus = (floorId: number, doctorId: string, status: 'Present' | 'In OT' | 'On Rounds' | 'Off Duty') => {
    playTactileClick();
    if (socketRef.current && isConnected) {
      socketRef.current.emit('doctor:update_status', {
        hospitalId: activeHospitalId,
        floorId,
        doctorId,
        status
      });
    }
  };

  const resetTriageForm = () => {
    setPatientName('');
    setPatientAge(35);
    setSymptomCategory('general');
    setSubSymptoms([]);
    setOnsetTime('<15 mins');
    setKnownAllergies([]);
    setPreExistingConditions([]);
    setAvpuScale('A - Alert');
    setVitals({ systolicBp: 120, diastolicBp: 80, heartRate: 75, spo2: 98 });
    setActiveCitizenDispatch(null);
  };

  const toggleAudio = () => {
    setIsAudioEnabled(prev => !prev);
  };

  return (
    <PrathmiktaContext.Provider
      value={{
        mode,
        setMode,
        hospitals,
        activeHospitalId,
        setActiveHospitalId,
        activeHospital,
        isConnected,
        selectedState,
        setSelectedState,
        selectedCity,
        setSelectedCity,
        selectedDisease,
        setSelectedDisease: handleSelectDisease,
        isWizardCompleted,
        setIsWizardCompleted,
        resetWizard,
        selectHospitalAndOpenMap,
        patientName,
        setPatientName,
        patientAge,
        setPatientAge,
        patientGender,
        setPatientGender,
        contactPhone,
        setContactPhone,
        symptomCategory,
        setSymptomCategory,
        subSymptoms,
        toggleSubSymptom,
        onsetTime,
        setOnsetTime,
        knownAllergies,
        toggleAllergy,
        preExistingConditions,
        toggleCondition,
        avpuScale,
        setAvpuScale,
        vitals,
        setVitals,
        currentSeverity: triageResult.severity,
        targetDepartment: triageResult.targetDepartment,
        targetFloorId: triageResult.targetFloorId,
        clinicalPriorityNotes: triageResult.clinicalPriorityNotes,
        qrPayloadString,
        currentTriageData,
        citizenCoords,
        setCitizenCoords,
        activeCitizenDispatch,
        setActiveCitizenDispatch,
        isTransitActive,
        setIsTransitActive,
        transitProgress,
        setTransitProgress,
        dispatchInboundEmergency,
        syncTransitTelemetry,
        cancelCitizenDispatch,
        updateFloorBeds,
        updatePharmacyStock,
        updatePatientDispatchStatus,
        updateDoctorStatus,
        resetTriageForm,
        isAudioEnabled,
        toggleAudio
      }}
    >
      {children}
    </PrathmiktaContext.Provider>
  );
};

export function usePrathmikta() {
  const context = useContext(PrathmiktaContext);
  if (!context) {
    throw new Error('usePrathmikta must be used within a PrathmiktaProvider');
  }
  return context;
}
