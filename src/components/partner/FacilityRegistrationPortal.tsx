import React, { useState } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import {
  Activity,
  Building2,
  Truck,
  Droplet,
  ArrowRight,
  CheckCircle2,
  Shield,
  Zap,
  Network,
  Link as LinkIcon,
  Lock,
  TrendingUp,
  Clock,
  MapPin,
  Phone,
  Mail,
  BedDouble,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  Radio,
  FileCheck,
  KeyRound,
  ShieldCheck,
  Send,
  HelpCircle,
  Globe,
  Database,
  Cpu,
  Copy,
  Download,
  Flame,
  CheckCheck,
  Navigation,
  Eye,
  Key,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { playTactileClick, playConfirmChime, playCodeRedAlert } from '../../lib/audio';

type FacilityType = 'hospital' | 'blood_bank' | 'ambulance';

export const FacilityRegistrationPortal: React.FC = () => {
  const { setMode, emitPartnerFacilityRegister } = usePrathmikta();

  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeFacilityType, setActiveFacilityType] = useState<FacilityType>('hospital');
  const [registrationStep, setRegistrationStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedFacilityId, setSubmittedFacilityId] = useState<string | null>(null);
  const [copiedApiKey, setCopiedApiKey] = useState<boolean>(false);
  const [copiedPass, setCopiedPass] = useState<boolean>(false);

  // FAQ Accordion Open States
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Generated dynamic API Key & Credentials
  const [generatedApiKey, setGeneratedApiKey] = useState<string>('pk_live_7f3a5c9d2b6e8f1a9d0c4e7b9a2f1c6d');
  const [generatedEmail, setGeneratedEmail] = useState<string>('emergency@citycarehosp.in');
  const [generatedPassword, setGeneratedPassword] = useState<string>('R!mlk7Yp3@2024');

  // Hospital Form State (matches screenshot)
  const [hospitalForm, setHospitalForm] = useState({
    hospitalName: 'City Care Multi-Speciality Hospital',
    hospitalCode: 'CCH-2024-1258',
    rohiniId: 'NABH/HP/2023/004567',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    coordinates: '26.8467° N, 80.9462° E',
    icuBeds: 24,
    nicuWarmers: 12,
    erTraumaBays: 6,
    ventilators: 18,
    hasCathLab: true,
    hasTraumaOT: true,
    hasBloodBankAttached: true,
    has24x7CT: true,
    emergencyPhone: '+91 522 123 4567',
    officialEmail: 'emergency@citycarehosp.in'
  });

  // Blood Bank Form State (matches screenshot)
  const [bloodBankForm, setBloodBankForm] = useState({
    bloodBankName: 'LifeSave Blood Centre',
    licenseId: 'UP/BB/LDI/2024/78945',
    aPos: 120,
    aNeg: 45,
    bPos: 98,
    bNeg: 32,
    oPos: 150,
    oNeg: 60,
    abPos: 70,
    abNeg: 28,
    hasSDP: true,
    hasFFP: true,
    hasCryo: true,
    helplinePhone: '+91 522 987 6543',
    coldChainStatus: 'Fully Operational'
  });

  // Ambulance Fleet Form State (matches screenshot)
  const [ambulanceForm, setAmbulanceForm] = useState({
    fleetName: 'City Care Emergency Services',
    operatorId: 'OCES-AMB-2024-556',
    hasALS: true,
    hasBLS: true,
    hasMortuary: false,
    totalAmbulances: 5,
    syncDevice: 'Mobile App (Prathmikta Connect)',
    otherOption: 'OBD-II GPS Tracker'
  });

  // Handle open registration for specific type
  const handleOpenRegistration = (type: FacilityType) => {
    playTactileClick();
    setActiveFacilityType(type);
    setRegistrationStep(1);
    setSubmittedFacilityId(null);
    setCopiedApiKey(false);
    setCopiedPass(false);
    setIsModalOpen(true);
  };

  // Submit Facility
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const prefix =
      activeFacilityType === 'hospital' ? 'PRATH-HOSP'
      : activeFacilityType === 'blood_bank' ? 'PRATH-BB'
      : 'PRATH-EMS';
    const genId = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedFacilityId(genId);

    const email =
      activeFacilityType === 'hospital' ? hospitalForm.officialEmail
      : activeFacilityType === 'blood_bank' ? 'bloodcenter@lifesave.org.in'
      : 'dispatch@citycareambulance.in';
    setGeneratedEmail(email);

    const randomKey = 'pk_live_' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setGeneratedApiKey(randomKey);

    // Prepare facility registration payload for MongoDB storage
    const payload = {
      facilityId: genId,
      facilityType: activeFacilityType,
      facilityName:
        activeFacilityType === 'hospital' ? hospitalForm.hospitalName
        : activeFacilityType === 'blood_bank' ? bloodBankForm.bloodBankName
        : ambulanceForm.fleetName,
      registrationNumber:
        activeFacilityType === 'hospital' ? hospitalForm.hospitalCode
        : activeFacilityType === 'blood_bank' ? bloodBankForm.licenseId
        : ambulanceForm.operatorId,
      state: hospitalForm.state,
      city: hospitalForm.city,
      coordinates: { lat: 26.8467, lng: 80.9462 },
      contactPhone:
        activeFacilityType === 'hospital' ? hospitalForm.emergencyPhone
        : activeFacilityType === 'blood_bank' ? bloodBankForm.helplinePhone
        : '+91 522 987 6543',
      contactEmail: email,
      apiKey: randomKey,
      hospitalCapacity: {
        icuBeds: hospitalForm.icuBeds,
        nicuWarmers: hospitalForm.nicuWarmers,
        erTraumaBays: hospitalForm.erTraumaBays,
        ventilators: hospitalForm.ventilators,
        facilities: [
          hospitalForm.hasCathLab ? 'Cath Lab (Cardiac)' : null,
          hospitalForm.hasTraumaOT ? 'Trauma Emergency OT' : null,
          hospitalForm.hasBloodBankAttached ? 'Blood Bank Attached' : null,
          hospitalForm.has24x7CT ? '24x7 CT/MRI Scanner' : null
        ].filter(Boolean)
      },
      bloodBankData: {
        licenseNumber: bloodBankForm.licenseId,
        stockMatrix: {
          aPos: bloodBankForm.aPos,
          aNeg: bloodBankForm.aNeg,
          bPos: bloodBankForm.bPos,
          bNeg: bloodBankForm.bNeg,
          oPos: bloodBankForm.oPos,
          oNeg: bloodBankForm.oNeg,
          abPos: bloodBankForm.abPos,
          abNeg: bloodBankForm.abNeg
        },
        specialComponents: [
          bloodBankForm.hasSDP ? 'Single Donor Platelets (SDP)' : null,
          bloodBankForm.hasFFP ? 'Fresh Frozen Plasma (FFP)' : null,
          bloodBankForm.hasCryo ? 'Cryoprecipitate' : null
        ].filter(Boolean),
        coldChainStatus: bloodBankForm.coldChainStatus
      },
      ambulanceFleetData: {
        fleetOperatorName: ambulanceForm.fleetName,
        operatorRegId: ambulanceForm.operatorId,
        vehicleTypes: [
          ambulanceForm.hasALS ? 'Advanced Life Support (ALS)' : null,
          ambulanceForm.hasBLS ? 'Basic Life Support (BLS)' : null,
          ambulanceForm.hasMortuary ? 'Mortuary / Transport Van' : null
        ].filter(Boolean),
        connectedCount: ambulanceForm.totalAmbulances,
        gpsSyncType: ambulanceForm.syncDevice
      }
    };

    try {
      await emitPartnerFacilityRegister(payload);
    } catch (err) {
      console.warn('[Socket/MongoDB] Syncing facility record offline/optimistic fallback', err);
    }

    setIsSubmitting(false);
    playConfirmChime();
    setRegistrationStep(3); // Success Screen
  };

  const copyToClipboard = (text: string, type: 'key' | 'pass') => {
    playTactileClick();
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedApiKey(true);
      setTimeout(() => setCopiedApiKey(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  const faqs = [
    {
      q: 'Is our patient data secure?',
      a: 'Yes. Data exchange is designed with secure, encrypted communication and privacy-focused architecture aligned with applicable Ayushman Bharat Digital Mission (ABDM) guidelines.'
    },
    {
      q: 'How is the ₹500 token settled?',
      a: 'Token settlement is routed securely through the designated state gateway / NPCI UPI switch and credited to the registered facility account.'
    },
    {
      q: 'How frequently does bed and blood availability synchronize?',
      a: 'Our sub-800ms bidirectional WebSocket bridge and FHIR/HL7 connectors sync real-time vacancy immediately whenever your reception triage admits or discharges a patient.'
    },
    {
      q: 'Can private ambulances and nursing homes register?',
      a: 'Yes. Any registered clinical establishment with a valid State Medical Council / ROHINI / NABH registration or licensed EMS ambulance fleet can onboard directly.'
    }
  ];

  return (
    <div className="w-full h-full overflow-y-auto bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (MATCHING THE ATTACHED SCREENSHOT) */}
      {/* ========================================================================= */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo & Sub-tag */}
          <div
            onClick={() => setMode('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Custom Cross Logo matching screenshot */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute w-2.5 h-8 bg-[#1d63ff] rounded-sm"></div>
              <div className="absolute w-8 h-2.5 bg-[#f97316] rounded-sm"></div>
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-slate-900 leading-none">
                Prathmikta
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#1d63ff] pt-0.5">
                PARTNER PORTAL
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button
              onClick={() => setMode('landing')}
              className="hover:text-[#1d63ff] transition-colors cursor-pointer"
            >
              Home
            </button>
            <div className="relative group cursor-pointer flex items-center gap-1 hover:text-[#1d63ff] transition-colors">
              <span>Solutions</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1d63ff]" />
            </div>
            <a href="#how-it-works" className="hover:text-[#1d63ff] transition-colors">
              How It Works
            </a>
            <a href="#security" className="hover:text-[#1d63ff] transition-colors">
              Security
            </a>
            <a href="#faqs" className="hover:text-[#1d63ff] transition-colors">
              FAQs
            </a>
          </nav>

          {/* Right Action: Register Facility CTA */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleOpenRegistration('hospital')}
              className="px-5 py-2.5 rounded-xl bg-[#1d63ff] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
            >
              Register Facility
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION WITH IMAGE & 3 STACKED STAT BADGES */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 px-4 sm:px-8 bg-gradient-to-b from-slate-50/80 via-white to-white">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Text Content */}
            <div className="lg:col-span-6 space-y-5 text-left">
              
              {/* Massive Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Connect Your Healthcare Facility to India’s{' '}
                <span className="text-[#1d63ff]">Emergency Grid.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
                Join a unified network of hospitals, ambulances, and blood banks working together to make emergency response faster, smarter, and more connected.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenRegistration('hospital')}
                  className="px-6 py-3.5 rounded-xl bg-[#1d63ff] hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/25 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Register Your Facility</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#how-it-works"
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all"
                >
                  <span>Explore How It Works</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </a>
              </div>

            </div>

            {/* Right Hero Image with 3 Stacked Stat Badges */}
            <div className="lg:col-span-6 relative">
              
              {/* Hospital & Ambulance Backdrop Container */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-100 group">
                <img
                  src="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80"
                  alt="Modern Hospital and Emergency Ambulance Hub"
                  className="w-full h-[320px] sm:h-[380px] object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />

                {/* Soft gradient wash */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>

                {/* Floating Stacked Badges on Right */}
                <div className="absolute top-4 right-4 flex flex-col gap-2.5 max-w-[200px] sm:max-w-[220px]">
                  
                  {/* Badge 1: Active Hospitals */}
                  <div className="bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl shadow-xl border border-slate-200/80 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1d63ff] flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-base sm:text-lg font-black text-slate-900 leading-tight">2,356</div>
                      <div className="text-[10px] text-slate-500 font-semibold">Active Hospitals</div>
                    </div>
                  </div>

                  {/* Badge 2: Live Ambulances */}
                  <div className="bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl shadow-xl border border-slate-200/80 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-base sm:text-lg font-black text-slate-900 leading-tight">1,248</div>
                      <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live Ambulances
                      </div>
                    </div>
                  </div>

                  {/* Badge 3: Blood Units Available */}
                  <div className="bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl shadow-xl border border-slate-200/80 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <Droplet className="w-5 h-5 fill-rose-500 text-rose-500" />
                    </div>
                    <div className="text-left">
                      <div className="text-base sm:text-lg font-black text-rose-600 leading-tight">18,732</div>
                      <div className="text-[10px] text-slate-500 font-semibold">Blood Units Available</div>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. 3 PRIMARY FACILITY ONBOARDING CARDS (WITH EXACT CHECKLIST) */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Ambulance Fleet Onboarding */}
            <div
              onClick={() => handleOpenRegistration('ambulance')}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between text-left cursor-pointer group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1d63ff] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="space-y-2.5">
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-[#1d63ff] transition-colors">
                    Ambulance Fleet Onboarding
                  </h3>
                  <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>Live GPS integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>OSRM corridor tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>Faster emergency dispatch</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-[#1d63ff] flex items-center justify-center group-hover:bg-[#1d63ff] group-hover:text-white transition-all shadow-sm">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Card 2: Hospital & Bed Matrix */}
            <div
              onClick={() => handleOpenRegistration('hospital')}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between text-left cursor-pointer group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BedDouble className="w-6 h-6" />
                </div>
                <div className="space-y-2.5">
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Hospital &amp; Bed Matrix
                  </h3>
                  <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>Real-time ICU inventory</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>Ventilator availability</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>General bed synchronization</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Card 3: Blood Bank Inventory */}
            <div
              onClick={() => handleOpenRegistration('blood_bank')}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-rose-300 transition-all duration-300 flex flex-col justify-between text-left cursor-pointer group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Droplet className="w-6 h-6 fill-rose-500 text-rose-500" />
                </div>
                <div className="space-y-2.5">
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-rose-600 transition-colors">
                    Blood Bank Inventory
                  </h3>
                  <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>Live blood stock synchronization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>A+, B+, O+, AB+ and other groups</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>Emergency availability visibility</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. WHY IT IS IMPORTANT & CORE ADVANTAGES */}
      {/* ========================================================================= */}
      <section id="why-important" className="px-4 sm:px-8 py-12 bg-slate-50/60 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Why It Is Important (5 items) */}
            <div className="lg:col-span-5 space-y-5 text-left">
              
              <div className="space-y-1">
                <div className="w-8 h-1 bg-[#1d63ff] rounded-full"></div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Why It Is Important
                </h2>
              </div>

              <div className="space-y-3 pt-2">
                
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-[#1d63ff] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-snug">
                    Emergencies don't wait. Real-time visibility saves critical minutes.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-[#1d63ff] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-snug">
                    Unified healthcare data helps responders make faster decisions.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-[#1d63ff] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-snug">
                    Decentralized resource visibility prevents unnecessary hospital overload.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-[#1d63ff] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-snug">
                    Live blood and bed availability improves emergency preparedness.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-[#1d63ff] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-snug">
                    Connected facilities create a stronger and more resilient healthcare ecosystem.
                  </p>
                </div>

              </div>

            </div>

            {/* Right Column: Core Advantages (2x3 Grid) */}
            <div id="advantages" className="lg:col-span-7 space-y-5 text-left">
              
              <div className="space-y-1">
                <div className="w-8 h-1 bg-[#1d63ff] rounded-full"></div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Core Advantages
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                    <Zap className="w-5 h-5 fill-white text-white" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-black text-slate-900">Zero-Delay Routing</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Real-time data enables faster emergency routing and response.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
                    <Network className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-black text-slate-900">Decentralized Load Balancing</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Smart distribution of patients and resources across facilities.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/20">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-black text-slate-900">ABDM Compliant</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Designed around India's digital health ecosystem and standards.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-black text-slate-900">Interoperable Systems</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Works alongside existing hospital and emergency systems.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/20">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-black text-slate-900">Data Security &amp; Privacy</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Secure access, encrypted communication, privacy focused.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/20">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-black text-slate-900">Scalable &amp; Future Ready</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Scales across cities, districts, and nationwide networks.
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. "HOW IT WORKS" 3-STEP PROCESS SECTION */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="px-4 sm:px-8 py-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto text-left space-y-6">
          
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Go from registration to live emergency connectivity in three simple steps.
            </p>
          </div>

          {/* 3 Step Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 relative">
            
            {/* Step 01 */}
            <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#1d63ff] text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/20">
                    01
                  </div>
                  <span className="text-xs font-black text-slate-400">STEP 1</span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Register Facility
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Submit your basic facility details and NABH/license information for verification.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/60 space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-[#1d63ff]" />
                  <span>Facility details</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                  <FileCheck className="w-3.5 h-3.5 text-[#1d63ff]" />
                  <span>License verification</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-[#1d63ff]" />
                  <span>Contact information</span>
                </div>
              </div>
            </div>

            {/* Step 02 */}
            <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-indigo-500/20">
                    02
                  </div>
                  <span className="text-xs font-black text-slate-400">STEP 2</span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Secure API Key &amp; Dashboard Access
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  After instant verification, receive secure credentials and access your partner dashboard.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/60 space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Secure API key</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Verified facility badge</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">VERIFIED</span>
                  <span>Dashboard access</span>
                </div>
              </div>
            </div>

            {/* Step 03 */}
            <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-500/20">
                    03
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    LIVE
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Go Live &amp; Sync Matrix
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Start updating bed availability and blood inventory to reflect real-time data in the emergency network.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/60 space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                  <BedDouble className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Bed matrix sync</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                  <Droplet className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>Blood stock sync</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Live status indicator</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. "BUILT FOR EMERGENCY-SPEED HEALTHCARE" */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-8 py-6">
        <div className="max-w-7xl mx-auto rounded-3xl bg-[#051838] border border-blue-900/60 p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
          
          <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center">
            <svg className="w-full h-24" viewBox="0 0 1000 100" preserveAspectRatio="none">
              <path
                d="M0,50 L200,50 L220,20 L240,80 L260,30 L280,70 L300,50 L600,50 L620,10 L640,90 L660,20 L680,80 L700,50 L1000,50"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Built for Emergency-Speed Healthcare
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center items-center">
              
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-sky-400 tracking-tight flex items-center justify-center gap-2">
                  <Clock className="w-6 h-6 text-sky-400" />
                  <span>&lt; 800ms</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">Ultra Low Latency Sync</p>
              </div>

              <div className="space-y-1 border-y md:border-y-0 md:border-x border-white/10 py-4 md:py-0">
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <span>100%</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">ABDM / National Health Stack Compliant</p>
              </div>

              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight flex items-center justify-center gap-2">
                  <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
                  <span>0-Delay</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">Direct Emergency Handshake</p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. "BUILT FOR TRUST" + FAQ ACCORDION */}
      {/* ========================================================================= */}
      <section id="security" className="px-4 sm:px-8 py-12 bg-white">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-6 text-left">
              
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Built for Trust. Designed for Healthcare.
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1d63ff] flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">ABDM Compatible</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Secure API Access</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">End-to-End Encrypted</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Role-Based Access</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center gap-2 col-span-2 sm:col-span-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Verified Facility Onboarding</span>
                </div>

              </div>

              {/* 3D Security Shield Illustration Container */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-800 text-white flex items-center justify-center gap-6 shadow-xl">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-sky-300">
                    <Lock className="w-8 h-8" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-black uppercase tracking-wider text-sky-400">
                    Enterprise Grade Vault
                  </div>
                  <h4 className="text-base font-black text-white">
                    256-Bit Hardware Encrypted Handshake
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Zero raw PHI exposure. Cryptographically signed token telemetry.
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive FAQ Accordion */}
            <div id="faqs" className="lg:col-span-6 space-y-4 text-left">
              
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="space-y-3 pt-2">
                {faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200/90 bg-slate-50/50 overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setOpenFaqIndex(isOpen ? null : index);
                        }}
                        className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#1d63ff] shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="p-4 pt-0 text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-100 bg-white animate-in fade-in">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. PRE-FOOTER CTA STRIP */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-8 py-6">
        <div className="max-w-7xl mx-auto rounded-3xl bg-blue-50/90 border border-blue-200/90 p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-left shadow-xs">
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1d63ff] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-slate-900">
                Ready to Connect Your Facility?
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Join Prathmikta and become part of a faster, smarter, and more connected emergency healthcare network.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
            <button
              type="button"
              onClick={() => handleOpenRegistration('hospital')}
              className="px-5 py-3 rounded-xl bg-[#1d63ff] hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>Register Facility</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <span>Already registered?</span>
              <button
                type="button"
                onClick={() => setMode('reception')}
                className="font-bold text-[#1d63ff] hover:underline cursor-pointer"
              >
                Access Partner Dashboard
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. COMPREHENSIVE 5-COLUMN DARK NAVY FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-[#051329] text-white px-4 sm:px-8 pt-12 pb-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto space-y-10 text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setMode('landing')}>
                <div className="relative w-7 h-7 flex items-center justify-center">
                  <div className="absolute w-2 h-7 bg-[#1d63ff] rounded-sm"></div>
                  <div className="absolute w-7 h-2 bg-[#f97316] rounded-sm"></div>
                </div>
                <div className="text-lg font-black tracking-tight text-white leading-none">
                  Prathmikta
                </div>
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                PARTNER PORTAL
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
                India's unified emergency healthcare network for hospitals, ambulances, and blood banks.
              </p>
            </div>

            {/* Column 2: Solutions */}
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase tracking-wider text-slate-300">Solutions</h5>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                <li><button onClick={() => handleOpenRegistration('ambulance')} className="hover:text-white transition-colors cursor-pointer">Ambulance Network</button></li>
                <li><button onClick={() => handleOpenRegistration('hospital')} className="hover:text-white transition-colors cursor-pointer">Hospital &amp; Bed Matrix</button></li>
                <li><button onClick={() => handleOpenRegistration('blood_bank')} className="hover:text-white transition-colors cursor-pointer">Blood Bank Inventory</button></li>
                <li><button onClick={() => setMode('hospital')} className="hover:text-white transition-colors cursor-pointer">Emergency Routing</button></li>
              </ul>
            </div>

            {/* Column 3: Partner Registration */}
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase tracking-wider text-slate-300">Partner Registration</h5>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                <li><button onClick={() => handleOpenRegistration('hospital')} className="hover:text-white transition-colors cursor-pointer">Register Facility</button></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Onboarding Process</a></li>
                <li><button onClick={() => setMode('reception')} className="hover:text-white transition-colors cursor-pointer">Partner Dashboard</button></li>
                <li><a href="#security" className="hover:text-white transition-colors">API Documentation</a></li>
              </ul>
            </div>

            {/* Column 4: Security & Compliance */}
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase tracking-wider text-slate-300">Security &amp; Compliance</h5>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                <li><a href="#security" className="hover:text-white transition-colors">ABDM Compliance</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Data Security</a></li>
                <li><span className="text-slate-400">Privacy Policy</span></li>
                <li><span className="text-slate-400">Terms of Service</span></li>
              </ul>
            </div>

            {/* Column 5: Connect With Us */}
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase tracking-wider text-slate-300">Connect With Us</h5>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#1d63ff]" />
                  <span>+91 1800 123 4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#1d63ff]" />
                  <span>partner@prathmikta.in</span>
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#1d63ff]" />
                  <span>www.prathmikta.in</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              &copy; 2024-2026 Prathmikta Partner Portal. All rights reserved.
            </div>
            <div className="text-slate-300 font-medium">
              Connecting healthcare resources when every second matters.
            </div>
          </div>

        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 10. EXACT MATCHING REGISTRATION MODAL (HOSPITAL, BLOOD BANK, AMBULANCE, SUCCESS) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden max-h-[96vh] flex flex-col text-left my-auto animate-in zoom-in-95">
            
            {/* Top Navigation & Status Strip (EXACT AS SCREENSHOT) */}
            <div className="bg-[#0b1b36] text-white px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE
                </span>
                <span className="font-mono text-slate-300 font-bold">ABDM - NATIONAL EMERGENCY GRID</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">Form v2.4</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-1.5 text-slate-300 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Secure &bull; Encrypted &bull; ABDM Compliant</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* STEP 3: SUCCESSFUL CONFIRMATION VIEW (BOTTOM-RIGHT IN SCREENSHOT) */}
            {registrationStep === 3 ? (
              <div className="bg-[#031d16] text-white p-6 sm:p-10 flex-1 overflow-y-auto flex flex-col justify-between space-y-8 relative">
                
                {/* Background Festive Subtle Grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>

                <div className="text-center space-y-4 relative z-10 pt-2">
                  
                  {/* Huge Green Success Icon */}
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-400/40 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
                    <Check className="w-10 h-10 stroke-[3]" />
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      Registration Successful!
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                      Your facility is now connected to Prathmikta National Emergency Grid.<br />
                      You can now access your partner dashboard and start managing live data.
                    </p>
                  </div>

                </div>

                {/* 2 Credentials Cards in Grid (As Screenshot) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                  
                  {/* Card 1: API Key */}
                  <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <Key className="w-4 h-4 text-amber-400" />
                      <span>Your Secure API Key</span>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-emerald-500/20">
                      <input
                        type="text"
                        readOnly
                        value={generatedApiKey}
                        className="bg-transparent text-emerald-300 text-[11px] font-mono w-full focus:outline-none truncate"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(generatedApiKey, 'key')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-700/60 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        {copiedApiKey ? <CheckCheck className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedApiKey ? 'COPIED' : 'COPY'}</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-400">
                      Keep this key secure. This will be used for API integration.
                    </p>
                  </div>

                  {/* Card 2: Dashboard Login Credentials */}
                  <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                      <Laptop className="w-4 h-4 text-emerald-400" />
                      <span>Dashboard Login Credentials</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-left">
                      <div className="p-2 rounded-xl bg-black/40 border border-emerald-500/20 space-y-0.5">
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">Email / Username</div>
                        <div className="text-xs font-semibold text-white truncate">{generatedEmail}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-black/40 border border-emerald-500/20 space-y-0.5 relative">
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">Password</div>
                        <div className="text-xs font-mono font-bold text-emerald-300 flex items-center justify-between">
                          <span>{generatedPassword}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(generatedPassword, 'pass')}
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            {copiedPass ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400">
                      You can change your password after first login.
                    </p>
                  </div>

                </div>

                {/* 4 Status Badges in Row (As Screenshot) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center relative z-10">
                  <div className="p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="text-left leading-tight">
                      <div className="text-[9px] text-slate-400">Facility Status</div>
                      <div className="text-xs font-black text-emerald-300">VERIFIED</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="text-left leading-tight">
                      <div className="text-[9px] text-slate-400">ABDM Compliance</div>
                      <div className="text-xs font-black text-emerald-300">COMPLIANT</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <div className="text-left leading-tight">
                      <div className="text-[9px] text-slate-400">Connection Status</div>
                      <div className="text-xs font-black text-emerald-300">&bull; LIVE</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="text-left leading-tight">
                      <div className="text-[9px] text-slate-400">Data Sync</div>
                      <div className="text-xs font-black text-emerald-300">ACTIVE</div>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Buttons (As Screenshot) */}
                <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setMode('reception');
                    }}
                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 cursor-pointer transition-all active:scale-95"
                  >
                    <span>Go to Partner Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      alert(`Downloading Prathmikta Facility Certificate: ${submittedFacilityId || 'PRATH-FACILITY-2024'}`);
                    }}
                    className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm border border-slate-700 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Registration Certificate</span>
                  </button>
                </div>

                <div className="text-center text-[10px] text-slate-400 relative z-10">
                  🔒 All your data is encrypted and secured under ABDM &amp; National Health Stack guidelines.
                </div>

              </div>
            ) : (
              /* FORM FLOW CONTAINER (STEP 1 & 2) */
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
                
                {/* Form Title & Progress Steps (Matches Screenshot) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-0.5">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Partner Facility Registration
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Join India's Unified Emergency Healthcare Network
                    </p>
                  </div>

                  {/* Step Tracker Indicator */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-[#1d63ff] text-white text-[10px] font-black flex items-center justify-center">
                        1
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] font-black text-slate-900">Step 1</div>
                        <div className="text-[9px] text-slate-400">Basic &amp; Legal Info</div>
                      </div>
                    </div>

                    <div className="w-8 h-0.5 bg-slate-200"></div>

                    <div className="flex items-center gap-1.5 opacity-60">
                      <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center">
                        2
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] font-bold text-slate-600">Step 2</div>
                        <div className="text-[9px] text-slate-400">Live Matrix &amp; Capabilities</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 Facility Selector Tabs (EXACT SCREENSHOT COLOR & DESIGN) */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  
                  {/* Tab 1: Hospital / ICU (Blue when selected) */}
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setActiveFacilityType('hospital');
                    }}
                    className={`py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      activeFacilityType === 'hospital'
                        ? 'bg-[#1d63ff] text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    <Building2 className={`w-4 h-4 ${activeFacilityType === 'hospital' ? 'text-white' : 'text-slate-500'}`} />
                    <span>Hospital / ICU</span>
                  </button>

                  {/* Tab 2: Blood Bank (Crimson Red when selected) */}
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setActiveFacilityType('blood_bank');
                    }}
                    className={`py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      activeFacilityType === 'blood_bank'
                        ? 'bg-[#c9182b] text-white shadow-md shadow-red-500/20'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    <Droplet className={`w-4 h-4 ${activeFacilityType === 'blood_bank' ? 'fill-white text-white' : 'fill-rose-500 text-rose-500'}`} />
                    <span>Blood Bank</span>
                  </button>

                  {/* Tab 3: Ambulance Fleet (Blue when selected) */}
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setActiveFacilityType('ambulance');
                    }}
                    className={`py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      activeFacilityType === 'ambulance'
                        ? 'bg-[#1d63ff] text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    <Truck className={`w-4 h-4 ${activeFacilityType === 'ambulance' ? 'text-white' : 'text-slate-500'}`} />
                    <span>Ambulance Fleet</span>
                  </button>

                </div>

                {/* FORM CONTENT ACCORDING TO SELECTED TAB */}
                <form onSubmit={handleSubmitRegistration} className="space-y-6">
                  
                  {/* ========================================================================= */}
                  {/* VIEW 1: HOSPITAL / ICU REGISTRATION FORM (TOP-LEFT SCREENSHOT) */}
                  {/* ========================================================================= */}
                  {activeFacilityType === 'hospital' && (
                    <div className="space-y-5 animate-in fade-in">
                      
                      {/* Section 1: Facility Basic & Legal Information */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                          Facility Basic &amp; Legal Information
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Hospital Name <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={hospitalForm.hospitalName}
                              onChange={(e) => setHospitalForm({ ...hospitalForm, hospitalName: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Hospital ID / Code <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={hospitalForm.hospitalCode}
                              onChange={(e) => setHospitalForm({ ...hospitalForm, hospitalCode: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">ROHINI / NABH / PMJAY ID <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={hospitalForm.rohiniId}
                              onChange={(e) => setHospitalForm({ ...hospitalForm, rohiniId: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">City <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={hospitalForm.city}
                              onChange={(e) => setHospitalForm({ ...hospitalForm, city: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">State <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={hospitalForm.state}
                              onChange={(e) => setHospitalForm({ ...hospitalForm, state: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Google Maps Link / Coordinates <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={hospitalForm.coordinates}
                                onChange={(e) => setHospitalForm({ ...hospitalForm, coordinates: e.target.value })}
                                className="w-full px-3 py-2 pr-9 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                              />
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600">
                                <MapPin className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Live Bed Capacity Matrix (Initial Sync) */}
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                          Live Bed Capacity Matrix (Initial Sync)
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          
                          {/* ICU Beds Card */}
                          <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-200/80 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1d63ff] flex items-center justify-center shrink-0">
                              <BedDouble className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5 text-left">
                              <div className="text-[10px] font-bold text-slate-500">ICU Beds</div>
                              <input
                                type="number"
                                value={hospitalForm.icuBeds}
                                onChange={(e) => setHospitalForm({ ...hospitalForm, icuBeds: Number(e.target.value) })}
                                className="font-black text-xl text-slate-900 w-16 bg-transparent focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* NICU Warmers Card */}
                          <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-200/80 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                              <Activity className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5 text-left">
                              <div className="text-[10px] font-bold text-slate-500">NICU Warmers</div>
                              <input
                                type="number"
                                value={hospitalForm.nicuWarmers}
                                onChange={(e) => setHospitalForm({ ...hospitalForm, nicuWarmers: Number(e.target.value) })}
                                className="font-black text-xl text-slate-900 w-16 bg-transparent focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* ER Trauma Bays Card */}
                          <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-200/80 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                              <Shield className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5 text-left">
                              <div className="text-[10px] font-bold text-slate-500">ER Trauma Bays</div>
                              <input
                                type="number"
                                value={hospitalForm.erTraumaBays}
                                onChange={(e) => setHospitalForm({ ...hospitalForm, erTraumaBays: Number(e.target.value) })}
                                className="font-black text-xl text-rose-600 w-16 bg-transparent focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Ventilators Card */}
                          <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                              <Zap className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5 text-left">
                              <div className="text-[10px] font-bold text-slate-500">Ventilators</div>
                              <input
                                type="number"
                                value={hospitalForm.ventilators}
                                onChange={(e) => setHospitalForm({ ...hospitalForm, ventilators: Number(e.target.value) })}
                                className="font-black text-xl text-emerald-600 w-16 bg-transparent focus:outline-none"
                              />
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Section 3: Advanced Facilities */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                          Advanced Facilities (Select All That Apply)
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hospitalForm.hasCathLab}
                              onChange={(e) => setHospitalForm({ ...hospitalForm, hasCathLab: e.target.checked })}
                              className="rounded text-blue-600 focus:ring-0"
                            />
                            <span>Cath Lab (Cardiac)</span>
                          </label>

                          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hospitalForm.hasTraumaOT}
                              onChange={(e) => setHospitalForm({ ...hospitalForm, hasTraumaOT: e.target.checked })}
                              className="rounded text-blue-600 focus:ring-0"
                            />
                            <span>Trauma Emergency OT</span>
                          </label>

                          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hospitalForm.hasBloodBankAttached}
                              onChange={(e) => setHospitalForm({ ...hospitalForm, hasBloodBankAttached: e.target.checked })}
                              className="rounded text-blue-600 focus:ring-0"
                            />
                            <span>Blood Bank Attached</span>
                          </label>

                          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hospitalForm.has24x7CT}
                              onChange={(e) => setHospitalForm({ ...hospitalForm, has24x7CT: e.target.checked })}
                              className="rounded text-blue-600 focus:ring-0"
                            />
                            <span>24x7 CT / MRI Scanner</span>
                          </label>
                        </div>
                      </div>

                      {/* Section 4: Nodal Officer Contact */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                          Nodal Officer Contact (Emergency Desk)
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Emergency Desk Phone <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={hospitalForm.emergencyPhone}
                                onChange={(e) => setHospitalForm({ ...hospitalForm, emergencyPhone: e.target.value })}
                                className="w-full px-3 py-2 pl-9 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                              />
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Phone className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Official Email ID <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <input
                                type="email"
                                required
                                value={hospitalForm.officialEmail}
                                onChange={(e) => setHospitalForm({ ...hospitalForm, officialEmail: e.target.value })}
                                className="w-full px-3 py-2 pl-9 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                              />
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Mail className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* VIEW 2: BLOOD BANK REGISTRATION FORM (TOP-RIGHT SCREENSHOT) */}
                  {/* ========================================================================= */}
                  {activeFacilityType === 'blood_bank' && (
                    <div className="space-y-5 animate-in fade-in">
                      
                      {/* Section 1: Blood Bank Details */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                          Blood Bank Details
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Blood Bank Name <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={bloodBankForm.bloodBankName}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, bloodBankName: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-red-500 bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">State License / Drug Inspector Approval ID <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={bloodBankForm.licenseId}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, licenseId: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-red-500 bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Initial Stock Matrix (Live Inventory) */}
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                          Initial Stock Matrix (Live Inventory)
                        </h4>

                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                          
                          {/* A+ */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
                            <span className="text-[11px] font-black text-slate-700">A+</span>
                            <input
                              type="number"
                              value={bloodBankForm.aPos}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, aPos: Number(e.target.value) })}
                              className="w-full text-center font-black text-base text-slate-900 focus:outline-none bg-transparent"
                            />
                            <div className="text-[9px] text-slate-400">Units</div>
                          </div>

                          {/* A- */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
                            <span className="text-[11px] font-black text-slate-700">A-</span>
                            <input
                              type="number"
                              value={bloodBankForm.aNeg}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, aNeg: Number(e.target.value) })}
                              className="w-full text-center font-black text-base text-slate-900 focus:outline-none bg-transparent"
                            />
                            <div className="text-[9px] text-slate-400">Units</div>
                          </div>

                          {/* B+ */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
                            <span className="text-[11px] font-black text-slate-700">B+</span>
                            <input
                              type="number"
                              value={bloodBankForm.bPos}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, bPos: Number(e.target.value) })}
                              className="w-full text-center font-black text-base text-slate-900 focus:outline-none bg-transparent"
                            />
                            <div className="text-[9px] text-slate-400">Units</div>
                          </div>

                          {/* B- */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
                            <span className="text-[11px] font-black text-slate-700">B-</span>
                            <input
                              type="number"
                              value={bloodBankForm.bNeg}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, bNeg: Number(e.target.value) })}
                              className="w-full text-center font-black text-base text-slate-900 focus:outline-none bg-transparent"
                            />
                            <div className="text-[9px] text-slate-400">Units</div>
                          </div>

                          {/* O+ */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
                            <span className="text-[11px] font-black text-slate-700">O+</span>
                            <input
                              type="number"
                              value={bloodBankForm.oPos}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, oPos: Number(e.target.value) })}
                              className="w-full text-center font-black text-base text-slate-900 focus:outline-none bg-transparent"
                            />
                            <div className="text-[9px] text-slate-400">Units</div>
                          </div>

                          {/* O- */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
                            <span className="text-[11px] font-black text-slate-700">O-</span>
                            <input
                              type="number"
                              value={bloodBankForm.oNeg}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, oNeg: Number(e.target.value) })}
                              className="w-full text-center font-black text-base text-slate-900 focus:outline-none bg-transparent"
                            />
                            <div className="text-[9px] text-slate-400">Units</div>
                          </div>

                          {/* AB+ */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
                            <span className="text-[11px] font-black text-slate-700">AB+</span>
                            <input
                              type="number"
                              value={bloodBankForm.abPos}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, abPos: Number(e.target.value) })}
                              className="w-full text-center font-black text-base text-slate-900 focus:outline-none bg-transparent"
                            />
                            <div className="text-[9px] text-slate-400">Units</div>
                          </div>

                          {/* AB- */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
                            <span className="text-[11px] font-black text-slate-700">AB-</span>
                            <input
                              type="number"
                              value={bloodBankForm.abNeg}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, abNeg: Number(e.target.value) })}
                              className="w-full text-center font-black text-base text-slate-900 focus:outline-none bg-transparent"
                            />
                            <div className="text-[9px] text-slate-400">Units</div>
                          </div>

                        </div>
                      </div>

                      {/* Section 3: Special Components Available */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                          Special Components Available
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={bloodBankForm.hasSDP}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, hasSDP: e.target.checked })}
                              className="rounded text-red-600 focus:ring-0"
                            />
                            <span>Single Donor Platelets (SDP)</span>
                          </label>

                          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={bloodBankForm.hasFFP}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, hasFFP: e.target.checked })}
                              className="rounded text-red-600 focus:ring-0"
                            />
                            <span>Fresh Frozen Plasma (FFP)</span>
                          </label>

                          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={bloodBankForm.hasCryo}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, hasCryo: e.target.checked })}
                              className="rounded text-red-600 focus:ring-0"
                            />
                            <span>Cryoprecipitate</span>
                          </label>
                        </div>
                      </div>

                      {/* Section 4: 24x7 Helplines & Refrigeration Status */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                          24x7 Helplines &amp; Refrigeration Status
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">24x7 Helpline Number <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={bloodBankForm.helplinePhone}
                                onChange={(e) => setBloodBankForm({ ...bloodBankForm, helplinePhone: e.target.value })}
                                className="w-full px-3 py-2 pl-9 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-red-500 bg-white"
                              />
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Phone className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Cold Chain Backup Status <span className="text-red-500">*</span></label>
                            <select
                              value={bloodBankForm.coldChainStatus}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, coldChainStatus: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-red-500 bg-white"
                            >
                              <option>● Fully Operational</option>
                              <option>● Dual Generator Backup</option>
                              <option>● Solar Inverter Hybrid</option>
                            </select>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* VIEW 3: AMBULANCE FLEET REGISTRATION FORM (BOTTOM-LEFT SCREENSHOT) */}
                  {/* ========================================================================= */}
                  {activeFacilityType === 'ambulance' && (
                    <div className="space-y-5 animate-in fade-in">
                      
                      {/* Section 1: Fleet Operator Details */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Fleet Operator / Hospital Name <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={ambulanceForm.fleetName}
                              onChange={(e) => setAmbulanceForm({ ...ambulanceForm, fleetName: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Operator ID / Registration No. <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={ambulanceForm.operatorId}
                              onChange={(e) => setAmbulanceForm({ ...ambulanceForm, operatorId: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Vehicle Type */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                          Vehicle Type (Select Applicable)
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={ambulanceForm.hasALS}
                              onChange={(e) => setAmbulanceForm({ ...ambulanceForm, hasALS: e.target.checked })}
                              className="rounded text-blue-600 focus:ring-0"
                            />
                            <span>Advanced Life Support (ALS) with Ventilator</span>
                          </label>

                          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={ambulanceForm.hasBLS}
                              onChange={(e) => setAmbulanceForm({ ...ambulanceForm, hasBLS: e.target.checked })}
                              className="rounded text-blue-600 focus:ring-0"
                            />
                            <span>Basic Life Support (BLS)</span>
                          </label>

                          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={ambulanceForm.hasMortuary}
                              onChange={(e) => setAmbulanceForm({ ...ambulanceForm, hasMortuary: e.target.checked })}
                              className="rounded text-blue-600 focus:ring-0"
                            />
                            <span>Mortuary / Transport Van</span>
                          </label>
                        </div>
                      </div>

                      {/* Section 3: Total Ambulances Connected to Grid */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Total Ambulances Connected to Grid <span className="text-red-500">*</span></label>
                        <div className="flex items-center gap-2 max-w-[200px]">
                          <input
                            type="number"
                            required
                            value={ambulanceForm.totalAmbulances}
                            onChange={(e) => setAmbulanceForm({ ...ambulanceForm, totalAmbulances: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                          />
                          <span className="text-xs text-slate-500 font-semibold">Vehicles</span>
                        </div>
                      </div>

                      {/* Section 4: Driver / Paramedic GPS Device Sync */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                          Driver / Paramedic GPS Device Sync
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-700">Sync Device Via *</span>
                              <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                ✓ Recommended
                              </span>
                            </div>
                            <select
                              value={ambulanceForm.syncDevice}
                              onChange={(e) => setAmbulanceForm({ ...ambulanceForm, syncDevice: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
                            >
                              <option>Mobile App (Prathmikta Connect)</option>
                              <option>AIS-140 Certified Hardware Tracker</option>
                            </select>
                          </div>

                          <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-slate-100 flex items-center justify-center shrink-0">
                              <Cpu className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5 text-left">
                              <div className="text-[9px] font-bold text-slate-400 uppercase">Other Option</div>
                              <div className="text-xs font-bold text-slate-800">OBD-II GPS Tracker</div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* FORM BOTTOM BAR (EXACT AS SCREENSHOT) */}
                  <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>All data is encrypted and secure under ABDM Guidelines.</span>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-5 py-2 rounded-xl text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-50 ${
                          activeFacilityType === 'blood_bank'
                            ? 'bg-[#c9182b] hover:bg-red-700 shadow-red-500/20'
                            : 'bg-[#1d63ff] hover:bg-blue-700 shadow-blue-500/20'
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                            <span>Verifying Credentials...</span>
                          </>
                        ) : (
                          <>
                            <span>Next: Live Matrix &amp; Capabilities</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </form>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
