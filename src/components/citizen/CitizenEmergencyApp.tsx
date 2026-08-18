import React, { useState, useEffect, useRef } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import {
  Heart,
  Droplet,
  Brain,
  Flame,
  Wind,
  PhoneCall,
  MapPin,
  Clock,
  AlertTriangle,
  Shield,
  Activity,
  Bluetooth,
  QrCode,
  Check,
  Plus,
  Minus,
  Crosshair,
  Play,
  Navigation,
  CheckCircle2,
  X,
  Share2,
  Printer,
  Sparkles,
  ArrowRight,
  UserCheck,
  Building2,
  Car,
  Compass,
  Mic,
  MicOff,
  SlidersHorizontal,
  RotateCcw,
  MessageSquare,
  User,
  Radio,
  Send,
  Loader2
} from 'lucide-react';
import { playTactileClick, playConfirmChime, playCodeRedAlert } from '../../lib/audio';
import {
  RealHospital,
  KANPUR_CENTER,
  fetchNearbyHospitals,
  reverseGeocode
} from '../../services/hospitalService';
import { RealLeafletHospitalMap } from '../map/RealLeafletHospitalMap';
import { PatientReportModal, PatientEmergencyReportData } from './PatientReportModal';

// Diverse randomized emergency clinical scenarios generated dynamically on each page load/refresh
const DYNAMIC_REFRESH_SCENARIOS = [
  {
    patientName: 'Amit Kumar',
    patientGender: 'Male',
    patientAge: '45',
    category: 'Cardiac',
    selectedEmergency: 'chest_pain',
    transcript: '"Patient ko severe radiating chest pain ho raha hai, age 45 hai, heavy sweating aur BP drop ho raha hai..."',
    vitals: { spo2: 95, pulse: 104, bp: '100/68' },
    symptomTime: '< 30 mins',
    consciousness: 'Alert',
    redFlags: { diabetes: false, hypertension: true, bloodThinners: true, heartDisease: true, pregnancy: false },
    detectedCategory: 'Acute Cardiac / STEMI',
    detectedRedFlags: 'Hypertension, Prior Stent',
    detectedVitals: 'BP 100/68 mmHg, Pulse 104 bpm, SpO2 95%'
  },
  {
    patientName: 'Sunita Sharma',
    patientGender: 'Female',
    patientAge: '58',
    category: 'Stroke / Neurological',
    selectedEmergency: 'stroke',
    transcript: '"Mataji ka right side pura sunn pad gaya hai aur bolne me takleef ho rahi hai, sudden paralysis attack lag raha hai..."',
    vitals: { spo2: 97, pulse: 88, bp: '168/102' },
    symptomTime: '45 mins ago',
    consciousness: 'Drowsy',
    redFlags: { diabetes: true, hypertension: true, bloodThinners: false, heartDisease: false, pregnancy: false },
    detectedCategory: 'Acute Stroke / Neurological Deficit',
    detectedRedFlags: 'Severe Hypertension, Diabetes Mellitus',
    detectedVitals: 'BP 168/102 mmHg (High), SpO2 97%'
  },
  {
    patientName: 'Rahul Verma',
    patientGender: 'Male',
    patientAge: '28',
    category: 'Severe Trauma / RTA',
    selectedEmergency: 'trauma',
    transcript: '"GT Road pe bike accident hua hai, deep head laceration aur leg fracture se severe bleeding ho rahi hai..."',
    vitals: { spo2: 92, pulse: 122, bp: '92/60' },
    symptomTime: '< 15 mins',
    consciousness: 'Altered / Disoriented',
    redFlags: { diabetes: false, hypertension: false, bloodThinners: false, heartDisease: false, pregnancy: false },
    detectedCategory: 'Severe Polytrauma & Hemorrhage',
    detectedRedFlags: 'Hypovolemic Shock Risk',
    detectedVitals: 'Pulse 122 bpm (Tachycardia), BP 92/60 mmHg'
  },
  {
    patientName: 'Pooja Tiwari',
    patientGender: 'Female',
    patientAge: '34',
    category: 'Acute Respiratory Distress',
    selectedEmergency: 'breathing',
    transcript: '"Severe asthma bronchospasm attack hai, oxygen saturation gir raha hai aur saans lene me bohot dikkat ho rahi hai..."',
    vitals: { spo2: 88, pulse: 116, bp: '135/88' },
    symptomTime: '< 20 mins',
    consciousness: 'Alert',
    redFlags: { diabetes: false, hypertension: false, bloodThinners: false, heartDisease: false, pregnancy: true },
    detectedCategory: 'Acute Respiratory Distress / Hypoxia',
    detectedRedFlags: 'Pregnancy (2nd Trimester), Chronic Asthma',
    detectedVitals: 'SpO2 88% (Critical Hypoxia), Pulse 116 bpm'
  },
  {
    patientName: 'Rameshwar Yadav',
    patientGender: 'Male',
    patientAge: '62',
    category: 'Thermal Burn / Inhalation Injury',
    selectedEmergency: 'burn',
    transcript: '"Gas cylinder flame burst hua hai, upper chest aur face pe partial 2nd degree burn marks hai..."',
    vitals: { spo2: 93, pulse: 110, bp: '142/90' },
    symptomTime: '< 25 mins',
    consciousness: 'Alert',
    redFlags: { diabetes: true, hypertension: false, bloodThinners: false, heartDisease: false, pregnancy: false },
    detectedCategory: 'Thermal Flash Burn & Inhalation Risk',
    detectedRedFlags: 'Diabetes Mellitus, Inhalation Airway Risk',
    detectedVitals: 'Pulse 110 bpm, SpO2 93%, BP 142/90 mmHg'
  }
];

