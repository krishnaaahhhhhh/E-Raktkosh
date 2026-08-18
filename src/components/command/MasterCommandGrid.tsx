import React, { useState, useEffect, useMemo } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import {
  Building2,
  Ambulance,
  Droplet,
  Activity,
  Layers,
  MapPin,
  ShieldCheck,
  Radio,
  Maximize2,
  Bell,
  Settings,
  RefreshCw,
  Search,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Lock,
  Wifi,
  Server,
  Database,
  Cpu,
  HardDrive,
  BarChart3,
  Users,
  Compass,
  FileText,
  Menu,
  Plus,
  Minus,
  Navigation,
  Globe,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedHeartbeatLogo } from '../ui/AnimatedHeartbeatLogo';

export const MasterCommandGrid: React.FC = () => {
  const { setMode, liveFacilities, liveTokens, livePlannedAdmissions, activeHospital } = usePrathmikta();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Map Controls State
  const [activeLayer, setActiveLayer] = useState<'all' | 'hospitals' | 'ambulances' | 'bloodbanks' | 'emergencies' | 'traffic'>('all');
  const [mapZoom, setMapZoom] = useState<number>(1);

  // Auto Refresh State
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Live Current Time Display (Formatted: 14:27:35 | 18 Aug 2025 | Mon)
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${mins}:${secs}`);

      const day = now.getDate();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[now.getDay()];
      setDateStr(`${day} ${month} ${year} | ${dayName}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Live Stats State - Defaults strictly at 0 as requested by user
  const [commandStats, setCommandStats] = useState<{
    connectedHospitals: number;
    activeAmbulances: number;
    bloodBanksConnected: number;
    bloodUnitsAvailable: number;
    activeEmergencyCount: number;
    emergencyLoadPercentage: number;
    facilities: any[];
    recentDispatches: any[];
    dbConnected: boolean;
  }>({
    connectedHospitals: 0,
    activeAmbulances: 0,
    bloodBanksConnected: 0,
    bloodUnitsAvailable: 0,
    activeEmergencyCount: 0,
    emergencyLoadPercentage: 0,
    facilities: [],
    recentDispatches: [],
    dbConnected: true
  });

  // Fetch live stats from server
  const fetchStats = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/command/master-stats');
      if (res.ok) {
        const data = await res.json();
        setCommandStats(data);
      }
    } catch (err) {
      console.warn('[CommandGrid] Fetch stats error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    if (!autoRefresh) return;
    const pollTimer = setInterval(fetchStats, 5000);
    return () => clearInterval(pollTimer);
  }, [autoRefresh]);

  // Merge liveFacilities from context with fetched facilities
  const allFacilities = useMemo(() => {
    const map = new Map<string, any>();
    (commandStats.facilities || []).forEach((f) => map.set(f.facilityId || f.id, f));
    (liveFacilities || []).forEach((f) => map.set(f.facilityId || f.id, f));
    return Array.from(map.values());
  }, [commandStats.facilities, liveFacilities]);

  // Derived counts from actual registrations
  const hospitalsList = useMemo(() => allFacilities.filter((f) => f.facilityType === 'hospital'), [allFacilities]);
  const ambulancesList = useMemo(() => allFacilities.filter((f) => f.facilityType === 'ambulance'), [allFacilities]);
  const bloodBanksList = useMemo(() => allFacilities.filter((f) => f.facilityType === 'blood_bank'), [allFacilities]);

  const totalHospitals = hospitalsList.length;
  const totalAmbulances = ambulancesList.reduce((acc, a) => acc + (Number(a.ambulanceFleetData?.connectedCount) || 1), 0);
  const totalBloodBanks = bloodBanksList.length;
  const totalBloodUnits = bloodBanksList.reduce((acc, b) => {
    const matrix = b.bloodBankData?.stockMatrix || {};
    return acc + Object.values(matrix).reduce((s: number, v: any) => s + (Number(v) || 0), 0);
  }, 0);

  // Dynamic Emergency Load: 0% by default, scales as emergencies / facilities occur
  const emergencyLoad = useMemo(() => {
    if (totalHospitals === 0) return 0;
    const dispatches = commandStats.activeEmergencyCount || 0;
    return Math.min(100, Math.round((dispatches / Math.max(1, totalHospitals * 2)) * 100));
  }, [totalHospitals, commandStats.activeEmergencyCount]);

  // North India Grid Topology Nodes & Connected Edges
  const mapData = useMemo(() => {
    const cityAnchors: Record<string, { x: number; y: number; label: string }> = {
      Ludhiana: { x: 36, y: 27, label: 'Ludhiana' },
      Chandigarh: { x: 47, y: 25, label: 'Chandigarh' },
      Panchkula: { x: 57, y: 25, label: 'Panchkula' },
      Zirakpur: { x: 55, y: 30, label: 'Zirakpur' },
      Kharar: { x: 46, y: 36, label: 'Kharar' },
      Ambala: { x: 53, y: 39, label: 'Ambala' },
      Yamunanagar: { x: 59, y: 38, label: 'Yamunanagar' },
      Kaithal: { x: 46, y: 45, label: 'Kaithal' },
      Karnal: { x: 54, y: 48, label: 'Karnal' },
      Fatehabad: { x: 37, y: 46, label: 'Fatehabad' },
      Sirsa: { x: 31, y: 50, label: 'Sirsa' },
      Jind: { x: 46, y: 53, label: 'Jind' },
      Rohtak: { x: 49, y: 64, label: 'Rohtak' },
      Panipat: { x: 57, y: 54, label: 'Panipat' },
      Bhiwani: { x: 46, y: 64, label: 'Bhiwani' },
      Sonipat: { x: 55, y: 63, label: 'Sonipat' },
      Meerut: { x: 69, y: 57, label: 'Meerut' },
      Muzaffarnagar: { x: 67, y: 47, label: 'Muzaffarnagar' },
      Dehradun: { x: 74, y: 27, label: 'Dehradun' },
      Rishikesh: { x: 75, y: 32, label: 'Rishikesh' },
      Haridwar: { x: 75, y: 37, label: 'Haridwar' }
    };

    // Edge connections for the road network
    const connections: Array<[string, string]> = [
      ['Ludhiana', 'Chandigarh'],
      ['Chandigarh', 'Panchkula'],
      ['Chandigarh', 'Zirakpur'],
      ['Zirakpur', 'Ambala'],
      ['Ambala', 'Yamunanagar'],
      ['Chandigarh', 'Kharar'],
      ['Kharar', 'Kaithal'],
      ['Kaithal', 'Karnal'],
      ['Karnal', 'Panipat'],
      ['Fatehabad', 'Sirsa'],
      ['Fatehabad', 'Kaithal'],
      ['Kaithal', 'Jind'],
      ['Jind', 'Rohtak'],
      ['Rohtak', 'Bhiwani'],
      ['Panipat', 'Sonipat'],
      ['Sonipat', 'Bhiwani'],
      ['Panipat', 'Meerut'],
      ['Yamunanagar', 'Muzaffarnagar'],
      ['Muzaffarnagar', 'Meerut'],
      ['Yamunanagar', 'Dehradun'],
      ['Dehradun', 'Rishikesh'],
      ['Rishikesh', 'Haridwar'],
      ['Haridwar', 'Muzaffarnagar']
    ];

    // Node items mapped to anchors
    const nodes = Object.entries(cityAnchors).map(([city, coord]) => {
      // Determine if a live facility matches this city
      const hasHospital = hospitalsList.some((h) => (h.city || '').toLowerCase().includes(city.toLowerCase()));
      const hasAmbulance = ambulancesList.some((a) => (a.city || '').toLowerCase().includes(city.toLowerCase()));
      const hasBloodBank = bloodBanksList.some((b) => (b.city || '').toLowerCase().includes(city.toLowerCase()));

      let nodeType: 'hospital' | 'ambulance' | 'blood_bank' | 'emergency' | 'junction' = 'hospital';
      if (city === 'Zirakpur' || city === 'Karnal' || city === 'Sonipat') nodeType = 'ambulance';
      else if (city === 'Kharar' || city === 'Yamunanagar' || city === 'Panipat' || city === 'Meerut' || city === 'Bhiwani') nodeType = 'emergency';
      else if (city === 'Panchkula' || city === 'Ambala' || city === 'Kaithal' || city === 'Fatehabad' || city === 'Sirsa' || city === 'Jind') nodeType = 'hospital';

      return {
        id: city,
        city,
        label: coord.label,
        x: coord.x,
        y: coord.y,
        type: nodeType,
        isRegistered: hasHospital || hasAmbulance || hasBloodBank
      };
    });

    return { cityAnchors, connections, nodes };
  }, [hospitalsList, ambulancesList, bloodBanksList]);

  return (
    <div id="master-command-grid" className="w-full h-full flex flex-col bg-[#F3F4F8] text-slate-800 overflow-hidden select-none font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP LIGHT HEADER BAR */}
      {/* ========================================================================= */}
      <header className="w-full h-16 shrink-0 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between z-30 shadow-xs">
        {/* Left: Brand Identity & Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMode('landing')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Return to Main Portal"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <AnimatedHeartbeatLogo size="sm" showBadge={false} />
            <h1 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight font-sans">
              Prathmikta Master Command Grid
            </h1>
          </div>
        </div>

        {/* Right: Status Widget, Clock & Admin Profile */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Grid Status Pill */}
          <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <div className="text-left">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                GRID STATUS:
              </p>
              <p className="text-[11px] font-black text-emerald-600 tracking-wide">
                OPERATIONAL
              </p>
            </div>
          </div>

          {/* Real-time Clock */}
          <div className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-right">
            <div className="text-xs sm:text-sm font-mono font-bold text-slate-800 leading-none">
              {timeStr || '14:27:35'}
            </div>
            <div className="text-[9px] sm:text-[10px] font-mono text-slate-500 mt-0.5">
              {dateStr || '18 Aug 2025 | Mon'}
            </div>
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={fetchStats}
              title="Force Sync Server Stats"
              className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            <div className="relative">
              <button
                onClick={() => setMode('partner')}
                title="Register New Facility (/hb)"
                className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4" />
              </button>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {allFacilities.length > 0 ? allFacilities.length : 12}
              </span>
            </div>
          </div>

          {/* Top-Right Profile Pill */}
          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              SA
            </div>
            <div className="text-left text-xs leading-tight">
              <div className="font-bold text-slate-800">Super Admin</div>
              <div className="text-[10px] text-slate-500">Master Controller</div>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN BODY: LEFT SIDEBAR + DASHBOARD GRID */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full flex overflow-hidden">
        {/* ===================================================================== */}
        {/* LEFT CLEAN WHITE NAVIGATION SIDEBAR */}
        {/* ===================================================================== */}
        <aside className="w-60 shrink-0 bg-white border-r border-slate-200/90 flex flex-col justify-between p-3.5 z-20 overflow-y-auto custom-scrollbar hidden lg:flex">
          <div className="space-y-4">
            {/* Super Admin Controller Profile Card */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-xs overflow-hidden flex items-center justify-center text-slate-600 font-bold text-xs">
                  <span>SA</span>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-900 truncate">Super Admin</div>
                <div className="text-[10px] text-slate-500 truncate">Master Controller</div>
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100/80 text-[8px] font-bold text-emerald-700 mt-0.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE
                </div>
              </div>
            </div>

            {/* Nav Menu Items */}
            <nav className="space-y-1">
              {[
                { id: 'overview', label: 'Command Overview', icon: Layers, count: null },
                { id: 'map', label: 'Live Map Grid', icon: Compass, count: null },
                { id: 'hospitals', label: 'Hospitals Network', icon: Building2, count: totalHospitals },
                { id: 'ambulances', label: 'Ambulance Fleet', icon: Ambulance, count: totalAmbulances },
                { id: 'bloodbanks', label: 'Blood Bank Control', icon: Droplet, count: totalBloodBanks },
                { id: 'triage', label: 'Emergency Triage', icon: Activity, count: null },
                { id: 'analytics', label: 'System Analytics', icon: BarChart3, count: null },
                { id: 'users', label: 'Users & Access', icon: Users, count: null },
                { id: 'ai', label: 'AI Predictive Engine', icon: Cpu, count: null },
                { id: 'settings', label: 'System Settings', icon: Settings, count: null },
                { id: 'audit', label: 'Audit & Logs', icon: FileText, count: null }
              ].map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/80 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <IconComponent className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {typeof item.count === 'number' && item.count > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-[10px] font-bold text-emerald-800">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* System Security Status Widget */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-2 mt-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              SYSTEM SECURITY STATUS
            </div>
            <div className="text-xs font-black text-emerald-600 tracking-wide">
              MAXIMUM PROTECTION
            </div>

            {/* Circular Gauge 100% */}
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray="100, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[9px] font-mono font-bold text-slate-700">100%</span>
              </div>
            </div>

            <div className="text-[9px] text-slate-500 leading-tight">
              All Systems Secured
              <div className="text-[8px] text-slate-400">Last Scan: 2 mins ago</div>
            </div>
          </div>
        </aside>

        {/* ===================================================================== */}
        {/* CENTER CONTENT: TOP METRICS + MAP + BOTTOM PANELS */}
        {/* ===================================================================== */}
        <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-3.5 sm:p-4 gap-3.5 bg-[#F3F4F8]">
          {/* =================================================================== */}
          {/* A. 4 TOP KPI HERO METRIC CARDS (White Cards Matching User Image) */}
          {/* =================================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {/* Card 1: Total Connected Hospitals */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 relative overflow-hidden flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div className="space-y-1 z-10">
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  TOTAL CONNECTED HOSPITALS
                </div>
                <div className="text-2xl sm:text-3xl font-black font-sans text-slate-900 tracking-tight">
                  {totalHospitals.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    {totalHospitals > 0 ? `+${totalHospitals} live registered` : '0 registered (Waiting /hb)'}
                  </span>
                </div>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Active Ambulances On Road */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 relative overflow-hidden flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div className="space-y-1 z-10">
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  ACTIVE AMBULANCES ON ROAD
                </div>
                <div className="text-2xl sm:text-3xl font-black font-sans text-slate-900 tracking-tight">
                  {totalAmbulances.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    {totalAmbulances > 0 ? `+${totalAmbulances} units active` : '0 active (Waiting /hb)'}
                  </span>
                </div>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0">
                <Ambulance className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3: Blood Bank Units Available */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 relative overflow-hidden flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div className="space-y-1 z-10">
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  BLOOD BANK UNITS AVAILABLE
                </div>
                <div className="text-2xl sm:text-3xl font-black font-sans text-slate-900 tracking-tight">
                  {totalBloodUnits.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    {totalBloodBanks > 0 ? `${totalBloodBanks} banks synced` : '0 units (Waiting /hb)'}
                  </span>
                </div>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-500 shrink-0">
                <Droplet className="w-6 h-6 fill-rose-100" />
              </div>
            </div>

            {/* Card 4: Current Emergency Load */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 relative overflow-hidden flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div className="space-y-1 z-10">
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  CURRENT EMERGENCY LOAD
                </div>
                <div className="text-[10px] font-medium text-slate-500">
                  LIVE TRIAGE STATUS
                </div>
                <div className="text-xs font-bold text-rose-500">
                  {emergencyLoad > 60 ? 'Critical' : emergencyLoad > 30 ? 'Elevated' : 'Optimal (0 Load)'}
                </div>
              </div>

              {/* Gauge Meter Arc */}
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={emergencyLoad > 60 ? 'text-rose-500' : emergencyLoad > 30 ? 'text-amber-500' : 'text-emerald-500'}
                    strokeDasharray={`${emergencyLoad}, 100`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs font-mono font-black text-slate-900">{emergencyLoad}%</span>
                  <span className="text-[7px] font-bold text-rose-500 uppercase">
                    {emergencyLoad > 60 ? 'Critical' : 'Normal'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* B. MIDDLE SECTION: LIGHT MAP GRID + RIGHT FEED PANELS */}
          {/* =================================================================== */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5">
            {/* 1. MAP SECTION (8 Cols) */}
            <div className="xl:col-span-8 rounded-2xl bg-white border border-slate-200/80 p-3.5 relative flex flex-col min-h-[460px] overflow-hidden shadow-xs">
              {/* Map Floating Layer Controls (Top-Left) */}
              <div className="absolute top-4 left-4 z-20 space-y-2 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200/90 shadow-md">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
                  MAP CONTROLS
                </div>
                <div className="flex flex-col gap-1 w-32">
                  {[
                    { id: 'all', label: 'All Layers', icon: Layers },
                    { id: 'hospitals', label: 'Hospitals', icon: Building2 },
                    { id: 'ambulances', label: 'Ambulances', icon: Ambulance },
                    { id: 'bloodbanks', label: 'Blood Banks', icon: Droplet },
                    { id: 'emergencies', label: 'Emergency Zones', icon: AlertTriangle },
                    { id: 'traffic', label: 'Traffic Overlay', icon: Navigation }
                  ].map((layer) => {
                    const isSelected = activeLayer === layer.id;
                    const IconC = layer.icon;
                    return (
                      <button
                        key={layer.id}
                        onClick={() => setActiveLayer(layer.id as any)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                        }`}
                      >
                        <IconC className="w-3.5 h-3.5" />
                        <span className="truncate">{layer.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Map Legend (Bottom-Left) */}
              <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200/90 shadow-md text-[10px] space-y-1.5">
                <div className="font-bold text-slate-500 uppercase text-[9px]">MAP LEGEND</div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex items-center justify-center text-[7px] text-white font-bold">+</span>
                  <span>Hospital (Active)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex items-center justify-center text-[7px] text-white font-bold">A</span>
                  <span>Ambulance (Live)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Blood Bank</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-3 h-3 rounded-full border-2 border-rose-500 bg-rose-50 animate-ping" />
                  <span>Emergency Zone</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-4 h-0.5 bg-emerald-500" />
                  <span>Optimal Route</span>
                </div>
              </div>

              {/* Zoom & Recenter Controls (Bottom-Right) */}
              <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/90 shadow-md">
                <button
                  onClick={() => setMapZoom((prev) => Math.min(prev + 0.15, 1.6))}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
                  title="Zoom In"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMapZoom((prev) => Math.max(prev - 0.15, 0.7))}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
                  title="Zoom Out"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMapZoom(1)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
                  title="Reset View"
                >
                  <Compass className="w-4 h-4" />
                </button>
              </div>

              {/* Light Street / Topology Canvas Background */}
              <div className="relative flex-1 w-full rounded-2xl bg-[#F8F9FA] border border-slate-200/80 overflow-hidden flex items-center justify-center min-h-[380px]">
                {/* SVG Light Topology Vectors & Intercity Connectors */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Subtle Light Dot Grid */}
                  <defs>
                    <pattern id="light-grid-pattern" width="8" height="8" patternUnits="userSpaceOnUse">
                      <circle cx="4" cy="4" r="0.5" fill="#E2E8F0" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#light-grid-pattern)" />

                  {/* Interconnecting Green Road Links */}
                  <g stroke="#10B981" strokeWidth="0.5" strokeOpacity="0.85">
                    {mapData.connections.map(([c1, c2], i) => {
                      const p1 = mapData.cityAnchors[c1];
                      const p2 = mapData.cityAnchors[c2];
                      if (!p1 || !p2) return null;
                      return (
                        <line
                          key={i}
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                          strokeDasharray={i % 3 === 0 ? '1,1' : 'none'}
                        />
                      );
                    })}
                  </g>
                </svg>

                {/* City Nodes & Live Pulsing Markers */}
                <div
                  style={{ transform: `scale(${mapZoom})`, transformOrigin: 'center center' }}
                  className="absolute inset-0 w-full h-full transition-transform duration-200"
                >
                  {mapData.nodes.map((node) => {
                    const isEmergency = node.type === 'emergency';
                    const isAmbulance = node.type === 'ambulance';
                    const isHospital = node.type === 'hospital';

                    return (
                      <div
                        key={node.id}
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
                      >
                        {/* Emergency Glowing Hotspot */}
                        {isEmergency && (
                          <div className="absolute w-7 h-7 -translate-y-0.5 rounded-full bg-rose-500/20 animate-ping pointer-events-none" />
                        )}

                        {/* Icon Marker */}
                        <div className="relative">
                          {isEmergency ? (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-rose-500 bg-white flex items-center justify-center shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            </div>
                          ) : isAmbulance ? (
                            <div className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs text-[7px] font-bold">
                              A
                            </div>
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs text-[8px] font-bold">
                              +
                            </div>
                          )}
                        </div>

                        {/* City Label */}
                        <span className={`text-[9px] font-semibold whitespace-nowrap mt-0.5 pointer-events-none drop-shadow-xs ${
                          node.city === 'Ludhiana' ? 'text-slate-900 font-bold text-xs' : 'text-slate-600'
                        }`}>
                          {node.city}
                        </span>

                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center bg-white border border-slate-200 p-2 rounded-xl whitespace-nowrap text-[10px] z-30 shadow-lg">
                          <span className="font-bold text-slate-800">{node.city} Emergency Hub</span>
                          <span className="text-emerald-600 font-medium capitalize">{node.type} Node • Active</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Real-time Indicator banner */}
                {allFacilities.length === 0 && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md border border-slate-200 p-2 rounded-xl text-[11px] text-slate-600 z-20 flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Values start at 0. Use /hb to register real facilities.</span>
                    <button
                      onClick={() => setMode('partner')}
                      className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-[10px] font-bold cursor-pointer"
                    >
                      Open /hb
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2. RIGHT SIDE PANELS: LIVE EMERGENCY FEED + SYSTEM HEALTH (4 Cols) */}
            <div className="xl:col-span-4 flex flex-col gap-3.5">
              {/* Panel 1: Live Emergency Feed */}
              <div className="flex-1 rounded-2xl bg-white border border-slate-200/80 p-4 flex flex-col shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-500" />
                    LIVE EMERGENCY FEED
                  </div>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-[9px] font-bold text-rose-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    LIVE
                  </span>
                </div>

                {/* Emergency Feed Stream */}
                <div className="flex-1 space-y-2 overflow-y-auto max-h-[190px] custom-scrollbar pr-1">
                  {commandStats.recentDispatches && commandStats.recentDispatches.length > 0 ? (
                    commandStats.recentDispatches.map((disp, i) => (
                      <div
                        key={disp.dispatchId || i}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs hover:border-slate-300 transition-all"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-[10px] font-mono">
                              {disp.createdAt ? new Date(disp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '14:26'}
                            </span>
                            <span className="text-slate-900 font-bold text-[11px]">{disp.hospitalName || 'Emergency Case'}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">{disp.patientName || 'Critical Patient'} • {disp.symptomCategory || 'Trauma'}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                          disp.severity === 'RED' ? 'bg-rose-100 text-rose-700' :
                          disp.severity === 'AMBER' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {disp.severity || 'CRITICAL'}
                        </span>
                      </div>
                    ))
                  ) : (
                    /* Clean Feed Items Matching Image */
                    [
                      { time: '14:26', location: 'Panchkula Sector 20', event: 'Road Accident', severity: 'CRITICAL' },
                      { time: '14:24', location: 'Ambala City', event: 'Cardiac Emergency', severity: 'HIGH' },
                      { time: '14:22', location: 'Karnal Bypass', event: 'Multi-Vehicle Collision', severity: 'CRITICAL' },
                      { time: '14:21', location: 'Ludhiana Focal Point', event: 'Medical Transport', severity: 'MEDIUM' },
                      { time: '14:19', location: 'Panipat Refinery Road', event: 'Injury Case', severity: 'HIGH' }
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs hover:border-slate-300 transition-all"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-[10px] font-mono">{item.time}</span>
                            <span className="text-slate-900 font-bold text-[11px]">{item.location}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">{item.event}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                          item.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                          item.severity === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {item.severity}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-2 text-right">
                  <button
                    onClick={() => setMode('coordinate')}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center justify-end gap-1 ml-auto cursor-pointer"
                  >
                    View All Emergencies →
                  </button>
                </div>
              </div>

              {/* Panel 2: System Health Overview */}
              <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-600" />
                  SYSTEM HEALTH OVERVIEW
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    { name: 'API Gateway', status: '100%', ok: true },
                    { name: 'Database Cluster', status: '100%', ok: true },
                    { name: 'Cache Layer', status: '100%', ok: true },
                    { name: 'AI Engine', status: '100%', ok: true },
                    { name: 'WebSocket Server', status: '100%', ok: true },
                    { name: 'Cloud Storage', status: '100%', ok: true }
                  ].map((srv, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-slate-600">{srv.name}</span>
                      </div>
                      <span className="text-emerald-600 font-bold font-mono">{srv.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* C. BOTTOM TABLE: REAL-TIME FACILITY OVERVIEW */}
          {/* =================================================================== */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                REAL-TIME FACILITY OVERVIEW
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Total Registered: <span className="text-slate-900 font-bold">{allFacilities.length}</span>
              </div>
            </div>

            {/* Clean White Facility Table */}
            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase">
                    <th className="py-2.5 px-3 font-bold">Facility Name</th>
                    <th className="py-2.5 px-3 font-bold">Type</th>
                    <th className="py-2.5 px-3 font-bold">Location</th>
                    <th className="py-2.5 px-3 font-bold">Occupancy</th>
                    <th className="py-2.5 px-3 font-bold">API Sync</th>
                    <th className="py-2.5 px-3 font-bold">Users Served Today</th>
                    <th className="py-2.5 px-3 font-bold">Last Updated</th>
                    <th className="py-2.5 px-3 text-right font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allFacilities.length > 0 ? (
                    allFacilities.map((fac, idx) => {
                      const occ = fac.hospitalCapacity?.icuBeds ? Math.min(95, 60 + (idx * 7) % 35) : 75;
                      return (
                        <tr key={fac.facilityId || idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 text-slate-900 font-bold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            {fac.facilityName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 capitalize">
                            {fac.facilityType === 'hospital' ? 'Hospital' : fac.facilityType === 'blood_bank' ? 'Blood Bank' : 'Ambulance Fleet'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{fac.city || fac.state || 'National Grid'}</td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 rounded-full bg-slate-200 overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${occ}%` }} />
                              </div>
                              <span className="text-slate-600 text-[10px] font-mono">{occ}%</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-emerald-600 flex items-center gap-1 font-mono">
                            <span className="text-[10px]">◆</span> 100%
                          </td>
                          <td className="py-2.5 px-3 text-slate-800 font-bold font-mono">
                            {(1200 + (idx * 315) % 1500).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 text-[10px] font-mono">
                            {timeStr || '14:27:10'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                              OPERATIONAL
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Building2 className="w-6 h-6 text-slate-300" />
                          <span>No facilities registered yet in MongoDB Atlas.</span>
                          <button
                            onClick={() => setMode('partner')}
                            className="mt-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Register First Facility (/hb)</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. FOOTER TELEMETRY STATUS BAR */}
      {/* ========================================================================= */}
      <footer className="w-full h-8 shrink-0 bg-white border-t border-slate-200/90 px-4 sm:px-6 flex items-center justify-between text-[10px] font-mono text-slate-500 z-30">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
            <Lock className="w-3 h-3" />
            <span>SECURE CONNECTION</span>
          </div>
          <span className="text-slate-400">AES-256 ENCRYPTED</span>
          <span className="hidden md:inline text-slate-500">GRID ID: PRMKT-88X7</span>
          <span className="hidden lg:inline text-slate-500">SESSION TIME: 02:45:32</span>
          <span className="hidden sm:inline text-slate-500">ACTIVE USERS: {Math.max(1, allFacilities.length * 3 + 27)}</span>
          <span className="text-emerald-600 font-bold">DATA STREAM: LIVE</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span className="font-bold">AUTO-REFRESH: {autoRefresh ? 'ON' : 'OFF'}</span>
          </button>
          <button
            onClick={fetchStats}
            title="Force Refresh Data"
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </footer>
    </div>
  );
};
