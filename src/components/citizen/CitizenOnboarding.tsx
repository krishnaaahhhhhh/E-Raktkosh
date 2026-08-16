import React, { useState, useMemo } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import {
  INDIAN_STATES,
  EMERGENCY_DISEASE_CONDITIONS,
  getHospitalsForLocation
} from '../../lib/locationData';
import { HospitalFacility, StateInfo, CityInfo, DiseaseCondition } from '../../types';
import { HospitalDiscoveryMapView } from './HospitalDiscoveryMapView';
import {
  MapPin,
  Navigation,
  HeartPulse,
  Brain,
  ShieldAlert,
  Wind,
  Flame,
  Activity,
  Heart,
  UserCheck,
  ShieldPlus,
  ArrowRight,
  ArrowLeft,
  Search,
  CheckCircle2,
  PhoneCall,
  AlertTriangle,
  Hospital,
  Bed,
  Check,
  ChevronRight,
  Sparkles,
  Layers,
  Map,
  Compass
} from 'lucide-react';
import { playTactileClick } from '../../lib/audio';

const diseaseIcons: Record<string, React.ReactNode> = {
  HeartPulse: <HeartPulse className="w-6 h-6 text-red-400" />,
  Brain: <Brain className="w-6 h-6 text-purple-400" />,
  ShieldAlert: <ShieldAlert className="w-6 h-6 text-amber-400" />,
  Wind: <Wind className="w-6 h-6 text-cyan-400" />,
  Flame: <Flame className="w-6 h-6 text-orange-400" />,
  Activity: <Activity className="w-6 h-6 text-blue-400" />,
  Heart: <Heart className="w-6 h-6 text-pink-400" />,
  UserCheck: <UserCheck className="w-6 h-6 text-emerald-400" />,
  ShieldPlus: <ShieldPlus className="w-6 h-6 text-teal-400" />
};

