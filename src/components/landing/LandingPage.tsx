import React, { useState, useEffect } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import BorderGlow from './BorderGlow';
import InfiniteGallery from '../ui/3d-gallery-photography';
import { getEmergencyGalleryImages } from '../../data/galleryImages';
import OurSolutionVideoSection from './OurSolutionVideoSection';
import { AbdmAlignmentSection } from './AbdmAlignmentSection';
import { HeroLiveRoutingCard } from './HeroLiveRoutingCard';
import {
  PhoneCall,
  MapPin,
  Clock,
  BedDouble,
  Activity,
  Stethoscope,
  ShieldCheck,
  Radio,
  Zap,
  Eye,
  Lock,
  Users,
  Building2,
  Share2,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  CheckCircle2,
  Heart,
  Navigation,
  ArrowRight,
  ExternalLink,
  AlertOctagon,
  Droplet,
  ArrowRightLeft,
  KeyRound,
  FileText
} from 'lucide-react';
import { playTactileClick, playConfirmChime } from '../../lib/audio';

export const LandingPage: React.FC = () => {
  const { setMode } = usePrathmikta();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesDropdownOpen, setResourcesDropdownOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [currentCity, setCurrentCity] = useState('Kanpur, Uttar Pradesh');
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [resourcesModalOpen, setResourcesModalOpen] = useState(false);

  // Auto Geolocation detection
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // If in India or local coords, keep nice display name
          setCurrentCity('Kanpur, Uttar Pradesh');
        },
        () => {
          setCurrentCity('Kanpur, Uttar Pradesh');
        },
        { timeout: 4000 }
      );
    }
  }, []);

  const handleGoldenHourClick = () => {
    playConfirmChime();
    setMode('patient');
  };

  const handleShare = async () => {
    playTactileClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Prathmikta - Smart Emergency & Triage Grid',
          text: 'Instant pre-hospital triage, live bed tracking, and emergency routing.',
          url: window.location.href
        });
      } catch {
        // Fallback to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  return (
    <div id="prathmikta-landing-root" className="w-full h-full overflow-y-auto bg-white text-slate-900 font-sans selection:bg-red-500 selection:text-white">
      {/* ========================================================================= */}
      {/* HERO SECTION (Headline, Badges, Interactive Live Map & Hospital Routing) */}
      {/* ========================================================================= */}
      <section id="landing-hero" className="relative overflow-hidden pt-8 sm:pt-14 pb-12 sm:pb-20 bg-gradient-to-b from-slate-50/80 via-white to-white">
        {/* Subtle City/Grid Blueprint Background */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:18px_18px]" />

        <div className="w-full px-4 sm:px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column (6 cols): Hero Headlines & Trust Pillars */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-left">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
                  Your Emergency. <br />
                  <span className="text-[#e62020] inline-block">Our Priority.</span>
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-slate-600 font-normal leading-relaxed max-w-xl">
                  Prathmikta connects you to the right hospital, right now. Real-time beds, live routes, and pre-arrival care — all in one place.
                </p>
              </div>

              {/* 3 Feature Trust Badges */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
                {/* Badge 1 */}
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900 leading-tight">Zero Delay</div>
                    <div className="text-[11px] text-slate-500 font-medium">Instant Triage</div>
                  </div>
                </div>

                {/* Badge 2 */}
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900 leading-tight">Trusted Network</div>
                    <div className="text-[11px] text-slate-500 font-medium">Verified Hospitals</div>
                  </div>
                </div>

                {/* Badge 3 */}
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900 leading-tight">Always Ready</div>
                    <div className="text-[11px] text-slate-500 font-medium">24/7 Emergency Grid</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (6 cols): Live Routing & Nearest Hospital Card */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <HeroLiveRoutingCard />
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. ABDM & GOVERNMENT ALIGNMENT SECTION */}
      {/* ========================================================================= */}
      <AbdmAlignmentSection />

      {/* ========================================================================= */}
      {/* 3.5. 3D MISSION & REALITY GALLERY: "LIVES ARE PRECIOUS" (DARK ARCHIVE) */}
      {/* ========================================================================= */}
      <section
        id="lives-are-precious-gallery-section"
        className="relative overflow-hidden bg-black text-white border-y border-neutral-900 select-none py-6 sm:py-10"
      >
        {/* Deep atmospheric ambient lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-red-600/10 filter blur-[160px] pointer-events-none rounded-full" />
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-amber-500/5 filter blur-[140px] pointer-events-none rounded-full" />

        <div className="w-full px-2 sm:px-6 lg:px-8 relative z-10">
          
          {/* 3D Infinite Newspaper Archive Stage Container */}
          <div className="relative w-full h-[580px] sm:h-[680px] lg:h-[760px] rounded-3xl overflow-hidden border border-neutral-800/80 bg-[#050505] shadow-2xl group">
            
            {/* 3D WebGL Canvas with scorched newsprint clippings */}
            <InfiniteGallery
              images={getEmergencyGalleryImages()}
              speed={1.1}
              visibleCount={10}
              fadeSettings={{
                fadeIn: { start: 0.04, end: 0.22 },
                fadeOut: { start: 0.78, end: 0.94 },
              }}
              blurSettings={{
                blurIn: { start: 0.0, end: 0.1 },
                blurOut: { start: 0.8, end: 0.95 },
                maxBlur: 6.0,
              }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            />

            {/* Center Editorial Title & Subtitle Overlay (Matching Screenshot Layout) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 px-4 text-center select-none">
              <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto transform -translate-y-2">
                
                {/* Eyebrow: ARCHIVE OF DISASTER / CRISIS */}
                <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.35em] text-neutral-400 font-semibold drop-shadow-md">
                  Archive of Healthcare Crisis
                </p>

                {/* Main Hero Display: Lives are Precious in Italic Serif */}
                <h2 className="font-serif italic font-normal text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white/95 drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)]">
                  Lives are Precious
                </h2>

                {/* Sub-Eyebrow: NEWSPRINT REPORTS */}
                <p className="font-mono text-[10px] sm:text-xs tracking-[0.22em] uppercase text-neutral-400 max-w-2xl mx-auto font-medium drop-shadow-md leading-relaxed">
                  Newsprint Reports of Preventable Ambulance &amp; Bed Delays
                </p>

              </div>
            </div>

            {/* Bottom Interaction Guide Hint (Matching Screenshot Navigation String) */}
            <div className="absolute bottom-5 left-0 right-0 pointer-events-none text-center font-mono uppercase text-[10px] sm:text-[11px] text-neutral-400/90 font-medium tracking-[0.25em] flex items-center justify-center gap-2 z-20">
              <span>Use mouse wheel, arrow keys, or touch to navigate</span>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3.75. OUR SOLUTION INTERACTIVE VIDEO FILM SECTION */}
      {/* ========================================================================= */}
      <OurSolutionVideoSection
        onStartTriage={handleGoldenHourClick}
        onExploreHospitals={() => {
          playTactileClick();
          setMode('hospital');
        }}
      />

      {/* ========================================================================= */}
      {/* 4. "WHAT WE OFFER" 4-CARD EMERGENCY ECOSYSTEM */}
      {/* ========================================================================= */}
      <section id="what-we-offer" className="py-16 sm:py-20 bg-slate-50/50 border-t border-slate-200/80">
        <div className="w-full px-4 sm:px-8 lg:px-12 space-y-12">
          
          {/* Section Header with Pulse Line */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 text-red-600 font-bold">
              <svg className="w-8 h-4 stroke-red-600 fill-none stroke-2" viewBox="0 0 50 20">
                <path d="M 0 10 L 15 10 L 20 2 L 25 18 L 30 5 L 35 12 L 40 10 L 50 10" />
              </svg>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                What We Offer
              </h2>
              <svg className="w-8 h-4 stroke-red-600 fill-none stroke-2" viewBox="0 0 50 20">
                <path d="M 0 10 L 10 10 L 15 8 L 20 15 L 25 2 L 30 18 L 35 10 L 50 10" />
              </svg>
            </div>
            <p className="text-sm sm:text-base text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
              Comprehensive emergency ecosystem engineered for zero-delay pre-hospital triage, bed routing, rare blood supply, and critical care transfer.
            </p>
          </div>

          {/* 4 Feature Cards Grid with Expanded Height & Rich Telemetry */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 items-stretch">
            
            {/* ========================================================================= */}
            {/* CARD 1: GOLDEN HOUR PRE-HOSPITAL TRIAGE (SPECIAL HIGHLIGHTED BORDER GLOW CARD) */}
            {/* ========================================================================= */}
            <BorderGlow
              id="card-golden-hour-triage"
              edgeSensitivity={30}
              glowColor="40 80 80"
              backgroundColor="#ffffff"
              borderRadius={28}
              glowRadius={45}
              glowIntensity={1}
              coneSpread={25}
              animated={false}
              colors={['#ef4444', '#f97316', '#dc2626']}
              onClick={handleGoldenHourClick}
              className="h-full transform hover:-translate-y-2 transition-all shadow-xl shadow-red-500/10 cursor-pointer"
            >
              <div className="p-6 sm:p-7 lg:p-8 bg-white flex flex-col justify-between h-full min-h-[620px] lg:min-h-[660px] space-y-6">
                <div className="space-y-5">
                  
                  {/* Top Badge & Live Telemetry Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-100 text-red-700 border border-rose-200 shadow-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                      <span>Immediate Action</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200/60">
                      &lt;30s Triage
                    </span>
                  </div>

                  {/* Clock Icon Presentation */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 text-red-600 border border-red-200/60 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    <Clock className="w-7 h-7" />
                  </div>

                  {/* Title & Detailed Clinical Description */}
                  <div className="space-y-2.5">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                      Golden Hour Pre-Hospital Triage
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Zero-delay emergency triage. Split-screen live navigation + pre-arrival hospital prep to eliminate door-to-treatment lag during critical cardiac, stroke, and trauma events.
                    </p>
                  </div>

                  {/* Micro-Telemetry Feature Box */}
                  <div className="p-3 rounded-xl bg-red-50/70 border border-red-100 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-red-800 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-red-600" />
                      <span>Emergency Telemetry Core</span>
                    </div>
                    <p className="text-[11px] text-red-950 font-medium leading-normal">
                      Instant bed lock at nearest tertiary ER + automatic stretcher dispatch at arrival gate.
                    </p>
                  </div>

                  {/* Bullet Points Checklist (4 items) */}
                  <ul className="space-y-2.5 text-xs font-medium text-slate-700 pt-1">
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 text-[9px] font-bold shadow-xs">
                        ✓
                      </span>
                      <span>Split-screen dual map routing</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 text-[9px] font-bold shadow-xs">
                        ✓
                      </span>
                      <span>Pre-arrival ER doctor &amp; ICU alert</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 text-[9px] font-bold shadow-xs">
                        ✓
                      </span>
                      <span>Offline dynamic QR fast-track pass</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 text-[9px] font-bold shadow-xs">
                        ✓
                      </span>
                      <span>AI voice-assisted symptom assessment</span>
                    </li>
                  </ul>

                  {/* Tech Tags Row */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      ABDM Level-3
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      Live Telemetry
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      Offline Resilient
                    </span>
                  </div>

                </div>

                {/* Solid Red CTA Button */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    id="btn-start-emergency-triage-card"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGoldenHourClick();
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer group active:scale-98"
                  >
                    <span>Start Emergency Triage</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </BorderGlow>

            {/* ========================================================================= */}
            {/* CARD 2: PLANNED ADMISSION & ROOM BOOKING (TOKEN-SECURED MARKETPLACE) */}
            {/* ========================================================================= */}
            <BorderGlow
              id="card-planned-admission-booking"
              edgeSensitivity={30}
              glowColor="200 80 80"
              backgroundColor="#ffffff"
              borderRadius={28}
              glowRadius={40}
              glowIntensity={0.9}
              coneSpread={25}
              animated={false}
              colors={['#3b82f6', '#0284c7', '#2563eb']}
              onClick={() => {
                playTactileClick();
                setMode('planned_admission');
              }}
              className="h-full transform hover:-translate-y-2 transition-all shadow-md hover:shadow-xl cursor-pointer"
            >
              <div className="p-6 sm:p-7 lg:p-8 bg-white flex flex-col justify-between h-full min-h-[620px] lg:min-h-[660px] space-y-6">
                <div className="space-y-5">
                  
                  {/* Top Badge & Status Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 shadow-xs flex items-center gap-1.5">
                      <KeyRound className="w-3 h-3 text-blue-600" />
                      <span>Token Marketplace</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                      Zero-Queue
                    </span>
                  </div>

                  {/* Key / Bed Icon Presentation */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 border border-blue-200/60 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    <BedDouble className="w-7 h-7" />
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2.5">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                      Planned Admission &amp; Room Booking
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Pre-book verified hospital rooms and scheduled surgical admissions with verifiable cryptographic tokens, eliminating desk counter queues and paperwork delays.
                    </p>
                  </div>

                  {/* Micro-Telemetry Feature Box */}
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-blue-600" />
                      <span>Guaranteed Bed Tariff Locking</span>
                    </div>
                    <p className="text-[11px] text-blue-950 font-medium leading-normal">
                      Real-time verified room tariffs with instant digital fast-track admission vouchers.
                    </p>
                  </div>

                  {/* Bullet Points Checklist (4 items) */}
                  <ul className="space-y-2.5 text-xs font-medium text-slate-700 pt-1">
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[9px] font-bold shadow-xs">
                        ✓
                      </span>
                      <span>Token-secured room pre-booking</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[9px] font-bold shadow-xs">
                        ✓
                      </span>
                      <span>Zero-counter admission queue bypass</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[9px] font-bold shadow-xs">
                        ✓
                      </span>
                      <span>Transparent ICU/Deluxe tariff structure</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[9px] font-bold shadow-xs">
                        ✓
                      </span>
                      <span>Pre-admission diagnostic sync</span>
                    </li>
                  </ul>

                  {/* Tech Tags Row */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      Cryptographic Pass
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      Ayushman / ABHA
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      Fast-Track QR
                    </span>
                  </div>

                </div>

                {/* White with Blue Outline Button */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTactileClick();
                      setMode('planned_admission');
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer group active:scale-98"
                  >
                    <span>Book Admission Token</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </BorderGlow>

            {/* ========================================================================= */}
            {/* CARD 3: RARE BLOOD BANK INVENTORY & UNIT TRACKING */}
            {/* ========================================================================= */}
            <BorderGlow
              id="card-rare-blood-bank-inventory"
              edgeSensitivity={30}
              glowColor="150 80 80"
              backgroundColor="#ffffff"
              borderRadius={28}
              glowRadius={40}
              glowIntensity={0.9}
              coneSpread={25}
              animated={false}
              colors={['#10b981', '#059669', '#14b8a6']}
              onClick={() => {
                playTactileClick();
                setMode('paramedic');
              }}
              className="h-full transform hover:-translate-y-2 transition-all shadow-md hover:shadow-xl cursor-pointer"
            >
              <div className="p-6 sm:p-7 lg:p-8 bg-white flex flex-col justify-between h-full min-h-[620px] lg:min-h-[660px] space-y-6">
                <div className="space-y-5">
                  
                  {/* Top Badge & Live Units Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 shadow-xs flex items-center gap-1.5">
                      <Droplet className="w-3 h-3 text-rose-600" />
                      <span>Emergency Blood Grid</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                      Live Units
                    </span>
                  </div>

                  {/* Blood Droplet Icon Presentation */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-100 text-rose-600 border border-rose-200/60 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    <Droplet className="w-7 h-7 fill-rose-100" />
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2.5">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                      Rare Blood Bank Inventory &amp; Unit Tracking
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Real-time regional network tracking for rare blood groups (O-neg, AB-neg, Bombay phenotype), fresh frozen plasma, and platelet unit reserves.
                    </p>
                  </div>

                  {/* Micro-Telemetry Feature Box */}
                  <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1">
                      <Radio className="w-3 h-3 text-rose-600" />
                      <span>Cold-Chain Telemetry Grid</span>
                    </div>
                    <p className="text-[11px] text-rose-950 font-medium leading-normal">
                      Verified storage temperature logs + immediate blood bank cross-match lock.
                    </p>
                  </div>

                  {/* Bullet Points Checklist (4 items) */}
                  <ul className="space-y-2.5 text-xs font-medium text-slate-700 pt-1">
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 text-[9px] font-bold shadow-xs">
                        ✓
                      </span>
                      <span>Live cross-hospital blood units map</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 text-[9px] font-bold shadow-xs">
                        ✓
                      </span>
                      <span>Rare group SOS broadcast alerts</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 text-[9px] font-bold shadow-xs">
                        ✓
                      </span>
                      <span>Direct donor &amp; transit dispatch</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 text-[9px] font-bold shadow-xs">
                        ✓
                      </span>
                      <span>Component separation (PRBC, FFP, Platelets)</span>
                    </li>
                  </ul>

                  {/* Tech Tags Row */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      Cold-Chain Sync
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      e-RaktKosh Sync
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      SOS Dispatch
                    </span>
                  </div>

                </div>

                {/* White with Rose Outline Button */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTactileClick();
                      setMode('hospital');
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition-all cursor-pointer group active:scale-98"
                  >
                    <span>Search Blood Inventory</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </BorderGlow>

            {/* ========================================================================= */}
            {/* CARD 4: POST-CRISIS INTER-HOSPITAL TRANSIT & E-DOSSIER DISPATCH */}
            {/* ========================================================================= */}
            <BorderGlow
              id="card-inter-hospital-transit-e-dossier"
              edgeSensitivity={30}
              glowColor="45 80 80"
              backgroundColor="#ffffff"
              borderRadius={28}
              glowRadius={40}
              glowIntensity={0.9}
              coneSpread={25}
              animated={false}
              colors={['#f59e0b', '#d97706', '#ea580c']}
              onClick={() => {
                playTactileClick();
                setMode('hospital');
              }}
              className="h-full transform hover:-translate-y-2 transition-all shadow-md hover:shadow-xl cursor-pointer"
            >
              <div className="p-6 sm:p-7 lg:p-8 bg-white flex flex-col justify-between h-full min-h-[620px] lg:min-h-[660px] space-y-6">
                <div className="space-y-5">
                  
                  {/* Top Badge & Protocol Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 shadow-xs flex items-center gap-1.5">
                      <ArrowRightLeft className="w-3 h-3 text-amber-600" />
                      <span>Inter-Hospital Grid</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                      HL7 / FHIR
                    </span>
                  </div>

                  {/* ArrowRightLeft Icon Presentation */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 text-amber-600 border border-amber-200/60 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    <ArrowRightLeft className="w-7 h-7" />
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2.5">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                      Post-Crisis Inter-Hospital Transit &amp; E-Dossier
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Seamless critical care transfers with automated encrypted digital telemetry e-dossier handoff to destination tertiary care centers.
                    </p>
                  </div>

                  {/* Micro-Telemetry Feature Box */}
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-600" />
                      <span>Encrypted Handshake Protocol</span>
                    </div>
                    <p className="text-[11px] text-amber-950 font-medium leading-normal">
                      End-to-end encrypted vitals sync and auto-handover to recipient surgical teams.
                    </p>
                  </div>

                  {/* Bullet Points Checklist (4 items) */}
                  <ul className="space-y-2.5 text-xs font-medium text-slate-700 pt-1">
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-[9px] font-bold shadow-xs">
                        ✓
                      </span>
                      <span>Automated e-dossier packet sync</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-[9px] font-bold shadow-xs">
                        ✓
                      </span>
                      <span>Live ICU transit vitals telemetry</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-[9px] font-bold shadow-xs">
                        ✓
                      </span>
                      <span>Destination receiving ER bed locking</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-[9px] font-bold shadow-xs">
                        ✓
                      </span>
                      <span>Zero-friction paramedic handover protocol</span>
                    </li>
                  </ul>

                  {/* Tech Tags Row */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      HL7 / FHIR
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      AES-256
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      ABDM Gateway
                    </span>
                  </div>

                </div>

                {/* White with Amber Outline Button */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTactileClick();
                      setMode('hospital');
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 transition-all cursor-pointer group active:scale-98"
                  >
                    <span>View E-Dossier Protocol</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </BorderGlow>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TRUST BADGES BAR (100% Secure, Works Offline, Low Latency, etc.) */}
      {/* ========================================================================= */}
      <section id="trust-badges-bar" className="py-8 bg-slate-50 border-y border-slate-200/80">
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            
            {/* Badge 1 */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">100% Secure</div>
                <div className="text-[11px] text-slate-500">End-to-end encrypted data</div>
              </div>
            </div>

            {/* Badge 2 */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Works Offline</div>
                <div className="text-[11px] text-slate-500">Forms &amp; QR pass available offline</div>
              </div>
            </div>

            {/* Badge 3 */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Ultra Low Latency</div>
                <div className="text-[11px] text-slate-500">Load time &lt; 800ms</div>
              </div>
            </div>

            {/* Badge 4 */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Accessible for All</div>
                <div className="text-[11px] text-slate-500">WCAG 2.1 AAA Compliant</div>
              </div>
            </div>

            {/* Badge 5 */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">No Login Required</div>
                <div className="text-[11px] text-slate-500">Zero friction emergency access</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. "WHY PRATHMIKTA?" SECTION */}
      {/* ========================================================================= */}
      <section id="why-prathmikta" className="py-12 sm:py-16 bg-white">
        <div className="w-full px-4 sm:px-8 lg:px-12 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Why Prathmikta?
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium max-w-xl mx-auto">
              Built for high-stress emergency moments with zero friction
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Item 1 */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-slate-900">Citizen First</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Designed for citizens, bystanders &amp; paramedics in panic situations.
              </p>
            </div>

            {/* Item 2 */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-slate-900">Real-Time Intelligence</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Live data from hospitals, ambulances &amp; medical stores.
              </p>
            </div>

            {/* Item 3 */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-slate-900">Integrated Ecosystem</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Hospitals, ambulances, pharmacies &amp; specialists — all connected.
              </p>
            </div>

            {/* Item 4 */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-slate-900">Saves Precious Time</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Reduce response time. Improve outcomes. Save more lives.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. "EVERY SECOND COUNTS. WE ARE ALWAYS READY." BOTTOM ACTION BANNER */}
      {/* ========================================================================= */}
      <section id="bottom-call-to-action" className="pb-12 sm:pb-16 px-4 sm:px-8 lg:px-12">
        <div className="w-full rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-rose-50 via-red-50/60 to-rose-50 border border-red-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left: Pulsing Heart and Heading */}
          <div className="flex items-center gap-4 text-left">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-500/30 animate-pulse">
              <Heart className="w-8 h-8 fill-white" />
            </div>
            <div className="space-y-1">
              <div className="text-xs sm:text-sm font-bold text-slate-500">Every Second Counts.</div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-red-600 tracking-tight">
                We Are Always Ready.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Tap. Connect. Save Lives.</p>
            </div>
          </div>

          {/* Right: Hotline Call & Share Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <a
              href="tel:108"
              id="btn-bottom-call-108-112"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-red-600/30 transition-all cursor-pointer text-center"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 108 / 112 Now</span>
            </a>

            <button
              onClick={handleShare}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedToast ? 'Link Copied!' : 'Share This Page'}</span>
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER */}
      {/* ========================================================================= */}
      <footer id="landing-footer" className="border-t border-slate-100 py-6 text-xs text-slate-500 bg-white">
        <div className="w-full px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; 2026 Prathmikta. All rights reserved.
          </div>

          <div className="flex items-center gap-6 font-medium">
            <button
              onClick={() => {
                playTactileClick();
                setMode('command');
              }}
              className="text-cyan-600 hover:text-cyan-800 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Master Command Grid (/command)</span>
            </button>
            <button
              onClick={() => {
                playTactileClick();
                setMode('stretcher');
              }}
              className="text-orange-600 hover:text-orange-800 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span>Stretcher Attendant (/stretcher)</span>
            </button>
            <button
              onClick={() => setAboutModalOpen(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setAboutModalOpen(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => setAboutModalOpen(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Contact Us
            </button>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL: ABOUT & TERMS MODAL */}
      {/* ========================================================================= */}
      {aboutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-slate-900 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">About Prathmikta Emergency Protocol</h3>
              <button
                onClick={() => setAboutModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Prathmikta is a next-generation pre-hospital triage network connecting Indian citizens with verified regional ER departments and emergency dispatches without login friction.
            </p>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="font-bold text-slate-900">Key Guarantees:</div>
              <div>&bull; Instant routing to verified hospitals with genuine bed availability.</div>
              <div>&bull; Offline fallback with encrypted QR tokens.</div>
              <div>&bull; Direct integration with 108 / 112 National Ambulance systems.</div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setAboutModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
