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
  Activity,
  AlertTriangle,
  Radio,
  Check,
  QrCode,
  Bluetooth,
  Navigation,
  Sparkles,
  Zap,
  Shield,
  Eye,
  Moon,
  ChevronRight,
  Plus,
  Minus,
  Crosshair,
  Volume2,
  VolumeX,
  Share2,
  X,
  Printer,
  Compass,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Car
} from 'lucide-react';
import { playTactileClick, playConfirmChime, playCodeRedAlert } from '../../lib/audio';

interface RegionalHospitalRow {
  id: string;
  name: string;
  distance: string;
  distanceKm: number;
  generalBedsTotal: number;
  generalBedsAvail: number;
  icuBedsTotal: number;
  icuBedsAvail: number;
  ventilatorsTotal: number;
  ventilatorsAvail: number;
  pharmacyOpen: boolean;
  onDiversion: boolean;
  erWaitTime: string;
  lat: number;
  lng: number;
  routeRoad: string;
  travelTime: string;
  travelMinutes: number;
  pathD: string;
  turns: Array<{ progress: number; instruction: string; subtext: string; icon: string }>;
}

const REGIONAL_HOSPITALS: RegionalHospitalRow[] = [
  {
    id: 'hosp-gsvm',
    name: 'GSVM Medical College',
    distance: '2.1 km',
    distanceKm: 2.1,
    travelTime: '7 min',
    travelMinutes: 7,
    routeRoad: 'via GT Road (Green Corridor)',
    generalBedsTotal: 250,
    generalBedsAvail: 34,
    icuBedsTotal: 45,
    icuBedsAvail: 4,
    ventilatorsTotal: 30,
    ventilatorsAvail: 3,
    pharmacyOpen: true,
    onDiversion: false,
    erWaitTime: '12 min',
    lat: 26.4715,
    lng: 80.328,
    pathD: 'M 170 190 C 180 140, 230 110, 310 90',
    turns: [
      { progress: 0, instruction: 'Head Northeast on Mall Road', subtext: 'Emergency Green Corridor synced with Traffic HQ', icon: '⬆️' },
      { progress: 25, instruction: 'In 300m, Turn Right onto GT Road Flyover', subtext: 'Traffic signal preempted green for ambulance', icon: '↗️' },
      { progress: 60, instruction: 'Continue straight for 1.1 km on GT Corridor', subtext: 'Speed 58 km/h &bull; Smooth corridor', icon: '⬆️' },
      { progress: 85, instruction: 'In 200m, Turn Left into GSVM Emergency Gate', subtext: 'Trauma Team Alerted &bull; Resus Bay 2 Ready', icon: '↖️' },
      { progress: 100, instruction: 'Arrived at GSVM Emergency Department', subtext: 'Staff & stretcher standing by at ER Ramp', icon: '🏁' }
    ]
  },
  {
    id: 'hosp-regency',
    name: 'Regency Hospital',
    distance: '3.4 km',
    distanceKm: 3.4,
    travelTime: '11 min',
    travelMinutes: 11,
    routeRoad: 'via Mall Road',
    generalBedsTotal: 180,
    generalBedsAvail: 6,
    icuBedsTotal: 20,
    icuBedsAvail: 1,
    ventilatorsTotal: 15,
    ventilatorsAvail: 0,
    pharmacyOpen: true,
    onDiversion: false,
    erWaitTime: '18 min',
    lat: 26.4601,
    lng: 80.312,
    pathD: 'M 170 190 C 140 210, 110 220, 90 200',
    turns: [
      { progress: 0, instruction: 'Head West toward Mall Road Junction', subtext: 'Signal priority active', icon: '⬅️' },
      { progress: 40, instruction: 'In 450m, Keep Left past Sarvodaya Nagar', subtext: 'Direct route to Regency Emergency', icon: '↙️' },
      { progress: 80, instruction: 'Turn Right into Regency Hospital Bay', subtext: '1 ICU Bed Reserved', icon: '↗️' },
      { progress: 100, instruction: 'Arrived at Regency Emergency', subtext: 'Emergency Doctor available', icon: '🏁' }
    ]
  },
  {
    id: 'hosp-medanta',
    name: 'Medanta Hospital',
    distance: '5.6 km',
    distanceKm: 5.6,
    travelTime: '16 min',
    travelMinutes: 16,
    routeRoad: 'via Bypass Expressway',
    generalBedsTotal: 350,
    generalBedsAvail: 19,
    icuBedsTotal: 60,
    icuBedsAvail: 2,
    ventilatorsTotal: 40,
    ventilatorsAvail: 2,
    pharmacyOpen: true,
    onDiversion: false,
    erWaitTime: '25 min',
    lat: 26.442,
    lng: 80.354,
    pathD: 'M 170 190 C 220 220, 270 240, 330 220',
    turns: [
      { progress: 0, instruction: 'Head South onto Bypass Expressway', subtext: 'Fast corridor &bull; Clear lanes', icon: '⬇️' },
      { progress: 50, instruction: 'Take Exit 4 toward Medanta Health City', subtext: 'Continue on Access Road', icon: '↘️' },
      { progress: 85, instruction: 'Turn Left into Medanta Emergency Portico', subtext: 'Cardiology on standby', icon: '↖️' },
      { progress: 100, instruction: 'Arrived at Medanta Hospital ER', subtext: 'Reception token processed', icon: '🏁' }
    ]
  },
  {
    id: 'hosp-kailash',
    name: 'Kailash Hospital',
    distance: '6.2 km',
    distanceKm: 6.2,
    travelTime: '19 min',
    travelMinutes: 19,
    routeRoad: 'via VIP Road',
    generalBedsTotal: 200,
    generalBedsAvail: 0,
    icuBedsTotal: 25,
    icuBedsAvail: 0,
    ventilatorsTotal: 10,
    ventilatorsAvail: 0,
    pharmacyOpen: false,
    onDiversion: true,
    erWaitTime: '—',
    lat: 26.488,
    lng: 80.298,
    pathD: 'M 170 190 C 160 110, 210 60, 270 40',
    turns: [
      { progress: 0, instruction: 'Warning: Hospital is currently on Diversion', subtext: 'Recommend selecting GSVM Medical College', icon: '⚠️' }
    ]
  },
  {
    id: 'hosp-lifeline',
    name: 'Lifeline Hospital',
    distance: '7.8 km',
    distanceKm: 7.8,
    travelTime: '22 min',
    travelMinutes: 22,
    routeRoad: 'via South Ring Road',
    generalBedsTotal: 150,
    generalBedsAvail: 12,
    icuBedsTotal: 15,
    icuBedsAvail: 3,
    ventilatorsTotal: 8,
    ventilatorsAvail: 1,
    pharmacyOpen: true,
    onDiversion: false,
    erWaitTime: '22 min',
    lat: 26.425,
    lng: 80.339,
    pathD: 'M 170 190 C 200 240, 240 280, 290 270',
    turns: [
      { progress: 0, instruction: 'Head South onto Ring Road', subtext: 'Emergency dispatch logged', icon: '⬇️' },
      { progress: 60, instruction: 'Continue on South Ring for 3.2 km', subtext: 'Moderate traffic', icon: '⬆️' },
      { progress: 100, instruction: 'Arrived at Lifeline Hospital', subtext: 'Admissions open', icon: '🏁' }
    ]
  }
];

