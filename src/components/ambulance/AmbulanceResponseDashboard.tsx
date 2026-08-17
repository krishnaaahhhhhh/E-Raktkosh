import React, { useState, useEffect, useRef } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import {
  Activity,
  Ambulance,
  MapPin,
  Clock,
  PhoneCall,
  ChevronRight,
  ChevronDown,
  Volume2,
  VolumeX,
  Maximize2,
  Radio,
  Bell,
  CheckCircle2,
  AlertCircle,
  FileText,
  Settings,
  LayoutDashboard,
  Map as MapIcon,
  Navigation,
  Crosshair,
  Plus,
  Minus,
  Users,
  Building2,
  Package,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  X,
  Send,
  Zap
} from 'lucide-react';
import { playCodeRedAlert, playConfirmChime, playTactileClick } from '../../lib/audio';

export const AmbulanceResponseDashboard: React.FC = () => {
  const { setMode, emitAmbulanceTelemetry, isConnected, isAudioEnabled } = usePrathmikta();

  // Sidebar navigation active state
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(14);

  // Live Trip & Incident Details from UI Image 1
  const [incidentData] = useState({
    id: 'INC-2024-05-17-0012',
    pickupLocation: 'MG Road, Connaught Place',
    pickupTime: '09:12 AM',
    destination: 'Kasturba Hospital',
    destinationEta: '09:24 AM ETA',
    priority: 'High',
    caseTitle: 'Respiratory Distress',
    patientId: 'PNT-784512',
    patientGenderAge: 'Male • 56 Y',
    driverName: 'Rohit Sharma',
    paramedicName: 'Arjun Singh',
    ambulanceNumber: 'Ambulance 108',
    vehiclePlate: 'DL-108-442'
  });

  // Trip Progress State
  const [tripStage, setTripStage] = useState<'assigned' | 'en_route' | 'arrived' | 'handover'>('en_route');
  const [stretcherTriggered, setStretcherTriggered] = useState<boolean>(false);
  const [showStretcherModal, setShowStretcherModal] = useState<boolean>(false);
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [showHandoverModal, setShowHandoverModal] = useState<boolean>(false);
  const [showCamExpand, setShowCamExpand] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // Navigation Metrics
  const [turnDistance, setTurnDistance] = useState<number>(300);
  const [remainingDistKm, setRemainingDistKm] = useState<number>(5.2);
  const [etaMins, setEtaMins] = useState<number>(12);

  // Live Oscillating Telemetry Vitals
  const [vitals, setVitals] = useState({
    spo2: 98,
    pulseRate: 112,
    respRate: 20,
    systolicBp: 112,
    diastolicBp: 68
  });

  const [currentTimeStr, setCurrentTimeStr] = useState<string>('09:16:43 AM');
  const [waveOffset, setWaveOffset] = useState<number>(0);

  // Dynamic animation ticks for waveforms & GPS progression
  useEffect(() => {
    const timer = setInterval(() => {
      setWaveOffset(prev => (prev + 4) % 360);
      
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      // Slight natural fluctuations in vitals
      if (Math.random() > 0.6) {
        setVitals(prev => ({
          spo2: Math.min(99, Math.max(96, prev.spo2 + (Math.random() > 0.5 ? 1 : -1))),
          pulseRate: Math.min(118, Math.max(108, prev.pulseRate + (Math.random() > 0.5 ? 1 : -1))),
          respRate: Math.min(22, Math.max(19, prev.respRate + (Math.random() > 0.6 ? 1 : -1))),
          systolicBp: Math.min(116, Math.max(110, prev.systolicBp + (Math.random() > 0.5 ? 1 : -1))),
          diastolicBp: Math.min(72, Math.max(66, prev.diastolicBp + (Math.random() > 0.5 ? 1 : -1)))
        }));
      }
    }, 800);

    return () => clearInterval(timer);
  }, []);

  // Handle Mark Arrived & Trigger Stretcher Action
  const handleMarkArrivedAndStretcher = () => {
    playTactileClick();
    setTripStage('arrived');
    setStretcherTriggered(true);
    setShowStretcherModal(true);

    if (isAudioEnabled) {
      playCodeRedAlert();
    }

    emitAmbulanceTelemetry({
      incidentId: incidentData.id,
      patientId: incidentData.patientId,
      status: 'ARRIVED_AT_FACILITY',
      stretcherRequested: true,
      hospital: incidentData.destination,
      vitals,
      paramedic: incidentData.paramedicName,
      timestamp: new Date().toISOString()
    });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'live_map', label: 'Live Map', icon: MapIcon, badge: 'Live' },
    { id: 'trips', label: 'Trips', icon: Navigation, badge: null },
    { id: 'patients', label: 'Patients', icon: Users, badge: null },
    { id: 'telemetry', label: 'Telemetry', icon: Radio, badge: 'HD' },
    { id: 'hospitals', label: 'Hospitals', icon: Building2, badge: null },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: '3' },
    { id: 'inventory', label: 'Inventory', icon: Package, badge: null },
    { id: 'reports', label: 'Reports', icon: FileText, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null }
  ];

  return (
    <div id="ambulance-response-screen" className="w-full h-full bg-[#090d16] text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* Top Main Navigation Bar */}
      <header className="h-16 px-4 sm:px-6 bg-[#0b101b] border-b border-slate-800/80 flex items-center justify-between gap-4 z-30 shrink-0">
        {/* Left Brand & Trip Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-900/30">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-black tracking-wider text-emerald-400 block uppercase leading-none">
                Emergency
              </span>
              <span className="text-sm font-black text-white tracking-tight uppercase">
                Response
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

          {/* Hamburger Sidebar Toggle */}
          <button
            onClick={() => {
              playTactileClick();
              setIsSidebarOpen(!isSidebarOpen);
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Toggle Sidebar"
          >
            <div className="space-y-1 w-4">
              <div className="h-0.5 w-4 bg-current rounded-full"></div>
              <div className="h-0.5 w-3 bg-current rounded-full"></div>
              <div className="h-0.5 w-4 bg-current rounded-full"></div>
            </div>
          </button>

          {/* Active Trip Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="text-xs text-slate-300 font-semibold">Active Trip</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold text-emerald-400">En Route</span>
          </div>
        </div>

        {/* Right Status Controls & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Route Switcher to other portals */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                playTactileClick();
                setMode('landing');
              }}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => {
                playTactileClick();
                setMode('hospital');
              }}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              ER Hub (/h)
            </button>
            <button
              onClick={() => {
                playTactileClick();
                setMode('bloodbank');
              }}
              className="px-2.5 py-1 rounded-lg bg-red-950/60 text-red-400 border border-red-900/50 hover:bg-red-900/50 transition-colors font-semibold"
            >
              Blood Bank (/b)
            </button>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                playTactileClick();
                setShowNotifications(!showNotifications);
              }}
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-[#0b101b]">
                3
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 space-y-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Active Alerts</span>
                  <span className="text-[10px] text-emerald-400 font-mono">3 New</span>
                </div>
                <div className="text-xs space-y-2">
                  <div className="p-2 rounded-lg bg-red-950/40 border border-red-900/50 text-red-200">
                    <p className="font-semibold">Resuscitation Bay 1 Assigned</p>
                    <p className="text-[10px] text-slate-400">Kasturba Hospital trauma team standing by</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200">
                    <p className="font-semibold">Traffic Alert: Janpath Junction</p>
                    <p className="text-[10px] text-slate-400">Green corridor beacon activated (+2 mins saved)</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200">
                    <p className="font-semibold">Telemetry Synchronized</p>
                    <p className="text-[10px] text-slate-400">Vitals streaming to ER triage monitor</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Comms Online Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Comms</span>
              <span className="text-xs font-bold text-emerald-400 leading-none">Online</span>
            </div>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
            <img
              src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop&q=60"
              alt="Paramedic Arjun Singh"
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-emerald-500/50"
            />
            <div className="text-left hidden md:block">
              <span className="text-xs font-bold text-slate-100 block leading-tight">Arjun Singh</span>
              <span className="text-[10px] text-slate-400 block leading-none">Paramedic</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </div>
        </div>
      </header>

      {/* Main Body with Left Sidebar & Stage */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside
          className={`bg-[#0b101b] border-r border-slate-800/80 flex flex-col justify-between transition-all duration-200 shrink-0 ${
            isSidebarOpen ? 'w-56' : 'w-16'
          }`}
        >
          {/* Navigation Links */}
          <div className="p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    playTactileClick();
                    setActiveNav(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {isSidebarOpen && (
                    <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                  )}
                  {isSidebarOpen && item.badge && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                        item.badge === 'Live'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : item.badge === '3'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-cyan-500/20 text-cyan-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Ambulance 108 Card */}
          {isSidebarOpen ? (
            <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
              <div className="p-3 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white tracking-wide">Ambulance 108</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    Online
                  </span>
                </div>

                {/* Ambulance Graphic */}
                <div className="py-2 flex items-center justify-center">
                  <div className="relative w-full h-14 bg-slate-800/40 rounded-xl flex items-center justify-center border border-slate-700/40 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <Ambulance className="w-8 h-8 text-red-500 drop-shadow-md animate-bounce" />
                      <div className="text-left">
                        <span className="text-[10px] font-mono text-slate-300 block font-bold">ALS UNIT 04</span>
                        <span className="text-[9px] text-emerald-400 font-mono">108 DEL-NCR</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] space-y-1 pt-1 text-slate-400 border-t border-slate-800/60">
                  <div className="flex justify-between">
                    <span>Driver</span>
                    <span className="text-slate-200 font-semibold">{incidentData.driverName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paramedic</span>
                    <span className="text-slate-200 font-semibold">{incidentData.paramedicName}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 border-t border-slate-800 flex justify-center">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
                <Ambulance className="w-5 h-5" />
              </div>
            </div>
          )}
        </aside>

        {/* Main Stage & Telemetry Panel */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-[#070a12]">
          {/* Top Incident Summary Bar */}
          <div className="px-6 py-3.5 bg-[#0d1322] border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 items-center">
            {/* 1. INCIDENT ID */}
            <div className="border-r border-slate-800/60 pr-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Incident ID
              </span>
              <span className="text-xs font-black text-white font-mono">{incidentData.id}</span>
            </div>

            {/* 2. PICKUP LOCATION */}
            <div className="border-r border-slate-800/60 pr-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>Pickup Location</span>
              </span>
              <span className="text-xs font-bold text-white block truncate">{incidentData.pickupLocation}</span>
              <span className="text-[10px] text-slate-400">{incidentData.pickupTime}</span>
            </div>

            {/* 3. DESTINATION */}
            <div className="border-r border-slate-800/60 pr-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                <Building2 className="w-3 h-3 text-red-400" />
                <span>Destination</span>
              </span>
              <span className="text-xs font-bold text-white block truncate">{incidentData.destination}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">{incidentData.destinationEta}</span>
            </div>

            {/* 4. PRIORITY */}
            <div className="border-r border-slate-800/60 pr-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Priority
              </span>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-black uppercase bg-red-950/80 text-red-400 border border-red-600/50 shadow-sm">
                High
              </span>
            </div>

            {/* 5. CASE */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Case
              </span>
              <span className="text-xs font-bold text-white truncate block">{incidentData.caseTitle}</span>
            </div>
          </div>

          {/* Grid Layout: Navigation Map & Video (Left) vs Telemetry & Actions (Right) */}
          <div className="flex-1 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
            {/* Left Column: GPS Navigation HUD & Bottom Feeds (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Interactive Vector GPS Navigation HUD Map */}
              <div className="flex-1 min-h-[380px] bg-[#0c1220] rounded-3xl border border-slate-800/90 relative overflow-hidden shadow-2xl flex flex-col">
                {/* SVG Vector Map Canvas Simulation (Dark Carto Style with Neon Route) */}
                <div className="absolute inset-0 bg-[#090e1a]">
                  <svg className="w-full h-full object-cover opacity-90" viewBox="0 0 800 500">
                    {/* Grid streets & buildings background */}
                    <defs>
                      <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#141e33" strokeWidth="0.8" />
                      </pattern>
                      <linearGradient id="neon-route-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#059669" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Base terrain */}
                    <rect width="800" height="500" fill="#090e1a" />
                    <rect width="800" height="500" fill="url(#grid-pattern)" />

                    {/* Major City Roads */}
                    <path d="M 50 120 Q 250 140 450 110 T 750 130" stroke="#1e293b" strokeWidth="14" fill="none" />
                    <path d="M 120 40 L 140 460" stroke="#1e293b" strokeWidth="12" fill="none" />
                    <path d="M 380 40 L 400 460" stroke="#1e293b" strokeWidth="16" fill="none" />
                    <path d="M 50 340 Q 300 320 750 360" stroke="#1e293b" strokeWidth="14" fill="none" />
                    <path d="M 620 40 L 600 460" stroke="#1e293b" strokeWidth="10" fill="none" />

                    {/* Street Labels */}
                    <text x="370" y="130" fill="#475569" fontSize="11" fontWeight="bold" fontFamily="sans-serif">MG Road</text>
                    <text x="410" y="270" fill="#475569" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Barakhamba Road</text>
                    <text x="210" y="290" fill="#475569" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Janpath</text>
                    <text x="610" y="240" fill="#334155" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Tolstoy Marg</text>
                    <text x="220" y="370" fill="#334155" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Connaught Place</text>
                    <text x="560" y="360" fill="#334155" fontSize="16" fontWeight="bold" fontFamily="sans-serif">New Delhi</text>

                    {/* Metro Station icon */}
                    <rect x="290" y="300" width="16" height="16" rx="3" fill="#0284c7" />
                    <text x="294" y="312" fill="#ffffff" fontSize="10" fontWeight="black" fontFamily="sans-serif">M</text>
                    <text x="312" y="312" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Ashok Nagar Metro</text>

                    {/* ACTIVE EMERGENCY ROUTE (Glowing Green Path from Pickup to Kasturba Hospital) */}
                    <path
                      d="M 325 125 L 340 160 Q 370 200 420 220 L 460 270 L 460 360 L 430 400"
                      stroke="#059669"
                      strokeWidth="10"
                      fill="none"
                      opacity="0.4"
                    />
                    <path
                      d="M 325 125 L 340 160 Q 370 200 420 220 L 460 270 L 460 360 L 430 400"
                      stroke="url(#neon-route-grad)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      filter="url(#route-glow)"
                    />

                    {/* Pickup Ambulance Marker Pin (Animated Pulse) */}
                    <g transform="translate(325, 125)">
                      <circle r="16" fill="#10b981" opacity="0.3">
                        <animate attributeName="r" values="12;22;12" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle r="9" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                      <circle r="3" fill="#ffffff" />
                    </g>

                    {/* Destination Hospital Pin */}
                    <g transform="translate(430, 400)">
                      <path d="M 0 -22 C -9 -22 -14 -14 -14 -5 C -14 6 0 20 0 20 C 0 20 14 6 14 -5 C 14 -14 9 -22 0 -22 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                      <text x="-4" y="-8" fill="#ffffff" fontSize="10" fontWeight="black" fontFamily="sans-serif">H</text>
                      <text x="18" y="-4" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Kasturba Hospital</text>
                    </g>
                  </svg>
                </div>

                {/* Top-Left Turn-by-Turn Navigation HUD Card */}
                <div className="absolute top-4 left-4 z-10 w-72 bg-slate-950/85 backdrop-blur-md border border-slate-700/60 rounded-2xl p-3.5 shadow-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <ChevronRight className="w-6 h-6 transform rotate-[-45deg]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-white font-mono">{turnDistance} m</span>
                        <button
                          onClick={() => {
                            playTactileClick();
                            setIsAudioMuted(!isAudioMuted);
                          }}
                          className="p-1 text-slate-400 hover:text-white"
                          title="Toggle Navigation Voice"
                        >
                          {isAudioMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                        </button>
                      </div>
                      <p className="text-xs font-bold text-slate-200 mt-0.5">Turn right onto MG Road</p>
                    </div>
                  </div>

                  {/* Secondary Next Turn Instruction */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="text-slate-500 font-bold uppercase text-[9px]">Then</span>
                    <span className="text-slate-300 font-semibold">1.2 km</span>
                    <span className="truncate">Turn left onto Janpath Road</span>
                  </div>
                </div>

                {/* Bottom-Left ETA & Distance Floating HUD Box */}
                <div className="absolute bottom-4 left-4 z-10 flex gap-2">
                  <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/60 rounded-2xl px-4 py-2.5 shadow-xl">
                    <span className="text-lg font-black text-white block leading-none font-mono">12 min</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">ETA 09:24 AM</span>
                  </div>
                  <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/60 rounded-2xl px-4 py-2.5 shadow-xl">
                    <span className="text-lg font-black text-white block leading-none font-mono">5.2 km</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Remaining Distance</span>
                  </div>
                </div>

                {/* Right Floating Map Controls */}
                <div className="absolute right-4 bottom-4 z-10 flex flex-col gap-2">
                  <button
                    onClick={() => playTactileClick()}
                    className="w-9 h-9 rounded-xl bg-slate-950/85 backdrop-blur border border-slate-700/60 text-slate-300 hover:text-white flex items-center justify-center shadow-lg cursor-pointer"
                    title="Recenter GPS Location"
                  >
                    <Crosshair className="w-4 h-4 text-emerald-400" />
                  </button>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setZoomLevel(prev => Math.min(18, prev + 1));
                    }}
                    className="w-9 h-9 rounded-xl bg-slate-950/85 backdrop-blur border border-slate-700/60 text-slate-300 hover:text-white flex items-center justify-center shadow-lg cursor-pointer"
                    title="Zoom In"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setZoomLevel(prev => Math.max(10, prev - 1));
                    }}
                    className="w-9 h-9 rounded-xl bg-slate-950/85 backdrop-blur border border-slate-700/60 text-slate-300 hover:text-white flex items-center justify-center shadow-lg cursor-pointer"
                    title="Zoom Out"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom Feeds: Trip Progress (Left) + Dashcam Live Feed (Right) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Trip Progress Bar (7 Cols) */}
                <div className="sm:col-span-6 bg-[#0c1220] rounded-2xl border border-slate-800/80 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Trip Progress</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">STAGE 2 / 4</span>
                  </div>

                  {/* 4 Step Stepper */}
                  <div className="relative flex items-center justify-between pt-2">
                    {/* Connecting Green Progress Line */}
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-800 -z-0">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{
                          width: tripStage === 'assigned' ? '0%' : tripStage === 'en_route' ? '40%' : tripStage === 'arrived' ? '75%' : '100%'
                        }}
                      ></div>
                    </div>

                    {/* Step 1: Assigned */}
                    <div className="flex flex-col items-center z-10">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-200 mt-1.5">Assigned</span>
                      <span className="text-[9px] text-slate-500">09:05 AM</span>
                    </div>

                    {/* Step 2: En Route */}
                    <div className="flex flex-col items-center z-10">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center ring-4 ring-emerald-500/20 shadow-md shadow-emerald-500/40">
                        <Navigation className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 mt-1.5">En Route</span>
                      <span className="text-[9px] text-slate-400">09:07 AM</span>
                    </div>

                    {/* Step 3: Arrived */}
                    <div className="flex flex-col items-center z-10">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                          tripStage === 'arrived' || tripStage === 'handover'
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-900 border-slate-700 text-slate-600'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 mt-1.5">Arrived</span>
                      <span className="text-[9px] text-slate-600">{tripStage === 'arrived' ? '09:24 AM' : '—'}</span>
                    </div>

                    {/* Step 4: Handover */}
                    <div className="flex flex-col items-center z-10">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                          tripStage === 'handover'
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-900 border-slate-700 text-slate-600'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 mt-1.5">Handover</span>
                      <span className="text-[9px] text-slate-600">—</span>
                    </div>
                  </div>
                </div>

                {/* Dashcam Live Feed (5 Cols) */}
                <div className="sm:col-span-6 bg-[#0c1220] rounded-2xl border border-slate-800/80 p-3 flex flex-col relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2 z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Live Feed</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        CAM 1
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        playTactileClick();
                        setShowCamExpand(!showCamExpand);
                      }}
                      className="text-slate-400 hover:text-white"
                      title="Expand Feed"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Real Highway Traffic Dashcam Simulation */}
                  <div className="flex-1 min-h-[90px] rounded-xl relative overflow-hidden bg-slate-950 flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop&q=60"
                      alt="Ambulance Live Dashcam View"
                      className="w-full h-full object-cover opacity-80 filter contrast-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30 pointer-events-none"></div>

                    {/* HUD Camera telemetry watermark */}
                    <div className="absolute bottom-1.5 left-2 text-[9px] font-mono text-emerald-400 font-bold bg-black/60 px-1.5 py-0.5 rounded">
                      SPEED: 58 KM/H &bull; REC 00:07:42
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Patient Telemetry, Actions & Notes (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Patient Telemetry Card */}
              <div className="bg-[#0c1220] rounded-3xl border border-slate-800/90 p-5 shadow-2xl flex flex-col gap-4">
                {/* Telemetry Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Patient Telemetry</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      Live
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-300">Patient ID {incidentData.patientId}</span>
                    <span className="text-[10px] text-slate-400 block font-medium">{incidentData.patientGenderAge}</span>
                  </div>
                </div>

                {/* 4 Live Vitals Cards with Animated Waveforms */}
                <div className="grid grid-cols-2 gap-3">
                  {/* 1. SpO2 Card */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">SpO₂</span>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Normal
                      </span>
                    </div>

                    <div className="my-1 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-emerald-400 font-mono">{vitals.spo2}</span>
                      <span className="text-xs text-slate-400 font-bold">%</span>
                    </div>

                    {/* Waveform SVG */}
                    <div className="h-8 w-full overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <path
                          d={`M 0 15 Q 15 ${10 + Math.sin(waveOffset * 0.05) * 5} 30 15 T 60 15 T 90 15 T 100 15`}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>

                    <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                      <span>90-100%</span>
                    </div>
                  </div>

                  {/* 2. Pulse Rate Card (Red Alert / Tachycardia) */}
                  <div className="bg-slate-950/70 border border-red-950/60 rounded-2xl p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">Pulse Rate</span>
                      <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                        Tachycardia
                      </span>
                    </div>

                    <div className="my-1 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-red-400 font-mono">{vitals.pulseRate}</span>
                      <span className="text-xs text-slate-400 font-bold">bpm</span>
                    </div>

                    {/* ECG QRS Waveform SVG */}
                    <div className="h-8 w-full overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <path
                          d="M 0 15 L 20 15 L 25 18 L 30 3 L 35 27 L 40 15 L 50 15 L 60 15 L 65 18 L 70 3 L 75 27 L 80 15 L 100 15"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>

                    <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                      <span>60-100 bpm</span>
                    </div>
                  </div>

                  {/* 3. Resp Rate Card */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">Resp Rate</span>
                      <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        Normal
                      </span>
                    </div>

                    <div className="my-1 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-cyan-400 font-mono">{vitals.respRate}</span>
                      <span className="text-xs text-slate-400 font-bold">/min</span>
                    </div>

                    {/* Sine Waveform */}
                    <div className="h-8 w-full overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <path
                          d="M 0 15 Q 12 5 25 15 T 50 15 T 75 15 T 100 15"
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>

                    <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                      <span>12-20 /min</span>
                    </div>
                  </div>

                  {/* 4. Blood Pressure Card */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">BP</span>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Normal
                      </span>
                    </div>

                    <div className="my-1 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-rose-400 font-mono">
                        {vitals.systolicBp}/{vitals.diastolicBp}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">mmHg</span>
                    </div>

                    {/* Arterial Pulse Waveform */}
                    <div className="h-8 w-full overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <path
                          d="M 0 18 Q 8 6 16 12 Q 22 22 30 18 Q 38 6 46 12 Q 52 22 60 18 Q 68 6 76 12 Q 82 22 90 18 T 100 18"
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>

                    <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                      <span>90/60-120/80</span>
                    </div>
                  </div>
                </div>

                {/* Telemetry Footer Info */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Last Updated: {currentTimeStr}</span>
                  <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <span className="flex gap-0.5 items-end h-3">
                      <span className="w-0.5 h-1 bg-emerald-400"></span>
                      <span className="w-0.5 h-2 bg-emerald-400"></span>
                      <span className="w-0.5 h-3 bg-emerald-400"></span>
                    </span>
                    Strong
                  </span>
                </div>
              </div>

              {/* ACTIONS PANEL */}
              <div className="bg-[#0c1220] rounded-3xl border border-slate-800/90 p-5 shadow-2xl flex flex-col gap-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Actions</span>

                {/* BIG CRIMSON BUTTON: MARK ARRIVED & TRIGGER STRETCHER */}
                <button
                  id="btn-mark-arrived-stretcher"
                  onClick={handleMarkArrivedAndStretcher}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-between transition-all shadow-xl cursor-pointer ${
                    stretcherTriggered
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white shadow-red-600/40 animate-pulse'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/20">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="block leading-tight uppercase font-black tracking-wide">
                        {stretcherTriggered ? 'STRETCHER TEAM DEPLOYED' : 'MARK ARRIVED & TRIGGER STRETCHER'}
                      </span>
                      <span className="text-[10px] text-red-100 font-medium block">
                        Preps Resus Bay 1 at Kasturba Hospital
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Secondary Action Buttons (Contact Hospital | Patient Handover) */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => {
                      playTactileClick();
                      setShowCallModal(true);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 text-cyan-400" />
                    <span>Contact Hospital</span>
                  </button>

                  <button
                    onClick={() => {
                      playTactileClick();
                      setShowHandoverModal(true);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Patient Handover</span>
                  </button>
                </div>
              </div>

              {/* NOTES SECTION */}
              <div className="bg-[#0c1220] rounded-3xl border border-slate-800/90 p-5 shadow-2xl flex flex-col justify-between flex-1 min-h-[120px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Notes</span>
                  <span className="text-[10px] text-slate-400 font-mono">09:10 AM &bull; {incidentData.paramedicName}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  "Patient experiencing difficulty in breathing since morning. On oxygen support via non-rebreather mask (4 LPM). Sublingual nitrate administered."
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Stretcher Deployment Confirmation Modal */}
      {showStretcherModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1322] border border-red-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150 text-center">
            <div className="w-16 h-16 rounded-3xl bg-red-600/20 border border-red-500 text-red-400 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 animate-bounce" />
            </div>

            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              STRETCHER TEAM DISPATCHED
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Kasturba Hospital Emergency Triage Desk has received your arrival beacon.
              <br />
              <strong className="text-emerald-400">Resuscitation Bay 1 Prepped.</strong> Trauma lead Dr. Vivek Mehra and staff nurse notified for immediate bedside transfer.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-slate-950 text-left text-xs font-mono space-y-1 text-slate-400 border border-slate-800">
              <div className="flex justify-between">
                <span>Incident:</span>
                <span className="text-white font-bold">{incidentData.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Patient ID:</span>
                <span className="text-white font-bold">{incidentData.patientId}</span>
              </div>
              <div className="flex justify-between">
                <span>Assigned Bed:</span>
                <span className="text-emerald-400 font-bold">Trauma Resus Bay 1</span>
              </div>
            </div>

            <button
              onClick={() => {
                playTactileClick();
                setShowStretcherModal(false);
              }}
              className="mt-6 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Acknowledge &amp; Open Handover Sheet
            </button>
          </div>
        </div>
      )}

      {/* Contact Hospital Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1322] border border-cyan-500/50 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500 text-cyan-400 flex items-center justify-center mx-auto mb-3">
              <PhoneCall className="w-7 h-7 animate-pulse" />
            </div>

            <h3 className="text-base font-black text-white">Direct ER Hotline Connected</h3>
            <p className="text-xs text-slate-400 mt-1">Kasturba Hospital Emergency Triage Line</p>

            <div className="my-4 py-3 px-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-sm text-cyan-300 font-bold">
              +91 11-2323-9000 &bull; EXT 108
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  playTactileClick();
                  setShowCallModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                End Comms
              </button>
              <a
                href="tel:108"
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Dial 108</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Patient Handover Sheet Modal */}
      {showHandoverModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1322] border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white uppercase">ABDM Digital Clinical Handover</h3>
              </div>
              <button onClick={() => setShowHandoverModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <p className="text-slate-400 font-mono">Patient: <strong className="text-white">PNT-784512 (56Y, Male)</strong></p>
                <p className="text-slate-400 font-mono">Chief Complaint: <strong className="text-white">Acute Respiratory Distress</strong></p>
                <p className="text-slate-400 font-mono">Current Vitals: <strong className="text-emerald-400">SpO2 98%, PR 112, BP 112/68</strong></p>
                <p className="text-slate-400 font-mono">Administered Meds: <strong className="text-white">O2 @ 4LPM, Sublingual Nitrate</strong></p>
              </div>
            </div>

            <button
              onClick={() => {
                playTactileClick();
                setTripStage('handover');
                setShowHandoverModal(false);
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase"
            >
              Sign &amp; Complete Handover
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
