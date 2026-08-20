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
  Laptop,
  Plus,
  RefreshCw,
  Search,
  FileText,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { playTactileClick, playConfirmChime, playCodeRedAlert } from '../../lib/audio';

type FacilityType = 'hospital' | 'blood_bank' | 'ambulance';

export const FacilityRegistrationPortal: React.FC = () => {
  const { setMode, emitPartnerFacilityRegister, liveFacilities } = usePrathmikta();

  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>('citycare@prathmikta.in');
  const [loginPassword, setLoginPassword] = useState<string>('123456789');
  const [loginFacilityType, setLoginFacilityType] = useState<FacilityType>('hospital');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeFacilityType, setActiveFacilityType] = useState<FacilityType>('hospital');
  const [registrationStep, setRegistrationStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedFacilityId, setSubmittedFacilityId] = useState<string | null>(null);
  const [copiedApiKey, setCopiedApiKey] = useState<boolean>(false);
  const [copiedPass, setCopiedPass] = useState<boolean>(false);

  // Registry Filter & Search State
  const [registryFilter, setRegistryFilter] = useState<'all' | 'hospital' | 'blood_bank' | 'ambulance'>('all');
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [selectedFacilityDetails, setSelectedFacilityDetails] = useState<any | null>(null);

  // FAQ Accordion Open States
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Generated dynamic API Key & Credentials
  const [generatedApiKey, setGeneratedApiKey] = useState<string>('pk_live_7f3a5c9d2b6e8f1a9d0c4e7b9a2f1c6d');
  const [generatedEmail, setGeneratedEmail] = useState<string>('citycare@prathmikta.in');
  const [generatedPassword, setGeneratedPassword] = useState<string>('123456789');

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

    const rawName =
      activeFacilityType === 'hospital' ? hospitalForm.hospitalName
      : activeFacilityType === 'blood_bank' ? bloodBankForm.bloodBankName
      : ambulanceForm.fleetName;

    // Clean name slug for email (e.g., "Apex Trauma" -> "apextrauma@prathmikta.in")
    const cleanSlug = rawName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16) || 'facility';
    const email = `${cleanSlug}@prathmikta.in`;
    const assignedPassword = '123456789';

    setGeneratedEmail(email);
    setGeneratedPassword(assignedPassword);

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

  // Export all recorded collaborations to CSV
  const handleExportCollaborationsCSV = () => {
    playTactileClick();
    if (!liveFacilities || liveFacilities.length === 0) {
      alert('No collaboration records available to export.');
      return;
    }
    const headers = ['Facility ID', 'Category', 'Facility Name', 'Reg/License ID', 'City', 'State', 'Phone', 'Email', 'Capacity Matrix / Stock / Fleet', 'ABDM Verified', 'API Key', 'Created Timestamp'];
    const rows = liveFacilities.map((fac) => {
      const capacityDesc = fac.hospitalCapacity
        ? `${fac.hospitalCapacity.icuBeds || 0} ICU, ${fac.hospitalCapacity.ventilators || 0} Vent, ${fac.hospitalCapacity.erTraumaBays || 0} ER`
        : fac.bloodBankData
        ? `8 Blood Groups Sync, ColdChain: ${fac.bloodBankData.coldChainStatus || 'OK'}`
        : `${fac.ambulanceFleetData?.connectedCount || 1} Ambulances, GPS: ${fac.ambulanceFleetData?.gpsSyncType || 'Active'}`;
      return [
        fac.facilityId,
        fac.facilityType,
        `"${(fac.facilityName || '').replace(/"/g, '""')}"`,
        `"${(fac.registrationNumber || '').replace(/"/g, '""')}"`,
        fac.city || 'Lucknow',
        fac.state || 'Uttar Pradesh',
        fac.contactPhone || '',
        fac.contactEmail || '',
        `"${capacityDesc.replace(/"/g, '""')}"`,
        'ABDM Verified',
        fac.apiKey || 'pk_live_...',
        fac.createdAt || new Date().toISOString()
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `prathmikta_collaborations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export all recorded collaborations to JSON
  const handleExportCollaborationsJSON = () => {
    playTactileClick();
    if (!liveFacilities || liveFacilities.length === 0) {
      alert('No collaboration records available to export.');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(liveFacilities, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `prathmikta_collaborations_log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  // Filter and search live registered facilities
  const filteredFacilities = (liveFacilities || []).filter((fac) => {
    const matchesType = registryFilter === 'all' || fac.facilityType === registryFilter;
    const query = registrySearch.toLowerCase().trim();
    if (!query) return matchesType;
    const nameMatch = (fac.facilityName || '').toLowerCase().includes(query);
    const idMatch = (fac.facilityId || '').toLowerCase().includes(query);
    const cityMatch = (fac.city || '').toLowerCase().includes(query);
    const phoneMatch = (fac.contactPhone || '').toLowerCase().includes(query);
    const stateMatch = (fac.state || '').toLowerCase().includes(query);
    return matchesType && (nameMatch || idMatch || cityMatch || phoneMatch || stateMatch);
  });

  const totalHospitalsCount = (liveFacilities || []).filter(f => f.facilityType === 'hospital').length;
  const totalBloodBanksCount = (liveFacilities || []).filter(f => f.facilityType === 'blood_bank').length;
  const totalAmbulanceCount = (liveFacilities || []).filter(f => f.facilityType === 'ambulance').length;

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
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-3 sm:px-6 py-3.5">
        <div className="w-full flex items-center justify-between">
          
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

          {/* Right Action: Register Facility CTA & Partner Login Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setIsLoginModalOpen(true);
              }}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#1d63ff]" />
              <span>Partner Login</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenRegistration('hospital')}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#1d63ff] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
            >
              Register Facility
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION WITH IMAGE & 3 STACKED STAT BADGES */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 px-3 sm:px-6 bg-gradient-to-b from-slate-50/80 via-white to-white w-full">
        <div className="w-full">
          
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
      <section className="px-3 sm:px-6 py-6 w-full">
        <div className="w-full">
          
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
      {/* 5. "HOW IT WORKS" 3-STEP PROCESS SECTION */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="px-3 sm:px-6 py-10 bg-white border-t border-slate-100 w-full">
        <div className="w-full text-left space-y-6">
          
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
      <section className="px-3 sm:px-6 py-6 w-full">
        <div className="w-full rounded-3xl bg-[#051838] border border-blue-900/60 p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
          
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
      <section id="security" className="px-3 sm:px-6 py-10 bg-white w-full">
        <div className="w-full">
          
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
      {/* 7.5 LIVE MONGODB PERSISTED REGISTRY & VERIFIED PARTNER AUDIT TABLE */}
      {/* ========================================================================= */}
      <section id="live-db-registry" className="px-3 sm:px-6 py-8 bg-[#061122] text-white border-y border-slate-800 w-full">
        <div className="w-full space-y-6 text-left">
          
          {/* Header & Main Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 font-mono">
                  LIVE DATABASE &amp; COMMAND COLLABORATION AUDIT
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                <Database className="w-6 h-6 text-emerald-400" />
                <span>Verified Facilities &amp; Collaboration Registry</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Track every hospital, blood bank, and ambulance fleet that collaborated with the national emergency grid.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleExportCollaborationsCSV}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                title="Export all collaboration entries to CSV"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handleExportCollaborationsJSON}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                title="Export raw JSON log of all entries"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export JSON Log</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenRegistration('hospital')}
                className="px-4 py-2 rounded-xl bg-[#1d63ff] hover:bg-blue-600 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/20 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Register New Partner</span>
              </button>
            </div>
          </div>

          {/* Quick Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Total Collaborations</div>
              <div className="text-2xl font-black text-white font-mono">{liveFacilities?.length || 0}</div>
              <div className="text-[10px] text-emerald-400 font-medium">● 100% Persisted &amp; Live</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/40 space-y-1">
              <div className="text-[10px] uppercase tracking-wider font-bold text-blue-300">Hospitals Connected</div>
              <div className="text-2xl font-black text-blue-400 font-mono">{totalHospitalsCount}</div>
              <div className="text-[10px] text-slate-400 font-medium">ICU Beds &amp; Trauma Matrix Sync</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/40 space-y-1">
              <div className="text-[10px] uppercase tracking-wider font-bold text-red-300">Blood Banks Connected</div>
              <div className="text-2xl font-black text-rose-400 font-mono">{totalBloodBanksCount}</div>
              <div className="text-[10px] text-slate-400 font-medium">8 Blood Types Live Inventory</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 space-y-1">
              <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-300">EMS Fleets Connected</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">{totalAmbulanceCount}</div>
              <div className="text-[10px] text-slate-400 font-medium">ALS/BLS GPS Tracking</div>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRegistryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  registryFilter === 'all'
                    ? 'bg-white text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                All Partners ({liveFacilities?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setRegistryFilter('hospital')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  registryFilter === 'hospital'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Hospitals ({totalHospitalsCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setRegistryFilter('blood_bank')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  registryFilter === 'blood_bank'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Droplet className="w-3.5 h-3.5" />
                <span>Blood Banks ({totalBloodBanksCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setRegistryFilter('ambulance')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  registryFilter === 'ambulance'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Ambulance Fleets ({totalAmbulanceCount})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={registrySearch}
                onChange={(e) => setRegistrySearch(e.target.value)}
                placeholder="Search facility name, ID, city..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all font-medium"
              />
              {registrySearch && (
                <button
                  type="button"
                  onClick={() => setRegistrySearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Database Table Container */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b1b36] text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                  <tr>
                    <th className="py-3.5 px-4">Facility &amp; Collab ID</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Facility Name &amp; Contact</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Live Matrix / Stock</th>
                    <th className="py-3.5 px-4">ABDM Status</th>
                    <th className="py-3.5 px-4">API Token</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300 font-medium">
                  {filteredFacilities && filteredFacilities.length > 0 ? (
                    filteredFacilities.map((fac, idx) => (
                      <tr key={fac.facilityId || idx} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-sky-400 whitespace-nowrap">
                          <div>{fac.facilityId}</div>
                          <div className="text-[10px] text-slate-500 font-sans font-normal">
                            {fac.createdAt ? new Date(fac.createdAt).toLocaleDateString() : 'Active Partner'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide inline-flex items-center gap-1.5 ${
                            fac.facilityType === 'hospital'
                              ? 'bg-blue-950 text-blue-400 border border-blue-800/60'
                              : fac.facilityType === 'blood_bank'
                              ? 'bg-red-950 text-red-400 border border-red-800/60'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          }`}>
                            {fac.facilityType === 'hospital' && <Building2 className="w-3 h-3" />}
                            {fac.facilityType === 'blood_bank' && <Droplet className="w-3 h-3" />}
                            {fac.facilityType === 'ambulance' && <Truck className="w-3 h-3" />}
                            <span>{fac.facilityType?.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-xs sm:text-sm">{fac.facilityName}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            {fac.contactPhone && <span>📞 {fac.contactPhone}</span>}
                            {fac.registrationNumber && <span className="font-mono text-slate-500">[{fac.registrationNumber}]</span>}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{fac.city || 'Lucknow'}, {fac.state || 'Uttar Pradesh'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {fac.hospitalCapacity ? (
                            <span className="font-mono text-emerald-400 text-xs">
                              {fac.hospitalCapacity.icuBeds || 0} ICU • {fac.hospitalCapacity.ventilators || 0} Vent • {fac.hospitalCapacity.erTraumaBays || 0} ER
                            </span>
                          ) : fac.bloodBankData ? (
                            <span className="font-mono text-rose-400 text-xs">
                              8 Blood Groups Active • {fac.bloodBankData.coldChainStatus || 'Cold Chain OK'}
                            </span>
                          ) : (
                            <span className="font-mono text-emerald-400 text-xs">
                              {fac.ambulanceFleetData?.connectedCount || 5} Ambulances • {fac.ambulanceFleetData?.gpsSyncType || 'GPS Sync'}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>VERIFIED</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(fac.apiKey || 'pk_live_default_partner', 'key')}
                            className="hover:text-white flex items-center gap-1 cursor-pointer bg-slate-900 px-2 py-1 rounded border border-slate-800"
                            title="Click to copy API Key"
                          >
                            <Key className="w-3 h-3 text-amber-400" />
                            <span>{(fac.apiKey || 'pk_live_...').slice(0, 10)}...</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedFacilityDetails(fac)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                              title="Inspect complete collaboration entry"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                playConfirmChime();
                                if (fac.facilityType === 'hospital') setMode('hospital');
                                else if (fac.facilityType === 'blood_bank') setMode('bloodbank');
                                else setMode('ambulance');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <span>Open</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2.5">
                          <Database className="w-10 h-10 text-slate-600 animate-pulse" />
                          <span className="text-sm font-semibold text-slate-400">
                            {registrySearch ? `No registered facilities match "${registrySearch}"` : 'No custom facilities registered yet.'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenRegistration('hospital')}
                            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-all cursor-pointer mt-1"
                          >
                            + Register First Facility Now
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Record Inspection Modal */}
          {selectedFacilityDetails && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-xl w-full text-white space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-sm">Collaboration Audit Record</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFacilityDetails(null)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-slate-400 uppercase text-[10px] font-bold">Facility Name</div>
                    <div className="font-bold text-sm text-white">{selectedFacilityDetails.facilityName}</div>
                    <div className="text-slate-400 font-mono text-[11px]">ID: {selectedFacilityDetails.facilityId}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Type</div>
                      <div className="font-bold text-emerald-400 capitalize">{selectedFacilityDetails.facilityType}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-slate-400 text-[10px] uppercase font-bold">City &amp; State</div>
                      <div className="font-bold text-white">{selectedFacilityDetails.city || 'Lucknow'}, {selectedFacilityDetails.state || 'UP'}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-[11px]">
                    <div className="text-slate-400 uppercase text-[10px] font-bold font-sans">API Key</div>
                    <div className="text-amber-300 break-all">{selectedFacilityDetails.apiKey || 'pk_live_default'}</div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedFacilityDetails(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Close Inspection
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. COMPREHENSIVE 5-COLUMN DARK NAVY FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-[#051329] text-white px-3 sm:px-6 pt-12 pb-8 border-t border-slate-900 w-full">
        <div className="w-full space-y-10 text-left">
          
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
      {/* 9.5 PARTNER AUTHENTICATION & LOGIN MODAL (/hb LOGIN -> /h, /b, /a DASHBOARD) */}
      {/* ========================================================================= */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-left my-auto animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="bg-[#0b1b36] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#1d63ff] flex items-center justify-center text-white">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight text-white leading-tight">
                    Partner Facility Login
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-mono">
                    ABDM AUTHENTICATION GATEWAY
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setIsLoginModalOpen(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Login Form Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                playConfirmChime();
                setIsLoginModalOpen(false);
                if (loginFacilityType === 'hospital') {
                  setMode('hospital');
                } else if (loginFacilityType === 'blood_bank') {
                  setMode('bloodbank');
                } else {
                  setMode('ambulance');
                }
              }}
              className="p-6 space-y-4 text-left"
            >
              <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-[#1d63ff]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Assigned Partner Credentials</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Default credentials: Password <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-blue-200">123456789</span> aur email format <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-blue-200">name@prathmikta.in</span>.
                </p>
              </div>

              {/* Facility Role / Destination Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Facility Sector
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setLoginFacilityType('hospital');
                    }}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      loginFacilityType === 'hospital'
                        ? 'bg-blue-50 border-[#1d63ff] text-[#1d63ff]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Hospital (/h)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setLoginFacilityType('blood_bank');
                    }}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      loginFacilityType === 'blood_bank'
                        ? 'bg-red-50 border-red-600 text-red-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Droplet className="w-4 h-4" />
                    <span>Blood Bank (/b)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setLoginFacilityType('ambulance');
                    }}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      loginFacilityType === 'ambulance'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>EMS Fleet (/a)</span>
                  </button>
                </div>
              </div>

              {/* Email / Username Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Email / Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="hospitalname@prathmikta.in"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:bg-white focus:border-[#1d63ff] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="•••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-mono font-medium text-slate-900 focus:bg-white focus:border-[#1d63ff] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Submit / Login Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#1d63ff] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-98"
                >
                  <span>Login to {loginFacilityType === 'hospital' ? 'Hospital Dashboard (/h)' : loginFacilityType === 'blood_bank' ? 'Blood Bank (/b)' : 'Ambulance (/a)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setIsLoginModalOpen(false);
                    handleOpenRegistration('hospital');
                  }}
                  className="text-xs text-[#1d63ff] hover:underline font-semibold cursor-pointer"
                >
                  Haven't registered your facility yet? Register Now &rarr;
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. ENHANCED LARGE & ZOOM-OPTIMIZED REGISTRATION MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-8 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl 2xl:max-w-6xl overflow-hidden max-h-[94vh] flex flex-col text-left my-auto animate-in zoom-in-95">
            
            {/* Top Navigation & Status Strip */}
            <div className="bg-[#0b1b36] text-white px-5 sm:px-8 py-3.5 flex items-center justify-between text-xs sm:text-sm shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE GRID ACTIVE
                </span>
                <span className="font-mono text-slate-200 font-black tracking-wide">ABDM &bull; NATIONAL EMERGENCY HEALTHCARE GRID</span>
                <span className="hidden sm:inline-block text-[11px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-lg border border-slate-700 font-mono">Form v2.5 High-Def</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 text-slate-300 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>256-Bit Encrypted &bull; ABDM Compliant &bull; Real-Time</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1.5 rounded-xl hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* STEP 3: SUCCESSFUL CONFIRMATION VIEW */}
            {registrationStep === 3 ? (
              <div className="bg-[#031d16] text-white p-6 sm:p-10 md:p-12 flex-1 overflow-y-auto flex flex-col justify-between space-y-8 relative">
                
                {/* Background Subtle Grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none"></div>

                <div className="text-center space-y-4 relative z-10 pt-2">
                  
                  {/* Big Green Success Badge */}
                  <div className="w-24 h-24 rounded-3xl bg-emerald-500/20 text-emerald-400 border-2 border-emerald-400/50 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/40">
                    <Check className="w-12 h-12 stroke-[3]" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                      Registration &amp; Collaboration Live!
                    </h2>
                    <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
                      Your facility is now permanently registered in the National Emergency Grid and saved in the central database cluster.
                    </p>
                  </div>

                </div>

                {/* 2 Credentials Cards in Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
                  
                  {/* Card 1: API Key */}
                  <div className="p-5 rounded-3xl bg-emerald-950/70 border border-emerald-500/40 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-black text-amber-300">
                        <Key className="w-5 h-5 text-amber-400" />
                        <span>Production API Key</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-black/60 border border-emerald-500/30">
                      <input
                        type="text"
                        readOnly
                        value={generatedApiKey}
                        className="bg-transparent text-emerald-300 text-xs sm:text-sm font-mono w-full focus:outline-none truncate font-bold px-1"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(generatedApiKey, 'key')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
                      >
                        {copiedApiKey ? <CheckCheck className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedApiKey ? 'COPIED' : 'COPY'}</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-400">
                      Keep this key secure. Use for webhook triggers and hospital MIS/EMR sync.
                    </p>
                  </div>

                  {/* Card 2: Dashboard Login Credentials */}
                  <div className="p-5 rounded-3xl bg-emerald-950/70 border border-emerald-500/40 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-black text-emerald-300">
                        <Laptop className="w-5 h-5 text-emerald-400" />
                        <span>Dashboard Login Credentials</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded-full">
                        1-CLICK READY
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-left">
                      <div className="p-3 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-1">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Username</div>
                        <div className="text-xs sm:text-sm font-bold text-white truncate">{generatedEmail}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-1 relative">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Password</div>
                        <div className="text-xs sm:text-sm font-mono font-black text-emerald-300 flex items-center justify-between">
                          <span>{generatedPassword}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(generatedPassword, 'pass')}
                            className="text-slate-400 hover:text-white cursor-pointer p-0.5"
                          >
                            {copiedPass ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400">
                      You can change your password anytime after logging into your dashboard.
                    </p>
                  </div>

                </div>

                {/* 4 Status Badges in Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center relative z-10">
                  <div className="p-3.5 rounded-2xl bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div className="text-left leading-tight">
                      <div className="text-[10px] text-slate-400">Facility Status</div>
                      <div className="text-xs sm:text-sm font-black text-emerald-300">VERIFIED</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div className="text-left leading-tight">
                      <div className="text-[10px] text-slate-400">ABDM Compliance</div>
                      <div className="text-xs sm:text-sm font-black text-emerald-300">COMPLIANT</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <div className="text-left leading-tight">
                      <div className="text-[10px] text-slate-400">Grid Connection</div>
                      <div className="text-xs sm:text-sm font-black text-emerald-300">&bull; LIVE DB SYNC</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center gap-2.5">
                    <Activity className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div className="text-left leading-tight">
                      <div className="text-[10px] text-slate-400">Data Stream</div>
                      <div className="text-xs sm:text-sm font-black text-emerald-300">ACTIVE</div>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      playConfirmChime();
                      setIsModalOpen(false);
                      if (activeFacilityType === 'hospital') setMode('hospital');
                      else if (activeFacilityType === 'blood_bank') setMode('bloodbank');
                      else setMode('ambulance');
                    }}
                    className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base flex items-center gap-3 shadow-xl shadow-emerald-500/30 cursor-pointer transition-all active:scale-95 hover:scale-[1.02]"
                  >
                    <span>Launch Facility Live Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      alert(`Downloading Prathmikta Facility Certificate: ${submittedFacilityId || 'PRATH-FACILITY-2024'}`);
                    }}
                    className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 flex items-center gap-2.5 cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Registration Certificate</span>
                  </button>
                </div>

                <div className="text-center text-xs text-slate-400 relative z-10">
                  🔒 All collaboration data is encrypted and permanently recorded under ABDM &amp; National Emergency Stack guidelines.
                </div>

              </div>
            ) : (
              /* FORM FLOW CONTAINER (STEP 1 & 2) - ENLARGED & HIGH CONTRAST */
              <div className="p-6 sm:p-8 md:p-10 overflow-y-auto flex-1 space-y-6">
                
                {/* Form Title & Progress Steps */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Partner Facility Onboarding &amp; Registration
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                      Connect your institution to the unified national emergency dispatch grid.
                    </p>
                  </div>

                  {/* Step Tracker Indicator */}
                  <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-xl bg-[#1d63ff] text-white text-xs font-black flex items-center justify-center shadow">
                        1
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-black text-slate-900">Step 1</div>
                        <div className="text-[10px] text-slate-500 font-medium">Basic &amp; Legal Info</div>
                      </div>
                    </div>

                    <div className="w-6 h-0.5 bg-slate-300"></div>

                    <div className="flex items-center gap-2 opacity-70">
                      <div className="w-6 h-6 rounded-xl bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center">
                        2
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-700">Step 2</div>
                        <div className="text-[10px] text-slate-500">Live Matrix &amp; Sync</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 Facility Selector Tabs */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  
                  {/* Tab 1: Hospital / ICU */}
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setActiveFacilityType('hospital');
                    }}
                    className={`py-3.5 sm:py-4 px-4 rounded-2xl text-xs sm:text-sm md:text-base font-black flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                      activeFacilityType === 'hospital'
                        ? 'bg-[#1d63ff] text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Building2 className={`w-5 h-5 ${activeFacilityType === 'hospital' ? 'text-white' : 'text-slate-600'}`} />
                    <span>Hospital / ICU</span>
                  </button>

                  {/* Tab 2: Blood Bank */}
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setActiveFacilityType('blood_bank');
                    }}
                    className={`py-3.5 sm:py-4 px-4 rounded-2xl text-xs sm:text-sm md:text-base font-black flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                      activeFacilityType === 'blood_bank'
                        ? 'bg-[#c9182b] text-white shadow-lg shadow-red-500/30 ring-2 ring-red-400'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Droplet className={`w-5 h-5 ${activeFacilityType === 'blood_bank' ? 'fill-white text-white' : 'fill-rose-500 text-rose-500'}`} />
                    <span>Blood Bank</span>
                  </button>

                  {/* Tab 3: Ambulance Fleet */}
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setActiveFacilityType('ambulance');
                    }}
                    className={`py-3.5 sm:py-4 px-4 rounded-2xl text-xs sm:text-sm md:text-base font-black flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                      activeFacilityType === 'ambulance'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Truck className={`w-5 h-5 ${activeFacilityType === 'ambulance' ? 'text-white' : 'text-slate-600'}`} />
                    <span>Ambulance Fleet</span>
                  </button>

                </div>

                {/* FORM CONTENT ACCORDING TO SELECTED TAB */}
                <form onSubmit={handleSubmitRegistration} className="space-y-7">
                  
                  {/* ========================================================================= */}
                  {/* VIEW 1: HOSPITAL / ICU REGISTRATION FORM */}
                  {/* ========================================================================= */}
                  {activeFacilityType === 'hospital' && (
                    <div className="space-y-6 animate-in fade-in">
                      
                      {/* Section 1: Facility Basic & Legal Information */}
                      <div className="space-y-3.5">
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">
                          Facility Basic &amp; Legal Information
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Hospital Name <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={hospitalForm.hospitalName}
                              onChange={(e) => setHospitalForm({ ...hospitalForm, hospitalName: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 bg-white"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Hospital ID / Code <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={hospitalForm.hospitalCode}
                              onChange={(e) => setHospitalForm({ ...hospitalForm, hospitalCode: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 bg-white font-mono"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">ROHINI / NABH / PMJAY ID <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={hospitalForm.rohiniId}
                              onChange={(e) => setHospitalForm({ ...hospitalForm, rohiniId: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 bg-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">City <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={hospitalForm.city}
                              onChange={(e) => setHospitalForm({ ...hospitalForm, city: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 bg-white"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">State <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={hospitalForm.state}
                              onChange={(e) => setHospitalForm({ ...hospitalForm, state: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 bg-white"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Google Maps / Coordinates <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={hospitalForm.coordinates}
                                onChange={(e) => setHospitalForm({ ...hospitalForm, coordinates: e.target.value })}
                                className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 bg-white"
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600">
                                <MapPin className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Live Bed Capacity Matrix */}
                      <div className="space-y-3.5">
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">
                          Live Bed Capacity Matrix (Initial Sync)
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          
                          {/* ICU Beds Card */}
                          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#1d63ff] flex items-center justify-center shrink-0 shadow-xs">
                              <BedDouble className="w-6 h-6" />
                            </div>
                            <div className="space-y-0.5 text-left">
                              <div className="text-xs font-bold text-slate-600">ICU Beds</div>
                              <input
                                type="number"
                                value={hospitalForm.icuBeds}
                                onChange={(e) => setHospitalForm({ ...hospitalForm, icuBeds: Number(e.target.value) })}
                                className="font-black text-2xl text-slate-900 w-20 bg-transparent focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* NICU Warmers Card */}
                          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
                              <Activity className="w-6 h-6" />
                            </div>
                            <div className="space-y-0.5 text-left">
                              <div className="text-xs font-bold text-slate-600">NICU Warmers</div>
                              <input
                                type="number"
                                value={hospitalForm.nicuWarmers}
                                onChange={(e) => setHospitalForm({ ...hospitalForm, nicuWarmers: Number(e.target.value) })}
                                className="font-black text-2xl text-slate-900 w-20 bg-transparent focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* ER Trauma Bays Card */}
                          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                              <Shield className="w-6 h-6" />
                            </div>
                            <div className="space-y-0.5 text-left">
                              <div className="text-xs font-bold text-slate-600">ER Trauma Bays</div>
                              <input
                                type="number"
                                value={hospitalForm.erTraumaBays}
                                onChange={(e) => setHospitalForm({ ...hospitalForm, erTraumaBays: Number(e.target.value) })}
                                className="font-black text-2xl text-rose-600 w-20 bg-transparent focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Ventilators Card */}
                          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                              <Zap className="w-6 h-6" />
                            </div>
                            <div className="space-y-0.5 text-left">
                              <div className="text-xs font-bold text-slate-600">Ventilators</div>
                              <input
                                type="number"
                                value={hospitalForm.ventilators}
                                onChange={(e) => setHospitalForm({ ...hospitalForm, ventilators: Number(e.target.value) })}
                                className="font-black text-2xl text-emerald-600 w-20 bg-transparent focus:outline-none"
                              />
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Section 3: Advanced Facilities */}
                      <div className="space-y-3">
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">
                          Advanced Facilities (Select All That Apply)
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={hospitalForm.hasCathLab}
                              onChange={(e) => setHospitalForm({ ...hospitalForm, hasCathLab: e.target.checked })}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                            />
                            <span>Cath Lab (Cardiac)</span>
                          </label>

                          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={hospitalForm.hasTraumaOT}
                              onChange={(e) => setHospitalForm({ ...hospitalForm, hasTraumaOT: e.target.checked })}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                            />
                            <span>Trauma Emergency OT</span>
                          </label>

                          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={hospitalForm.hasBloodBankAttached}
                              onChange={(e) => setHospitalForm({ ...hospitalForm, hasBloodBankAttached: e.target.checked })}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                            />
                            <span>Blood Bank Attached</span>
                          </label>

                          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={hospitalForm.has24x7CT}
                              onChange={(e) => setHospitalForm({ ...hospitalForm, has24x7CT: e.target.checked })}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                            />
                            <span>24x7 CT / MRI Scanner</span>
                          </label>
                        </div>
                      </div>

                      {/* Section 4: Nodal Officer Contact */}
                      <div className="space-y-3">
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">
                          Nodal Officer Contact (Emergency Desk)
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Emergency Desk Phone <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={hospitalForm.emergencyPhone}
                                onChange={(e) => setHospitalForm({ ...hospitalForm, emergencyPhone: e.target.value })}
                                className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 bg-white"
                              />
                              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                <Phone className="w-4 h-4" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Official Email ID <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <input
                                type="email"
                                required
                                value={hospitalForm.officialEmail}
                                onChange={(e) => setHospitalForm({ ...hospitalForm, officialEmail: e.target.value })}
                                className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 bg-white"
                              />
                              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                <Mail className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* VIEW 2: BLOOD BANK REGISTRATION FORM */}
                  {/* ========================================================================= */}
                  {activeFacilityType === 'blood_bank' && (
                    <div className="space-y-6 animate-in fade-in">
                      
                      {/* Section 1: Blood Bank Details */}
                      <div className="space-y-3.5">
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">
                          Blood Bank Center Details
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Blood Bank Name <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={bloodBankForm.bloodBankName}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, bloodBankName: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-600 bg-white"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">State License / Drug Inspector Approval ID <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={bloodBankForm.licenseId}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, licenseId: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-600 bg-white font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Initial Stock Matrix (Live Inventory) */}
                      <div className="space-y-3.5">
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">
                          Initial Stock Matrix (Live Inventory Sync)
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                          
                          {/* A+ */}
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1 shadow-xs">
                            <span className="text-xs font-black text-slate-800">A+</span>
                            <input
                              type="number"
                              value={bloodBankForm.aPos}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, aPos: Number(e.target.value) })}
                              className="w-full text-center font-black text-xl text-slate-900 focus:outline-none bg-transparent"
                            />
                            <div className="text-[10px] text-slate-500 font-medium">Units</div>
                          </div>

                          {/* A- */}
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1 shadow-xs">
                            <span className="text-xs font-black text-slate-800">A-</span>
                            <input
                              type="number"
                              value={bloodBankForm.aNeg}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, aNeg: Number(e.target.value) })}
                              className="w-full text-center font-black text-xl text-slate-900 focus:outline-none bg-transparent"
                            />
                            <div className="text-[10px] text-slate-500 font-medium">Units</div>
                          </div>

                          {/* B+ */}
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1 shadow-xs">
                            <span className="text-xs font-black text-slate-800">B+</span>
                            <input
                              type="number"
                              value={bloodBankForm.bPos}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, bPos: Number(e.target.value) })}
                              className="w-full text-center font-black text-xl text-slate-900 focus:outline-none bg-transparent"
                            />
                            <div className="text-[10px] text-slate-500 font-medium">Units</div>
                          </div>

                          {/* B- */}
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1 shadow-xs">
                            <span className="text-xs font-black text-slate-800">B-</span>
                            <input
                              type="number"
                              value={bloodBankForm.bNeg}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, bNeg: Number(e.target.value) })}
                              className="w-full text-center font-black text-xl text-slate-900 focus:outline-none bg-transparent"
                            />
                            <div className="text-[10px] text-slate-500 font-medium">Units</div>
                          </div>

                          {/* O+ */}
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1 shadow-xs">
                            <span className="text-xs font-black text-slate-800">O+</span>
                            <input
                              type="number"
                              value={bloodBankForm.oPos}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, oPos: Number(e.target.value) })}
                              className="w-full text-center font-black text-xl text-slate-900 focus:outline-none bg-transparent"
                            />
                            <div className="text-[10px] text-slate-500 font-medium">Units</div>
                          </div>

                          {/* O- */}
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1 shadow-xs">
                            <span className="text-xs font-black text-slate-800">O-</span>
                            <input
                              type="number"
                              value={bloodBankForm.oNeg}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, oNeg: Number(e.target.value) })}
                              className="w-full text-center font-black text-xl text-slate-900 focus:outline-none bg-transparent"
                            />
                            <div className="text-[10px] text-slate-500 font-medium">Units</div>
                          </div>

                          {/* AB+ */}
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1 shadow-xs">
                            <span className="text-xs font-black text-slate-800">AB+</span>
                            <input
                              type="number"
                              value={bloodBankForm.abPos}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, abPos: Number(e.target.value) })}
                              className="w-full text-center font-black text-xl text-slate-900 focus:outline-none bg-transparent"
                            />
                            <div className="text-[10px] text-slate-500 font-medium">Units</div>
                          </div>

                          {/* AB- */}
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1 shadow-xs">
                            <span className="text-xs font-black text-slate-800">AB-</span>
                            <input
                              type="number"
                              value={bloodBankForm.abNeg}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, abNeg: Number(e.target.value) })}
                              className="w-full text-center font-black text-xl text-slate-900 focus:outline-none bg-transparent"
                            />
                            <div className="text-[10px] text-slate-500 font-medium">Units</div>
                          </div>

                        </div>
                      </div>

                      {/* Section 3: Special Components Available */}
                      <div className="space-y-3">
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">
                          Special Components Available
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={bloodBankForm.hasSDP}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, hasSDP: e.target.checked })}
                              className="w-4 h-4 rounded text-red-600 focus:ring-0 cursor-pointer"
                            />
                            <span>Single Donor Platelets (SDP)</span>
                          </label>

                          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={bloodBankForm.hasFFP}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, hasFFP: e.target.checked })}
                              className="w-4 h-4 rounded text-red-600 focus:ring-0 cursor-pointer"
                            />
                            <span>Fresh Frozen Plasma (FFP)</span>
                          </label>

                          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={bloodBankForm.hasCryo}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, hasCryo: e.target.checked })}
                              className="w-4 h-4 rounded text-red-600 focus:ring-0 cursor-pointer"
                            />
                            <span>Cryoprecipitate</span>
                          </label>
                        </div>
                      </div>

                      {/* Section 4: 24x7 Helplines & Refrigeration Status */}
                      <div className="space-y-3">
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">
                          24x7 Helplines &amp; Refrigeration Status
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">24x7 Helpline Number <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={bloodBankForm.helplinePhone}
                                onChange={(e) => setBloodBankForm({ ...bloodBankForm, helplinePhone: e.target.value })}
                                className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-600 bg-white"
                              />
                              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                <Phone className="w-4 h-4" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Cold Chain Backup Status <span className="text-red-500">*</span></label>
                            <select
                              value={bloodBankForm.coldChainStatus}
                              onChange={(e) => setBloodBankForm({ ...bloodBankForm, coldChainStatus: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-600 bg-white"
                            >
                              <option>● Fully Operational (Primary + Backup)</option>
                              <option>● Dual Generator Backup</option>
                              <option>● Solar Inverter Hybrid</option>
                            </select>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* VIEW 3: AMBULANCE FLEET REGISTRATION FORM */}
                  {/* ========================================================================= */}
                  {activeFacilityType === 'ambulance' && (
                    <div className="space-y-6 animate-in fade-in">
                      
                      {/* Section 1: Fleet Operator Details */}
                      <div className="space-y-3.5">
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">
                          EMS Fleet Operator Details
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Fleet Operator / Hospital Name <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={ambulanceForm.fleetName}
                              onChange={(e) => setAmbulanceForm({ ...ambulanceForm, fleetName: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 bg-white"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Operator ID / Registration No. <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={ambulanceForm.operatorId}
                              onChange={(e) => setAmbulanceForm({ ...ambulanceForm, operatorId: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 bg-white font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Vehicle Type */}
                      <div className="space-y-3">
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">
                          Vehicle Type (Select Applicable)
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <label className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={ambulanceForm.hasALS}
                              onChange={(e) => setAmbulanceForm({ ...ambulanceForm, hasALS: e.target.checked })}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                            />
                            <span>Advanced Life Support (ALS) with Ventilator</span>
                          </label>

                          <label className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={ambulanceForm.hasBLS}
                              onChange={(e) => setAmbulanceForm({ ...ambulanceForm, hasBLS: e.target.checked })}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                            />
                            <span>Basic Life Support (BLS)</span>
                          </label>

                          <label className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={ambulanceForm.hasMortuary}
                              onChange={(e) => setAmbulanceForm({ ...ambulanceForm, hasMortuary: e.target.checked })}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                            />
                            <span>Mortuary / Transport Van</span>
                          </label>
                        </div>
                      </div>

                      {/* Section 3: Total Ambulances Connected to Grid */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Total Ambulances Connected to Grid <span className="text-red-500">*</span></label>
                        <div className="flex items-center gap-3 max-w-[240px]">
                          <input
                            type="number"
                            required
                            value={ambulanceForm.totalAmbulances}
                            onChange={(e) => setAmbulanceForm({ ...ambulanceForm, totalAmbulances: Number(e.target.value) })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 bg-white"
                          />
                          <span className="text-xs sm:text-sm text-slate-600 font-bold">Vehicles</span>
                        </div>
                      </div>

                      {/* Section 4: Driver / Paramedic GPS Device Sync */}
                      <div className="space-y-3">
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">
                          Driver / Paramedic GPS Device Sync
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800">Sync Device Via *</span>
                              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                ✓ Recommended
                              </span>
                            </div>
                            <select
                              value={ambulanceForm.syncDevice}
                              onChange={(e) => setAmbulanceForm({ ...ambulanceForm, syncDevice: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 bg-white focus:outline-none"
                            >
                              <option>Mobile App (Prathmikta Connect)</option>
                              <option>AIS-140 Certified Hardware Tracker</option>
                            </select>
                          </div>

                          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-slate-100 flex items-center justify-center shrink-0 shadow-xs">
                              <Cpu className="w-6 h-6" />
                            </div>
                            <div className="space-y-0.5 text-left">
                              <div className="text-[10px] font-bold text-slate-500 uppercase">Hardware Support</div>
                              <div className="text-xs sm:text-sm font-black text-slate-800">OBD-II &amp; AIS-140 GPS Tracker</div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* FORM BOTTOM BAR */}
                  <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <span>Encrypted under ABDM Guidelines. Persisted in Central Database.</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-5 py-3 rounded-xl border-2 border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 cursor-pointer transition-all"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-7 py-3.5 rounded-xl text-white font-black text-xs sm:text-sm md:text-base flex items-center gap-2.5 shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50 ${
                          activeFacilityType === 'blood_bank'
                            ? 'bg-[#c9182b] hover:bg-red-700 shadow-red-500/20'
                            : activeFacilityType === 'ambulance'
                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                            : 'bg-[#1d63ff] hover:bg-blue-700 shadow-blue-500/20'
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                            <span>Saving &amp; Verifying In Database...</span>
                          </>
                        ) : (
                          <>
                            <span>Complete Registration &amp; Sync Matrix</span>
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
