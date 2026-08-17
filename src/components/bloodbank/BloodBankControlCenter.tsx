import React, { useState, useEffect } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import {
  Droplet,
  Search,
  Bell,
  Calendar,
  ChevronDown,
  LayoutDashboard,
  Users,
  Package,
  FileSpreadsheet,
  Truck,
  Tent,
  BarChart3,
  ThermometerSnowflake,
  AlertTriangle,
  Settings,
  PhoneCall,
  RefreshCw,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { playConfirmChime, playTactileClick, playCodeRedAlert } from '../../lib/audio';

interface BloodUnitGroup {
  group: string;
  units: number;
  critical?: boolean;
}

export const BloodBankControlCenter: React.FC = () => {
  const { setMode } = usePrathmikta();

  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('This Week');
  const [showCriticalModal, setShowCriticalModal] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showDriveModal, setShowDriveModal] = useState<boolean>(false);

  // Live Blood Units State (matching Image 2)
  const [bloodInventory, setBloodInventory] = useState<Record<string, number>>({
    'A+': 128,
    'A-': 48,
    'B+': 92,
    'B-': 31,
    'O+': 156,
    'O-': 5, // Critical shortage
    'AB+': 37,
    'AB-': 12
  });

  // Recent Requests State
  const [requests, setRequests] = useState([
    { id: 'REQ-2024-0517-001', patient: 'Rahul Verma', group: 'O-', units: 2, hospital: 'City Hospital', status: 'Pending' },
    { id: 'REQ-2024-0517-002', patient: 'Meera Joshi', group: 'B+', units: 1, hospital: 'Green Valley Hosp.', status: 'Approved' },
    { id: 'REQ-2024-0517-003', patient: 'Amit Kumar', group: 'A+', units: 2, hospital: 'Life Care Hospital', status: 'Pending' },
    { id: 'REQ-2024-0517-004', patient: 'Sneha Patel', group: 'AB+', units: 1, hospital: 'Sunrise Hospital', status: 'Approved' },
    { id: 'REQ-2024-0517-005', patient: 'Vikram Singh', group: 'O-', units: 2, hospital: 'City Hospital', status: 'Pending' }
  ]);

  // Total Units Computed
  const totalUnits = Object.values(bloodInventory).reduce((acc, curr) => acc + curr, 0);

  // Unit increment/decrement handler
  const handleAdjustUnits = (group: string, delta: number) => {
    playTactileClick();
    setBloodInventory(prev => ({
      ...prev,
      [group]: Math.max(0, (prev[group] || 0) + delta)
    }));
  };

  // Toggle Request Approval
  const handleToggleRequest = (id: string) => {
    playTactileClick();
    setRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status: r.status === 'Pending' ? 'Approved' : 'Pending' } : r))
    );
    playConfirmChime();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'donor_mgmt', label: 'Donor Management', icon: Users },
    { id: 'inventory', label: 'Blood Inventory', icon: Package },
    { id: 'requests', label: 'Requests', icon: FileSpreadsheet },
    { id: 'issuance', label: 'Issuance', icon: Truck },
    { id: 'camps', label: 'Camps & Drives', icon: Tent },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'cold_chain', label: 'Cold Chain Monitor', icon: ThermometerSnowflake },
    { id: 'alerts', label: 'Alerts & Notifications', icon: Bell },
    { id: 'user_mgmt', label: 'User Management', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Bar Chart Data (May 11 to May 17)
  const barChartData = [
    { date: 'May 11', collected: 52, issued: 36 },
    { date: 'May 12', collected: 68, issued: 48 },
    { date: 'May 13', collected: 62, issued: 45 },
    { date: 'May 14', collected: 45, issued: 38 },
    { date: 'May 15', collected: 64, issued: 42 },
    { date: 'May 16', collected: 42, issued: 34 },
    { date: 'May 17', collected: 58, issued: 46 }
  ];

  return (
    <div id="blood-bank-control-center" className="w-full h-full bg-[#0b0f19] text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* Top Header Bar */}
      <header className="h-16 px-4 sm:px-6 bg-[#0e1322] border-b border-slate-800/80 flex items-center justify-between gap-4 z-30 shrink-0">
        {/* Left Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/60 flex items-center justify-center text-red-500 shadow-lg shadow-red-900/30">
            <Droplet className="w-5 h-5 fill-red-500 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white tracking-tight">Prathmikta</span>
              <span className="text-[11px] font-bold text-slate-400">Blood Bank Control Center</span>
            </div>
          </div>
        </div>

        {/* Center Search Input Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search donor, request, or bag ID..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50"
            />
          </div>
        </div>

        {/* Right Status Controls, Date & Profile */}
        <div className="flex items-center gap-4">
          {/* Quick Route Switcher */}
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
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
                setMode('ambulance');
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-900/50 transition-colors font-semibold"
            >
              Ambulance 108 (/a)
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
          </div>

          {/* Notification Bell with Badge */}
          <div className="relative">
            <button
              onClick={() => {
                playTactileClick();
                setShowNotifications(!showNotifications);
              }}
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-[#0e1322]">
                8
              </span>
            </button>
          </div>

          {/* Date & Live Timestamp */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div className="text-left leading-tight">
              <span className="font-bold text-slate-200 block">May 17, 2024</span>
              <span className="text-[10px] text-slate-400 font-mono">10:24:36 AM</span>
            </div>
          </div>

          {/* Profile Card */}
          <div className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <img
              src="https://images.unsplash.com/photo-1594824813589-3221946eb617?w=100&auto=format&fit=crop&q=60"
              alt="Dr. Ananya Singh"
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-red-500/50"
            />
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-slate-100 block leading-tight">Dr. Ananya Singh</span>
              <span className="text-[10px] text-slate-400 block leading-none">Center Incharge</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-60 bg-[#0e1322] border-r border-slate-800/80 flex flex-col justify-between shrink-0">
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-red-950/70 text-white border-l-4 border-l-red-600 border-y border-r border-red-900/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-red-500' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* 24/7 Helpline Bottom Card */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="text-left overflow-hidden">
                <span className="text-[10px] text-slate-400 block font-medium">24/7 Helpline</span>
                <span className="text-xs font-black text-white block tracking-tight truncate">1800-309-8765</span>
                <span className="text-[9px] text-red-400 block font-semibold">Emergency Support</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Dashboard Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 bg-[#090d16]">
          {/* CRITICAL SHORTAGE ALERT BANNER */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/90 via-red-900/70 to-red-950/90 border border-red-600/60 shadow-xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-600/40">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-300 block">
                  Critical Shortage
                </span>
                <h2 className="text-sm font-black text-white tracking-tight">
                  O-negative (O-) blood group is critically low!
                </h2>
                <p className="text-xs text-red-200/90 mt-0.5">
                  Immediate action required. Please organize a donor drive.
                </p>
              </div>
            </div>

            <button
              id="btn-view-details-critical"
              onClick={() => {
                playTactileClick();
                setShowCriticalModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-white border border-red-500/80 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              View Details
            </button>
          </div>

          {/* 2 Column Main Grid (Inventory & Charts Left, Overview & Cold Chain Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column (8 Cols) */}
            <div className="lg:col-span-8 space-y-5">
              {/* BLOOD INVENTORY - TOTAL UNITS */}
              <div className="bg-[#0e1322] rounded-3xl border border-slate-800/90 p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Blood Inventory &mdash; Total Units
                  </span>
                  <button
                    onClick={() => {
                      playTactileClick();
                      playConfirmChime();
                    }}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* 8 Blood Group Cards (4 Cols x 2 Rows) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(bloodInventory).map(([grp, count]) => {
                    const isCritical = grp === 'O-' && count <= 10;
                    return (
                      <div
                        key={grp}
                        className={`rounded-2xl p-3.5 flex flex-col justify-between transition-all ${
                          isCritical
                            ? 'bg-red-950/60 border-2 border-red-500 shadow-lg shadow-red-950/50 relative'
                            : 'bg-slate-900/80 border border-slate-800/90'
                        }`}
                      >
                        {/* Top: Group label & Drop Icon */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xl font-black text-white">{grp}</span>
                            {isCritical && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-600 text-white uppercase">
                                Critical
                              </span>
                            )}
                          </div>
                          <Droplet className={`w-4 h-4 ${isCritical ? 'text-red-500 fill-red-500' : 'text-red-400 fill-red-400/40'}`} />
                        </div>

                        {/* Middle: Count & Label */}
                        <div className="my-2">
                          <span className={`text-2xl font-black font-mono block ${isCritical ? 'text-red-400' : 'text-white'}`}>
                            {count}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">Units Available</span>
                        </div>

                        {/* Bottom: Plus & Minus Steppers */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <button
                            onClick={() => handleAdjustUnits(grp, 1)}
                            className="py-1 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-900/50 flex items-center justify-center transition-colors cursor-pointer"
                            title={`Add 1 unit to ${grp}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAdjustUnits(grp, -1)}
                            className="py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/50 flex items-center justify-center transition-colors cursor-pointer"
                            title={`Deduct 1 unit from ${grp}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Inventory Summary Strip */}
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Units</span>
                    <span className="text-lg font-black text-white font-mono mt-0.5 block">{totalUnits}</span>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-amber-400 font-bold uppercase block">Expiring Soon</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg font-black text-amber-400 font-mono">23</span>
                      <span className="text-[9px] text-slate-400">(Within 7 Days)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase block">Collection Today</span>
                    <span className="text-lg font-black text-white font-mono mt-0.5 block">18 <span className="text-xs text-slate-400">Units</span></span>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase block">Issued Today</span>
                    <span className="text-lg font-black text-white font-mono mt-0.5 block">27 <span className="text-xs text-slate-400">Units</span></span>
                  </div>
                </div>
              </div>

              {/* Bottom Split (Collection Chart Left + Recent Requests Right) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Blood Collection & Issuance Chart (6 Cols) */}
                <div className="md:col-span-6 bg-[#0e1322] rounded-3xl border border-slate-800/90 p-5 shadow-2xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">
                        Blood Collection &amp; Issuance
                      </h3>
                      <span className="text-[10px] text-slate-400">(This Week)</span>
                    </div>

                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="text-xs bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none"
                    >
                      <option value="This Week">This Week</option>
                      <option value="Last Week">Last Week</option>
                      <option value="This Month">This Month</option>
                    </select>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 text-[11px] mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-red-600"></span>
                      <span className="text-slate-300">Collected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-slate-600"></span>
                      <span className="text-slate-300">Issued</span>
                    </div>
                  </div>

                  {/* Custom Bar Chart SVG */}
                  <div className="h-44 w-full relative flex items-end justify-between pt-4 pb-1 px-2 border-b border-slate-800">
                    {barChartData.map((d, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="w-full flex items-end justify-center gap-1 h-36">
                          {/* Collected Red Bar */}
                          <div
                            className="w-3 rounded-t-sm bg-red-600 hover:bg-red-500 transition-all group-hover:brightness-125"
                            style={{ height: `${(d.collected / 80) * 100}%` }}
                            title={`Collected: ${d.collected} units`}
                          ></div>
                          {/* Issued Gray Bar */}
                          <div
                            className="w-3 rounded-t-sm bg-slate-600 hover:bg-slate-500 transition-all group-hover:brightness-125"
                            style={{ height: `${(d.issued / 80) * 100}%` }}
                            title={`Issued: ${d.issued} units`}
                          ></div>
                        </div>
                        <span className="text-[9px] text-slate-400 font-medium">{d.date.replace('May ', '')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 pt-2 font-mono">
                    <span>May 11</span>
                    <span>May 17</span>
                  </div>
                </div>

                {/* Recent Requests Table (6 Cols) */}
                <div className="md:col-span-6 bg-[#0e1322] rounded-3xl border border-slate-800/90 p-5 shadow-2xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-white uppercase tracking-wider">Recent Requests</span>
                    <button
                      onClick={() => playTactileClick()}
                      className="text-xs text-red-400 hover:underline font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-bold">
                          <th className="pb-2">Request ID</th>
                          <th className="pb-2">Patient</th>
                          <th className="pb-2">Grp</th>
                          <th className="pb-2">Units</th>
                          <th className="pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {requests.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-900/50 transition-colors">
                            <td className="py-2.5 font-mono text-slate-300">{req.id.slice(-7)}</td>
                            <td className="py-2.5 text-white font-semibold">{req.patient}</td>
                            <td className="py-2.5 font-black text-red-400">{req.group}</td>
                            <td className="py-2.5 text-slate-300">{req.units}</td>
                            <td className="py-2.5">
                              <button
                                onClick={() => handleToggleRequest(req.id)}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                                  req.status === 'Approved'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {req.status}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (4 Cols: Today's Overview, Cold Chain & Notifications) */}
            <div className="lg:col-span-4 space-y-5">
              {/* TODAY'S OVERVIEW */}
              <div className="bg-[#0e1322] rounded-3xl border border-slate-800/90 p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase tracking-wider">Today's Overview</span>
                  <button onClick={() => playTactileClick()} className="text-xs text-red-400 hover:underline font-semibold">
                    View Full Report
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-lg font-black text-white font-mono block leading-none">32</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Total Donors</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                      <Droplet className="w-4 h-4 fill-red-400" />
                    </div>
                    <div>
                      <span className="text-lg font-black text-white font-mono block leading-none">18</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Units Collected</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-lg font-black text-white font-mono block leading-none">27</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Units Issued</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-lg font-black text-amber-400 font-mono block leading-none">4</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Pending Requests</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLD CHAIN MONITOR */}
              <div className="bg-[#0e1322] rounded-3xl border border-slate-800/90 p-5 shadow-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase tracking-wider">Cold Chain Monitor</span>
                  <button onClick={() => playTactileClick()} className="text-xs text-red-400 hover:underline font-semibold">
                    View All
                  </button>
                </div>

                <div className="space-y-2.5">
                  {/* Unit 1 */}
                  <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center">
                        <ThermometerSnowflake className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Blood Bank Refrigerator 1</span>
                        <span className="text-[9px] text-slate-500 font-mono">PRBB/REF/01</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-400 font-mono">4.1&deg;C</span>
                      <span className="text-[9px] text-emerald-500/80 block">Optimal</span>
                    </div>
                  </div>

                  {/* Unit 2 */}
                  <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center">
                        <ThermometerSnowflake className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Blood Bank Refrigerator 2</span>
                        <span className="text-[9px] text-slate-500 font-mono">PRBB/REF/02</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-400 font-mono">3.8&deg;C</span>
                      <span className="text-[9px] text-emerald-500/80 block">Optimal</span>
                    </div>
                  </div>

                  {/* Unit 3: Platelet Agitator */}
                  <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-950/60 text-purple-400 flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Platelet Agitator</span>
                        <span className="text-[9px] text-slate-500 font-mono">PRBB/AGT/01</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-400 font-mono">22.0&deg;C</span>
                      <span className="text-[9px] text-emerald-500/80 block">Optimal</span>
                    </div>
                  </div>

                  {/* Unit 4: Plasma Freezer */}
                  <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-cyan-950/60 text-cyan-400 flex items-center justify-center">
                        <ThermometerSnowflake className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Plasma Freezer</span>
                        <span className="text-[9px] text-slate-500 font-mono">PRBB/FRZ/01</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-400 font-mono">-29.1&deg;C</span>
                      <span className="text-[9px] text-emerald-500/80 block">Optimal</span>
                    </div>
                  </div>

                  {/* Unit 5: Backup Refrigerator (High Temp Alert) */}
                  <div className="p-2.5 bg-red-950/40 border border-red-900/60 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-red-900/40 text-red-400 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Backup Refrigerator</span>
                        <span className="text-[9px] text-slate-500 font-mono">PRBB/REF/BK</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-amber-400 font-mono">7.2&deg;C</span>
                      <span className="text-[9px] text-amber-400 block font-semibold">High</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    All systems operational
                  </span>
                  <span>Updated: 10:24 AM</span>
                </div>
              </div>

              {/* LATEST NOTIFICATIONS */}
              <div className="bg-[#0e1322] rounded-3xl border border-slate-800/90 p-5 shadow-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase tracking-wider">Latest Notifications</span>
                  <button onClick={() => playTactileClick()} className="text-xs text-red-400 hover:underline font-semibold">
                    View All
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 bg-slate-900/70 rounded-2xl border border-slate-800 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Droplet className="w-3.5 h-3.5 fill-red-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">Critical Shortage: O-negative</span>
                        <span className="text-[9px] text-slate-500">10:18 AM</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">O-negative blood group is critically low.</p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900/70 rounded-2xl border border-slate-800 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">New Blood Request</span>
                        <span className="text-[9px] text-slate-500">10:15 AM</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">2 units of O- requested from City Hospital.</p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900/70 rounded-2xl border border-slate-800 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Tent className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">Donor Drive Scheduled</span>
                        <span className="text-[9px] text-slate-500">09:45 AM</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Mega Blood Donation Camp on May 20, 2024.</p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900/70 rounded-2xl border border-slate-800 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">Unit Expiry Alert</span>
                        <span className="text-[9px] text-slate-500">09:30 AM</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">5 units (A+) expiring on May 22, 2024.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Critical Shortage Details Modal */}
      {showCriticalModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1322] border border-red-500/60 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center">
                  <Droplet className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase">O-Negative Emergency Action Protocol</h3>
                  <span className="text-[10px] text-red-400 font-bold">Only 5 Units Remaining in Grid</span>
                </div>
              </div>
              <button onClick={() => setShowCriticalModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="p-3.5 bg-red-950/40 border border-red-900/60 rounded-2xl text-slate-300 leading-relaxed">
                <strong className="text-white block mb-1">Recommended Emergency Measures:</strong>
                &bull; Auto-SMS broadcast to registered universal O- donors in New Delhi / NCR grid.
                <br />
                &bull; Notify Regional DEOC for inter-facility blood transfer from Safdarjung Apex Bank.
                <br />
                &bull; Reserve remaining 5 units strictly for Polytrauma &amp; OB-GYN emergency codes.
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">Registered O- Donors in Radius</span>
                  <span className="text-sm font-black text-white">142 Donors Available</span>
                </div>
                <button
                  onClick={() => {
                    playTactileClick();
                    playConfirmChime();
                    setShowCriticalModal(false);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-red-600/30"
                >
                  Broadcast SMS Drive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