export const PrathmiktaExactEmergencyDashboard: React.FC = () => {
  const { setMode } = usePrathmikta();

  // State 1: Emergency Type Triage Chip Selection
  const [selectedEmergency, setSelectedEmergency] = useState<string>('cardiac');

  // State 2: Selected Hospital for Routing
  const [selectedHospId, setSelectedHospId] = useState<string>('hosp-gsvm');

  // State 3: Pre-Arrival Form States
  const [symptomTime, setSymptomTime] = useState<string>('< 30 mins');
  const [allergies, setAllergies] = useState<string[]>(['None']);
  const [patientAgeGroup, setPatientAgeGroup] = useState<string>('13-60');
  const [consciousness, setConsciousness] = useState<string>('Alert');
  const [redFlags, setRedFlags] = useState<Record<string, boolean>>({
    Diabetes: false,
    Hypertension: true,
    'Blood Thinners': true,
    'Heart Disease': false,
    Pregnancy: false
  });

  // Paramedic Vitals (Quick Sync)
  const [vitals, setVitals] = useState({
    spo2: 98,
    pulse: 96,
    bpSystolic: 120,
    bpDiastolic: 80
  });
  const [isSyncingBLE, setIsSyncingBLE] = useState(false);
  const [bleConnected, setBleConnected] = useState(false);

  // Modals & Navigation
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isNavigatingLive, setIsNavigatingLive] = useState(false);
  const [isNavPaused, setIsNavPaused] = useState(false);
  const [navProgress, setNavProgress] = useState(0); // 0 to 100
  const [remainingSeconds, setRemainingSeconds] = useState(420); // 7 mins = 420s
  const [speedKmh, setSpeedKmh] = useState(54);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);
  const [showNavHUDModal, setShowNavHUDModal] = useState(false);

  // SVG Path Reference for exact mathematical trajectory calculation
  const activePathRef = useRef<SVGPathElement | null>(null);
  const [vehiclePos, setVehiclePos] = useState<{ x: number; y: number; angle: number }>({
    x: 170,
    y: 190,
    angle: 0
  });

  const activeHospital = REGIONAL_HOSPITALS.find((h) => h.id === selectedHospId) || REGIONAL_HOSPITALS[0];

  // Allergy Toggle Handler
  const toggleAllergy = (allergy: string) => {
    playTactileClick();
    if (allergy === 'None') {
      setAllergies(['None']);
      return;
    }
    setAllergies((prev) => {
      const filtered = prev.filter((a) => a !== 'None');
      if (filtered.includes(allergy)) {
        const next = filtered.filter((a) => a !== allergy);
        return next.length === 0 ? ['None'] : next;
      } else {
        return [...filtered, allergy];
      }
    });
  };

  // Red Flag Toggle
  const toggleRedFlag = (flag: string) => {
    playTactileClick();
    setRedFlags((prev) => ({
      ...prev,
      [flag]: !prev[flag]
    }));
  };

  // BLE Quick Sync Simulator
  const handleBLEConnect = () => {
    playTactileClick();
    setIsSyncingBLE(true);
    setTimeout(() => {
      setIsSyncingBLE(false);
      setBleConnected(true);
      setVitals({
        spo2: 97 + Math.floor(Math.random() * 3),
        pulse: 92 + Math.floor(Math.random() * 10),
        bpSystolic: 122 + Math.floor(Math.random() * 8),
        bpDiastolic: 82 + Math.floor(Math.random() * 6)
      });
      playConfirmChime();
    }, 1200);
  };

  // Handle Dispatch & Offline QR
  const handleDispatchER = () => {
    playCodeRedAlert();
    setIsQRModalOpen(true);
  };

  // Voice Announcement Helper
  const speakGuidance = (text: string) => {
    if (isAudioMuted) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.lang = 'en-IN';
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Audio fallback silent
    }
  };

  // Handle Live Navigation Start
  const handleStartNavigation = (hospId?: string) => {
    playConfirmChime();
    const targetHosp = hospId
      ? REGIONAL_HOSPITALS.find((h) => h.id === hospId) || activeHospital
      : activeHospital;

    if (hospId) {
      setSelectedHospId(hospId);
    }
    setIsNavigatingLive(true);
    setIsNavPaused(false);
    setNavProgress(0);
    setRemainingSeconds(targetHosp.travelMinutes * 60);
    setSpeedKmh(52);

    speakGuidance(`Emergency navigation started to ${targetHosp.name}. Green corridor active.`);
  };

  // Reset or Stop Navigation
  const handleStopNavigation = () => {
    playTactileClick();
    setIsNavigatingLive(false);
    setIsNavPaused(false);
    setNavProgress(0);
    setRemainingSeconds(activeHospital.travelMinutes * 60);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Calculate Current Turn Instruction
  const currentTurn = [...activeHospital.turns]
    .reverse()
    .find((t) => navProgress >= t.progress) || activeHospital.turns[0];

  // LIVE NAVIGATION TIMER & REALISTIC POSITION UPDATE EFFECT
  useEffect(() => {
    if (!isNavigatingLive || isNavPaused) return;

    const interval = setInterval(() => {
      setNavProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          playConfirmChime();
          speakGuidance(`You have arrived at ${activeHospital.name} emergency bay.`);
          return 100;
        }
        // Smooth increment (~2.5% per step => ~40 seconds full simulated ride or adjust smoothly)
        const next = Math.min(100, prev + 1.25);
        return next;
      });

      // Update Remaining Seconds & Speed Fluctuations
      setRemainingSeconds((prevSec) => {
        const totalSec = activeHospital.travelMinutes * 60;
        const newSec = Math.max(0, Math.round(totalSec * (1 - (navProgress + 1.25) / 100)));
        return newSec;
      });

      // Dynamic Speed variance
      setSpeedKmh((prev) => {
        const delta = (Math.random() - 0.5) * 6;
        return Math.min(75, Math.max(42, Math.round(prev + delta)));
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isNavigatingLive, isNavPaused, navProgress, activeHospital]);

  // UPDATE VEHICLE EXACT COORDINATES ALONG SVG PATH
  useEffect(() => {
    if (activePathRef.current) {
      try {
        const path = activePathRef.current;
        const totalLength = path.getTotalLength();
        const currentLength = (navProgress / 100) * totalLength;
        const pt = path.getPointAtLength(currentLength);
        
        // Calculate tangent for vehicle rotation
        const ptNext = path.getPointAtLength(Math.min(totalLength, currentLength + 2));
        const angle = Math.atan2(ptNext.y - pt.y, ptNext.x - pt.x) * (180 / Math.PI);

        setVehiclePos({
          x: pt.x,
          y: pt.y,
          angle: isNaN(angle) ? 0 : angle
        });
      } catch {
        // Fallback default coordinates
        setVehiclePos({ x: 170, y: 190, angle: 0 });
      }
    } else {
      setVehiclePos({ x: 170, y: 190, angle: 0 });
    }
  }, [navProgress, selectedHospId]);

  // Format MM:SS for Time Display
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Format Remaining Distance
  const remainingDistanceKm = Math.max(
    0,
    activeHospital.distanceKm * (1 - navProgress / 100)
  ).toFixed(1);

  return (
    <div id="prathmikta-exact-container" className="w-full bg-[#05070d] text-slate-100 min-h-screen p-3 sm:p-5 font-sans select-none overflow-x-hidden">
      <div className="max-w-[1340px] mx-auto space-y-4">
        
        {/* ========================================================================= */}
        {/* TOP HEADER: Prathmikta Logo, Location, Always-Visible CALL 108 / 112 */}
        {/* ========================================================================= */}
        <header id="prathmikta-top-header" className="flex items-center justify-between gap-3 flex-wrap py-2">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-[0_0_15px_rgba(239,68,68,0.6)] border border-red-400/40 shrink-0">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                <span>Prathmikta</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Your Emergency, Our Priority</p>
            </div>
          </div>

          {/* Center: Auto-Location & Accuracy Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 shadow-inner">
            <MapPin className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-300 font-medium">
              Auto-Location: <strong className="text-white font-bold">Kanpur, Uttar Pradesh</strong>
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              Accuracy: High
            </span>
          </div>

          {/* Right: Always Visible Emergency Hotline Call Button */}
          <div className="relative group">
            <a
              href="tel:108"
              id="btn-call-emergency-hotline"
              className="flex items-center gap-3 px-5 py-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] border border-red-400/50 transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg animate-bounce">
                🚨
              </div>
              <div className="text-left">
                <div className="text-sm sm:text-base font-black tracking-wider leading-tight uppercase">
                  CALL 108 / 112
                </div>
                <div className="text-[10px] text-red-200 font-mono tracking-tight">Emergency Hotline</div>
              </div>
            </a>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* SECTION 1: SELECT EMERGENCY TYPE (One Tap, Instant Response) */}
        {/* ========================================================================= */}
        <section id="section-emergency-types" className="space-y-2">
          <div className="text-center">
            <h2 className="text-xs sm:text-sm font-black text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2">
              <span>1. SELECT EMERGENCY TYPE</span>
              <span className="text-slate-400 font-normal font-sans text-xs">(One Tap, Instant Response)</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
            {/* Card 1: Chest Pain / Cardiac */}
            <button
              id="chip-emergency-cardiac"
              onClick={() => {
                playTactileClick();
                setSelectedEmergency('cardiac');
              }}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden group ${
                selectedEmergency === 'cardiac'
                  ? 'bg-gradient-to-br from-red-950 via-red-900/60 to-slate-900 border-red-500 shadow-[0_0_18px_rgba(239,68,68,0.4)] ring-2 ring-red-400'
                  : 'bg-[#101424] border-slate-800/90 hover:border-red-500/50 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${selectedEmergency === 'cardiac' ? 'bg-red-500 text-white shadow-lg' : 'bg-red-950/80 text-red-400 border border-red-800'}`}>
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white leading-tight">Chest Pain / Cardiac</h3>
                  <span className="text-[10px] text-red-300 font-medium">Tap for Help</span>
                </div>
              </div>
            </button>

            {/* Card 2: Severe Trauma / Bleeding */}
            <button
              id="chip-emergency-trauma"
              onClick={() => {
                playTactileClick();
                setSelectedEmergency('trauma');
              }}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden group ${
                selectedEmergency === 'trauma'
                  ? 'bg-gradient-to-br from-rose-950 via-rose-900/60 to-slate-900 border-rose-500 shadow-[0_0_18px_rgba(244,63,94,0.4)] ring-2 ring-rose-400'
                  : 'bg-[#101424] border-slate-800/90 hover:border-rose-500/50 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${selectedEmergency === 'trauma' ? 'bg-rose-600 text-white shadow-lg' : 'bg-rose-950/80 text-rose-400 border border-rose-800'}`}>
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white leading-tight">Severe Trauma / Bleeding</h3>
                  <span className="text-[10px] text-rose-300 font-medium">Tap for Help</span>
                </div>
              </div>
            </button>

            {/* Card 3: Stroke / Paralysis */}
            <button
              id="chip-emergency-stroke"
              onClick={() => {
                playTactileClick();
                setSelectedEmergency('stroke');
              }}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden group ${
                selectedEmergency === 'stroke'
                  ? 'bg-gradient-to-br from-purple-950 via-purple-900/60 to-slate-900 border-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.4)] ring-2 ring-purple-400'
                  : 'bg-[#101424] border-slate-800/90 hover:border-purple-500/50 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${selectedEmergency === 'stroke' ? 'bg-purple-600 text-white shadow-lg' : 'bg-purple-950/80 text-purple-400 border border-purple-800'}`}>
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white leading-tight">Stroke / Paralysis</h3>
                  <span className="text-[10px] text-purple-300 font-medium">Tap for Help</span>
                </div>
              </div>
            </button>

            {/* Card 4: Burn Injury */}
            <button
              id="chip-emergency-burn"
              onClick={() => {
                playTactileClick();
                setSelectedEmergency('burn');
              }}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden group ${
                selectedEmergency === 'burn'
                  ? 'bg-gradient-to-br from-amber-950 via-amber-900/60 to-slate-900 border-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.4)] ring-2 ring-amber-400'
                  : 'bg-[#101424] border-slate-800/90 hover:border-amber-500/50 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${selectedEmergency === 'burn' ? 'bg-amber-600 text-white shadow-lg' : 'bg-amber-950/80 text-amber-400 border border-amber-800'}`}>
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white leading-tight">Burn Injury</h3>
                  <span className="text-[10px] text-amber-300 font-medium">Tap for Help</span>
                </div>
              </div>
            </button>

            {/* Card 5: Breathing Issue */}
            <button
              id="chip-emergency-breathing"
              onClick={() => {
                playTactileClick();
                setSelectedEmergency('breathing');
              }}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden group col-span-2 sm:col-span-1 ${
                selectedEmergency === 'breathing'
                  ? 'bg-gradient-to-br from-cyan-950 via-cyan-900/60 to-slate-900 border-cyan-500 shadow-[0_0_18px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400'
                  : 'bg-[#101424] border-slate-800/90 hover:border-cyan-500/50 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${selectedEmergency === 'breathing' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-cyan-950/80 text-cyan-400 border border-cyan-800'}`}>
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white leading-tight">Breathing Issue</h3>
                  <span className="text-[10px] text-cyan-300 font-medium">Tap for Help</span>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: LIVE DISPATCH & ROUTING ENGINE (Split Screen: Map + Form) */}
        {/* ========================================================================= */}
        <section id="section-dispatch-routing-engine" className="space-y-2">
          <div className="text-center">
            <h2 className="text-xs sm:text-sm font-black text-slate-300 uppercase tracking-widest">
              2. LIVE DISPATCH &amp; ROUTING ENGINE
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#090d1a] shadow-2xl overflow-hidden">
            {/* Split Header Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-slate-800/80 text-xs font-mono font-bold tracking-wider">
              <div className="px-5 py-2.5 text-emerald-400 flex items-center justify-between bg-slate-900/40">
                <div className="flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>LEFT: LIVE MAP ROUTING</span>
                </div>
                {isNavigatingLive && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>GPS ACTIVE &bull; {speedKmh} km/h</span>
                  </span>
                )}
              </div>
              <div className="px-5 py-2.5 text-cyan-400 flex items-center gap-2 bg-slate-900/40 border-t lg:border-t-0 lg:border-l border-slate-800/80">
                <Sparkles className="w-3.5 h-3.5" />
                <span>RIGHT: PRE-ARRIVAL FORM &amp; DISPATCH</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* ========================================================= */}
              {/* LEFT HALF: LIVE MAP ROUTING */}
              {/* ========================================================= */}
              <div className="p-4 sm:p-5 flex flex-col justify-between space-y-3 border-b lg:border-b-0 lg:border-r border-slate-800/80 relative bg-[#040813]">
                {/* Map Legend Overlay & Live Controls Bar */}
                <div className="flex items-center justify-between gap-2 flex-wrap z-10">
                  <div className="flex items-center gap-2.5 text-[11px] font-mono text-slate-300 bg-slate-950/80 border border-slate-800/90 rounded-xl p-1.5 px-2.5 backdrop-blur-md">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-400/40" />
                      <span>{isNavigatingLive ? 'Ambulance (In-Transit)' : 'You (Live Location)'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-600 text-[8px] font-bold text-white flex items-center justify-center">
                        H
                      </span>
                      <span>Selected Hospital</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-cyan-400 rounded" />
                      <span>Corridor</span>
                    </div>
                  </div>

                  {isNavigatingLive && (
                    <div className="flex items-center gap-1.5">
                      {/* Audio Mute Toggle */}
                      <button
                        onClick={() => {
                          playTactileClick();
                          setIsAudioMuted(!isAudioMuted);
                        }}
                        className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                          isAudioMuted
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        }`}
                        title={isAudioMuted ? 'Unmute Guidance' : 'Mute Guidance'}
                      >
                        {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>

                      {/* Pause / Resume */}
                      <button
                        onClick={() => {
                          playTactileClick();
                          setIsNavPaused(!isNavPaused);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {isNavPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
                        <span>{isNavPaused ? 'Resume' : 'Pause'}</span>
                      </button>

                      {/* Cancel / Stop */}
                      <button
                        onClick={handleStopNavigation}
                        className="px-2 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Stop</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* ======================================================== */}
                {/* LIVE TURN-BY-TURN HUD BANNER (When Navigation is active) */}
                {/* ======================================================== */}
                {isNavigatingLive && (
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900/90 to-cyan-950/90 border border-emerald-500/50 shadow-xl space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300 z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-base shadow-md">
                          {currentTurn.icon}
                        </div>
                        <div>
                          <div className="text-xs font-black text-white leading-tight">
                            {currentTurn.instruction}
                          </div>
                          <div
                            className="text-[10px] text-emerald-300 font-mono"
                            dangerouslySetInnerHTML={{ __html: currentTurn.subtext }}
                          />
                        </div>
                      </div>

                      {/* Speed & ETA Countdown pill */}
                      <div className="text-right font-mono shrink-0 pl-2">
                        <div className="text-sm font-black text-emerald-400">
                          {formatTime(remainingSeconds)}
                        </div>
                        <div className="text-[10px] text-cyan-300">{remainingDistanceKm} km left</div>
                      </div>
                    </div>

                    {/* Green Corridor Progress Line */}
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-emerald-300 rounded-full transition-all duration-300"
                        style={{ width: `${navProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Interactive Map Visual Stage with Smooth Scalable Coordinates */}
                <div className="relative w-full h-[310px] rounded-2xl bg-[#070c1b] border border-slate-800/80 overflow-hidden shadow-inner">
                  {/* Grid Lines and Road Network Simulation */}
                  <svg className="w-full h-full absolute inset-0 opacity-85" viewBox="0 0 500 320">
                    <defs>
                      <pattern id="city-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#141c33" strokeWidth="1" />
                      </pattern>
                      {/* Glowing Route Filter */}
                      <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <filter id="glow-emergency-siren" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    <rect width="100%" height="100%" fill="url(#city-grid)" />

                    {/* Secondary City Roads */}
                    <path d="M 30 180 Q 150 140 280 200 T 480 160" fill="none" stroke="#1e293b" strokeWidth="6" />
                    <path d="M 120 40 Q 200 120 240 280" fill="none" stroke="#1e293b" strokeWidth="5" />
                    <path d="M 320 30 Q 360 160 440 290" fill="none" stroke="#1e293b" strokeWidth="5" />
                    <path d="M 80 290 Q 220 220 390 90" fill="none" stroke="#1e293b" strokeWidth="5" />

                    {/* Alternative Path to Medanta (Orange Dash) */}
                    <path
                      d="M 170 190 C 220 220, 270 240, 330 220"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      strokeDasharray="4 4"
                      opacity={selectedHospId === 'hosp-medanta' ? '0.9' : '0.4'}
                    />

                    {/* Alternative Path to Regency (Yellow Dash) */}
                    <path
                      d="M 170 190 C 140 210, 110 220, 90 200"
                      fill="none"
                      stroke="#eab308"
                      strokeWidth="3"
                      strokeDasharray="4 4"
                      opacity={selectedHospId === 'hosp-regency' ? '0.9' : '0.4'}
                    />

                    {/* Active Selected Path Element (Target for getPointAtLength) */}
                    <path
                      ref={activePathRef}
                      d={activeHospital.pathD}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth={isNavigatingLive ? '7' : '5'}
                      strokeLinecap="round"
                      strokeDasharray={isNavigatingLive ? '8 4' : '6 3'}
                      filter="url(#glow-cyan)"
                      className={isNavigatingLive ? 'animate-pulse' : ''}
                    />

                    {/* Live Traveled Green Line Path */}
                    {isNavigatingLive && (
                      <path
                        d={activeHospital.pathD}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray="500"
                        strokeDashoffset={500 * (1 - navProgress / 100)}
                        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                      />
                    )}
                  </svg>

                  {/* Marker 1: User Starting Location / Base */}
                  {!isNavigatingLive && (
                    <div className="absolute left-[140px] top-[165px] z-20 flex flex-col items-center">
                      <div className="flex items-center gap-1 bg-cyan-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-cyan-400">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        <span>You are here</span>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-cyan-500 border-2 border-white shadow-[0_0_15px_rgba(6,182,212,0.8)] mt-1" />
                      <span className="text-[9px] font-mono text-cyan-300 font-bold bg-slate-950/80 px-1 rounded mt-0.5">
                        Best Route
                      </span>
                    </div>
                  )}

                  {/* Marker 1 (Live Mode): Moving Emergency Ambulance / Vehicle with Siren Effect */}
                  {isNavigatingLive && (
                    <div
                      className="absolute z-30 transition-all duration-300 pointer-events-none"
                      style={{
                        left: `${vehiclePos.x - 20}px`,
                        top: `${vehiclePos.y - 20}px`,
                        transform: `rotate(${vehiclePos.angle}deg)`
                      }}
                    >
                      {/* Siren Flashing Beacon */}
                      <div className="relative flex items-center justify-center">
                        <span className="absolute -inset-2 rounded-full bg-red-500/40 animate-ping" />
                        <span className="absolute -inset-1 rounded-full bg-blue-500/40 animate-pulse" />
                        
                        {/* Vehicle Icon Badge */}
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-cyan-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.9)] border-2 border-white">
                          <Car className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Speed Badge Under Vehicle */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2 top-11 whitespace-nowrap bg-slate-950/90 text-emerald-400 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-500/50 shadow-md"
                        style={{ transform: `rotate(${-vehiclePos.angle}deg)` }}
                      >
                        {speedKmh} km/h
                      </div>
                    </div>
                  )}

                  {/* Marker 2: GSVM Medical College (North-East) */}
                  <div
                    onClick={() => {
                      playTactileClick();
                      setSelectedHospId('hosp-gsvm');
                      if (isNavigatingLive) {
                        handleStartNavigation('hosp-gsvm');
                      }
                    }}
                    className={`absolute right-[140px] top-[35px] z-20 cursor-pointer transform hover:scale-105 transition-transform ${
                      selectedHospId === 'hosp-gsvm' ? 'ring-2 ring-cyan-400 rounded-xl' : ''
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-slate-950/95 border border-cyan-500/80 shadow-2xl text-left text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center font-black">
                          H
                        </span>
                        <span>GSVM Medical College</span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono">2.1 km &bull; 7 min</div>
                      <div className="flex items-center gap-1 text-[10px] font-mono">
                        <span className="text-emerald-400 font-bold">&bull; 4 ICU Beds</span>
                        <span className="text-slate-400">|</span>
                        <span className="text-emerald-400 font-bold">&bull; 12 Beds</span>
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>24x7 Pharmacy</span>
                      </div>
                    </div>
                  </div>

                  {/* Marker 3: Regency Hospital (West) */}
                  <div
                    onClick={() => {
                      playTactileClick();
                      setSelectedHospId('hosp-regency');
                      if (isNavigatingLive) {
                        handleStartNavigation('hosp-regency');
                      }
                    }}
                    className={`absolute left-[30px] top-[175px] z-20 cursor-pointer transform hover:scale-105 transition-transform ${
                      selectedHospId === 'hosp-regency' ? 'ring-2 ring-yellow-400 rounded-xl' : ''
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-yellow-500/60 shadow-xl text-left text-[11px] space-y-0.5 max-w-[170px]">
                      <div className="font-bold text-slate-200 truncate">Regency Hospital</div>
                      <div className="text-[10px] text-slate-400 font-mono">3.4 km &bull; 11 min</div>
                      <div className="text-[10px] text-amber-400 font-mono">&bull; 1 ICU Bed | Low Beds</div>
                      <div className="text-[9px] text-emerald-400 font-mono">&bull; 24x7 Pharmacy</div>
                    </div>
                  </div>

                  {/* Marker 4: Medanta Hospital (South-East) */}
                  <div
                    onClick={() => {
                      playTactileClick();
                      setSelectedHospId('hosp-medanta');
                      if (isNavigatingLive) {
                        handleStartNavigation('hosp-medanta');
                      }
                    }}
                    className={`absolute right-[35px] top-[195px] z-20 cursor-pointer transform hover:scale-105 transition-transform ${
                      selectedHospId === 'hosp-medanta' ? 'ring-2 ring-amber-400 rounded-xl' : ''
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-red-500/60 shadow-xl text-left text-[11px] space-y-0.5 max-w-[170px]">
                      <div className="font-bold text-slate-200 truncate">Medanta Hospital</div>
                      <div className="text-[10px] text-slate-400 font-mono">5.6 km &bull; 16 min</div>
                      <div className="text-[10px] text-red-400 font-mono">&bull; ICU Full | 2 Beds</div>
                      <div className="text-[9px] text-emerald-400 font-mono">&bull; 24x7 Pharmacy</div>
                    </div>
                  </div>

                  {/* Zoom Controls & GPS Center */}
                  <div className="absolute right-3 bottom-3 flex flex-col gap-1 z-20">
                    <button
                      onClick={() => setMapZoom((z) => Math.min(z + 0.2, 2))}
                      className="w-7 h-7 rounded-lg bg-slate-900/90 border border-slate-700 text-white flex items-center justify-center hover:bg-slate-800 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setMapZoom((z) => Math.max(z - 0.2, 0.8))}
                      className="w-7 h-7 rounded-lg bg-slate-900/90 border border-slate-700 text-white flex items-center justify-center hover:bg-slate-800 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setMapZoom(1)}
                      className="w-7 h-7 rounded-lg bg-slate-900/90 border border-slate-700 text-cyan-400 flex items-center justify-center hover:bg-slate-800 cursor-pointer"
                      title="Recenter GPS"
                    >
                      <Crosshair className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Route Bar & Start Navigation Button */}
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl border ${isNavigatingLive ? 'bg-emerald-950 text-emerald-400 border-emerald-500 animate-pulse' : 'bg-cyan-950 text-cyan-400 border-cyan-800'}`}>
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {isNavigatingLive ? 'En-Route to' : 'Best Route to'} {activeHospital.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{activeHospital.routeRoad}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        {isNavigatingLive ? formatTime(remainingSeconds) : activeHospital.travelTime}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {isNavigatingLive ? `${remainingDistanceKm} km` : activeHospital.distance}
                      </p>
                    </div>

                    {!isNavigatingLive ? (
                      <button
                        id="btn-start-navigation-live"
                        onClick={() => handleStartNavigation()}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-emerald-600/30 uppercase tracking-wider flex items-center gap-1.5 transform hover:scale-[1.02]"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>START NAVIGATION</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setShowNavHUDModal(true)}
                          className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Full HUD</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* RIGHT HALF: PRE-ARRIVAL FORM & DISPATCH */}
              {/* ========================================================= */}
              <div className="p-4 sm:p-5 space-y-4 bg-[#090e1c] flex flex-col justify-between">
                <div className="space-y-3.5">
                  {/* Field 1: Symptom Start Time */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Symptom Start Time</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['< 30 mins', '30 mins – 2 hrs', '2 – 6 hrs', '> 6 hrs'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            playTactileClick();
                            setSymptomTime(t);
                          }}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                            symptomTime === t
                              ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Field 2: Known Allergies */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Known Allergies</span>
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                      {['None', 'Penicillin', 'Iodine', 'Latex', 'Other'].map((allergy) => {
                        const isSelected = allergies.includes(allergy);
                        return (
                          <button
                            key={allergy}
                            type="button"
                            onClick={() => toggleAllergy(allergy)}
                            className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                              isSelected
                                ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {allergy}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Two-Column Row: Patient Age & Consciousness */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Patient Age */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Patient Age</label>
                      <div className="grid grid-cols-4 gap-1">
                        {['< 1', '1–12', '13–60', '> 60'].map((age) => (
                          <button
                            key={age}
                            type="button"
                            onClick={() => {
                              playTactileClick();
                              setPatientAgeGroup(age);
                            }}
                            className={`py-1.5 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                              patientAgeGroup === age
                                ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {age}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Consciousness */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                        <Brain className="w-3.5 h-3.5 text-purple-400" />
                        <span>Consciousness</span>
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {['Alert', 'Drowsy', 'Unconscious'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              playTactileClick();
                              setConsciousness(c);
                            }}
                            className={`py-1.5 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                              consciousness === c
                                ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Field 3: Medical Red Flags (Checkboxes) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-red-400" />
                      <span>Medical Red Flags</span>
                    </label>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {Object.keys(redFlags).map((flag) => {
                        const checked = redFlags[flag];
                        return (
                          <button
                            key={flag}
                            type="button"
                            onClick={() => toggleRedFlag(flag)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                              checked
                                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                                checked ? 'bg-cyan-500 border-cyan-400 text-white' : 'border-slate-600'
                              }`}
                            >
                              {checked && <Check className="w-2.5 h-2.5" />}
                            </span>
                            <span>{flag}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Field 4: Paramedic Vitals (Quick Sync) */}
                  <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                        <span>Paramedic Vitals (Quick Sync)</span>
                      </span>

                      <button
                        type="button"
                        onClick={handleBLEConnect}
                        disabled={isSyncingBLE}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                          bleConnected
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                            : 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 hover:bg-cyan-900'
                        }`}
                      >
                        <Bluetooth className={`w-3 h-3 ${isSyncingBLE ? 'animate-spin' : ''}`} />
                        <span>{isSyncingBLE ? 'Syncing...' : bleConnected ? 'BLE Synced' : 'Connect Device'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center font-mono">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">SpO2</span>
                        <div className="text-base font-black text-cyan-400">
                          {vitals.spo2} <span className="text-[10px] text-slate-500 font-normal">%</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Pulse</span>
                        <div className="text-base font-black text-rose-400">
                          {vitals.pulse} <span className="text-[10px] text-slate-500 font-normal">bpm</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">BP</span>
                        <div className="text-base font-black text-emerald-400">
                          {vitals.bpSystolic}/{vitals.bpDiastolic}{' '}
                          <span className="text-[10px] text-slate-500 font-normal">mmHg</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Big Green Dispatch Button */}
                <button
                  id="btn-dispatch-offline-qr"
                  onClick={handleDispatchER}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)] border border-emerald-400/50 transition-all transform hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-3 text-left"
                >
                  <div className="p-2 rounded-xl bg-white/20 text-white shrink-0">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black tracking-wider uppercase">
                      DISPATCH TO ER &amp; GENERATE OFFLINE QR TOKEN
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-emerald-100 font-normal">
                      Hospital will receive your details instantly
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: LIVE REGIONAL HOSPITAL MATRIX (Real-Time Availability Table) */}
        {/* ========================================================================= */}
        <section id="section-regional-hospital-matrix" className="space-y-2">
          <div className="text-center">
            <h2 className="text-xs sm:text-sm font-black text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2">
              <span>3. LIVE REGIONAL HOSPITAL MATRIX</span>
              <span className="text-slate-400 font-normal font-sans text-xs">(Real-Time Availability)</span>
            </h2>
          </div>

          {/* High Transparency Clean Matrix Table */}
          <div className="rounded-3xl border border-slate-800 bg-[#090d1c] shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-300 font-bold">
                    <th className="py-3 px-4">Hospital Name</th>
                    <th className="py-3 px-3">Distance</th>
                    <th className="py-3 px-3 text-center" colSpan={2}>
                      General Beds
                    </th>
                    <th className="py-3 px-3 text-center" colSpan={2}>
                      ICU Beds
                    </th>
                    <th className="py-3 px-3 text-center" colSpan={2}>
                      Ventilators
                    </th>
                    <th className="py-3 px-3">24x7 Pharmacy</th>
                    <th className="py-3 px-3">On Diversion</th>
                    <th className="py-3 px-3">ER Waiting Time</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                  <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[10px] text-slate-400">
                    <th className="py-1 px-4"></th>
                    <th className="py-1 px-3"></th>
                    <th className="py-1 px-2 text-center">Total</th>
                    <th className="py-1 px-2 text-center text-emerald-400">Available</th>
                    <th className="py-1 px-2 text-center">Total</th>
                    <th className="py-1 px-2 text-center text-emerald-400">Available</th>
                    <th className="py-1 px-2 text-center">Total</th>
                    <th className="py-1 px-2 text-center text-emerald-400">Available</th>
                    <th className="py-1 px-3"></th>
                    <th className="py-1 px-3"></th>
                    <th className="py-1 px-3"></th>
                    <th className="py-1 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-sans">
                  {REGIONAL_HOSPITALS.map((hosp) => {
                    const isSelected = hosp.id === selectedHospId;
                    return (
                      <tr
                        key={hosp.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isSelected ? 'bg-cyan-950/30' : ''
                        }`}
                      >
                        {/* Hospital Name with Red Cross Icon */}
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                            H
                          </span>
                          <span className="truncate max-w-[180px]">{hosp.name}</span>
                        </td>

                        {/* Distance */}
                        <td className="py-3 px-3 text-slate-300 font-mono">{hosp.distance}</td>

                        {/* General Beds Total & Avail */}
                        <td className="py-3 px-2 text-center text-slate-400 font-mono">{hosp.generalBedsTotal}</td>
                        <td
                          className={`py-3 px-2 text-center font-black font-mono ${
                            hosp.generalBedsAvail > 10
                              ? 'text-emerald-400'
                              : hosp.generalBedsAvail > 0
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          {hosp.generalBedsAvail}
                        </td>

                        {/* ICU Beds Total & Avail */}
                        <td className="py-3 px-2 text-center text-slate-400 font-mono">{hosp.icuBedsTotal}</td>
                        <td
                          className={`py-3 px-2 text-center font-black font-mono ${
                            hosp.icuBedsAvail > 2
                              ? 'text-emerald-400'
                              : hosp.icuBedsAvail > 0
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          {hosp.icuBedsAvail}
                        </td>

                        {/* Ventilators Total & Avail */}
                        <td className="py-3 px-2 text-center text-slate-400 font-mono">{hosp.ventilatorsTotal}</td>
                        <td
                          className={`py-3 px-2 text-center font-black font-mono ${
                            hosp.ventilatorsAvail > 1
                              ? 'text-emerald-400'
                              : hosp.ventilatorsAvail > 0
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          {hosp.ventilatorsAvail}
                        </td>

                        {/* Pharmacy */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                              hosp.pharmacyOpen
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${hosp.pharmacyOpen ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            <span>{hosp.pharmacyOpen ? 'Open' : 'Closed'}</span>
                          </span>
                        </td>

                        {/* On Diversion */}
                        <td className="py-3 px-3 font-mono">
                          {hosp.onDiversion ? (
                            <span className="text-red-400 font-black">Yes</span>
                          ) : (
                            <span className="text-slate-400">No</span>
                          )}
                        </td>

                        {/* ER Waiting Time */}
                        <td
                          className={`py-3 px-3 font-mono font-bold ${
                            hosp.erWaitTime.includes('12')
                              ? 'text-emerald-400'
                              : hosp.erWaitTime === '—'
                              ? 'text-slate-500'
                              : 'text-amber-400'
                          }`}
                        >
                          {hosp.erWaitTime}
                        </td>

                        {/* Action Button */}
                        <td className="py-3 px-4 text-center">
                          {hosp.onDiversion ? (
                            <button
                              disabled
                              className="px-3 py-1 rounded-xl bg-red-600/20 text-red-400 border border-red-500/40 text-xs font-bold cursor-not-allowed"
                            >
                              On Diversion
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartNavigation(hosp.id)}
                              className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer flex items-center justify-center gap-1 mx-auto"
                            >
                              <Navigation className="w-3 h-3" />
                              <span>Navigate</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FOOTER FEATURE TRUST BADGES BAR */}
        {/* ========================================================================= */}
        <footer id="prathmikta-trust-badges" className="pt-2 pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 font-medium">
            <div className="flex items-center gap-2 p-1">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <strong className="text-slate-200 block">Ultra Low Latency</strong>
                <span>Load Time &lt; 800ms</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-slate-200 block">No Login Required</strong>
                <span>Zero Friction Access</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1">
              <Radio className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <strong className="text-slate-200 block">Works Offline</strong>
                <span>QR + Data Saved</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <strong className="text-slate-200 block">100% Secure</strong>
                <span>End-to-End Encrypted</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1">
              <Eye className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <strong className="text-slate-200 block">Accessible for All</strong>
                <span>WCAG 2.1 AAA</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1">
              <Moon className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <strong className="text-slate-200 block">Dark Mode</strong>
                <span>Panic Friendly UI</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: OFFLINE QR FAST-TRACK PASS & ER PRE-ARRIVAL ALERT */}
      {/* ========================================================================= */}
      {isQRModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/60 rounded-3xl p-6 max-w-md w-full text-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <QrCode className="w-6 h-6" />
                <h3 className="text-base font-black text-white">Emergency ER Fast-Track Token</h3>
              </div>
              <button
                onClick={() => setIsQRModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
              <div className="inline-block p-3 bg-white rounded-2xl shadow-xl">
                {/* SVG Real QR Code Simulation */}
                <svg className="w-40 h-40" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="white" />
                  {/* Position squares */}
                  <rect x="5" y="5" width="25" height="25" fill="black" />
                  <rect x="9" y="9" width="17" height="17" fill="white" />
                  <rect x="13" y="13" width="9" height="9" fill="black" />

                  <rect x="70" y="5" width="25" height="25" fill="black" />
                  <rect x="74" y="9" width="17" height="17" fill="white" />
                  <rect x="78" y="13" width="9" height="9" fill="black" />

                  <rect x="5" y="70" width="25" height="25" fill="black" />
                  <rect x="9" y="74" width="17" height="17" fill="white" />
                  <rect x="13" y="78" width="9" height="9" fill="black" />

                  {/* QR Data Pattern */}
                  <rect x="35" y="10" width="5" height="10" fill="black" />
                  <rect x="45" y="5" width="5" height="15" fill="black" />
                  <rect x="55" y="15" width="10" height="5" fill="black" />
                  <rect x="35" y="35" width="30" height="5" fill="black" />
                  <rect x="10" y="35" width="15" height="5" fill="black" />
                  <rect x="35" y="45" width="5" height="25" fill="black" />
                  <rect x="45" y="45" width="15" height="10" fill="black" />
                  <rect x="65" y="35" width="10" height="15" fill="black" />
                  <rect x="80" y="40" width="15" height="5" fill="black" />
                  <rect x="45" y="65" width="20" height="5" fill="black" />
                  <rect x="70" y="65" width="25" height="5" fill="black" />
                  <rect x="75" y="75" width="10" height="20" fill="black" />
                  <rect x="35" y="75" width="15" height="15" fill="black" />
                </svg>
              </div>

              <div className="font-mono text-xs text-slate-300">
                <span className="text-emerald-400 font-bold block text-sm">TOKEN: #PRATH-ER-8921</span>
                <span>Pre-Allocated Bed: Trauma Bay 03</span>
              </div>
            </div>

            <div className="text-xs space-y-1 text-slate-300 font-mono">
              <div>🏥 Hospital: <strong className="text-white">{activeHospital.name}</strong></div>
              <div>🚨 Condition: <strong className="text-red-400 uppercase">{selectedEmergency} Emergency</strong></div>
              <div>❤️ Vitals: SpO2 {vitals.spo2}% | HR {vitals.pulse} bpm | BP {vitals.bpSystolic}/{vitals.bpDiastolic}</div>
            </div>

            <button
              onClick={() => {
                setIsQRModalOpen(false);
                handleStartNavigation();
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Start Live Navigation to ER</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FULL-SCREEN LIVE NAVIGATION HUD & COCKPIT VIEW */}
      {/* ========================================================================= */}
      {showNavHUDModal && isNavigatingLive && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/60 rounded-3xl p-6 max-w-lg w-full text-slate-100 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Compass className="w-5 h-5 animate-spin" />
                <h3 className="text-base font-black text-white">Live Emergency Navigation HUD</h3>
              </div>
              <button
                onClick={() => setShowNavHUDModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Turn by turn header */}
            <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-cyan-600 text-white font-black text-2xl">
                {currentTurn.icon}
              </div>
              <div>
                <span className="text-xs text-cyan-300 font-mono">Current Instruction</span>
                <h4 className="text-sm font-bold text-white">{currentTurn.instruction}</h4>
                <p className="text-xs text-emerald-300 font-mono" dangerouslySetInnerHTML={{ __html: currentTurn.subtext }} />
              </div>
            </div>

            {/* Live Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Transit to {activeHospital.name}</span>
                <span className="text-emerald-400 font-bold">{Math.round(navProgress)}% Completed</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${navProgress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Remaining Time</span>
                <span className="text-base font-black text-emerald-400">
                  {formatTime(remainingSeconds)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Distance</span>
                <span className="text-base font-black text-cyan-400">
                  {remainingDistanceKm} km
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Live Speed</span>
                <span className="text-base font-black text-amber-400">
                  {speedKmh} km/h
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:108`}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Emergency 108</span>
              </a>

              <button
                onClick={() => setShowNavHUDModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Close HUD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
