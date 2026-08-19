import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Ambulance,
  Navigation,
  MapPin,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Radio,
  Clock,
  Activity,
  HeartPulse,
  Maximize2,
  Crosshair,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { TransferRequestState } from '../../types/transfer';
import { ROUTE_WAYPOINTS } from '../../services/ambulanceService';

interface DynamicLightTransitMapProps {
  state: TransferRequestState;
  onUpdateProgress: (percent: number) => void;
  height?: string;
  showControls?: boolean;
}

// Function to calculate exact lat/lng interpolated along waypoint segments based on progress percent
function interpolateRoute(percent: number): { lat: number; lng: number; heading: number; currentWaypointIndex: number } {
  const clamped = Math.max(0, Math.min(100, percent));
  const totalWaypoints = ROUTE_WAYPOINTS.length;

  if (clamped <= 0) {
    const wp = ROUTE_WAYPOINTS[0];
    return { lat: wp.coords[0], lng: wp.coords[1], heading: 45, currentWaypointIndex: 0 };
  }
  if (clamped >= 100) {
    const wp = ROUTE_WAYPOINTS[totalWaypoints - 1];
    return { lat: wp.coords[0], lng: wp.coords[1], heading: 90, currentWaypointIndex: totalWaypoints - 1 };
  }

  // Calculate segment
  const segmentDistance = 100 / (totalWaypoints - 1);
  const segmentIndex = Math.min(totalWaypoints - 2, Math.floor(clamped / segmentDistance));
  const segmentFraction = (clamped - segmentIndex * segmentDistance) / segmentDistance;

  const startWp = ROUTE_WAYPOINTS[segmentIndex];
  const endWp = ROUTE_WAYPOINTS[segmentIndex + 1];

  const lat = startWp.coords[0] + (endWp.coords[0] - startWp.coords[0]) * segmentFraction;
  const lng = startWp.coords[1] + (endWp.coords[1] - startWp.coords[1]) * segmentFraction;

  // Calculate rough heading
  const dLat = endWp.coords[0] - startWp.coords[0];
  const dLng = endWp.coords[1] - startWp.coords[1];
  const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);
  const heading = (angle + 360) % 360;

  return { lat, lng, heading, currentWaypointIndex: segmentIndex };
}

