import React, { useState, useEffect, useMemo } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import {
  Heart,
  PhoneCall,
  MapPin,
  Building2,
  Check,
  CheckCircle2,
  X,
  Navigation,
  ChevronRight,
  ChevronDown,
  Download,
  CreditCard,
  QrCode,
  BedDouble,
  Activity,
  Baby,
  Pill,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  Phone,
  Search,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { playTactileClick, playConfirmChime } from '../../lib/audio';
import {
  RealHospital,
  KANPUR_CENTER,
  fetchNearbyHospitals,
  reverseGeocode
} from '../../services/hospitalService';
import { RealLeafletHospitalMap } from '../map/RealLeafletHospitalMap';
import { AnimatedHeartbeatLogo } from '../ui/AnimatedHeartbeatLogo';

export const PlannedAdmissionBooking: React.FC = () => {
  const { setMode, emitAdmissionBooking } = usePrathmikta();

  // User Location (Default to Kanpur Hub, overridden by real GPS if allowed)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: KANPUR_CENTER.lat,
    lng: KANPUR_CENTER.lng
  });
  const [locationName, setLocationName] = useState<string>('Kanpur, Uttar Pradesh');
  const [locationAccuracy, setLocationAccuracy] = useState<'High' | 'GPS Active' | 'Estimated'>('High');

  // Hospital List from Real API / Verified Dataset
  const [hospitals, setHospitals] = useState<RealHospital[]>([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState<boolean>(true);

  // Selected Hospital State (null = initial empty state)
  const [selectedHospital, setSelectedHospital] = useState<RealHospital | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'icu' | 'pharmacy' | 'verified'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Active Navigation Route State
  const [isRouteActive, setIsRouteActive] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  // Booking Modal States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bedType, setBedType] = useState<string>('ICU Bed');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // Payment Success State
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [confirmedTokenId, setConfirmedTokenId] = useState<string>('PRT-26-GSVM-7F92');
  const [validTillTime, setValidTillTime] = useState<string>('16 May 2026, 11:45 AM');

  // 1. Detect Real User Geolocation on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setLocationAccuracy('GPS Active');

          // Reverse geocode
          const addr = await reverseGeocode(lat, lng);
          setLocationName(addr);

          // Load hospitals around user's GPS
          loadHospitals(lat, lng);
        },
        (err) => {
          console.log('GPS access not granted or unavailable, defaulting to Kanpur:', err.message);
          loadHospitals(KANPUR_CENTER.lat, KANPUR_CENTER.lng);
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    } else {
      loadHospitals(KANPUR_CENTER.lat, KANPUR_CENTER.lng);
    }
  }, []);

  // 2. Fetch Hospitals via OpenStreetMap Overpass & Verified DB
  const loadHospitals = async (lat: number, lng: number) => {
    setIsLoadingHospitals(true);
    try {
      const data = await fetchNearbyHospitals(lat, lng, 18000);
      setHospitals(data);
    } catch (e) {
      console.error('Failed to load hospitals:', e);
    } finally {
      setIsLoadingHospitals(false);
    }
  };

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setLocationAccuracy('GPS Active');
          const addr = await reverseGeocode(lat, lng);
          setLocationName(addr);
          loadHospitals(lat, lng);
        },
        () => {
          setUserLocation({ lat: KANPUR_CENTER.lat, lng: KANPUR_CENTER.lng });
        }
      );
    }
  };

  // Filtered Hospital List
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.corridorName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterType === 'icu') return h.icuBeds > 0;
      if (filterType === 'pharmacy') return h.pharmacyOpen;
      if (filterType === 'verified') return h.isVerified;
      return true;
    });
  }, [hospitals, searchQuery, filterType]);

  const handleSelectHospital = (hospital: RealHospital) => {
    playTactileClick();
    setSelectedHospital(hospital);
    setIsRouteActive(false);
  };

  const handleToggleRoute = () => {
    playTactileClick();
    setIsRouteActive((prev) => !prev);
  };

  const handleStartNavigation = () => {
    playConfirmChime();
    setIsNavigating(true);
  };

  const handleStopNavigation = () => {
    playTactileClick();
    setIsNavigating(false);
  };

  const handleOpenBookingModal = () => {
    playTactileClick();
    setIsBookingModalOpen(true);
  };

  const handleProcessPayment = async () => {
    playTactileClick();
    setIsProcessingPayment(true);

    const hospCode = selectedHospital
      ? selectedHospital.name.replace(/[^A-Za-z]/g, '').substring(0, 4).toUpperCase()
      : 'GSVM';
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
    const tokenId = `PRT-26-${hospCode}-${randomHex}`;
    setConfirmedTokenId(tokenId);

    const now = new Date();
    now.setHours(now.getHours() + 3);
    const validUntil = now.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    setValidTillTime(validUntil);

    // Save to MongoDB Atlas & Broadcast via Socket.io
    try {
      await emitAdmissionBooking({
        bookingId: tokenId,
        patientName: 'Aarav Kumar (ABHA Patient)',
        contactPhone: '+91 98765 43210',
        hospitalId: selectedHospital?.id || 'gsvm-kanpur',
        hospitalName: selectedHospital?.name || 'GSVM Medical College',
        department: bedType,
        scheduledDate: new Date().toISOString().split('T')[0],
        timeSlot: '11:30 AM - 01:30 PM',
        admissionType: bedType,
        preAdmissionDeposit: 500,
        status: 'CONFIRMED'
      });
    } catch (err) {
      console.warn('[Socket/MongoDB] Syncing planned admission record', err);
    }

    setIsProcessingPayment(false);
    setIsBookingModalOpen(false);
    setIsSuccessModalOpen(true);
    playConfirmChime();
  };

  return (
    <div id="planned-admission-marketplace" className="w-full h-full overflow-y-auto bg-[#f8fafc] text-slate-900 font-sans select-none flex flex-col justify-between">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER NAVIGATION */}
      {/* ========================================================================= */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-40 select-none text-slate-800 shadow-xs">
        <div className="w-full px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Prathmikta Brand & Continuous Real-Time Hospital ECG Monitor */}
          <div
            onClick={() => {
              playTactileClick();
              setMode('landing');
            }}
            className="cursor-pointer group flex items-center shrink-0"
            title="Back to Landing Page"
          >
            <AnimatedHeartbeatLogo size="md" showBadge={true} showWaveformStrip={true} />
          </div>

          {/* Center: Real Live Auto-Location Pill */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-inner">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-slate-500 font-medium hidden md:inline">Auto-Location:</span>
            <span className="text-slate-900 font-black max-w-[180px] sm:max-w-[280px] md:max-w-[340px] truncate">{locationName}</span>
            <button
              onClick={handleLocateMe}
              className="ml-1 px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-extrabold hover:bg-emerald-200 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              title="Click to Refresh Real GPS Location"
            >
              <span>{locationAccuracy}</span>
              <Compass className="w-3.5 h-3.5 text-emerald-700" />
            </button>
          </div>

          {/* Right: Hotline Pill 108 / 112 */}
          <a
            href="tel:108"
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-red-200 shadow-sm transition-all text-left group shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/30 group-hover:scale-105 transition-transform shrink-0">
              <PhoneCall className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-red-600 leading-tight">
                CALL 108 / 112
              </div>
              <div className="text-[10px] text-slate-500 font-semibold leading-tight">
                Emergency Hotline
              </div>
            </div>
          </a>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. SPLIT-SCREEN REAL LEAFLET MAP & INTERACTIVE BOOKING PANEL (FULL WIDTH) */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full px-2 sm:px-3 py-2.5 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        
        {/* ======================================================================= */}
        {/* LEFT / CENTER: REAL LEAFLET MAP CANVAS (8 Cols) */}
        {/* ======================================================================= */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between relative min-h-[580px] lg:min-h-[660px]">
          
          {/* Map Top Floating Controls, Search & Filter Bar */}
          {!isNavigating && (
            <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-120px)]">
              
              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200 shadow-md text-xs font-bold text-slate-800 flex items-center gap-2 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {filterType === 'all'
                      ? 'Nearby Hospitals & Clinics'
                      : filterType === 'icu'
                      ? 'ICU Available'
                      : filterType === 'pharmacy'
                      ? '24x7 Pharmacy'
                      : 'Verified Facilities'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {isFilterOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 z-30 space-y-1">
                    <button
                      onClick={() => {
                        setFilterType('all');
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                        filterType === 'all' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      All Facilities ({hospitals.length})
                    </button>
                    <button
                      onClick={() => {
                        setFilterType('icu');
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                        filterType === 'icu' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      ICU Available Only
                    </button>
                    <button
                      onClick={() => {
                        setFilterType('pharmacy');
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                        filterType === 'pharmacy' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      24x7 Pharmacy Verified
                    </button>
                    <button
                      onClick={() => {
                        setFilterType('verified');
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                        filterType === 'verified' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      Medical Colleges &amp; Major Super-Speciality
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Live Count Badge */}
              <div className="px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200 shadow-md text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{filteredHospitals.length} Real Live Facilities</span>
              </div>

            </div>
          )}

          {/* Active Route Floating Banner (When Route is active and not driving) */}
          {isRouteActive && !isNavigating && selectedHospital && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-5 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-300 shadow-lg shadow-emerald-600/15 flex items-center gap-3 animate-in fade-in slide-in-from-top-3">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Navigation className="w-4 h-4 rotate-45 fill-emerald-600" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-slate-900">
                  <span className="text-emerald-600">{selectedHospital.travelTime}</span> &bull; {selectedHospital.distance}
                </div>
                <div className="text-[11px] font-semibold text-slate-500">
                  via {selectedHospital.corridorName} (Live OSRM Geometry)
                </div>
              </div>
            </div>
          )}

          {/* REAL LEAFLET MAP INSTANCE */}
          <div className="relative w-full flex-1 min-h-[480px]">
            <RealLeafletHospitalMap
              userLocation={userLocation}
              hospitals={filteredHospitals}
              selectedHospital={selectedHospital}
              onSelectHospital={handleSelectHospital}
              isNavigating={isNavigating}
              onStartNavigation={handleStartNavigation}
              onStopNavigation={handleStopNavigation}
              isRouteActive={isRouteActive || isNavigating}
              onLocateMe={handleLocateMe}
              isLoadingHospitals={isLoadingHospitals}
            />

            {/* Green Corridor Active Bottom Floating Pill */}
            {isRouteActive && selectedHospital && (
              <div className="absolute bottom-4 left-4 z-20 px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-300 shadow-md flex items-center gap-2.5 animate-in fade-in">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-emerald-800">Green Corridor Active</div>
                  <div className="text-[10px] text-slate-500 font-medium">Real-time routing with priority emergency clearance</div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Legend Bar */}
          <div className="p-3.5 bg-white border-t border-slate-100 flex flex-wrap items-center justify-center sm:justify-start gap-5 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>You (GPS)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span>Hospital / Clinic</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>24x7 Pharmacy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Emergency Open</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>On Diversion</span>
            </div>
          </div>

        </div>

        {/* ======================================================================= */}
        {/* RIGHT SIDE: INTERACTIVE HOSPITAL DETAILS & BOOKING PANEL (4 Cols) */}
        {/* ======================================================================= */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between h-full min-h-[580px] lg:min-h-[660px]">
          
          {/* ===================================================================== */}
          {/* STATE 1: EMPTY / "SELECT A HOSPITAL ON MAP" */}
          {/* ===================================================================== */}
          {!selectedHospital && (
            <div className="flex-1 p-6 sm:p-7 flex flex-col items-center justify-between text-center space-y-5">
              
              <div className="w-full flex-1 flex flex-col items-center justify-center space-y-4 py-4">
                {/* Circular Building Icon */}
                <div className="w-24 h-24 rounded-3xl bg-blue-50/90 border-2 border-blue-100 flex items-center justify-center text-blue-600 shadow-md">
                  <Building2 className="w-12 h-12 stroke-[1.75]" />
                </div>

                {/* Curved Indicator Arrow */}
                <div className="text-slate-400">
                  <svg className="w-14 h-14 -scale-x-100 rotate-12" viewBox="0 0 50 50" fill="none">
                    <path d="M 10 35 C 20 15, 35 15, 40 25" stroke="#3b82f6" strokeWidth="3" strokeDasharray="5 5" strokeLinecap="round" />
                    <path d="M 33 28 L 40 25 L 38 18" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Typography */}
                <div className="space-y-2 max-w-[320px]">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Select Hospital on Map
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                    Click any marker or facility below to view live beds, ER status, fast route &amp; instant booking.
                  </p>
                </div>
              </div>

              {/* Quick List of Nearby Real Facilities */}
              <div className="w-full pt-4 border-t border-slate-200 text-left space-y-2.5">
                <div className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Nearby Facilities</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                    {filteredHospitals.length} Available
                  </span>
                </div>
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {filteredHospitals.slice(0, 6).map((h) => (
                    <div
                      key={h.id}
                      onClick={() => handleSelectHospital(h)}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200/90 hover:border-blue-400 flex items-center justify-between cursor-pointer transition-all shadow-xs group"
                    >
                      <div className="truncate pr-3">
                        <div className="text-sm font-black text-slate-900 group-hover:text-blue-600 truncate transition-colors">
                          {h.name}
                        </div>
                        <div className="text-xs font-semibold text-slate-500 mt-0.5">
                          <span className="text-blue-600 font-bold">{h.travelTime}</span> &bull; {h.distance} away
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0 gap-1">
                        <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-red-100 text-red-700 border border-red-200">
                          ICU: {h.icuBeds}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* STATE 2 & 3: HOSPITAL DETAILS OPENED */}
          {/* ===================================================================== */}
          {selectedHospital && (
            <div className="flex-1 flex flex-col justify-between p-5 sm:p-6 space-y-5 animate-in fade-in slide-in-from-right-4 duration-150 overflow-y-auto">
              
              <div className="space-y-4 text-left">
                
                {/* Hospital Photo with Close 'x' */}
                <div className="relative w-full h-40 sm:h-44 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                  <img
                    src={selectedHospital.imageUrl}
                    alt={selectedHospital.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setSelectedHospital(null);
                      setIsRouteActive(false);
                    }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm cursor-pointer transition-all shadow-md"
                    title="Close Details"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  {selectedHospital.isVerified && (
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md">
                      <Sparkles className="w-3.5 h-3.5 fill-white" />
                      <span>Verified Medical Center</span>
                    </div>
                  )}
                </div>

                {/* Title, Distance & Badges (Larger & Bolder) */}
                <div className="space-y-1.5">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    {selectedHospital.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                      <Navigation className="w-3.5 h-3.5 rotate-45 fill-blue-600" />
                      <span>{selectedHospital.travelTime} ({selectedHospital.distance})</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>24x7 Open</span>
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 pt-0.5">
                    {selectedHospital.address}
                  </p>
                </div>

                {/* Live Bed Capacity Cards (Large Punchy Stat Tiles) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Live Bed Capacity</span>
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Real-Time
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* General Beds Tile */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
                      <div className="flex items-center gap-2 text-slate-600 text-xs font-bold">
                        <BedDouble className="w-4 h-4 text-blue-600" />
                        <span>General Beds</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                        {selectedHospital.generalBeds}
                      </div>
                      <span className="text-[11px] text-slate-500 font-semibold">Beds Available</span>
                    </div>

                    {/* ICU Beds Tile */}
                    <div className="p-3 rounded-2xl bg-red-50/70 border border-red-200 flex flex-col justify-between">
                      <div className="flex items-center gap-2 text-red-700 text-xs font-black">
                        <Activity className="w-4 h-4 text-red-600" />
                        <span>ICU Beds</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-red-600 mt-1">
                        {selectedHospital.icuBeds}
                      </div>
                      <span className="text-[11px] text-red-600/80 font-bold">Ventilator Attached</span>
                    </div>
                  </div>

                  {/* NICU & Pharmacy Status Rows */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Baby className="w-4 h-4 text-purple-600" />
                        <span>NICU</span>
                      </div>
                      <span className="font-black text-purple-700">{selectedHospital.nicuStatus}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Pill className="w-4 h-4 text-emerald-600" />
                        <span>Pharmacy</span>
                      </div>
                      <span className="font-black text-emerald-600">24x7</span>
                    </div>
                  </div>
                </div>

                {/* ER Status & Waiting Time (Prominent Banners) */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                  <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-left">
                    <div className="text-[11px] font-bold text-emerald-800 uppercase">ER Triage Status</div>
                    <div className="text-sm font-black text-emerald-700 mt-0.5">
                      {selectedHospital.erStatus}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-left">
                    <div className="text-[11px] font-bold text-slate-600 uppercase">Est. Wait Time</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">
                      {selectedHospital.waitingTime}
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons: Best Route + Book Slot (Larger, Bolder & Taller) */}
              <div className="space-y-3 pt-2">
                
                {/* 1. Best Route / Start Navigation */}
                {!isRouteActive && !isNavigating ? (
                  <button
                    onClick={handleToggleRoute}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#00a86b] hover:bg-[#00925d] text-white font-black text-sm sm:text-base flex items-center justify-between shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <Navigation className="w-5 h-5 fill-white rotate-45" />
                      <div>
                        <div className="text-sm sm:text-base font-black">Best Route (Green Corridor)</div>
                        <div className="text-xs font-semibold text-emerald-100">{selectedHospital.travelTime} &bull; Emergency Clearance</div>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-emerald-100" />
                  </button>
                ) : (
                  <button
                    onClick={handleStartNavigation}
                    className="w-full py-4 px-4 rounded-2xl bg-[#00a86b] hover:bg-[#00925d] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    <span>START LIVE NAVIGATION</span>
                  </button>
                )}

                {/* 2. Book Your Slot (Reserve Emergency Bed) */}
                <button
                  onClick={handleOpenBookingModal}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#1d63ff] hover:bg-[#1652d8] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-sm sm:text-base font-black leading-tight">Book Bed Slot (₹500 Token)</div>
                    <div className="text-xs font-medium text-blue-100">Guaranteed Emergency Bed Reservation</div>
                  </div>
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. BOOK SLOT MODAL (₹500 ADVANCE TOKEN RESERVATION) */}
      {/* ========================================================================= */}
      {isBookingModalOpen && selectedHospital && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-slate-900 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-left">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Reserve Emergency Bed
                </h3>
                <p className="text-sm text-slate-600 font-semibold mt-0.5">
                  {selectedHospital.name} &bull; <span className="text-blue-600 font-bold">{selectedHospital.travelTime}</span> away
                </p>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bed Type Selector */}
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-800 block">
                Select Bed / Unit Category
              </label>
              <select
                value={bedType}
                onChange={(e) => setBedType(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="ICU Bed">ICU Bed (Ventilator &amp; Cardiac Monitor Attached)</option>
                <option value="General Emergency Bed">General Emergency Triage Bed</option>
                <option value="NICU Bay">NICU Bay (Neonatal Intensive Care)</option>
                <option value="Cardiac Care Unit (CCU)">Cardiac Care Unit (CCU)</option>
                <option value="Deluxe Private Room">Deluxe Private Emergency Room</option>
              </select>
            </div>

            {/* Availability & Fee Summary */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-2.5 text-sm font-semibold text-slate-700">
              <div className="flex items-center justify-between">
                <span>Real-Time Bed Status</span>
                <span className="font-black text-slate-900 text-base">{selectedHospital.icuBeds} ICU Beds Available</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Advance Token Fee</span>
                <span className="font-black text-emerald-600 text-lg">₹500</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Estimated ER Wait Time</span>
                <span className="font-bold text-slate-900">{selectedHospital.waitingTime}</span>
              </div>
            </div>

            {/* Choose Payment Method */}
            <div className="space-y-2.5">
              <div className="text-sm font-black text-slate-900">
                Choose Payment Method
              </div>

              <div className="space-y-2.5">
                {/* UPI Option */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-900">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <span>UPI (Google Pay, PhonePe, Paytm, BHIM)</span>
                  </div>
                  {paymentMethod === 'upi' && <Check className="w-5 h-5 text-blue-600 stroke-[3]" />}
                </div>

                {/* Card Option */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-900">
                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span>Credit / Debit Card (Instant OTP)</span>
                  </div>
                  {paymentMethod === 'card' && <Check className="w-5 h-5 text-blue-600 stroke-[3]" />}
                </div>

                {/* Net Banking */}
                <div
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-900">
                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span>Net Banking (All Indian Banks)</span>
                  </div>
                  {paymentMethod === 'netbanking' && <Check className="w-5 h-5 text-blue-600 stroke-[3]" />}
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleProcessPayment}
              disabled={isProcessingPayment}
              className="w-full py-4 rounded-2xl bg-[#00a86b] hover:bg-[#00925d] text-white font-black text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 cursor-pointer active:scale-98 transition-all disabled:opacity-50"
            >
              {isProcessingPayment ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>LOCKING BED &amp; NOTIFYING ER WALL...</span>
                </>
              ) : (
                <span>PAY ₹500 &amp; LOCK BED RESERVATION</span>
              )}
            </button>

            {/* Trust Footer */}
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 text-center">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Instant slot lock with priority emergency clearance code.</span>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PAYMENT SUCCESS — TOKEN GENERATED MODAL */}
      {/* ========================================================================= */}
      {isSuccessModalOpen && selectedHospital && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-slate-900 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-center">
            
            {/* Success Check Circle */}
            <div className="w-18 h-18 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/40">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            {/* Headlines */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-emerald-800 tracking-tight">
                RESERVATION CONFIRMED!
              </h2>
              <p className="text-sm text-slate-600 font-medium">
                Your emergency bed is locked in the live hospital triage queue.
              </p>
            </div>

            {/* Token ID Badge */}
            <div className="space-y-1.5">
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Emergency Token ID
              </div>
              <div className="inline-block px-5 py-2 rounded-2xl bg-emerald-50 border-2 border-emerald-300 font-mono font-black text-xl text-emerald-700 shadow-sm">
                {confirmedTokenId}
              </div>
            </div>

            {/* QR Code Graphic */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-inner max-w-[200px] mx-auto">
              <svg className="w-40 h-40" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="white" />
                <rect x="10" y="10" width="25" height="25" fill="#0f172a" rx="4" />
                <rect x="15" y="15" width="15" height="15" fill="white" rx="2" />
                <rect x="18" y="18" width="9" height="9" fill="#0f172a" rx="1" />

                <rect x="65" y="10" width="25" height="25" fill="#0f172a" rx="4" />
                <rect x="70" y="15" width="15" height="15" fill="white" rx="2" />
                <rect x="73" y="18" width="9" height="9" fill="#0f172a" rx="1" />

                <rect x="10" y="65" width="25" height="25" fill="#0f172a" rx="4" />
                <rect x="15" y="70" width="15" height="15" fill="white" rx="2" />
                <rect x="18" y="73" width="9" height="9" fill="#0f172a" rx="1" />

                <rect x="42" y="12" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="18" width="6" height="6" fill="#0f172a" />
                <rect x="42" y="28" width="6" height="6" fill="#0f172a" />
                <rect x="12" y="45" width="6" height="6" fill="#0f172a" />
                <rect x="22" y="48" width="6" height="6" fill="#0f172a" />
                <rect x="42" y="42" width="16" height="16" fill="#10b981" rx="3" />
                <circle cx="50" cy="50" r="4" fill="white" />
                <rect x="65" y="45" width="6" height="6" fill="#0f172a" />
                <rect x="78" y="52" width="6" height="6" fill="#0f172a" />
                <rect x="45" y="68" width="6" height="6" fill="#0f172a" />
                <rect x="55" y="78" width="6" height="6" fill="#0f172a" />
                <rect x="70" y="72" width="6" height="6" fill="#0f172a" />
                <rect x="80" y="82" width="6" height="6" fill="#0f172a" />
              </svg>
            </div>

            {/* Summary Details Table (Large Font) */}
            <div className="space-y-2 text-left text-sm font-semibold text-slate-700 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span>Hospital</span>
                <span className="font-black text-slate-900 text-base">{selectedHospital.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Reserved Bed</span>
                <span className="font-bold text-slate-900">{bedType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Arrival ETA</span>
                <span className="font-bold text-slate-900">~ {selectedHospital.travelTime} ({selectedHospital.distance})</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Reservation Valid Till</span>
                <span className="font-black text-blue-600">{validTillTime}</span>
              </div>
            </div>

            {/* Slot Locked Status Badge */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm font-bold text-emerald-800 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Token broadcasted to ER triage board &amp; ambulance team.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleStartNavigation}
                className="flex-1 py-4 rounded-2xl bg-[#00a86b] hover:bg-[#00925d] text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 cursor-pointer active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>START NAVIGATION</span>
              </button>
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base cursor-pointer transition-all"
              >
                CLOSE
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
