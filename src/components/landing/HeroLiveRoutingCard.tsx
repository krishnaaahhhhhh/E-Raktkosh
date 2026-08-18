import React, { useState } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import {
  CheckCircle2,
  BedDouble,
  Clock,
  Car,
  Plus,
  Minus,
  Crosshair,
  Navigation,
  Activity,
  HeartPulse
} from 'lucide-react';
import { playConfirmChime, playTactileClick } from '../../lib/audio';

export const HeroLiveRoutingCard: React.FC = () => {
  const { setMode } = usePrathmikta();
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleNavigateClick = () => {
    playConfirmChime();
    setMode('patient');
  };

  const handleControlClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTactileClick();
  };

  return (
    <div
      id="hero-live-routing-card"
      onClick={handleNavigateClick}
      className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/80 overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-red-500/10 transition-all group select-none"
      title="Click to launch live emergency navigation"
    >
      <div className="grid grid-cols-1 sm:grid-cols-12 min-h-[380px]">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Map & Live Routing (6 or 7 cols) */}
        {/* ========================================================================= */}
        <div className="sm:col-span-6 lg:col-span-6 relative bg-[#f1f5f9] overflow-hidden flex flex-col justify-between p-3.5 min-h-[260px] sm:min-h-full border-b sm:border-b-0 sm:border-r border-slate-200">
          
          {/* Vector Map Background SVG */}
          <div className="absolute inset-0 pointer-events-none">
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 320 320"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Map Land Background */}
              <rect width="320" height="320" fill="#f8fafc" />

              {/* River / Water Canal Stream */}
              <path
                d="M -20 280 C 60 270, 100 240, 120 190 C 140 140, 180 120, 340 70"
                fill="none"
                stroke="#bae6fd"
                strokeWidth="28"
                strokeLinecap="round"
                opacity="0.85"
              />
              <path
                d="M -20 280 C 60 270, 100 240, 120 190 C 140 140, 180 120, 340 70"
                fill="none"
                stroke="#e0f2fe"
                strokeWidth="18"
                strokeLinecap="round"
              />

              {/* City Road Network Grid */}
              {/* Secondary roads */}
              <path d="M 0 50 L 320 50" stroke="#ffffff" strokeWidth="6" />
              <path d="M 0 50 L 320 50" stroke="#e2e8f0" strokeWidth="2" />
              
              <path d="M 0 130 L 320 130" stroke="#ffffff" strokeWidth="8" />
              <path d="M 0 130 L 320 130" stroke="#e2e8f0" strokeWidth="2" />

              <path d="M 0 210 L 320 210" stroke="#ffffff" strokeWidth="6" />
              <path d="M 0 210 L 320 210" stroke="#e2e8f0" strokeWidth="2" />

              <path d="M 60 0 L 60 320" stroke="#ffffff" strokeWidth="8" />
              <path d="M 60 0 L 60 320" stroke="#e2e8f0" strokeWidth="2" />

              <path d="M 170 0 L 170 320" stroke="#ffffff" strokeWidth="7" />
              <path d="M 170 0 L 170 320" stroke="#e2e8f0" strokeWidth="2" />

              <path d="M 260 0 L 260 320" stroke="#ffffff" strokeWidth="8" />
              <path d="M 260 0 L 260 320" stroke="#e2e8f0" strokeWidth="2" />

              {/* Diagonal Main Arterial Roads (GT Road) */}
              <path d="M -20 30 L 300 320" stroke="#ffffff" strokeWidth="12" />
              <path d="M -20 30 L 300 320" stroke="#cbd5e1" strokeWidth="3" />

              <path d="M 280 0 L 20 300" stroke="#ffffff" strokeWidth="10" />
              <path d="M 280 0 L 20 300" stroke="#e2e8f0" strokeWidth="2" />

              {/* Active Blue Navigation Route Polyline (Leading to Hospital Pin) */}
              <path
                d="M 85 205 L 115 155 L 102 145 L 125 105 L 155 102 L 180 80 L 205 60"
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 85 205 L 115 155 L 102 145 L 125 105 L 155 102 L 180 80 L 205 60"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* User Location Radar Pulse Wave */}
              <circle cx="85" cy="205" r="32" fill="#3b82f6" fillOpacity="0.12" />
              <circle cx="85" cy="205" r="20" fill="#3b82f6" fillOpacity="0.2" />
              <circle cx="85" cy="205" r="7" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />

              {/* Hospital Location Pin Drop Marker */}
              <g transform="translate(205, 60)">
                {/* Pin Shadow */}
                <ellipse cx="0" cy="18" rx="8" ry="3.5" fill="#64748b" opacity="0.3" />
                {/* Pin Body */}
                <path
                  d="M 0 16 C -9 8 -13 0 -13 -7 C -13 -15 -7 -21 0 -21 C 7 -21 13 -15 13 -7 C 13 0 9 8 0 16 Z"
                  fill="#dc2626"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                {/* White H Symbol */}
                <text
                  x="0"
                  y="-2"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="900"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  textAnchor="middle"
                >
                  H
                </text>
              </g>
            </svg>
          </div>

          {/* Top-Left Floating Badge: "Live Routing" + "LIVE" */}
          <div className="relative z-10 self-start flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-800 tracking-tight">Live Routing</span>
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider animate-pulse">
              LIVE
            </span>
          </div>

          {/* Right Floating Map Controls: Zoom in, Zoom out, Recenter */}
          <div
            onClick={handleControlClick}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 flex flex-col bg-white rounded-xl border border-slate-200 shadow-md divide-y divide-slate-100 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.1, 1.5))}
              className="p-2 text-slate-700 hover:bg-slate-50 transition-colors"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.1, 0.8))}
              className="p-2 text-slate-700 hover:bg-slate-50 transition-colors"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="p-2 text-slate-700 hover:bg-slate-50 transition-colors"
              title="Current Location"
            >
              <Crosshair className="w-3.5 h-3.5 text-slate-800" />
            </button>
          </div>

          {/* Bottom Floating ETA Card */}
          <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-slate-200 shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Car className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[11px] text-slate-500 font-medium">ETA (via GT Road)</div>
                <div className="text-sm font-black text-emerald-600 leading-tight">7 min</div>
              </div>
            </div>
            <div className="text-xs font-bold text-slate-600 font-mono">
              2.1 km
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Nearest Hospital & Live Availability (6 or 7 cols) */}
        {/* ========================================================================= */}
        <div className="sm:col-span-6 lg:col-span-6 p-4 sm:p-5 flex flex-col justify-between space-y-4 bg-white text-left">
          
          {/* Top Header: Nearest Hospital + Verified Badge */}
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-slate-900 tracking-tight">Nearest Hospital</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
          </div>

          {/* Hospital Photo Thumbnail */}
          <div className="relative w-full h-24 sm:h-28 rounded-2xl overflow-hidden border border-slate-200/80 shadow-inner group-hover:scale-[1.01] transition-transform">
            <img
              src="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80"
              alt="GSVM Medical College & Hospital"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
          </div>

          {/* Hospital Name Title */}
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug tracking-tight">
              GSVM Medical College &amp; Hospital
            </h3>
          </div>

          {/* Bed & Medical Resource Availability List */}
          <div className="space-y-2.5 text-xs">
            {/* ICU Beds */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ICU Beds Available</span>
              </div>
              <span className="font-black text-slate-900 text-sm">4</span>
            </div>

            {/* General Beds */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <BedDouble className="w-4 h-4 text-blue-600" />
                <span>General Beds Available</span>
              </div>
              <span className="font-black text-slate-900 text-sm">12</span>
            </div>

            {/* Ventilators */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Activity className="w-4 h-4 text-purple-600" />
                <span>Ventilators Available</span>
              </div>
              <span className="font-black text-slate-900 text-sm">3</span>
            </div>

            {/* Distance */}
            <div className="flex items-center justify-between pt-0.5 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>Distance</span>
              </div>
              <span className="font-bold text-slate-800 text-xs">2.1 km</span>
            </div>
          </div>

          {/* Bottom Solid Red "Navigate Now" Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigateClick();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#e62020] hover:bg-[#d01818] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-red-600/30 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Navigate Now</span>
            <Navigation className="w-4 h-4 fill-white rotate-45" />
          </button>

        </div>

      </div>
    </div>
  );
};
