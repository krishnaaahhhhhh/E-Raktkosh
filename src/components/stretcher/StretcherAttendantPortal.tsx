import React, { useState, useEffect } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import { io, Socket } from 'socket.io-client';
import {
  Bed,
  Sun,
  ShieldCheck,
  Bell,
  ChevronDown,
  Clock,
  Droplet,
  Thermometer,
  MapPin,
  Compass,
  ArrowRight,
  Coffee,
  PhoneCall,
  AlertTriangle,
  FileText,
  Calendar,
  Umbrella,
  BarChart2,
  Volume2,
  Settings,
  HelpCircle,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Maximize2,
  Info,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const StretcherAttendantPortal: React.FC = () => {
  const { setMode } = usePrathmikta();

  // Active Menu
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Attendant State
  const [attendantData, setAttendantData] = useState<{
    name: string;
    employeeId: string;
    dutyStatus: string;
    shiftHours: string;
    heatIndexNow: number;
    shadeCompliance: number;
    currentLocation: string;
    onBreak: boolean;
  }>({
    name: 'Ram Singh',
    employeeId: 'SA-1047',
    dutyStatus: 'Duty Status: Shade Shelter Active',
    shiftHours: '08:00 AM to 04:00 PM',
    heatIndexNow: 42.8,
    shadeCompliance: 98,
    currentLocation: 'Indoor Shade Shelter – Emergency Block A',
    onBreak: false
  });

  // Emergency Dispatch Acceptance State
  const [dispatchAccepted, setDispatchAccepted] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<'idle' | 'moving' | 'reached' | 'transporting' | 'completed'>('idle');
  const [liveIncomingDispatch, setLiveIncomingDispatch] = useState<any | null>(null);
  const [socketClient, setSocketClient] = useState<Socket | null>(null);

  // Hydration Count State
  const [hydrationLogs, setHydrationLogs] = useState<number>(3);
  const [showHydrationModal, setShowHydrationModal] = useState<boolean>(false);

  // Break Request State
  const [onBreak, setOnBreak] = useState<boolean>(false);
  const [breakToast, setBreakToast] = useState<string | null>(null);

  // Trips counter
  const [totalTrips, setTotalTrips] = useState<number>(6);

  // Live Dispatches state
  const [dispatchesList, setDispatchesList] = useState<any[]>([
    {
      dispatchId: 'disp-101',
      time: '10:24 AM',
      destination: 'Gate 1 – OPD Entrance',
      priority: 'Medium',
      status: 'Completed'
    },
    {
      dispatchId: 'disp-102',
      time: '09:45 AM',
      destination: 'Emergency Block B',
      priority: 'High',
      status: 'Completed'
    }
  ]);

  // Socket.io Real-Time Connection for Ram Singh (SA-1047)
  useEffect(() => {
    const socket = io({
      transports: ['websocket', 'polling']
    });
    setSocketClient(socket);

    socket.on('connect', () => {
      console.log('[Stretcher Portal] Socket connected. Registering as Ram Singh (SA-1047)');
      socket.emit('stretcher:join', { attendantId: 'SA-1047', attendantName: 'Ram Singh' });
    });

    // Targeted dispatch received from GSVM Hospital Reception
    socket.on('stretcher:dispatch_new', (data: any) => {
      if (data && (data.attendantId === 'SA-1047' || !data.attendantId)) {
        console.log('[Stretcher Portal] Targeted dispatch received for Ram Singh:', data);
        setLiveIncomingDispatch(data);
        setDispatchAccepted(false);
        setActiveStep('idle');
        setBreakToast(`🚨 EMERGENCY DISPATCH FOR RAM SINGH: ${data.patientName || 'Emergency Patient'} at ${data.destination || 'Gate 2'}`);

        // Try playing web audio chime
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        } catch {
          // ignore
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch initial attendant data & dispatches from MongoDB Atlas
  useEffect(() => {
    const fetchMongoData = async () => {
      try {
        const [attendantRes, dispatchesRes] = await Promise.all([
          fetch('/api/stretcher/attendant?attendantId=SA-1047'),
          fetch('/api/stretcher/dispatches?attendantId=SA-1047')
        ]);
        if (attendantRes.ok) {
          const aData = await attendantRes.json();
          if (aData) {
            setAttendantData({
              name: aData.name || 'Ram Singh',
              employeeId: aData.employeeId || 'SA-1047',
              dutyStatus: aData.dutyStatus || 'Duty Status: Shade Shelter Active',
              shiftHours: aData.shiftHours || '08:00 AM to 04:00 PM',
              heatIndexNow: aData.heatIndexNow || 42.8,
              shadeCompliance: aData.shadeCompliance || 98,
              currentLocation: aData.currentLocation || 'Indoor Shade Shelter – Emergency Block A',
              onBreak: !!aData.onBreak
            });
            if (typeof aData.hydrationLogs === 'number') setHydrationLogs(aData.hydrationLogs);
            if (typeof aData.totalTrips === 'number') setTotalTrips(aData.totalTrips);
            if (typeof aData.onBreak === 'boolean') setOnBreak(aData.onBreak);
          }
        }
        if (dispatchesRes.ok) {
          const dData = await dispatchesRes.json();
          if (Array.isArray(dData) && dData.length > 0) {
            setDispatchesList(dData);
          }
        }
      } catch (err) {
        console.warn('[Stretcher] Fetch MongoDB error:', err);
      }
    };
    fetchMongoData();
  }, []);

  const handleAcceptDispatch = async () => {
    setDispatchAccepted(true);
    setActiveStep('moving');

    const dispatchId = liveIncomingDispatch?.dispatchId || `disp-${Date.now()}`;
    const destination = liveIncomingDispatch?.destination || 'Gate 2 – Main Entrance';

    // Broadcast status to GSVM Hospital Dashboard via Socket.io
    if (socketClient) {
      socketClient.emit('stretcher:status_update', {
        attendantId: 'SA-1047',
        attendantName: 'Ram Singh',
        dispatchId,
        step: 'moving',
        statusText: `Ram Singh accepted! Moving to ${destination}`,
        location: 'En Route to Gate 2'
      });
    }

    // Sync to MongoDB
    try {
      await fetch('/api/stretcher/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dispatchId,
          attendantId: 'SA-1047',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          destination,
          reason: liveIncomingDispatch?.reason || 'Emergency Patient Transfer',
          priority: liveIncomingDispatch?.priority || 'High',
          etaRequired: 'Within 2 Minutes',
          status: 'In Progress (Moving to Gate 2)'
        })
      });
    } catch {
      // ignore
    }
  };

  const handlePatientLoaded = () => {
    setActiveStep('transporting');
    const dispatchId = liveIncomingDispatch?.dispatchId || `disp-${Date.now()}`;

    if (socketClient) {
      socketClient.emit('stretcher:status_update', {
        attendantId: 'SA-1047',
        attendantName: 'Ram Singh',
        dispatchId,
        step: 'transporting',
        statusText: 'Patient Loaded! Transporting to Assigned ICU Bed #4',
        location: 'Trauma Bay Corridor'
      });
    }
  };

  const handleCompleteDispatch = async () => {
    setActiveStep('completed');
    const newTotal = totalTrips + 1;
    setTotalTrips(newTotal);

    const dispatchId = liveIncomingDispatch?.dispatchId || `disp-${Date.now()}`;
    const completedEntry = {
      dispatchId,
      attendantId: 'SA-1047',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      destination: liveIncomingDispatch?.destination || 'Gate 2 – Main Entrance',
      reason: liveIncomingDispatch?.reason || 'Emergency Patient Transfer',
      priority: liveIncomingDispatch?.priority || 'High',
      status: 'Completed'
    };

    setDispatchesList((prev) => [completedEntry, ...prev]);

    // Broadcast status to GSVM Hospital Dashboard via Socket.io
    if (socketClient) {
      socketClient.emit('stretcher:status_update', {
        attendantId: 'SA-1047',
        attendantName: 'Ram Singh',
        dispatchId,
        step: 'completed',
        statusText: 'Handover Completed at ICU Bed #4. Ram Singh Available.',
        location: 'Indoor Shade Shelter – Emergency Block A'
      });
    }

    // Save completed state to MongoDB
    try {
      await fetch('/api/stretcher/attendant/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendantId: 'SA-1047',
          totalTrips: newTotal
        })
      });
      await fetch('/api/stretcher/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completedEntry)
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setDispatchAccepted(false);
      setActiveStep('idle');
      setLiveIncomingDispatch(null);
    }, 2500);
  };

  const handleLogHydration = async () => {
    const newCount = hydrationLogs + 1;
    setHydrationLogs(newCount);
    setBreakToast('Hydration logged: 250ml cold ORS water consumed (Synced to MongoDB).');
    setTimeout(() => setBreakToast(null), 3000);

    try {
      await fetch('/api/stretcher/attendant/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendantId: 'SA-1047',
          hydrationLogs: newCount
        })
      });
    } catch {
      // ignore
    }
  };

  const handleToggleBreak = async () => {
    const nextState = !onBreak;
    setOnBreak(nextState);
    setBreakToast(nextState ? 'Break logged in Shade Shelter (15 mins) (Synced to MongoDB).' : 'Resumed active duty.');
    setTimeout(() => setBreakToast(null), 3000);

    try {
      await fetch('/api/stretcher/attendant/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendantId: 'SA-1047',
          onBreak: nextState,
          dutyStatus: nextState ? 'On Break: Shade Shelter Active' : 'Duty Status: Shade Shelter Active'
        })
      });
    } catch {
      // ignore
    }
  };

  return (
    <div id="stretcher-attendant-portal" className="w-full h-full flex flex-col bg-[#F3F4F8] text-slate-800 overflow-hidden select-none font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR */}
      {/* ========================================================================= */}
      <header className="w-full h-16 shrink-0 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between z-30 shadow-xs">
        {/* Left: Brand Icon & Portal Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-800 flex items-center justify-center text-slate-900 shadow-xs shrink-0 p-1.5">
            {/* Shield with Stretcher Bed Symbol */}
            <div className="relative flex items-center justify-center">
              <Bed className="w-5 h-5 text-slate-800" />
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-600" />
            </div>
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight">
              Stretcher Attendant Portal
            </h1>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500">
              Hospital Staff Dashboard
            </p>
          </div>
        </div>

        {/* Right Status Widgets: Heat Index + Shade Compliance + Notifications + Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Heat Index (Now) Pill */}
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-orange-50/70 border border-orange-200/80 shadow-xs">
            <Sun className="w-4 h-4 text-orange-500 animate-spin-slow" />
            <div className="text-left leading-tight">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Heat Index (Now)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900">42.8°C</span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-red-100 text-red-700 tracking-wider">
                  EXTREME
                </span>
              </div>
            </div>
          </div>

          {/* Shade Compliance Pill */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <div className="text-left leading-tight">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Shade Compliance
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900">98%</span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-emerald-100 text-emerald-700 tracking-wider">
                  GOOD
                </span>
              </div>
            </div>
          </div>

          {/* Notification Bell Badge */}
          <div className="relative">
            <button
              onClick={() => {
                setBreakToast('Emergency notification channel active');
                setTimeout(() => setBreakToast(null), 3000);
              }}
              className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
            </button>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
              3
            </span>
          </div>

          {/* Staff User Profile Dropdown Pill */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs overflow-hidden border-2 border-white shadow-xs">
                <span>RS</span>
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <span>Ram Singh</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-[9px] font-mono text-slate-500">SA-1047</div>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN BODY: LEFT SIDEBAR + CENTER FEED + RIGHT PANELS */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full flex overflow-hidden">
        {/* ===================================================================== */}
        {/* LEFT CLEAN WHITE NAVIGATION SIDEBAR */}
        {/* ===================================================================== */}
        <aside className="w-56 shrink-0 bg-white border-r border-slate-200/90 flex flex-col justify-between p-3.5 z-20 overflow-y-auto custom-scrollbar hidden lg:flex">
          <div className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Bed, badge: null },
              { id: 'duty', label: 'My Duty', icon: FileText, badge: null },
              { id: 'alerts', label: 'Dispatch Alerts', icon: Bell, badge: 2 },
              { id: 'roster', label: 'Duty Roster', icon: Calendar, badge: null },
              { id: 'shelter', label: 'Shade Shelter', icon: Umbrella, badge: null },
              { id: 'safety', label: 'Heat Safety', icon: Thermometer, badge: null },
              { id: 'performance', label: 'My Performance', icon: BarChart2, badge: null },
              { id: 'announcements', label: 'Announcements', icon: Volume2, badge: null },
              { id: 'settings', label: 'Settings', icon: Settings, badge: null },
              { id: 'help', label: 'Help & Support', icon: HelpCircle, badge: null }
            ].map((item) => {
              const IconC = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-orange-50/80 text-orange-600 font-bold border border-orange-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <IconC className={`w-4 h-4 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Left Bottom Heat Safety Tip Card */}
          <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200/80 text-left space-y-2 mt-4">
            <div className="flex items-center gap-1.5 text-orange-600 font-bold text-xs">
              <Sun className="w-4 h-4" />
              <span>Heat Safety Tip</span>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed font-normal">
              Stay hydrated, take breaks in shade, and report any heat discomfort.
            </p>
            <button
              onClick={() => setActiveTab('safety')}
              className="text-[10px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View Guidelines</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </aside>

        {/* ===================================================================== */}
        {/* CENTER COLUMN: PROFILE BANNER + HEAT BANNER + DISPATCH CARD */}
        {/* ===================================================================== */}
        <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-3.5 sm:p-4 gap-3.5 bg-[#F3F4F8]">
          {/* 1. TOP PROFILE & SHIFT CARD */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Profile Avatar with Online Status */}
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-lg overflow-hidden border-2 border-white shadow-xs">
                  <span>RS</span>
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              {/* Name & Employee ID */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base sm:text-lg font-black text-slate-900">Ram Singh</h2>
                  <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold">
                    ✓
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500">Stretcher Attendant</p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[11px] font-mono text-slate-500">Employee ID: SA-1047</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Duty Status: Shade Shelter Active
                  </span>
                </div>
              </div>
            </div>

            {/* Today's Shift Card */}
            <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 sm:self-center">
              <Clock className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-[9px] font-bold uppercase text-slate-500">Today's Shift</div>
                <div className="text-xs font-black text-slate-900">08:00 AM to <span className="text-orange-600">04:00 PM</span></div>
              </div>
            </div>
          </div>

          {/* 2. HEAT WELFARE PROTECTION ACTIVE BANNER */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-2 z-10 max-w-md">
              <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <Sun className="w-4 h-4" />
                </div>
                <span className="font-black text-slate-900 text-sm sm:text-base">Heat Welfare Protection Active</span>
              </div>
              <p className="text-xs text-slate-600">
                You are currently in a shaded zone. Stay hydrated and take regular breaks.
              </p>

              {/* 3 Metric Pills: Hydration, Heat Index, Shade Compliance */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700">
                  <Droplet className="w-3.5 h-3.5 text-blue-500 fill-blue-200" />
                  <span>Hydration: Good</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-[10px] font-bold text-orange-700">
                  <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                  <span>Heat Index: 42.8°C</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Shade Compliance: 100%</span>
                </div>
              </div>
            </div>

            {/* Shaded Shelter Illustration Graphic */}
            <div className="relative w-full md:w-64 h-28 rounded-xl bg-gradient-to-r from-orange-50/50 to-emerald-50/50 border border-slate-200/80 flex items-center justify-center p-2 overflow-hidden shrink-0">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 mx-auto rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-amber-700">
                  <Umbrella className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-bold text-slate-700">Indoor Shelter Zone</div>
                <div className="text-[8px] text-slate-500">Misting Fan Active • Cold Water Stand</div>
              </div>
            </div>
          </div>

          {/* 3. CURRENT LOCATION BANNER */}
          <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-400 block">Current Location</span>
                <span className="text-xs font-black text-slate-800">Indoor Shade Shelter – Emergency Block A</span>
              </div>
            </div>
            <button
              onClick={() => setMode('command')}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-emerald-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>View Map</span>
            </button>
          </div>

          {/* 4. EMERGENCY DISPATCH ACTION CARD (Matches Screenshot) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span className="text-xs font-black tracking-wider uppercase text-red-600">
                  EMERGENCY DISPATCH
                </span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                Just Now
              </span>
            </div>

            {/* Center Graphic & Details */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Left Stretcher Target Ring Graphic */}
              <div className="md:col-span-4 flex items-center justify-center">
                <div className="relative w-28 h-28 rounded-full border border-orange-200 bg-orange-50/40 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border border-orange-300 bg-orange-50/80 flex items-center justify-center">
                    <Bed className="w-10 h-10 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Right Dispatch Info */}
              <div className="md:col-span-8 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {liveIncomingDispatch?.patientName ? `Transfer: ${liveIncomingDispatch.patientName}` : 'Stretcher Needed'}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                    liveIncomingDispatch?.priority === 'Critical' || liveIncomingDispatch?.priority === 'TRAUMA RED'
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    Priority: {liveIncomingDispatch?.priority || 'High'}
                  </span>
                  {liveIncomingDispatch?.caseId && (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {liveIncomingDispatch.caseId}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-500 font-medium">Pickup & Destination: </span>
                      <span className="font-bold text-slate-900">
                        {liveIncomingDispatch?.destination || 'Gate 2 – Main Entrance'} → {liveIncomingDispatch?.targetBed || 'ICU Bed #4 (Ventilator Bay)'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-500 font-medium">Reason / Clinical: </span>
                      <span className="font-bold text-slate-900">
                        {liveIncomingDispatch?.reason || 'Emergency Patient Transfer (GSVM Medical College)'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-500 font-medium">ETA Required: </span>
                      <span className="font-black text-orange-600">
                        {liveIncomingDispatch?.etaRequired || 'Within 2 Minutes'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action CTA Steps: Step 1 (Accept & Move) -> Step 2 (Load Patient) -> Step 3 (Complete) */}
            {!dispatchAccepted ? (
              <button
                onClick={handleAcceptDispatch}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Accept &amp; Move From Shade to Gate 2</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : activeStep === 'moving' ? (
              <div className="space-y-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                    <span>En Route to Gate 2 (Live Socket Synced to GSVM Reception)</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-700">Step 1 of 2</span>
                </div>
                <button
                  onClick={handlePatientLoaded}
                  className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Patient Reached &amp; Loaded on Stretcher → Transport to ICU</span>
                </button>
              </div>
            ) : activeStep === 'transporting' ? (
              <div className="space-y-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                    <span>Transporting Patient to {liveIncomingDispatch?.targetBed || 'ICU Bed #4'}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-blue-700">Step 2 of 2</span>
                </div>
                <button
                  onClick={handleCompleteDispatch}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Patient Handover Completed &amp; Return to Shelter</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center animate-in fade-in duration-200">
                <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Dispatch Completed! Synced to Hospital Reception &amp; MongoDB.</span>
                </div>
              </div>
            )}
          </div>

          {/* 5. RECENT DISPATCH ALERTS TABLE */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Recent Dispatch Alerts
              </h4>
              <button
                onClick={() => setActiveTab('alerts')}
                className="text-[10px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase">
                    <th className="py-2 px-3 font-bold">Time</th>
                    <th className="py-2 px-3 font-bold">Destination</th>
                    <th className="py-2 px-3 font-bold">Priority</th>
                    <th className="py-2 px-3 font-bold">Status</th>
                    <th className="py-2 px-3 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dispatchesList.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-600">{row.time}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{row.destination}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          row.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {row.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="flex items-center gap-1 text-emerald-700 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{row.status}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            setBreakToast(`Viewing case details for ${row.destination}`);
                            setTimeout(() => setBreakToast(null), 3000);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* ===================================================================== */}
        {/* RIGHT COLUMN: TODAY'S OVERVIEW + QUICK ACTIONS + ANNOUNCEMENTS */}
        {/* ===================================================================== */}
        <aside className="w-80 shrink-0 border-l border-slate-200/90 bg-[#F8F9FA] p-3.5 space-y-3.5 overflow-y-auto custom-scrollbar hidden xl:block">
          {/* Panel 1: Today's Overview (4 Mini KPI Cards) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Today's Overview
              </h3>
              <button
                onClick={() => setActiveTab('performance')}
                className="text-[10px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Box 1: Total Trips */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <Bed className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">{String(totalTrips).padStart(2, '0')}</div>
                  <div className="text-[9px] text-slate-500 font-medium">Total Trips</div>
                </div>
              </div>

              {/* Box 2: Active Duty */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">02h 45m</div>
                  <div className="text-[9px] text-slate-500 font-medium">Active Duty</div>
                </div>
              </div>

              {/* Box 3: Hydration Logs */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                  <Droplet className="w-4 h-4 fill-cyan-100" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">{hydrationLogs}</div>
                  <div className="text-[9px] text-slate-500 font-medium">Hydration Logs</div>
                </div>
              </div>

              {/* Box 4: Compliance */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">100%</div>
                  <div className="text-[9px] text-slate-500 font-medium">Compliance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: Quick Actions (4 Clean Action Buttons) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleToggleBreak}
                className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs flex items-center gap-2 text-left cursor-pointer transition-all"
              >
                <Coffee className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-xs font-bold text-slate-800">{onBreak ? 'End Break' : 'Request Break'}</span>
              </button>

              <button
                onClick={handleLogHydration}
                className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs flex items-center gap-2 text-left cursor-pointer transition-all"
              >
                <Droplet className="w-4 h-4 text-cyan-500 shrink-0" />
                <span className="text-xs font-bold text-slate-800">Hydration Log</span>
              </button>

              <button
                onClick={() => {
                  setBreakToast('Maintenance ticket reported for Stretcher #4 (Synced to MongoDB).');
                  setTimeout(() => setBreakToast(null), 3000);
                }}
                className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs flex items-center gap-2 text-left cursor-pointer transition-all"
              >
                <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="text-xs font-bold text-slate-800">Report Issue</span>
              </button>

              <a
                href="tel:108"
                className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs flex items-center gap-2 text-left cursor-pointer transition-all"
              >
                <PhoneCall className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-xs font-bold text-slate-800">Emergency Call</span>
              </a>
            </div>
          </div>

          {/* Panel 3: Announcements */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Announcements
              </h3>
              <button
                onClick={() => setActiveTab('announcements')}
                className="text-[10px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Volume2 className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1 text-left">
                  <div className="text-[9px] font-mono text-slate-400">18 May 2025, 10:30 AM</div>
                  <p className="text-xs font-bold text-slate-800 leading-snug">
                    Stay in shade between 12 PM – 4 PM. Hydration is mandatory.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Floating Action Toast Notification */}
      <AnimatePresence>
        {breakToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{breakToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