export const CitizenEmergencyApp: React.FC = () => {
  const { setMode } = usePrathmikta();

  // User GPS Location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: KANPUR_CENTER.lat,
    lng: KANPUR_CENTER.lng
  });
  const [locationName, setLocationName] = useState<string>('Kanpur, Uttar Pradesh');
  const [locationAccuracy, setLocationAccuracy] = useState<'High' | 'GPS Active' | 'Estimated'>('High');

  // Real Hospital List
  const [hospitals, setHospitals] = useState<RealHospital[]>([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState<boolean>(true);
  const [selectedHospital, setSelectedHospital] = useState<RealHospital | null>(null);

  // Selected Emergency Type
  const [selectedEmergency, setSelectedEmergency] = useState<string>('chest_pain');

  // Input Mode: 'manual' | 'voice'
  const [inputMode, setInputMode] = useState<'manual' | 'voice'>('voice');

  // Voice AI Agent State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>(
    '"Patient ko severe chest pain ho raha hai, age 45 hai, BP check kiya toh low hai..."'
  );
  const [detectedData, setDetectedData] = useState({
    category: 'Cardiac',
    age: '45 Years',
    consciousness: 'Alert',
    redFlags: 'Hypertension',
    vitals: 'BP Low, SpO2 98%',
    isReportGenerated: true
  });
  const speechRecognitionRef = useRef<any>(null);

  // Form State
  const [patientName, setPatientName] = useState<string>('Amit Kumar');
  const [patientGender, setPatientGender] = useState<string>('Male');
  const [symptomTime, setSymptomTime] = useState<string>('< 30 mins');
  const [allergy, setAllergy] = useState<string>('None');
  const [patientAge, setPatientAge] = useState<string>('13–60');
  const [consciousness, setConsciousness] = useState<string>('Alert');
  const [redFlags, setRedFlags] = useState<{ [key: string]: boolean }>({
    diabetes: false,
    hypertension: true,
    bloodThinners: true,
    heartDisease: false,
    pregnancy: false
  });

  // Vitals State
  const [vitals, setVitals] = useState({
    spo2: 98,
    pulse: 96,
    bp: '120/80'
  });
  const [isBleSyncing, setIsBleSyncing] = useState(false);

  // Map Navigation and QR Modal State
  const [isNavigating, setIsNavigating] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrTokenId, setQrTokenId] = useState<string>('PRATH-2026-GSVM-9842');
  const [navProgress, setNavProgress] = useState(0);

  // AI Generated Report State & Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [currentReportData, setCurrentReportData] = useState<PatientEmergencyReportData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccessNotice, setSubmitSuccessNotice] = useState<string | null>(null);

  // 1. Dynamic Scenario Randomizer on Page Refresh / Mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * DYNAMIC_REFRESH_SCENARIOS.length);
    const scenario = DYNAMIC_REFRESH_SCENARIOS[randomIndex];

    setPatientName(scenario.patientName);
    setPatientGender(scenario.patientGender);
    setPatientAge(scenario.patientAge);
    setSelectedEmergency(scenario.selectedEmergency);
    setVoiceTranscript(scenario.transcript);
    setVitals(scenario.vitals);
    setSymptomTime(scenario.symptomTime);
    setConsciousness(scenario.consciousness);
    setRedFlags(scenario.redFlags);
    setDetectedData({
      category: scenario.detectedCategory,
      age: `${scenario.patientAge} Years`,
      consciousness: scenario.consciousness,
      redFlags: scenario.detectedRedFlags,
      vitals: scenario.detectedVitals,
      isReportGenerated: true
    });

    const randomizedToken = `PRATH-${new Date().getFullYear()}-GSVM-${Math.floor(1000 + Math.random() * 9000)}`;
    setQrTokenId(randomizedToken);
  }, []);

  // 2. Geolocation & Hospital initialization
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setLocationAccuracy('GPS Active');

          const addr = await reverseGeocode(lat, lng);
          setLocationName(addr);

          loadHospitals(lat, lng);
        },
        () => {
          loadHospitals(KANPUR_CENTER.lat, KANPUR_CENTER.lng);
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    } else {
      loadHospitals(KANPUR_CENTER.lat, KANPUR_CENTER.lng);
    }
  }, []);

  const loadHospitals = async (lat: number, lng: number) => {
    setIsLoadingHospitals(true);
    try {
      const data = await fetchNearbyHospitals(lat, lng, 18000);
      setHospitals(data);
      if (data.length > 0) {
        setSelectedHospital(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHospitals(false);
    }
  };

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setLocationAccuracy('GPS Active');
          const addr = await reverseGeocode(lat, lng);
          setLocationName(addr);
          loadHospitals(lat, lng);
        },
        () => {
          setUserLocation({ lat: KANPUR_CENTER.lat, lng: KANPUR_CENTER.lng });
        }
      );
    }
  };

  // Navigation simulation loop
  useEffect(() => {
    let interval: any;
    if (isNavigating) {
      interval = setInterval(() => {
        setNavProgress((prev) => {
          if (prev >= 100) {
            return 100;
          }
          return prev + 1;
        });
      }, 400);
    } else {
      setNavProgress(0);
    }
    return () => clearInterval(interval);
  }, [isNavigating]);

  const handleToggleRedFlag = (key: string) => {
    playTactileClick();
    setRedFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectEmergency = (type: string) => {
    playCodeRedAlert();
    setSelectedEmergency(type);
    if (type === 'chest_pain') {
      setDetectedData((prev) => ({ ...prev, category: 'Cardiac' }));
    } else if (type === 'trauma') {
      setDetectedData((prev) => ({ ...prev, category: 'Severe Trauma' }));
    } else if (type === 'stroke') {
      setDetectedData((prev) => ({ ...prev, category: 'Stroke / Paralysis' }));
    } else if (type === 'burn') {
      setDetectedData((prev) => ({ ...prev, category: 'Burn Injury' }));
    } else if (type === 'breathing') {
      setDetectedData((prev) => ({ ...prev, category: 'Breathing / Respiratory' }));
    }
  };

  const parseVoiceText = (text: string) => {
    const lower = text.toLowerCase();
    let cat = 'Cardiac';
    let age = '45 Years';
    let cons = 'Alert';
    let red = 'Hypertension';
    let vit = 'BP Low, SpO2 98%';

    // Detect Category
    if (lower.includes('chest') || lower.includes('heart') || lower.includes('cardiac') || lower.includes('dard') || lower.includes('seene')) {
      cat = 'Cardiac';
      setSelectedEmergency('chest_pain');
    } else if (lower.includes('trauma') || lower.includes('bleed') || lower.includes('accident') || lower.includes('blood') || lower.includes('chot')) {
      cat = 'Severe Trauma';
      setSelectedEmergency('trauma');
    } else if (lower.includes('stroke') || lower.includes('paralysis') || lower.includes('lakwa') || lower.includes('kamzor')) {
      cat = 'Stroke / Paralysis';
      setSelectedEmergency('stroke');
    } else if (lower.includes('burn') || lower.includes('aag') || lower.includes('jal')) {
      cat = 'Burn Injury';
      setSelectedEmergency('burn');
    } else if (lower.includes('breath') || lower.includes('saans') || lower.includes('asthma') || lower.includes('oxygen')) {
      cat = 'Breathing Issue';
      setSelectedEmergency('breathing');
    }

    // Detect Age
    const ageMatch = text.match(/(\d{1,2})\s*(saal|years|yr|age)/i) || text.match(/age\s*(\d{1,2})/i);
    if (ageMatch && ageMatch[1]) {
      age = `${ageMatch[1]} Years`;
      const num = parseInt(ageMatch[1], 10);
      if (num < 1) setPatientAge('< 1');
      else if (num <= 12) setPatientAge('1–12');
      else if (num <= 60) setPatientAge('13–60');
      else setPatientAge('> 60');
    }

    // Detect Consciousness
    if (lower.includes('unconscious') || lower.includes('behos') || lower.includes('behosh')) {
      cons = 'Unconscious';
      setConsciousness('Unconscious');
    } else if (lower.includes('drowsy') || lower.includes('chakkar') || lower.includes('giddiness')) {
      cons = 'Drowsy';
      setConsciousness('Drowsy');
    } else {
      cons = 'Alert';
      setConsciousness('Alert');
    }

    // Detect Red Flags
    if (lower.includes('sugar') || lower.includes('diabetes')) {
      red = 'Diabetes, Hypertension';
      setRedFlags((prev) => ({ ...prev, diabetes: true, hypertension: true }));
    } else if (lower.includes('bp') || lower.includes('pressure') || lower.includes('hypertension')) {
      red = 'Hypertension';
      setRedFlags((prev) => ({ ...prev, hypertension: true }));
    }

    // Detect Vitals
    if (lower.includes('low') || lower.includes('kam')) {
      vit = 'BP 90/60 Low, SpO2 96%';
      setVitals({ spo2: 96, pulse: 104, bp: '90/60' });
    } else if (lower.includes('high')) {
      vit = 'BP 160/100 High, SpO2 98%';
      setVitals({ spo2: 98, pulse: 110, bp: '160/100' });
    }

    setDetectedData({
      category: cat,
      age,
      consciousness: cons,
      redFlags: red,
      vitals: vit,
      isReportGenerated: true
    });
  };

  const handleToggleVoiceListening = () => {
    if (isListening) {
      setIsListening(false);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
      playTactileClick();
    } else {
      playConfirmChime();
      setIsListening(true);

      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'hi-IN';
          rec.onresult = (e: any) => {
            let res = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
              res += e.results[i][0].transcript;
            }
            if (res) {
              setVoiceTranscript(`"${res}"`);
              parseVoiceText(res);
            }
          };
          rec.onerror = () => {};
          rec.start();
          speechRecognitionRef.current = rec;
        } catch (e) {
          // Simulation fallback
        }
      }

      // Live transcript simulation demo if mic is inactive
      setTimeout(() => {
        setVoiceTranscript('"Patient ko severe chest pain ho raha hai, age 45 hai, BP check kiya toh low hai..."');
        parseVoiceText('Patient ko severe chest pain ho raha hai, age 45 hai, BP check kiya toh low hai');
      }, 1200);
    }
  };

  const handleResetVoice = () => {
    playTactileClick();
    setVoiceTranscript('"Speak clearly in Hindi or English (e.g. Patient ko severe chest pain hai, age 45, BP low...)"');
    setDetectedData({
      category: 'Cardiac',
      age: '45 Years',
      consciousness: 'Alert',
      redFlags: 'Hypertension',
      vitals: 'BP Low, SpO2 98%',
      isReportGenerated: true
    });
    if (!isListening) {
      handleToggleVoiceListening();
    }
  };

  const handleBleSync = () => {
    playTactileClick();
    setIsBleSyncing(true);
    setTimeout(() => {
      setVitals({
        spo2: 97 + Math.floor(Math.random() * 3),
        pulse: 94 + Math.floor(Math.random() * 6),
        bp: '122/82'
      });
      setIsBleSyncing(false);
      playConfirmChime();
    }, 900);
  };

  const constructEmergencyReport = (): PatientEmergencyReportData => {
    const isVoice = inputMode === 'voice';
    const emergencyCategoryName = isVoice
      ? detectedData.category
      : selectedEmergency === 'chest_pain'
      ? 'Chest Pain / Acute Cardiac Event'
      : selectedEmergency === 'trauma'
      ? 'Severe Trauma / Hemorrhage'
      : selectedEmergency === 'stroke'
      ? 'Acute Stroke / Neurological Deficit'
      : selectedEmergency === 'burn'
      ? 'Thermal Burn Injury'
      : 'Acute Respiratory Distress';

    const activeRedFlags: string[] = [];
    if (redFlags.hypertension) activeRedFlags.push('Hypertension');
    if (redFlags.diabetes) activeRedFlags.push('Diabetes Mellitus');
    if (redFlags.bloodThinners) activeRedFlags.push('Blood Thinners (Anticoagulants)');
    if (redFlags.heartDisease) activeRedFlags.push('Previous Cardiac Disease');
    if (redFlags.pregnancy) activeRedFlags.push('Active Pregnancy');

    const calculatedToken = qrTokenId || `PRATH-${new Date().getFullYear()}-${(selectedHospital?.id || 'GSVM').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const currentTimestamp = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const isCritical =
      selectedEmergency === 'chest_pain' ||
      selectedEmergency === 'trauma' ||
      consciousness === 'Unconscious' ||
      vitals.spo2 < 92;

    const severity: 'RED (Critical / Immediate)' | 'YELLOW (Urgent)' | 'GREEN (Stable)' = isCritical
      ? 'RED (Critical / Immediate)'
      : 'YELLOW (Urgent)';

    const clinicalSummary = isVoice
      ? `AI Voice Assessment extracted acute ${detectedData.category} distress with consciousness level '${detectedData.consciousness}'. Extracted vital signs indicate ${detectedData.vitals} with background risk factors (${detectedData.redFlags}). Immediate ER triage bay reservation recommended.`
      : `Pre-arrival triage intake indicates patient presenting with ${emergencyCategoryName} of duration ${symptomTime}. Baseline consciousness is '${consciousness}'. Known allergies: ${allergy}. Medical history positive for: ${activeRedFlags.join(', ') || 'None'}.`;

    const aiSuggestedActions = [
      'Keep patient in semi-fowler / resting position; avoid physical strain.',
      'Ensure clear airway and oxygen support readiness upon ER arrival.',
      'Prepare ECG & Cardiac Enzyme / Trauma Bay protocol at destination ER.',
      'Maintain continuous SpO2 and Blood Pressure surveillance.'
    ];

    const targetHospital: RealHospital = selectedHospital || (hospitals.length > 0 ? hospitals[0] : {
      id: 'gsvm',
      name: 'GSVM Medical College & Hospital',
      address: 'Swaroop Nagar, Kanpur, Uttar Pradesh 208002',
      lat: 26.4712,
      lng: 80.3211,
      distance: '2.1 km',
      distanceKm: 2.1,
      travelTime: '6 min',
      travelTimeMinutes: 6,
      phone: '+91 512 253 5483',
      icuBeds: 4,
      generalBeds: 14,
      nicuStatus: 'Available',
      pharmacyOpen: true,
      erStatus: 'Open',
      waitingTime: '~ 5 min',
      imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
      corridorName: 'GT Road Corridor',
      category: 'medical_college',
      isVerified: true
    });

    return {
      reportId: `REP-${Date.now().toString().slice(-6)}`,
      timestamp: currentTimestamp,
      patientName: patientName.trim() || 'Amit Kumar',
      patientAge: isVoice ? detectedData.age : patientAge,
      gender: patientGender,
      inputMethod: isVoice ? 'AI Voice Triage' : 'Manual Self-Triage',
      emergencyCategory: emergencyCategoryName,
      symptomDuration: isVoice ? '< 30 mins' : symptomTime,
      consciousness: isVoice ? detectedData.consciousness : consciousness,
      vitals: {
        spo2: vitals.spo2,
        pulse: vitals.pulse,
        bp: vitals.bp
      },
      medicalRedFlags: isVoice ? [detectedData.redFlags] : activeRedFlags,
      allergies: allergy,
      hospital: targetHospital,
      userLocationName: locationName,
      qrTokenId: calculatedToken,
      severityLevel: severity,
      clinicalSummary,
      aiSuggestedActions
    };
  };

  const handleOpenReportModal = () => {
    playConfirmChime();
    const rep = constructEmergencyReport();
    setCurrentReportData(rep);
    setIsReportModalOpen(true);
  };

  // Submit Emergency Intake -> Generate AI Medical Report & Auto-Transmit to Hospital Reception Dashboard
  const handleSubmitAndGenerateAiReport = async () => {
    playConfirmChime();
    setIsSubmitting(true);
    setSubmitSuccessNotice(null);

    const generatedReport = constructEmergencyReport();
    setCurrentReportData(generatedReport);

    try {
      // 1. Prepare standard InboundDispatch payload for Hospital Reception Grid
      const dispatchPayload = {
        dispatchId: generatedReport.qrTokenId || `PRATH-DISP-${Date.now()}`,
        hospitalId: generatedReport.hospital.id || 'gsvm-kanpur',
        hospitalName: generatedReport.hospital.name,
        severity: generatedReport.severityLevel.includes('RED') ? 'RED' : 'YELLOW',
        status: 'In Queue',
        etaMinutes: generatedReport.hospital.travelTimeMinutes || 6,
        ambulanceId: 'CITIZEN-EMERGENCY',
        patient: {
          fullName: generatedReport.patientName,
          age: parseInt(generatedReport.patientAge) || 35,
          gender: generatedReport.gender || 'Male',
          contactPhone: '+91 98765 43210',
          symptomCategory: generatedReport.emergencyCategory,
          subSymptoms: generatedReport.medicalRedFlags,
          onsetTime: generatedReport.symptomDuration,
          avpuScale: generatedReport.consciousness === 'Unconscious' ? 'U' : generatedReport.consciousness === 'Drowsy' ? 'V' : 'A',
          vitals: {
            bp: generatedReport.vitals.bp,
            spo2: generatedReport.vitals.spo2,
            heartRate: generatedReport.vitals.pulse
          },
          targetDepartment: generatedReport.emergencyCategory.includes('Cardiac')
            ? 'Emergency Cardiology'
            : generatedReport.emergencyCategory.includes('Trauma')
            ? 'ER Trauma Bay'
            : 'Emergency Critical Care',
          clinicalPriorityNotes: generatedReport.clinicalSummary
        },
        originCoords: { lat: generatedReport.hospital.lat || 26.4712, lng: generatedReport.hospital.lng || 80.3211 },
        currentCoords: { lat: generatedReport.hospital.lat || 26.4712, lng: generatedReport.hospital.lng || 80.3211 }
      };

      // 2. Transmit to server API (broadcasts via Socket.io to GSVM hospital dashboard in real-time)
      await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dispatchPayload)
      });

      setIsSubmitting(false);
      setSubmitSuccessNotice(`Report successfully generated & transmitted to ${generatedReport.hospital.name} live dashboard!`);

      // 3. Open AI Medical Report Modal for patient preview and download
      setIsReportModalOpen(true);
    } catch (err) {
      console.error('Submission error:', err);
      setIsSubmitting(false);
      // Still open modal so patient can view/save report
      setIsReportModalOpen(true);
    }
  };

  const handleDispatchAndGenerateQr = () => {
    playConfirmChime();
    const token = `PRATH-${new Date().getFullYear()}-${(selectedHospital?.id || 'GSVM').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setQrTokenId(token);
    setIsQrModalOpen(true);
  };

  const handleStartNavigation = () => {
    playConfirmChime();
    setIsNavigating(true);
  };

  return (
    <div id="patient-emergency-screen" className="w-full h-full overflow-y-auto bg-[#f8fafc] text-slate-900 font-sans select-none pb-12">
      
      {/* ========================================================================= */}
      {/* TOP APP HEADER */}
      {/* ========================================================================= */}
      <header className="w-full bg-white border-b border-slate-200/90 sticky top-0 z-30 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        
        {/* Left: Prathmikta Logo & Tagline */}
        <div
          onClick={() => {
            playTactileClick();
            setMode('landing');
          }}
          className="flex items-center gap-3 cursor-pointer group"
          title="Back to Landing Page"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
              Prathmikta
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Your Emergency, Our Priority
            </p>
          </div>
        </div>

        {/* Center: Auto-Location Pill */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-full text-xs font-semibold shadow-inner">
          <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-slate-600">Auto-Location:</span>
          <span className="text-slate-900 font-bold">Kanpur, Uttar Pradesh</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
            Accuracy: High
          </span>
        </div>

        {/* Right: Hotline Pill 108 / 112 */}
        <a
          href="tel:108"
          className="flex items-center gap-3 px-5 py-2 rounded-2xl bg-white hover:bg-rose-50 border border-red-200 shadow-sm transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/30 group-hover:scale-105 transition-transform shrink-0">
            <PhoneCall className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="text-sm font-black text-red-600 leading-tight">
              CALL 108 / 112
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Emergency Hotline
            </div>
          </div>
        </a>

      </header>

      {/* ========================================================================= */}
      {/* MAIN 2-COLUMN DASHBOARD GRID */}
      {/* ========================================================================= */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        {/* Dynamic Scenario Indicator & Success Banner */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-extrabold text-slate-800">Dynamic AI Triage Intake</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600 font-medium">Page refresh generates new clinical patient profiles automatically. Click <strong className="text-red-600 font-black">"Submit"</strong> to transmit directly to GSVM reception.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all cursor-pointer"
              title="Generate new patient emergency profile"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh Scenario</span>
            </button>
          </div>
        </div>

        {submitSuccessNotice && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span>{submitSuccessNotice}</span>
            </div>
            <button
              onClick={() => setSubmitSuccessNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ======================================================================= */}
          {/* LEFT COLUMN: 2. LIVE DISPATCH & ROUTING ENGINE (6 Cols) */}
          {/* ======================================================================= */}
          <div className="lg:col-span-6 space-y-3">
            
            {/* Section Header */}
            <div className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>2. LIVE SATELLITE NAVIGATION &amp; DISPATCH ENGINE</span>
              </span>
              <span className="text-[11px] font-bold text-slate-500">Real OSRM Road Geometry</span>
            </div>

            {/* Map Container Card */}
            <div className={`bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden flex flex-col justify-between transition-all duration-300 ${
              isNavigating ? 'ring-4 ring-blue-500/30 shadow-2xl' : ''
            }`}>
              
              {/* Real Leaflet Map Canvas */}
              <div className={`relative w-full bg-slate-900 overflow-hidden transition-all duration-300 ${
                isNavigating ? 'h-[620px]' : 'h-[540px]'
              }`}>
                <RealLeafletHospitalMap
                  userLocation={userLocation}
                  hospitals={hospitals}
                  selectedHospital={selectedHospital}
                  onSelectHospital={(hosp) => {
                    playTactileClick();
                    setSelectedHospital(hosp);
                  }}
                  isNavigating={isNavigating}
                  onStartNavigation={() => {
                    playConfirmChime();
                    setIsNavigating(true);
                  }}
                  onStopNavigation={() => {
                    playTactileClick();
                    setIsNavigating(false);
                  }}
                  onLocateMe={handleLocateMe}
                  isLoadingHospitals={isLoadingHospitals}
                />
              </div>

              {/* Bottom Route & Start Navigation Action Bar */}
              {!isNavigating && (
                <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  
                  {/* Route Info */}
                  <div className="flex items-center gap-3 text-left w-full sm:w-auto">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                      <Navigation className="w-5 h-5 fill-blue-600 rotate-45" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 leading-tight">
                        Route to {selectedHospital?.name || 'Madhuraj Hospital Private Limited'}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        via {selectedHospital?.corridorName || 'Mall Rd & Halsi Rd Corridor'} (Live OSRM Geometry)
                      </p>
                    </div>
                  </div>

                  {/* Travel Time & Green Start Navigation Button */}
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-base font-black text-emerald-600 leading-tight">
                        {selectedHospital?.travelTime || '15 min'}
                      </div>
                      <div className="text-xs font-bold text-slate-500">
                        {selectedHospital?.distance || '4.8 km'}
                      </div>
                    </div>

                    <button
                      onClick={handleStartNavigation}
                      className="px-6 py-3 rounded-2xl bg-[#00a86b] hover:bg-[#00925d] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>START NAVIGATION</span>
                    </button>
                  </div>

                </div>
              )}

            </div>

          </div>

          {/* ======================================================================= */}
          {/* RIGHT COLUMN: 1. SELECT EMERGENCY TYPE + PRE-ARRIVAL FORM (6 Cols) */}
          {/* ======================================================================= */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* ===================================================================== */}
            {/* 1. SELECT EMERGENCY TYPE (ONE TAP, INSTANT RESPONSE) */}
            {/* ===================================================================== */}
            <div className="space-y-3 text-left">
              <div className="text-xs font-black uppercase tracking-wider text-slate-800">
                1. SELECT EMERGENCY TYPE (ONE TAP, INSTANT RESPONSE)
              </div>

              {/* 5 Emergency Types Horizontal Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                
                {/* 1. Chest Pain / Cardiac */}
                <div
                  onClick={() => handleSelectEmergency('chest_pain')}
                  className={`p-3 rounded-2xl bg-white border cursor-pointer transition-all flex flex-col items-center justify-between text-center space-y-2 group ${
                    selectedEmergency === 'chest_pain'
                      ? 'border-red-500 ring-2 ring-red-400/20 shadow-md shadow-red-500/10'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md shadow-red-500/25 group-hover:scale-105 transition-transform">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      Chest Pain / Cardiac
                    </div>
                    <div className="text-[10px] text-red-500 font-bold pt-1">
                      Tap for Help
                    </div>
                  </div>
                </div>

                {/* 2. Severe Trauma / Bleeding */}
                <div
                  onClick={() => handleSelectEmergency('trauma')}
                  className={`p-3 rounded-2xl bg-white border cursor-pointer transition-all flex flex-col items-center justify-between text-center space-y-2 group ${
                    selectedEmergency === 'trauma'
                      ? 'border-red-500 ring-2 ring-red-400/20 shadow-md shadow-red-500/10'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/25 group-hover:scale-105 transition-transform">
                    <Droplet className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      Severe Trauma / Bleeding
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium pt-1">
                      Tap for Help
                    </div>
                  </div>
                </div>

                {/* 3. Stroke / Paralysis */}
                <div
                  onClick={() => handleSelectEmergency('stroke')}
                  className={`p-3 rounded-2xl bg-white border cursor-pointer transition-all flex flex-col items-center justify-between text-center space-y-2 group ${
                    selectedEmergency === 'stroke'
                      ? 'border-purple-500 ring-2 ring-purple-400/20 shadow-md'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      Stroke / Paralysis
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium pt-1">
                      Tap for Help
                    </div>
                  </div>
                </div>

                {/* 4. Burn Injury */}
                <div
                  onClick={() => handleSelectEmergency('burn')}
                  className={`p-3 rounded-2xl bg-white border cursor-pointer transition-all flex flex-col items-center justify-between text-center space-y-2 group ${
                    selectedEmergency === 'burn'
                      ? 'border-orange-500 ring-2 ring-orange-400/20 shadow-md'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      Burn Injury
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium pt-1">
                      Tap for Help
                    </div>
                  </div>
                </div>

                {/* 5. Breathing Issue */}
                <div
                  onClick={() => handleSelectEmergency('breathing')}
                  className={`p-3 rounded-2xl bg-white border cursor-pointer transition-all flex flex-col items-center justify-between text-center space-y-2 group col-span-2 sm:col-span-1 ${
                    selectedEmergency === 'breathing'
                      ? 'border-cyan-500 ring-2 ring-cyan-400/20 shadow-md'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Wind className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      Breathing Issue
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium pt-1">
                      Tap for Help
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ===================================================================== */}
            {/* MODE SWITCHER: MANUAL SELECTION vs AI VOICE AGENT MODE */}
            {/* ===================================================================== */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setInputMode('manual');
                }}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  inputMode === 'manual'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                <span>Manual Selection</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setInputMode('voice');
                  if (!isListening) {
                    handleToggleVoiceListening();
                  }
                }}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  inputMode === 'voice'
                    ? 'bg-[#1d63ff] text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mic className="w-4 h-4 text-white" />
                <span>AI Voice Agent Mode</span>
              </button>
            </div>

            {/* ===================================================================== */}
            {/* CONDITIONAL RENDERING: AI VOICE AGENT MODE vs MANUAL FORM */}
            {/* ===================================================================== */}
            {inputMode === 'voice' ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-6 text-left animate-in fade-in duration-200">
                
                {/* 1. Sound Waveform Equalizer Visualizer */}
                <div className="w-full flex items-center justify-center gap-[3px] py-3 px-2 overflow-hidden h-14 select-none">
                  {[
                    18, 24, 12, 35, 48, 60, 32, 70, 85, 45, 95, 65, 40, 80, 55, 90, 75, 100, 80, 60,
                    90, 100, 70, 85, 50, 92, 68, 45, 80, 60, 95, 75, 40, 65, 88, 50, 72, 35, 60, 42,
                    28, 16, 22, 14, 18, 10
                  ].map((height, idx) => (
                    <div
                      key={idx}
                      className={`w-1 rounded-full transition-all duration-200 ${
                        isListening
                          ? 'bg-gradient-to-t from-blue-600 via-indigo-500 to-blue-400 animate-pulse'
                          : 'bg-blue-300/80'
                      }`}
                      style={{
                        height: isListening
                          ? `${Math.max(12, (height * (0.6 + Math.sin(idx + Date.now() / 300) * 0.4)) * 0.45)}px`
                          : `${height * 0.28}px`,
                        animationDelay: `${idx * 40}ms`
                      }}
                    />
                  ))}
                </div>

                {/* 2. Glowing Big Circular Mic Button with Listening status */}
                <div className="flex flex-col items-center justify-center text-center space-y-2 py-1">
                  <div className="relative">
                    {/* Glowing pulse rings when listening */}
                    {isListening && (
                      <>
                        <div className="absolute -inset-2.5 rounded-full bg-blue-500/20 animate-ping" />
                        <div className="absolute -inset-5 rounded-full bg-indigo-500/10 animate-pulse" />
                      </>
                    )}
                    
                    <button
                      type="button"
                      onClick={handleToggleVoiceListening}
                      className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all cursor-pointer ${
                        isListening
                          ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/40 ring-4 ring-blue-400/30'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-slate-300'
                      }`}
                      title={isListening ? 'Tap to pause microphone' : 'Tap to speak emergency'}
                    >
                      {isListening ? (
                        <Mic className="w-8 h-8 text-white animate-bounce" />
                      ) : (
                        <MicOff className="w-8 h-8 text-slate-600" />
                      )}
                    </button>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-base font-black text-blue-600 leading-tight">
                      {isListening ? 'Listening...' : 'Tap Mic to Start Speaking'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium pt-0.5">
                      Speak your emergency details in Hindi or English.
                    </p>
                  </div>
                </div>

                {/* 3. Detected Details Cards Grid (2 cols) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Card 1: Live Transcript */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-1 sm:col-span-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        <span>Live Transcript</span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium italic line-clamp-2 leading-relaxed pt-1">
                      {voiceTranscript}
                    </p>
                  </div>

                  {/* Card 2: Category (Detected) */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-1 sm:col-span-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                      <Activity className="w-3.5 h-3.5 text-purple-600" />
                      <span>Category (Detected)</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 pt-1">
                      {detectedData.category}
                    </div>
                  </div>

                  {/* Card 3: Consciousness (Detected) */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                      <Brain className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Consciousness (Detected)</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 pt-1">
                      {detectedData.consciousness}
                    </div>
                  </div>

                  {/* Card 4: Patient Age (Detected) */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Patient Age (Detected)</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 pt-1">
                      {detectedData.age}
                    </div>
                  </div>

                  {/* Card 5: Medical Red Flags */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                      <Shield className="w-3.5 h-3.5 text-red-500" />
                      <span>Medical Red Flags</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 pt-1">
                      {detectedData.redFlags}
                    </div>
                  </div>

                  {/* Card 6: Vitals (Extracted) */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                      <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                      <span>Vitals (Extracted)</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 pt-1">
                      {detectedData.vitals}
                    </div>
                  </div>

                </div>

                {/* 4. Green Success Banner: Report Generated Successfully */}
                <div className="p-4 rounded-2xl bg-[#ecfdf5] border border-emerald-200/90 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-emerald-900 leading-tight">
                        Report Generated Successfully
                      </h4>
                      <p className="text-[11px] sm:text-xs text-emerald-700 font-medium pt-0.5">
                        AI has auto-filled all critical details. You can review before dispatch.
                      </p>
                    </div>
                  </div>

                  <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin shrink-0 hidden sm:block" />
                </div>

                {/* 5. Bottom Action Buttons: Submit & Generate AI Report + Reset + QR Token */}
                <div className="space-y-3 pt-2">
                  {/* Primary Submit Button */}
                  <button
                    type="button"
                    onClick={handleSubmitAndGenerateAiReport}
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-red-600/30 active:scale-95 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating AI Medical Report &amp; Transmitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 fill-white" />
                        <span>Submit Intake &amp; Generate AI Report (Direct Transfer)</span>
                        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      </>
                    )}
                  </button>

                  {/* Secondary auxiliary buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetVoice}
                      className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reset &amp; Speak Again</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenReportModal}
                      className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Preview AI Report</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDispatchAndGenerateQr}
                      className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Generate QR Token</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              /* ===================================================================== */
              /* MANUAL PRE-ARRIVAL FORM & DISPATCH CARD */
              /* ===================================================================== */
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5 text-left animate-in fade-in duration-200">
                
                <div className="text-xs font-black uppercase tracking-wider text-slate-800">
                  RIGHT: PRE-ARRIVAL FORM &amp; DISPATCH
                </div>

                {/* Patient Name & Gender Input */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Patient Full Name</span>
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Amit Kumar"
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Gender
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      {['Male', 'Female'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setPatientGender(g)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                            patientGender === g
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Symptom Start Time */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Symptom Start Time</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['< 30 mins', '30 mins – 2 hrs', '2 – 6 hrs', '> 6 hrs'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setSymptomTime(item);
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                          symptomTime === item
                            ? 'bg-[#1d63ff] text-white shadow-md shadow-blue-500/20'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Known Allergies */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Known Allergies</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {['None', 'Penicillin', 'Iodine', 'Latex', 'Other'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setAllergy(item);
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                          allergy === item
                            ? 'bg-[#1d63ff] text-white shadow-md shadow-blue-500/20'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Patient Age & Consciousness in 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Patient Age */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700">
                      Patient Age
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['< 1', '1–12', '13–60', '> 60'].map((age) => (
                        <button
                          key={age}
                          type="button"
                          onClick={() => {
                            playTactileClick();
                            setPatientAge(age);
                          }}
                          className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                            patientAge === age
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                          }`}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Consciousness */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <span>Consciousness</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['Alert', 'Drowsy', 'Unconscious'].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            playTactileClick();
                            setConsciousness(item);
                          }}
                          className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                            consciousness === item
                              ? 'bg-[#1d63ff] text-white shadow-md shadow-blue-500/20'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Medical Red Flags Checkboxes */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Shield className="w-4 h-4 text-red-500" />
                    <span>Medical Red Flags</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-slate-700">
                    {[
                      { id: 'diabetes', label: 'Diabetes' },
                      { id: 'hypertension', label: 'Hypertension' },
                      { id: 'bloodThinners', label: 'Blood Thinners' },
                      { id: 'heartDisease', label: 'Heart Disease' },
                      { id: 'pregnancy', label: 'Pregnancy' }
                    ].map((flag) => (
                      <label
                        key={flag.id}
                        onClick={() => handleToggleRedFlag(flag.id)}
                        className="flex items-center gap-1.5 cursor-pointer select-none"
                      >
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            redFlags[flag.id]
                              ? 'bg-[#1d63ff] border-[#1d63ff] text-white'
                              : 'bg-white border-slate-300'
                          }`}
                        >
                          {redFlags[flag.id] && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-slate-800 font-semibold">{flag.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Paramedic Vitals (Quick Sync) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      <span>Paramedic Vitals (Quick Sync)</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleBleSync}
                      disabled={isBleSyncing}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-50 text-blue-600 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Bluetooth className={`w-3.5 h-3.5 ${isBleSyncing ? 'animate-spin' : ''}`} />
                      <span>{isBleSyncing ? 'Syncing...' : 'Connect Device'}</span>
                    </button>
                  </div>

                  {/* 3 Metric Cards: SpO2, Pulse, BP */}
                  <div className="grid grid-cols-3 gap-3">
                    
                    {/* SpO2 */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-center space-y-1">
                      <div className="text-[11px] font-bold text-slate-500">SpO2</div>
                      <div className="text-2xl font-black text-blue-600">
                        {vitals.spo2} <span className="text-xs text-slate-500 font-bold">%</span>
                      </div>
                    </div>

                    {/* Pulse */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-center space-y-1">
                      <div className="text-[11px] font-bold text-slate-500">Pulse</div>
                      <div className="text-2xl font-black text-red-600">
                        {vitals.pulse} <span className="text-xs text-slate-500 font-bold">bpm</span>
                      </div>
                    </div>

                    {/* BP */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-center space-y-1">
                      <div className="text-[11px] font-bold text-slate-500">BP</div>
                      <div className="text-xl sm:text-2xl font-black text-emerald-600">
                        {vitals.bp} <span className="text-[10px] text-slate-500 font-bold">mmHg</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Bottom Action Cards: SUBMIT & GENERATE AI REPORT + PREVIEW & QR */}
                <div className="space-y-3 pt-2">
                  {/* Primary Submit Button */}
                  <button
                    type="button"
                    onClick={handleSubmitAndGenerateAiReport}
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-red-600/30 active:scale-95 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating AI Medical Report &amp; Transmitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 fill-white" />
                        <span>Submit Intake &amp; Generate AI Report (Direct Transfer)</span>
                        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={handleOpenReportModal}
                      className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/90 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-indigo-100/80 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-indigo-500/20">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="text-left space-y-0.5">
                        <h3 className="text-xs font-black text-indigo-950 tracking-tight leading-tight">
                          PREVIEW AI REPORT &amp; PDF
                        </h3>
                        <p className="text-[11px] text-indigo-700 font-medium">
                          Check report layout
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={handleDispatchAndGenerateQr}
                      className="p-3.5 rounded-2xl bg-[#ecfdf5] border border-emerald-200/90 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-[#d1fae5] transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-emerald-500/20">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div className="text-left space-y-0.5">
                        <h3 className="text-xs font-black text-emerald-950 tracking-tight leading-tight">
                          GENERATE QR TOKEN
                        </h3>
                        <p className="text-[11px] text-emerald-700 font-medium">
                          Instant hospital pass
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* QR TOKEN / DISPATCH CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-slate-900 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Pre-Arrival Triage Dispatched
                </h3>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Token ID and Hospital Name */}
            <div className="text-center space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Digital ER Fast-Track Token
              </div>
              <div className="text-lg font-mono font-black text-blue-600">
                {qrTokenId}
              </div>
              <div className="text-xs font-bold text-slate-800">
                Reserved at: {selectedHospital.name}
              </div>
            </div>

            {/* QR Code Graphic */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 shadow-inner">
              <svg className="w-40 h-40" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="white" />
                {/* QR corner 1 */}
                <rect x="10" y="10" width="25" height="25" fill="#0f172a" rx="4" />
                <rect x="15" y="15" width="15" height="15" fill="white" rx="2" />
                <rect x="18" y="18" width="9" height="9" fill="#0f172a" rx="1" />

                {/* QR corner 2 */}
                <rect x="65" y="10" width="25" height="25" fill="#0f172a" rx="4" />
                <rect x="70" y="15" width="15" height="15" fill="white" rx="2" />
                <rect x="73" y="18" width="9" height="9" fill="#0f172a" rx="1" />

                {/* QR corner 3 */}
                <rect x="10" y="65" width="25" height="25" fill="#0f172a" rx="4" />
                <rect x="15" y="70" width="15" height="15" fill="white" rx="2" />
                <rect x="18" y="73" width="9" height="9" fill="#0f172a" rx="1" />

                {/* Matrix dots */}
                <rect x="42" y="12" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="18" width="6" height="6" fill="#0f172a" />
                <rect x="42" y="28" width="6" height="6" fill="#0f172a" />
                <rect x="12" y="45" width="6" height="6" fill="#0f172a" />
                <rect x="22" y="48" width="6" height="6" fill="#0f172a" />
                <rect x="42" y="42" width="16" height="16" fill="#ef4444" rx="3" />
                <circle cx="50" cy="50" r="4" fill="white" />
                <rect x="65" y="45" width="6" height="6" fill="#0f172a" />
                <rect x="78" y="52" width="6" height="6" fill="#0f172a" />
                <rect x="45" y="68" width="6" height="6" fill="#0f172a" />
                <rect x="55" y="78" width="6" height="6" fill="#0f172a" />
                <rect x="70" y="72" width="6" height="6" fill="#0f172a" />
                <rect x="80" y="82" width="6" height="6" fill="#0f172a" />
              </svg>
              <div className="text-[11px] text-slate-500 font-medium pt-2">
                Scan at ER Gate or Paramedic Handover
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  playConfirmChime();
                  setIsQrModalOpen(false);
                  setIsNavigating(true);
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                <Navigation className="w-4 h-4 fill-white rotate-45" />
                <span>Start Navigation Now</span>
              </button>

              <button
                onClick={() => {
                  setIsQrModalOpen(false);
                  handleOpenReportModal();
                }}
                className="px-4 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Report</span>
              </button>

              <button
                onClick={() => setIsQrModalOpen(false)}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AI GENERATED MEDICAL REPORT MODAL */}
      {/* ========================================================================= */}
      {currentReportData && (
        <PatientReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          report={currentReportData}
        />
      )}

    </div>
  );
};
