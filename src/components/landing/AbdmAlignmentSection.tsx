import React from 'react';
import {
  ShieldCheck,
  Building2,
  Ambulance,
  HeartHandshake,
  CheckCircle2,
  UserCheck,
  FileHeart,
  Landmark
} from 'lucide-react';

export const AbdmAlignmentSection: React.FC = () => {
  return (
    <section
      id="abdm-alignment-section"
      className="py-12 sm:py-16 bg-gradient-to-b from-white via-slate-50/50 to-white border-y border-slate-200/80 select-none"
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 space-y-10">
        
        {/* Section Header */}
        <div className="text-center space-y-2.5 max-w-3xl mx-auto">
          <h2 className="text-sm sm:text-base font-black tracking-wider text-slate-800 uppercase">
            GOVERNMENT &amp; AYUSHMAN BHARAT DIGITAL MISSION (ABDM) ALIGNMENT
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Building the National Emergency Care Grid of India
          </p>
          {/* Indian Tiranga Tri-color Indicator Bar */}
          <div className="flex items-center justify-center gap-0.5 pt-1">
            <span className="w-6 h-1 rounded-l-full bg-[#FF9933]" />
            <span className="w-6 h-1 bg-white border-y border-slate-200" />
            <span className="w-6 h-1 rounded-r-full bg-[#138808]" />
          </div>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: ABHA Digital Health Record Sync */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                <div className="relative">
                  <UserCheck className="w-7 h-7" />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-blue-600 text-white flex items-center justify-center text-[7px] font-black">
                    ♥
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  ABHA Digital Health Record Sync
                </h3>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Instant retrieval of blood group, chronic conditions, allergies and past surgeries for unconscious or critical patients.
            </p>
          </div>

          {/* Card 2: Health Facility Registry (HFR) Bed Transparency */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  Health Facility Registry (HFR) Bed Transparency
                </h3>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Standardized, real-time bed, ICU and ventilator matrix across government and private health facilities.
            </p>
          </div>

          {/* Card 3: 108 / 112 Fleet Pre-Arrival Integration */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 shadow-inner">
                <div className="relative">
                  <Ambulance className="w-7 h-7" />
                  <span className="absolute -top-1 -right-1 text-red-500 font-bold text-xs animate-pulse">
                    +
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  108 / 112 Fleet Pre-Arrival Integration
                </h3>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Digital handshake between paramedics and ER doctors for faster handover and better outcomes.
            </p>
          </div>

        </div>

        {/* Bottom Compliance & NHA/ABDM Badges Bar */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Left: Security & Compliance info */}
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-slate-900">
                Secure. Private. Compliant.
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Fully aligned with DPDP Act, 2023 &amp; National Digital Health Mission (NDHM) standards.
              </p>
            </div>
          </div>

          {/* Right: National Health Authority & ABDM Integrated Official Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 shrink-0">
            
            {/* National Health Authority Logo Mock */}
            <div className="flex items-center gap-2 text-left">
              {/* Ashoka Pillar Emblem Style Graphic */}
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-1 text-slate-700">
                <Landmark className="w-4 h-4" />
                <span className="text-[6px] font-black uppercase tracking-tighter">सत्यमेव जयते</span>
              </div>
              <div className="leading-tight font-serif">
                <div className="text-[11px] font-bold text-slate-800 tracking-tight">national</div>
                <div className="text-[11px] font-bold text-slate-800 tracking-tight">health</div>
                <div className="text-[11px] font-bold text-slate-800 tracking-tight">authority</div>
              </div>
            </div>

            {/* ABDM Integrated Badge */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200">
              {/* ABDM Geometric Diamond Logo */}
              <div className="w-7 h-7 relative flex items-center justify-center">
                <div className="w-5 h-5 rotate-45 border-2 border-blue-600 relative rounded-sm flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-xs font-black tracking-tight text-slate-900">ABDM</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Integrated</div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100 ml-1" />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
