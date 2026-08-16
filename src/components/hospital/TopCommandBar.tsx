import React, { useEffect, useState } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import {
  Hospital,
  Activity,
  Pill,
  Clock,
  Volume2,
  VolumeX,
  ScanLine,
  ShieldAlert,
  BellRing,
  Radio,
  Sparkles
} from 'lucide-react';
import { PharmacyStockModal } from './PharmacyStockModal';
import { QrScannerModal } from './QrScannerModal';
import { playCodeRedAlert } from '../../lib/audio';

export const TopCommandBar: React.FC = () => {
  const {
    activeHospital,
    isConnected,
    isAudioEnabled,
    toggleAudio
  } = usePrathmikta();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPharmacyModalOpen, setIsPharmacyModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

  // Live Precision Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalBeds = activeHospital.totalFacilityBeds || 112;
  const occupiedBeds = activeHospital.occupiedFacilityBeds || 84;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);
  const availableBeds = totalBeds - occupiedBeds;

  // Compute ICU total and occupied across floors
  const totalIcuBeds = activeHospital.floors.reduce((acc, f) => acc + f.icuBeds.total, 0);
  const occupiedIcuBeds = activeHospital.floors.reduce((acc, f) => acc + f.icuBeds.occupied, 0);
  const icuAvailable = totalIcuBeds - occupiedIcuBeds;

  // Compute Ventilators in use across floors
  const totalVents = activeHospital.floors.reduce((acc, f) => acc + f.ventilators.total, 0);
  const inUseVents = activeHospital.floors.reduce((acc, f) => acc + f.ventilators.inUse, 0);

  const formattedIstTime = currentTime.toLocaleTimeString('en-IN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const formattedUtcTime = currentTime.toISOString().slice(11, 19);

  return (
    <header
      id="top-command-bar"
      className="w-full bg-[#080d1a] border-b border-cyan-500/30 px-4 py-2.5 shadow-2xl flex items-center justify-between gap-4 flex-wrap select-none text-slate-100 z-30"
    >
      {/* Hospital Branding & Status */}
      <div className="flex items-center gap-3 min-w-[280px]">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600/30 to-blue-700/40 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <Hospital className="w-5 h-5 text-cyan-300" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-1.5">
              <span>{activeHospital.name}</span>
            </h1>
            <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              COMMAND TV 4K
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {activeHospital.tagline} • <span className="text-emerald-400 font-semibold">{activeHospital.city}</span>
          </p>
        </div>
      </div>

      {/* Facility Capacity Gauges */}
      <div className="flex items-center gap-3">
        {/* Overall Facility Bed Utilization */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#0c1220] border border-slate-800">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={occupancyRate > 85 ? 'text-red-500' : 'text-cyan-400'}
                strokeDasharray={`${occupancyRate}, 100`}
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-black font-mono text-white">{occupancyRate}%</span>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Operational Beds</div>
            <div className="text-xs font-mono font-bold text-slate-100 flex items-center gap-1.5">
              <span className="text-white">{occupiedBeds} Occ</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{totalBeds} Total</span>
              <span className="text-emerald-400 font-bold ml-1">({availableBeds} Free)</span>
            </div>
          </div>
        </div>

        {/* Critical ICU & Ventilator utilization */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#0c1220] border border-slate-800">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Critical ICU Beds</div>
            <div className="text-xs font-mono font-bold text-cyan-300">
              {occupiedIcuBeds}/{totalIcuBeds} Occ <span className="text-emerald-400">({icuAvailable} Free)</span>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Ventilators</div>
            <div className="text-xs font-mono font-bold text-amber-300">
              {inUseVents}/{totalVents} In Use
            </div>
          </div>
        </div>

        {/* 24/7 Medical Store Status Pill */}
        <button
          id="btn-open-pharmacy-store"
          onClick={() => setIsPharmacyModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0c1220] hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 transition-all text-left"
        >
          <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Pill className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-300">24/7 Medical Store</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[11px] font-mono text-emerald-300 font-semibold">
              Emergency Stock Active (Edit)
            </div>
          </div>
        </button>
      </div>

      {/* Right Controls: Scanner, Audio Alarm, Military Clock */}
      <div className="flex items-center gap-3">
        {/* Handheld QR Scanner Intake Modal Trigger */}
        <button
          id="btn-open-qr-scanner"
          onClick={() => setIsScannerModalOpen(true)}
          className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
          title="Scan patient QR Pass"
        >
          <ScanLine className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Scan QR Intake</span>
        </button>

        {/* Siren Test / Audio Toggle */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
          <button
            id="btn-test-siren"
            onClick={playCodeRedAlert}
            title="Test Emergency Siren Tone"
            className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/60 transition-colors"
          >
            <BellRing className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-toggle-sound"
            onClick={toggleAudio}
            title={isAudioEnabled ? 'Mute Alert Sound' : 'Enable Alert Sound'}
            className={`p-1.5 rounded-lg transition-colors ${
              isAudioEnabled ? 'text-cyan-400 hover:bg-cyan-950/60' : 'text-slate-500 hover:bg-slate-800'
            }`}
          >
            {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Live Precision Clock */}
        <div className="px-3 py-1 rounded-xl bg-[#070b14] border border-cyan-500/40 text-right font-mono">
          <div className="text-xs font-black text-white tracking-widest flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{formattedIstTime}</span>
            <span className="text-[10px] text-cyan-400">IST</span>
          </div>
          <div className="text-[9px] text-slate-400">
            {formattedUtcTime} UTC • {isConnected ? <span className="text-emerald-400 font-bold">WS SYNC</span> : <span className="text-red-400 font-bold">OFFLINE</span>}
          </div>
        </div>
      </div>

      {/* Pharmacy Stock Modal */}
      <PharmacyStockModal
        isOpen={isPharmacyModalOpen}
        onClose={() => setIsPharmacyModalOpen(false)}
      />

      {/* Scanner Intake Modal */}
      <QrScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
      />
    </header>
  );
};