export const CitizenOnboarding: React.FC = () => {
  const {
    hospitals,
    selectedState,
    setSelectedState,
    selectedCity,
    setSelectedCity,
    selectedDisease,
    setSelectedDisease,
    setCitizenCoords,
    selectHospitalAndOpenMap,
    setIsWizardCompleted
  } = usePrathmikta();

  // Wizard Step: 1 = State, 2 = City, 3 = Disease, 4 = Nearby Hospitals
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGpsLocating, setIsGpsLocating] = useState<boolean>(false);
  const [gpsFeedback, setGpsFeedback] = useState<string | null>(null);

  // Active selected state and city objects
  const currentStateObj = useMemo(() => {
    return INDIAN_STATES.find((s) => s.id === selectedState) || INDIAN_STATES[0];
  }, [selectedState]);

  const currentCityObj = useMemo(() => {
    return (
      currentStateObj.cities.find((c) => c.id === selectedCity) ||
      currentStateObj.cities[0]
    );
  }, [currentStateObj, selectedCity]);

  const currentDiseaseObj = useMemo(() => {
    return (
      EMERGENCY_DISEASE_CONDITIONS.find((d) => d.id === selectedDisease) ||
      EMERGENCY_DISEASE_CONDITIONS[0]
    );
  }, [selectedDisease]);

  // Matching hospitals in chosen State, City & Disease
  const matchingHospitals = useMemo(() => {
    const list = getHospitalsForLocation(
      hospitals,
      selectedState,
      currentCityObj?.name || selectedCity,
      selectedDisease
    );
    // If none found in strict filter, fallback to state hospitals or all
    if (list.length === 0) {
      return Object.values(hospitals);
    }
    return list;
  }, [hospitals, selectedState, selectedCity, currentCityObj, selectedDisease]);

  // Handler for GPS Auto-Locate
  const handleAutoDetectLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsGpsLocating(true);
      setGpsFeedback('Detecting your live coordinates...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsGpsLocating(false);
          setCitizenCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setGpsFeedback('GPS location detected! Auto-matching nearest city...');
          // By default set to Delhi NCR / nearest
          setSelectedState('delhi-ncr');
          setSelectedCity('delhi');
          setTimeout(() => {
            setCurrentStep(3); // Jump straight to Disease selection
            setGpsFeedback(null);
          }, 800);
        },
        (err) => {
          setIsGpsLocating(false);
          setGpsFeedback('Could not fetch exact GPS. Please select your State manually.');
          setTimeout(() => setGpsFeedback(null), 3500);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  const handleStateSelect = (state: StateInfo) => {
    playTactileClick();
    setSelectedState(state.id);
    setSelectedCity(state.cities[0].id);
    setCitizenCoords({ lat: state.cities[0].lat, lng: state.cities[0].lng });
    setSearchQuery('');
    setCurrentStep(2);
  };

  const handleCitySelect = (city: CityInfo) => {
    playTactileClick();
    setSelectedCity(city.id);
    setCitizenCoords({ lat: city.lat, lng: city.lng });
    setSearchQuery('');
    setCurrentStep(3);
  };

  const handleDiseaseSelect = (disease: DiseaseCondition) => {
    playTactileClick();
    setSelectedDisease(disease.id);
    setSearchQuery('');
    setCurrentStep(4);
  };

  const filteredStates = useMemo(() => {
    if (!searchQuery.trim()) return INDIAN_STATES;
    const q = searchQuery.toLowerCase();
    return INDIAN_STATES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.hindiName.toLowerCase().includes(q) ||
        s.cities.some(
          (c) => c.name.toLowerCase().includes(q) || c.hindiName.toLowerCase().includes(q)
        )
    );
  }, [searchQuery]);

  const filteredCities = useMemo(() => {
    const cities = currentStateObj?.cities || [];
    if (!searchQuery.trim()) return cities;
    const q = searchQuery.toLowerCase();
    return cities.filter(
      (c) => c.name.toLowerCase().includes(q) || c.hindiName.toLowerCase().includes(q)
    );
  }, [currentStateObj, searchQuery]);

  const filteredDiseases = useMemo(() => {
    if (!searchQuery.trim()) return EMERGENCY_DISEASE_CONDITIONS;
    const q = searchQuery.toLowerCase();
    return EMERGENCY_DISEASE_CONDITIONS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.hindiName.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.hindiDescription.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div
      id="citizen-onboarding-wizard"
      className="w-full h-full min-h-[90vh] bg-slate-950 text-slate-100 flex flex-col justify-between overflow-y-auto"
    >
      {/* Top Banner / Progress Indicator */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-20 px-4 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/20 font-black text-white text-lg">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-wide">
                  Prathmikta Emergency Intake
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold uppercase">
                  Golden Hour Protocol
                </span>
              </div>
              <p className="text-xs text-slate-400">
                1. State &rarr; 2. City &rarr; 3. Disease &rarr; 4. Matching Nearby Hospitals & Map
              </p>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2">
            {[
              { num: 1, label: 'State (राज्य)' },
              { num: 2, label: 'City (शहर)' },
              { num: 3, label: 'Disease (बीमारी)' },
              { num: 4, label: 'Hospitals & Map (अस्पताल)' }
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  id={`stepper-button-step-${step.num}`}
                  onClick={() => {
                    if (isPast) {
                      playTactileClick();
                      setCurrentStep(step.num);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-2 ring-red-400/50'
                      : isPast
                      ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700 cursor-pointer'
                      : 'bg-slate-900/60 text-slate-500 opacity-60'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-black/40 text-[10px] flex items-center justify-center">
                      {step.num}
                    </span>
                  )}
                  <span className="hidden md:inline">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Summary Breadcrumb */}
        <div className="max-w-4xl mx-auto mt-2 pt-2 border-t border-slate-800/40 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-medium">Current Selection:</span>
          {selectedState && (
            <span
              onClick={() => setCurrentStep(1)}
              className="px-2 py-0.5 rounded bg-slate-800/80 text-cyan-300 border border-cyan-500/30 cursor-pointer hover:border-cyan-400 flex items-center gap-1"
            >
              <MapPin className="w-3 h-3 text-cyan-400" />
              {currentStateObj?.name}
            </span>
          )}
          {currentStep >= 2 && selectedCity && (
            <span
              onClick={() => setCurrentStep(2)}
              className="px-2 py-0.5 rounded bg-slate-800/80 text-cyan-300 border border-cyan-500/30 cursor-pointer hover:border-cyan-400 flex items-center gap-1"
            >
              &rarr; {currentCityObj?.name}
            </span>
          )}
          {currentStep >= 3 && selectedDisease && (
            <span
              onClick={() => setCurrentStep(3)}
              className="px-2 py-0.5 rounded bg-slate-800/80 text-amber-300 border border-amber-500/30 cursor-pointer hover:border-amber-400 flex items-center gap-1"
            >
              &rarr; {currentDiseaseObj?.name.split('/')[0]}
            </span>
          )}
        </div>
      </div>

      {/* Center Main Wizard Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* STEP 1: STATE SELECTION */}
        {currentStep === 1 && (
          <div id="wizard-step-1" className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-red-500" />
                  Select Your State (अपना राज्य चुनें)
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Choose the state where emergency medical care or hospital bed is required.
                </p>
              </div>

              {/* GPS Auto Detect CTA */}
              <button
                id="btn-auto-detect-gps"
                onClick={handleAutoDetectLocation}
                disabled={isGpsLocating}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
              >
                <Compass className={`w-4 h-4 ${isGpsLocating ? 'animate-spin' : ''}`} />
                {isGpsLocating ? 'Detecting Location...' : 'Use My Live GPS (लाइव लोकेशन)'}
              </button>
            </div>

            {gpsFeedback && (
              <div className="p-3 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                {gpsFeedback}
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-state"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search state by name or Hindi (उदा. Delhi, Uttar Pradesh, Maharashtra)..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* States Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredStates.map((state) => {
                const isSelected = selectedState === state.id;
                return (
                  <button
                    key={state.id}
                    id={`state-card-${state.id}`}
                    onClick={() => handleStateSelect(state)}
                    className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-500'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                        {state.name}
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {state.code}
                      </span>
                    </div>
                    <div className="text-xs text-amber-400/90 font-medium mt-1">
                      {state.hindiName}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                      <Hospital className="w-3 h-3 text-slate-500" />
                      <span>{state.cities.length} Primary Emergency Hubs</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-cyan-400 font-semibold pt-2 border-t border-slate-800/60">
                      <span>Select & View Cities &rarr;</span>
                      <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: CITY SELECTION */}
        {currentStep === 2 && (
          <div id="wizard-step-2" className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                    {currentStateObj?.name}
                  </span>
                  <span className="text-xs text-slate-400">Step 2 of 4</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mt-1">
                  <Navigation className="w-6 h-6 text-cyan-400" />
                  Select Your City / Region (अपना शहर चुनें)
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Select city to calculate closest trauma center and ambulance ETA.
                </p>
              </div>

              <button
                id="btn-back-to-states"
                onClick={() => {
                  playTactileClick();
                  setCurrentStep(1);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change State
              </button>
            </div>

            {/* Search Input for Cities */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-city"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search city in ${currentStateObj?.name} (e.g. Lucknow, Kanpur, South Delhi)...`}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Cities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredCities.map((city) => {
                const isSelected = selectedCity === city.id;
                return (
                  <button
                    key={city.id}
                    id={`city-card-${city.id}`}
                    onClick={() => handleCitySelect(city)}
                    className={`p-4 rounded-xl border text-left transition-all relative group cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-500'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                        {city.name}
                      </div>
                      {city.isPopular && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Major Hub
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-amber-300/90 font-medium mt-1">
                      {city.hindiName}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-cyan-400 font-semibold pt-2 border-t border-slate-800/60">
                      <span>Next: Select Disease &rarr;</span>
                      <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: DISEASE / EMERGENCY PROBLEM SELECTION */}
        {currentStep === 3 && (
          <div id="wizard-step-3" className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                    📍 {currentStateObj?.name} &rarr; {currentCityObj?.name}
                  </span>
                  <span className="text-xs text-slate-400">Step 3 of 4</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mt-1">
                  <Activity className="w-6 h-6 text-red-500" />
                  Select Emergency / Disease (समस्या / बीमारी चुनें)
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Select the primary medical condition to automatically filter capable hospitals & specialty teams.
                </p>
              </div>

              <button
                id="btn-back-to-cities"
                onClick={() => {
                  playTactileClick();
                  setCurrentStep(2);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer self-start sm:self-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change City
              </button>
            </div>

            {/* Search Input for Disease */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-disease"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symptom or disease (e.g. Heart Attack, Accident, Breathing, Stroke)..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Disease Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredDiseases.map((condition) => {
                const isSelected = selectedDisease === condition.id;
                const isCritical = condition.urgency === 'CRITICAL';
                return (
                  <button
                    key={condition.id}
                    id={`disease-card-${condition.id}`}
                    onClick={() => handleDiseaseSelect(condition)}
                    className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-red-950/40 border-red-500 shadow-lg shadow-red-500/20 ring-1 ring-red-500'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/80 group-hover:scale-105 transition-transform">
                            {diseaseIcons[condition.iconName] || <Activity className="w-6 h-6 text-red-400" />}
                          </div>
                          <div>
                            <div className="font-black text-white text-base leading-snug group-hover:text-red-300 transition-colors">
                              {condition.name}
                            </div>
                            <div className="text-xs text-amber-300 font-semibold mt-0.5">
                              {condition.hindiName}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0 ${
                            isCritical
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {condition.urgency}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                        {condition.hindiDescription}
                      </p>

                      {/* Required Features Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {condition.requiredFeatures.map((feat, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/60 text-[10px] font-medium"
                          >
                            ✓ {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-red-400 font-bold">
                      <span>View Nearby Equipped Hospitals &rarr;</span>
                      <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: NEARBY MATCHING HOSPITALS AS INTERACTIVE MAP VIEW */}
        {currentStep === 4 && (
          <div id="wizard-step-4" className="w-full h-[68vh] min-h-[500px] rounded-2xl overflow-hidden border border-slate-800 relative shadow-2xl animate-in fade-in duration-200">
            <HospitalDiscoveryMapView
              hospitals={matchingHospitals}
              onSelectHospital={(hospId) => selectHospitalAndOpenMap(hospId)}
              cityName={currentCityObj?.name || 'City'}
              stateName={currentStateObj?.name || 'State'}
              diseaseName={currentDiseaseObj?.name.split('/')[0] || 'Emergency'}
              onBack={() => {
                playTactileClick();
                setCurrentStep(3);
              }}
            />
          </div>
        )}
      </div>

      {/* Footer info & emergency 108 direct banner */}
      <div className="border-t border-slate-800/80 bg-slate-950 p-4 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between max-w-4xl mx-auto w-full gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Government Emergency Ambulance Hotline:</span>
          <a
            href="tel:108"
            className="font-black text-red-400 hover:underline px-2 py-0.5 rounded bg-red-950/60 border border-red-800"
          >
            📞 DIAL 108 (Toll Free)
          </a>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          Prathmikta Pre-Hospital Triage Protocol &bull; Zero-Friction Emergency Routing
        </div>
      </div>
    </div>
  );
};
