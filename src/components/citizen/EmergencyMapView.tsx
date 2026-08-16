import React, { useEffect, useRef, useState } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import { HospitalFacility } from '../../types';
import { fetchDrivingRoute, RouteData, RouteStep } from '../../lib/routingService';
import {
  MapPin,
  Navigation,
  Crosshair,
  Hospital,
  Clock,
  Flame,
  Heart,
  Layers,
  RotateCcw,
  Volume2,
  VolumeX,
  Compass,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  List,
  X,
  Gauge,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { playTactileClick } from '../../lib/audio';

export const EmergencyMapView: React.FC = () => {
  const {
    activeHospital,
    hospitals,
    setActiveHospitalId,
    citizenCoords,
    setCitizenCoords,
    activeCitizenDispatch,
    currentSeverity,
    isTransitActive,
    setIsTransitActive,
    transitProgress,
    setTransitProgress
  } = usePrathmikta();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const routeBackgroundLayerRef = useRef<L.Polyline | null>(null);
  const routeForegroundLayerRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const hospitalMarkerRef = useRef<L.Marker | null>(null);
  const ambulanceMarkerRef = useRef<L.Marker | null>(null);

  const [mapStyle, setMapStyle] = useState<'dark' | 'tactical'>('dark');
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isDirectionsDrawerOpen, setIsDirectionsDrawerOpen] = useState(false);
  const [followVehicle, setFollowVehicle] = useState(true);

  // Fetch real road route geometry & turn steps when location or hospital changes
  useEffect(() => {
    let isCancelled = false;

    async function loadRoute() {
      const data = await fetchDrivingRoute(
        citizenCoords,
        { lat: activeHospital.lat, lng: activeHospital.lng },
        activeHospital.name
      );
      if (!isCancelled) {
        setRouteData(data);
      }
    }

    loadRoute();

    return () => {
      isCancelled = true;
    };
  }, [citizenCoords.lat, citizenCoords.lng, activeHospital.id]);

  // Compute active turn maneuver step based on transit progress
  const activeStepIndex = routeData?.steps
    ? Math.min(
        routeData.steps.length - 1,
        Math.floor(transitProgress * routeData.steps.length)
      )
    : 0;

  const currentStep = routeData?.steps?.[activeStepIndex] || {
    instruction: `Proceed to ${activeHospital.name}`,
    distanceMeters: 500,
    durationSeconds: 90,
    maneuver: 'straight' as const,
    streetName: 'Emergency Green Corridor'
  };

  // Next step preview
  const nextStep = routeData?.steps?.[activeStepIndex + 1];

  // Dynamic distance & ETA calculations
  const totalDistanceKm = routeData ? routeData.distanceKm : 3.5;
  const remainingDistKm = Math.max(0.05, totalDistanceKm * (1 - transitProgress));
  const rawEtaMinutes = Math.max(0.5, (remainingDistKm / 38) * 60);
  const etaFormatted =
    transitProgress >= 0.98
      ? 'Arrived at ER Bay'
      : rawEtaMinutes < 1
      ? '< 1 min (Approaching)'
      : `${Math.ceil(rawEtaMinutes)} mins`;

  // Calculated arrival clock time (e.g. 12:45 PM)
  const arrivalTime = new Date(Date.now() + rawEtaMinutes * 60000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (leafletMapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [citizenCoords.lat, citizenCoords.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    const tileUrl =
      mapStyle === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    leafletMapRef.current = map;

    // Allow user to click map to set custom incident location
    map.on('click', (e) => {
      setCitizenCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      setTransitProgress(0);
    });

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Update Tile Layer on map theme switch
  useEffect(() => {
    if (!leafletMapRef.current) return;
    leafletMapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        leafletMapRef.current?.removeLayer(layer);
      }
    });

    const tileUrl =
      mapStyle === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(leafletMapRef.current);
  }, [mapStyle]);

  // Update Markers and Google Maps Navigation Dual-Polyline
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Clear prior route layers & markers
    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
    if (hospitalMarkerRef.current) map.removeLayer(hospitalMarkerRef.current);
    if (routeBackgroundLayerRef.current) map.removeLayer(routeBackgroundLayerRef.current);
    if (routeForegroundLayerRef.current) map.removeLayer(routeForegroundLayerRef.current);
    if (ambulanceMarkerRef.current) map.removeLayer(ambulanceMarkerRef.current);

    // Patient Incident Marker (Start Point)
    const userCustomIcon = L.divIcon({
      className: 'custom-patient-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="background-color: #0284c7; border: 2.5px solid #ffffff; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.6); z-index: 10;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background-color: #ffffff;"></div>
          </div>
          <div style="margin-top: 2px; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(2, 132, 199, 0.8); padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: 800; color: #38bdf8; white-space: nowrap;">
            START LOCATION
          </div>
        </div>
      `,
      iconSize: [80, 48],
      iconAnchor: [40, 20]
    });

    const userMarker = L.marker([citizenCoords.lat, citizenCoords.lng], {
      icon: userCustomIcon,
      draggable: true
    }).addTo(map);

    userMarker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      setCitizenCoords({ lat: pos.lat, lng: pos.lng });
      setTransitProgress(0);
    });

    userMarkerRef.current = userMarker;

    // Hospital Destination Marker (End Point)
    const availableBeds = activeHospital.totalFacilityBeds - activeHospital.occupiedFacilityBeds;
    const hospitalCustomIcon = L.divIcon({
      className: 'custom-hospital-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="background-color: #1e293b; border: 2px solid #ef4444; border-radius: 10px; padding: 4px 8px; display: flex; align-items: center; gap: 6px; box-shadow: 0 8px 24px rgba(0,0,0,0.8); white-space: nowrap;">
            <span style="font-size: 14px;">🏥</span>
            <span style="font-size: 11px; font-weight: 800; color: #f8fafc;">${activeHospital.name.split(' ')[0]}</span>
            <span style="font-size: 9.5px; background: rgba(34, 197, 94, 0.2); color: #4ade80; padding: 1px 4px; border-radius: 4px; font-weight: 700;">${availableBeds} Beds</span>
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #ef4444;"></div>
        </div>
      `,
      iconSize: [140, 44],
      iconAnchor: [70, 44]
    });

    const hospitalMarker = L.marker([activeHospital.lat, activeHospital.lng], {
      icon: hospitalCustomIcon
    }).addTo(map);

    hospitalMarkerRef.current = hospitalMarker;

    // Render Dual-Layered Google Maps Navigation Route Polyline
    const routeCoords: [number, number][] =
      routeData && routeData.coordinates.length > 0
        ? routeData.coordinates
        : [
            [citizenCoords.lat, citizenCoords.lng],
            [activeHospital.lat, activeHospital.lng]
          ];

    // Background thick casing polyline (Dark Navy / Indigo casing)
    const bgPolyline = L.polyline(routeCoords, {
      color: '#1e3a8a',
      weight: 10,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Foreground vibrant Google Maps navigation polyline (Royal Blue / Cyan)
    const fgPolyline = L.polyline(routeCoords, {
      color: currentSeverity === 'RED' ? '#2563eb' : '#0284c7',
      weight: 6,
      opacity: 1,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    routeBackgroundLayerRef.current = bgPolyline;
    routeForegroundLayerRef.current = fgPolyline;

    // Fit map bounds to view whole route
    const bounds = L.latLngBounds(routeCoords);
    map.fitBounds(bounds, { padding: [70, 70], maxZoom: 15 });
  }, [citizenCoords, activeHospital, currentSeverity, mapStyle, routeData]);

  // Ambulance Movement In-Transit Loop
  useEffect(() => {
    if (!isTransitActive) return;

    const interval = setInterval(() => {
      setTransitProgress((prev) => {
        if (prev >= 1) {
          return 1;
        }
        return Math.min(1, prev + 0.012);
      });
    }, 350);

    return () => clearInterval(interval);
  }, [isTransitActive, setTransitProgress]);

  // Calculate vehicle coordinates along exact route segments
  const getPositionOnPolyline = (coords: [number, number][], progress: number): [number, number] => {
    if (!coords || coords.length === 0) return [citizenCoords.lat, citizenCoords.lng];
    if (coords.length === 1 || progress <= 0) return coords[0];
    if (progress >= 1) return coords[coords.length - 1];

    const totalSegments = coords.length - 1;
    const exactIndex = progress * totalSegments;
    const segIndex = Math.min(Math.floor(exactIndex), totalSegments - 1);
    const segProgress = exactIndex - segIndex;

    const p1 = coords[segIndex];
    const p2 = coords[segIndex + 1];

    const lat = p1[0] + (p2[0] - p1[0]) * segProgress;
    const lng = p1[1] + (p2[1] - p1[1]) * segProgress;

    return [lat, lng];
  };

  // Update vehicle position on map and optionally auto-pan
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    const routeCoords: [number, number][] =
      routeData && routeData.coordinates.length > 0
        ? (routeData.coordinates.map((c) => [c[0], c[1]] as [number, number]))
        : [
            [citizenCoords.lat, citizenCoords.lng],
            [activeHospital.lat, activeHospital.lng]
          ];

    if (transitProgress > 0 && transitProgress <= 1) {
      const [curLat, curLng] = getPositionOnPolyline(routeCoords, transitProgress);

      if (!ambulanceMarkerRef.current) {
        const ambIcon = L.divIcon({
          className: 'ambulance-nav-cursor',
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
              <div style="position: absolute; width: 50px; height: 50px; border-radius: 50%; background-color: #ef4444; opacity: 0.4; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite; top: -6px;"></div>
              <div style="background: #dc2626; border: 2.5px solid #ffffff; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(239, 68, 68, 0.95); z-index: 10;">
                <span style="font-size: 18px;">🚑</span>
              </div>
              <div style="margin-top: 2px; background: rgba(15, 23, 42, 0.95); border: 1px solid #ef4444; padding: 1px 6px; border-radius: 4px; font-size: 9.5px; font-weight: 800; color: #ffffff; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.6);">
                ${transitProgress >= 1 ? 'ARRIVED' : `${Math.round(transitProgress * 100)}% EN-ROUTE`}
              </div>
            </div>
          `,
          iconSize: [60, 52],
          iconAnchor: [30, 24]
        });
        ambulanceMarkerRef.current = L.marker([curLat, curLng], {
          icon: ambIcon,
          zIndexOffset: 1000
        }).addTo(map);
      } else {
        ambulanceMarkerRef.current.setLatLng([curLat, curLng]);
      }

      if (followVehicle && isTransitActive) {
        map.panTo([curLat, curLng], { animate: true, duration: 0.3 });
      }
    } else if (ambulanceMarkerRef.current && transitProgress === 0) {
      map.removeLayer(ambulanceMarkerRef.current);
      ambulanceMarkerRef.current = null;
    }
  }, [transitProgress, routeData, citizenCoords, activeHospital, followVehicle, isTransitActive]);

  const handleRecenter = () => {
    playTactileClick();
    if (leafletMapRef.current) {
      if (routeData && routeData.coordinates.length > 0) {
        leafletMapRef.current.fitBounds(L.latLngBounds(routeData.coordinates), {
          padding: [70, 70],
          maxZoom: 15
        });
      } else {
        leafletMapRef.current.setView([citizenCoords.lat, citizenCoords.lng], 14);
      }
    }
  };

  const handleLocateMe = () => {
    playTactileClick();
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCitizenCoords(newCoords);
          setTransitProgress(0);
          if (leafletMapRef.current) {
            leafletMapRef.current.flyTo([newCoords.lat, newCoords.lng], 15);
          }
        },
        () => {
          setCitizenCoords({ lat: 28.548, lng: 77.201 });
        }
      );
    }
  };

  const renderManeuverIcon = (maneuver: RouteStep['maneuver']) => {
    switch (maneuver) {
      case 'turn-right':
      case 'slight-right':
        return <CornerUpRight className="w-7 h-7 text-white" />;
      case 'turn-left':
      case 'slight-left':
        return <CornerUpLeft className="w-7 h-7 text-white" />;
      case 'arrive':
        return <CheckCircle2 className="w-7 h-7 text-emerald-300" />;
      default:
        return <ArrowUp className="w-7 h-7 text-white" />;
    }
  };

  return (
    <div
      id="emergency-map-view"
      className="relative w-full h-full min-h-[480px] flex flex-col bg-slate-950 overflow-hidden select-none"
    >
      {/* Top Google Maps Turn-by-Turn HUD Navigation Banner */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-2 pointer-events-none">
        {/* Google Maps Style Green / Blue Navigation Header Card */}
        <div className="pointer-events-auto bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 border border-emerald-500/50 shadow-2xl rounded-2xl p-3 sm:p-3.5 text-white max-w-lg w-full flex items-start gap-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Big Maneuver Icon */}
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-400/40 shadow-inner flex items-center justify-center shrink-0">
            {renderManeuverIcon(currentStep.maneuver)}
          </div>

          {/* Turn Text & Next Step */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200 flex items-center gap-1">
                <Compass className="w-3 h-3 text-emerald-300 animate-spin" style={{ animationDuration: '8s' }} />
                <span>In {Math.round(currentStep.distanceMeters * (1 - (transitProgress % (1 / (routeData?.steps.length || 1)))))} m</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsVoiceEnabled((prev) => !prev)}
                  className="p-1 rounded-md bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 transition-colors cursor-pointer"
                  title={isVoiceEnabled ? 'Voice Guidance Active' : 'Voice Muted'}
                >
                  {isVoiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setIsDirectionsDrawerOpen(true)}
                  className="px-2 py-0.5 rounded-md bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="View All Steps"
                >
                  <List className="w-3 h-3" />
                  <span>Steps</span>
                </button>
              </div>
            </div>

            <h3 className="text-sm sm:text-base font-black text-white leading-tight truncate mt-0.5">
              {currentStep.instruction}
            </h3>

            {nextStep && (
              <p className="text-[11px] text-emerald-200/90 truncate mt-0.5 flex items-center gap-1">
                <span className="text-[9px] opacity-70">Then:</span>
                <span>{nextStep.instruction}</span>
              </p>
            )}
          </div>
        </div>

        {/* Floating Quick Action Map Tools */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl shrink-0 self-end sm:self-start">
          <button
            id="btn-locate-gps"
            onClick={handleLocateMe}
            title="GPS Auto Location"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <button
            id="btn-recenter-map"
            onClick={handleRecenter}
            title="Recenter Full Route"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
          </button>
          <button
            id="btn-toggle-follow"
            onClick={() => setFollowVehicle((prev) => !prev)}
            title={followVehicle ? 'Auto-pan on vehicle active' : 'Auto-pan paused'}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              followVehicle ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Navigation className="w-4 h-4" />
          </button>
          <button
            id="btn-toggle-map-style"
            onClick={() => setMapStyle((prev) => (prev === 'dark' ? 'tactical' : 'dark'))}
            title="Switch Map Style"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            id="btn-toggle-transit-play"
            onClick={() => {
              if (transitProgress >= 1) {
                setTransitProgress(0.02);
                setIsTransitActive(true);
              } else {
                setIsTransitActive(!isTransitActive);
              }
            }}
            title="Toggle Driving Route"
            className={`p-2 rounded-lg transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer ${
              isTransitActive ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isTransitActive ? 'animate-spin' : ''}`} />
            <span>{transitProgress >= 1 ? 'Restart' : isTransitActive ? 'Moving' : 'Start'}</span>
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-0" />

      {/* Google Maps Bottom Bar: ETA, Remaining Time, Distance, Speedometer */}
      <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-auto max-w-4xl mx-auto w-full space-y-2">
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/90 shadow-2xl space-y-2.5">
          {/* Main Google Maps Navigation Metrics Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* ETA Display */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
                    {etaFormatted}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ({remainingDistKm.toFixed(1)} km)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span>ETA: <strong className="text-white font-mono">{arrivalTime}</strong></span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-cyan-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    Green Corridor Active
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Vehicle Telemetry / Speed / Hospital Name */}
            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span className="font-mono font-bold text-white">
                  {isTransitActive && transitProgress < 1 ? '46 km/h' : '0 km/h'}
                </span>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-bold uppercase text-slate-400">Navigating To:</div>
                <div className="text-xs font-black text-white truncate max-w-[180px]">
                  {activeHospital.name}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Target Hospital Switcher Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-slate-800/80 no-scrollbar">
            <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0 flex items-center gap-1">
              <Hospital className="w-3 h-3 text-cyan-400" />
              Target Hospital:
            </span>
            {(Object.values(hospitals) as HospitalFacility[]).map((hosp) => {
              const isCur = hosp.id === activeHospital.id;
              const free = hosp.totalFacilityBeds - hosp.occupiedFacilityBeds;
              return (
                <button
                  key={hosp.id}
                  onClick={() => {
                    playTactileClick();
                    setActiveHospitalId(hosp.id);
                    setTransitProgress(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isCur
                      ? 'bg-red-600 text-white border-red-500 shadow-md ring-1 ring-white/20'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>{hosp.name.split(' ')[0]}</span>
                  <span className="text-[9px] opacity-80">({free} Beds)</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Google Maps Step-by-Step Directions Modal Drawer */}
      {isDirectionsDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">Route Directions</h3>
              </div>
              <button
                onClick={() => setIsDirectionsDrawerOpen(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Green Corridor Active</div>
                  <div className="text-[11px] text-emerald-300/80">Priority Signals enabled via Traffic Command</div>
                </div>
                <div className="text-right font-mono font-bold">
                  {totalDistanceKm} km &bull; ~{Math.ceil((totalDistanceKm / 38) * 60)} mins
                </div>
              </div>

              {routeData?.steps.map((step, idx) => {
                const isPassed = idx < activeStepIndex;
                const isCurrent = idx === activeStepIndex;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                      isCurrent
                        ? 'bg-emerald-900/30 border-emerald-500/60 ring-1 ring-emerald-500/40 text-white'
                        : isPassed
                        ? 'bg-slate-950/40 border-slate-800/60 text-slate-400 opacity-60'
                        : 'bg-slate-950/80 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? 'bg-emerald-500 text-white shadow-lg'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {renderManeuverIcon(step.maneuver)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold leading-snug">{step.instruction}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {step.streetName} &bull; {step.distanceMeters} m
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t border-slate-800 text-center">
              <button
                onClick={() => setIsDirectionsDrawerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close & Return to Live Navigation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