export const DynamicLightTransitMap: React.FC<DynamicLightTransitMapProps> = ({
  state,
  onUpdateProgress,
  height = '460px',
  showControls = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const ambulanceMarkerRef = useRef<L.Marker | null>(null);
  const traversedPolylineRef = useRef<L.Polyline | null>(null);
  const upcomingPolylineRef = useRef<L.Polyline | null>(null);
  const pulseCircleRef = useRef<L.Circle | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [autoFollow, setAutoFollow] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);

  const { ambulance, clinical } = state;
  const currentProgress = ambulance.routeProgressPercent;

  // Real-time animation ticker
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      onUpdateProgress(Math.min(100, Number((currentProgress + 0.35 * speedMultiplier).toFixed(2))));
    }, 400);

    return () => clearInterval(interval);
  }, [isPlaying, currentProgress, speedMultiplier, onUpdateProgress]);

  // Initialize Leaflet Map with Light CartoDB Positron Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [26.60, 80.60],
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
      });

      // Crisp Light Map Tiles (CartoDB Positron)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Custom Zoom Control top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Route coordinates array
      const allCoords: [number, number][] = ROUTE_WAYPOINTS.map((w) => [w.coords[0], w.coords[1]]);

      // Route Outline Corridor (subtle shadow road)
      L.polyline(allCoords, {
        color: '#CBD5E1',
        weight: 8,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Upcoming Polyline (Dashed Highway)
      upcomingPolylineRef.current = L.polyline(allCoords, {
        color: '#0284C7',
        weight: 4,
        dashArray: '6, 8',
        opacity: 0.85,
        lineCap: 'round',
      }).addTo(map);

      // Traversed Polyline (Solid Medical Red)
      traversedPolylineRef.current = L.polyline([], {
        color: '#DC2626',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
      }).addTo(map);

      // Waypoint Markers
      ROUTE_WAYPOINTS.forEach((wp, idx) => {
        const isOrigin = idx === 0;
        const isDestination = idx === ROUTE_WAYPOINTS.length - 1;

        const iconHtml = isOrigin
          ? `<div class="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-[10px] shadow-md border-2 border-white">H</div>`
          : isDestination
          ? `<div class="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-md border-2 border-white animate-bounce">PCI</div>`
          : `<div class="flex items-center justify-center w-5 h-5 rounded-full bg-white text-slate-700 font-bold text-[9px] shadow border-2 border-sky-500">${idx}</div>`;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-waypoint-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([wp.coords[0], wp.coords[1]], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
            <strong style="color: #0f172a; display: block; font-size: 12px;">${wp.name}</strong>
            <span style="color: #64748b; font-size: 10px;">${wp.km} km from origin • Offset: ${wp.timeOffset}</span>
            <p style="margin-top: 4px; color: #334155; line-height: 1.3;">${wp.description}</p>
          </div>
        `);
      });

      // Moving Ambulance Marker Icon with pulsing LED beacon
      const ambulanceHtml = `
        <div class="relative flex items-center justify-center w-11 h-11">
          <div class="absolute inset-0 rounded-full bg-red-500/30 animate-ping"></div>
          <div class="relative w-9 h-9 rounded-full bg-red-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 10H6"/>
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-2.308A1 1 0 0 0 16.46 8H14"/>
              <circle cx="17" cy="18" r="2"/>
              <circle cx="7" cy="18" r="2"/>
            </svg>
          </div>
          <div class="absolute -top-4 bg-slate-900 text-white font-mono text-[9px] font-bold px-1.5 py-0.2 rounded shadow-xs border border-slate-700 whitespace-nowrap">
            ALS-042
          </div>
        </div>
      `;

      const ambIcon = L.divIcon({
        html: ambulanceHtml,
        className: 'custom-ambulance-marker',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const initialPos = interpolateRoute(0);
      ambulanceMarkerRef.current = L.marker([initialPos.lat, initialPos.lng], {
        icon: ambIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      pulseCircleRef.current = L.circle([initialPos.lat, initialPos.lng], {
        radius: 1200,
        color: '#DC2626',
        fillColor: '#EF4444',
        fillOpacity: 0.12,
        weight: 1.5,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // cleanup handled on component unmount
    };
  }, []);

  // Update Ambulance Position & Polylines when progress changes
  useEffect(() => {
    if (!mapInstanceRef.current || !ambulanceMarkerRef.current) return;

    const { lat, lng } = interpolateRoute(currentProgress);

    // Update marker position
    ambulanceMarkerRef.current.setLatLng([lat, lng]);

    if (pulseCircleRef.current) {
      pulseCircleRef.current.setLatLng([lat, lng]);
    }

    // Update Traversed Polyline
    const traversedCoords: [number, number][] = [];
    const totalWaypoints = ROUTE_WAYPOINTS.length;
    const currentWaypointFraction = (currentProgress / 100) * (totalWaypoints - 1);
    const passedIndex = Math.floor(currentWaypointFraction);

    for (let i = 0; i <= passedIndex && i < totalWaypoints; i++) {
      traversedCoords.push([ROUTE_WAYPOINTS[i].coords[0], ROUTE_WAYPOINTS[i].coords[1]]);
    }
    traversedCoords.push([lat, lng]);

    if (traversedPolylineRef.current) {
      traversedPolylineRef.current.setLatLngs(traversedCoords);
    }

    // Smooth Pan if autoFollow is enabled
    if (autoFollow && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([lat, lng], { animate: true, duration: 0.5 });
    }
  }, [currentProgress, autoFollow]);

  const handleCenterMap = () => {
    if (!mapInstanceRef.current) return;
    const { lat, lng } = interpolateRoute(currentProgress);
    mapInstanceRef.current.setView([lat, lng], 12, { animate: true });
    setAutoFollow(true);
  };

  const handleFitFullRoute = () => {
    if (!mapInstanceRef.current) return;
    setAutoFollow(false);
    const allCoords: [number, number][] = ROUTE_WAYPOINTS.map((w) => [w.coords[0], w.coords[1]]);
    mapInstanceRef.current.fitBounds(L.latLngBounds(allCoords), { padding: [40, 40], animate: true });
  };

  const currentWp = interpolateRoute(currentProgress);
  const activeWpData = ROUTE_WAYPOINTS[currentWp.currentWaypointIndex] || ROUTE_WAYPOINTS[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col font-sans">
      {/* Map Header Strip */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                Kanpur ➔ SGPGI Lucknow Green Corridor (NH-27)
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                5G GPS LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Checkpoint: <strong className="text-slate-800">{activeWpData.name}</strong> • Remaining: <strong className="text-red-600">{ambulance.distanceRemainingKm} km</strong>
            </p>
          </div>
        </div>

        {/* Live Vitals HUD */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <HeartPulse className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-bold">{clinical.vitals.heartRate} bpm</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
            <Activity className="w-3.5 h-3.5" />
            <span className="font-bold">SpO2 {clinical.vitals.spO2}%</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-bold font-mono">ETA: {ambulance.etaString}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Leaflet Map Container */}
      <div className="relative w-full" style={{ height }}>
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Quick Action Overlays (Top Left) */}
        <div className="absolute top-3 left-3 z-20 flex flex-col space-y-1.5">
          <button
            onClick={handleCenterMap}
            className={`p-2 rounded-xl border shadow-md transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
              autoFollow
                ? 'bg-red-600 text-white border-red-700 ring-2 ring-red-300'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
            title="Auto-Follow Ambulance"
          >
            <Crosshair className="w-4 h-4" />
            <span className="hidden sm:inline">Follow Vehicle</span>
          </button>

          <button
            onClick={handleFitFullRoute}
            className="p-2 rounded-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-md transition cursor-pointer flex items-center gap-1 text-xs font-bold"
            title="View Full Corridor"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Full Route</span>
          </button>
        </div>

        {/* Floating Ambulance Telemetry Overlay Badge (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-lg text-xs space-y-1 max-w-[260px]">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span className="flex items-center gap-1 text-red-600">
              <Ambulance className="w-3.5 h-3.5" />
              <span>{ambulance.vehicleNumber}</span>
            </span>
            <span className="text-emerald-700">{ambulance.speedKmH || 82} km/h</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Paramedic: <strong className="text-slate-800">{ambulance.paramedic.split('(')[0]}</strong>
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Green Channel Escort Active</span>
          </div>
        </div>
      </div>

      {/* Bottom Interactive Simulation Controls */}
      {showControls && (
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                isPlaying
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play Live GPS'}</span>
            </button>

            <button
              onClick={() => onUpdateProgress(0)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white transition cursor-pointer"
              title="Reset Route"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center space-x-1 pl-2 border-l border-slate-200">
              {[1, 2, 4].map((mult) => (
                <button
                  key={mult}
                  onClick={() => setSpeedMultiplier(mult)}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                    speedMultiplier === mult
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {mult}x
                </button>
              ))}
            </div>
          </div>

          {/* Scrubber Progress Slider */}
          <div className="flex items-center space-x-3 w-full sm:w-1/2">
            <span className="text-[11px] text-slate-500 font-semibold whitespace-nowrap">Progress:</span>
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={currentProgress}
              onChange={(e) => onUpdateProgress(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <span className="font-mono font-bold text-slate-900 w-10 text-right">{Math.round(currentProgress)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
