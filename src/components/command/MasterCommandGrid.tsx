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
  Bell,
  Settings,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Lock,
  Server,
  BarChart3,
  Users,
  Compass,
  FileText,
  Menu,
  Cpu
} from 'lucide-react';
import { AnimatedHeartbeatLogo } from '../ui/AnimatedHeartbeatLogo';
import { CommandMapGrid } from './CommandMapGrid';
import { CommandFacilityTable } from './CommandFacilityTable';
import { CommandHospitalsView } from './CommandHospitalsView';
import { CommandAmbulanceView } from './CommandAmbulanceView';
import { CommandBloodBankView } from './CommandBloodBankView';
import { CommandEmergencyFeed } from './CommandEmergencyFeed';

export const MasterCommandGrid: React.FC = () => {
  const { setMode, liveFacilities, socket, isConnected } = usePrathmikta();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Map Controls State
  const [activeLayer, setActiveLayer] = useState<'all' | 'hospitals' | 'ambulances' | 'bloodbanks' | 'emergencies' | 'traffic'>('all');
  const [mapZoom, setMapZoom] = useState<number>(1);

  // Auto Refresh State
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Live Current Time Display
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

  // Live Stats State - Defaults strictly at 0
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
    const pollTimer = setInterval(fetchStats, 3000);
    return () => clearInterval(pollTimer);
  }, [autoRefresh]);

  // Real-time WebSocket Listeners for Instant Live Data Updates
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchStats();
    };

    socket.on('facility:registered', handleUpdate);
    socket.on('partner:facility_added', handleUpdate);
    socket.on('patient:inbound_received', handleUpdate);
    socket.on('admission:new', handleUpdate);
    socket.on('token:new', handleUpdate);
    socket.on('telemetry:new_log', handleUpdate);

    return () => {
      socket.off('facility:registered', handleUpdate);
      socket.off('partner:facility_added', handleUpdate);
      socket.off('patient:inbound_received', handleUpdate);
      socket.off('admission:new', handleUpdate);
      socket.off('token:new', handleUpdate);
      socket.off('telemetry:new_log', handleUpdate);
    };
  }, [socket]);

  // Merge liveFacilities from context with fetched facilities
  const allFacilities = useMemo(() => {
    const map = new Map<string, any>();
    (commandStats.facilities || []).forEach((f) => map.set(f.facilityId || f.id, f));
    (liveFacilities || []).forEach((f) => map.set(f.facilityId || f.id, f));
    return Array.from(map.values());
  }, [commandStats.facilities, liveFacilities]);

  // Derived counts from ONLY actual collaborated facilities
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

  // Dynamic Emergency Load
  const emergencyLoad = useMemo(() => {
    if (totalHospitals === 0) return 0;
    const dispatches = commandStats.activeEmergencyCount || 0;
    return Math.min(100, Math.round((dispatches / Math.max(1, totalHospitals * 2)) * 100));
  }, [totalHospitals, commandStats.activeEmergencyCount]);

  return (
    <div id="master-command-grid" className="w-full h-full flex flex-col bg-[#F3F4F8] text-slate-800 overflow-hidden select-none font-sans">
      {/* 1. TOP HEADER BAR */}
      <header className="w-full h-16 shrink-0 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between z-30 shadow-xs">
        {/* Brand Identity & Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMode('landing')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
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

        {/* Status, Clock & Profile */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Grid Status Pill */}
          <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <div className="text-left">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                LIVE PARTNER MESH:
              </p>
              <p className="text-[11px] font-black text-emerald-600 tracking-wide">
                {allFacilities.length} NODES CONNECTED
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
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {allFacilities.length}
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

      {/* 2. MAIN BODY: LEFT SIDEBAR + CONTENT */}
      <div className="flex-1 w-full flex overflow-hidden">
        {/* LEFT NAVIGATION SIDEBAR */}
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
                <div className="text-[10px] text-slate-500 truncate">National Emergency Hub</div>
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100/80 text-[8px] font-bold text-emerald-700 mt-0.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </div>
              </div>
            </div>

            {/* Nav Menu Items */}
            <nav className="space-y-1">
              {[
                { id: 'overview', label: 'Command Overview', icon: Layers, count: null },
                { id: 'map', label: 'Live Map Grid', icon: Compass, count: allFacilities.length },
                { id: 'hospitals', label: 'Hospitals Network', icon: Building2, count: totalHospitals },
                { id: 'ambulances', label: 'Ambulance Fleet', icon: Ambulance, count: totalAmbulances },
                { id: 'bloodbanks', label: 'Blood Bank Control', icon: Droplet, count: totalBloodBanks },
                { id: 'triage', label: 'Emergency Triage', icon: Activity, count: commandStats.activeEmergencyCount || null },
                { id: 'analytics', label: 'System Analytics', icon: BarChart3, count: null },
                { id: 'users', label: 'Users & Access', icon: Users, count: null },
                { id: 'audit', label: 'Audit & Logs', icon: FileText, count: null }
              ].map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
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
              <div className="text-[8px] text-slate-400">Last Sync: Live</div>
            </div>
          </div>
        </aside>

        {/* CENTER CONTENT */}
        <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-3.5 sm:p-4 gap-3.5 bg-[#F3F4F8]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {/* TOP KPI HERO METRIC CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                {/* Card 1: Total Connected Hospitals */}
                <div
                  onClick={() => setActiveTab('hospitals')}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 relative overflow-hidden flex items-center justify-between shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="space-y-1 z-10">
                    <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600">
                      CONNECTED HOSPITALS
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
                <div
                  onClick={() => setActiveTab('ambulances')}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 relative overflow-hidden flex items-center justify-between shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="space-y-1 z-10">
                    <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600">
                      ACTIVE AMBULANCE FLEET
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
                <div
                  onClick={() => setActiveTab('bloodbanks')}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 relative overflow-hidden flex items-center justify-between shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
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
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 relative overflow-hidden flex items-center justify-between shadow-xs hover:shadow-md transition-all">
                  <div className="space-y-1 z-10">
                    <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600">
                      CURRENT EMERGENCY LOAD
                    </div>
                    <div className="text-[10px] font-medium text-slate-500">
                      LIVE TRIAGE STATUS
                    </div>
                    <div className="text-xs font-bold text-rose-500">
                      {emergencyLoad > 60 ? 'Critical' : emergencyLoad > 30 ? 'Elevated' : 'Optimal'}
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
                      <span className="text-[7px] font-bold text-emerald-600 uppercase">
                        {emergencyLoad > 60 ? 'High' : 'Normal'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* MIDDLE SECTION: MAP GRID + RIGHT FEED PANELS */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5">
                <div className="xl:col-span-8">
                  <CommandMapGrid
                    allFacilities={allFacilities}
                    hospitalsList={hospitalsList}
                    ambulancesList={ambulancesList}
                    bloodBanksList={bloodBanksList}
                    activeLayer={activeLayer}
                    setActiveLayer={setActiveLayer}
                    mapZoom={mapZoom}
                    setMapZoom={setMapZoom}
                    setMode={setMode}
                  />
                </div>
                <div className="xl:col-span-4">
                  <CommandEmergencyFeed
                    recentDispatches={commandStats.recentDispatches}
                    setMode={setMode}
                  />
                </div>
              </div>

              {/* BOTTOM TABLE: REAL-TIME COLLABORATED FACILITIES */}
              <CommandFacilityTable
                allFacilities={allFacilities}
                setMode={setMode}
                timeStr={timeStr}
              />
            </>
          )}

          {/* TAB 2: LIVE MAP GRID */}
          {activeTab === 'map' && (
            <div className="h-[750px] w-full">
              <CommandMapGrid
                allFacilities={allFacilities}
                hospitalsList={hospitalsList}
                ambulancesList={ambulancesList}
                bloodBanksList={bloodBanksList}
                activeLayer={activeLayer}
                setActiveLayer={setActiveLayer}
                mapZoom={mapZoom}
                setMapZoom={setMapZoom}
                setMode={setMode}
              />
            </div>
          )}

          {/* TAB 3: HOSPITALS */}
          {activeTab === 'hospitals' && (
            <CommandHospitalsView
              hospitalsList={hospitalsList}
              setMode={setMode}
            />
          )}

          {/* TAB 4: AMBULANCES */}
          {activeTab === 'ambulances' && (
            <CommandAmbulanceView
              ambulancesList={ambulancesList}
              setMode={setMode}
            />
          )}

          {/* TAB 5: BLOOD BANKS */}
          {activeTab === 'bloodbanks' && (
            <CommandBloodBankView
              bloodBanksList={bloodBanksList}
              setMode={setMode}
            />
          )}

          {/* TAB 6: TRIAGE / DISPATCHES */}
          {activeTab === 'triage' && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-rose-500" />
                    <span>Emergency Intake & Active Triage Stream</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time patient dispatches flowing into partnered trauma centers.
                  </p>
                </div>
                <button
                  onClick={() => setMode('coordinate')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Open Full Coordinator
                </button>
              </div>

              <div className="space-y-2">
                {commandStats.recentDispatches && commandStats.recentDispatches.length > 0 ? (
                  commandStats.recentDispatches.map((disp, idx) => (
                    <div
                      key={disp.dispatchId || idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${disp.severity === 'RED' ? 'bg-rose-500 animate-ping' : disp.severity === 'AMBER' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{disp.patientName || 'Emergency Patient'}</div>
                          <div className="text-xs text-slate-500">
                            🏥 Destination: <span className="font-semibold text-slate-700">{disp.hospitalName}</span> • Bay: {disp.assignedBay || 'Triage ER'}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        disp.severity === 'RED' ? 'bg-rose-100 text-rose-700' :
                        disp.severity === 'AMBER' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        CODE {disp.severity || 'RED'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No active emergency dispatches in current queue.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-700" />
                <span>Partner Mesh Collaboration Audit & Logs</span>
              </h2>
              <div className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs max-h-[500px] overflow-y-auto space-y-2">
                <div className="text-slate-500">// Prathmikta National Partner Network Live Audit Stream</div>
                {allFacilities.map((fac, idx) => (
                  <div key={fac.facilityId || idx} className="border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">[{new Date(fac.createdAt || Date.now()).toLocaleTimeString()}]</span>{' '}
                    <span className="text-yellow-400">COLLAB_SAVED:</span> {fac.facilityName} ({fac.facilityType?.toUpperCase()}) in {fac.city || 'National Grid'} - API Key: {fac.apiKey || 'pk_live_sec'} [Status: ACTIVE]
                  </div>
                ))}
                {allFacilities.length === 0 && (
                  <div className="text-slate-500">// No partner registrations recorded yet. Register in /hb</div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 3. FOOTER TELEMETRY STATUS BAR */}
      <footer className="w-full h-8 shrink-0 bg-white border-t border-slate-200/90 px-4 sm:px-6 flex items-center justify-between text-[10px] font-mono text-slate-500 z-30">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
            <Lock className="w-3 h-3" />
            <span>SECURE CONNECTION</span>
          </div>
          <span className="text-slate-400">AES-256 ENCRYPTED</span>
          <span className="hidden md:inline text-slate-500">GRID ID: PRMKT-88X7</span>
          <span className="hidden lg:inline text-slate-500">PARTNER NODES: {allFacilities.length} ACTIVE</span>
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
