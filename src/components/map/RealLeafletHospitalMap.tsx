import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RealHospital, fetchOsrmRoute, OsrmRouteResult } from '../../services/hospitalService';
import {
  Search,
  Fuel,
  Zap,
  Building,
  Plus,
  Minus,
  Crosshair,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Compass,
  CheckCircle2,
  Play,
  X,
  Navigation,
  Clock,
  AlertCircle
} from 'lucide-react';
import { playTactileClick, playConfirmChime, playCodeRedAlert } from '../../lib/audio';

interface RealLeafletHospitalMapProps {
  userLocation: { lat: number; lng: number };
  hospitals: RealHospital[];
  selectedHospital: RealHospital | null;
  onSelectHospital: (hospital: RealHospital) => void;
  isNavigating?: boolean;
  onStartNavigation?: () => void;
  onStopNavigation?: () => void;
  isRouteActive?: boolean;
  onLocateMe?: () => void;
  isLoadingHospitals?: boolean;
}

export const RealLeafletHospitalMap: React.FC<RealLeafletHospitalMapProps> = ({
  userLocation,
  hospitals,
  selectedHospital,
  onSelectHospital,
  isNavigating = false,
  onStartNavigation,
  onStopNavigation,
  isRouteActive,
  onLocateMe,
  isLoadingHospitals = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const labelsTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const poiLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const navigationVehicleMarkerRef = useRef<L.Marker | null>(null);

  const [mapStyle, setMapStyle] = useState<'satellite' | 'street' | 'dark'>(isNavigating ? 'dark' : 'satellite');
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLiveTrafficEnabled, setIsLiveTrafficEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeRouteIndex, setActiveRouteIndex] = useState<number>(0);
  const [routesData, setRoutesData] = useState<OsrmRouteResult | null>(null);

  // Live Navigation State
  const [navProgress, setNavProgress] = useState(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number | string>('--');
  const [currentDistanceLeftKm, setCurrentDistanceLeftKm] = useState(4.8);
  const [currentDurationLeftMins, setCurrentDurationLeftMins] = useState(15);
  const [currentStreetName, setCurrentStreetName] = useState('St Catherines Way');
  const [turnManeuver, setTurnManeuver] = useState<{ dist: string; text: string; arrow: 'right' | 'left' | 'straight' }>({
    dist: '60 m',
    text: 'Turn right',
    arrow: 'right'
  });
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [compassHeading, setCompassHeading] = useState(35);

  // Target Hospital
  const currentTarget = selectedHospital || hospitals[0] || {
    id: 'madhuraj-hospital',
    name: 'Madhuraj Hospital Private Limited',
    lat: 26.4802,
    lng: 80.3155,
    travelTime: '15 min',
    distance: '4.8 km',
    icuBeds: 6,
    generalBeds: 24,
    waitingTime: '~ 5 min',
    corridorName: 'Mall Rd & Halsi Rd Corridor'
  };

  // Switch map style automatically when navigating to dark 3D mode
  useEffect(() => {
    if (isNavigating) {
      setMapStyle('dark');
    }
  }, [isNavigating]);

  // Calculate formatted Estimated Arrival Time (e.g. 22:49)
  const calculateEtaTime = (mins: number) => {
    const d = new Date(Date.now() + mins * 60000);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [26.4680, 80.3340],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      // Default dark or satellite base
      const initialStyle = isNavigating ? 'dark' : 'satellite';
      if (initialStyle === 'dark') {
        const baseDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 20,
          subdomains: 'abcd'
        }).addTo(map);
        baseTileLayerRef.current = baseDark;
      } else {
        const baseSatellite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }).addTo(map);
        const hybridLabels = L.tileLayer('https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }).addTo(map);
        baseTileLayerRef.current = baseSatellite;
        labelsTileLayerRef.current = hybridLabels;
      }

      poiLayerGroupRef.current = L.layerGroup().addTo(map);
      routeLayerGroupRef.current = L.layerGroup().addTo(map);
      markersLayerGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Map Tile Layer based on style
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (baseTileLayerRef.current) map.removeLayer(baseTileLayerRef.current);
    if (labelsTileLayerRef.current) map.removeLayer(labelsTileLayerRef.current);

    if (mapStyle === 'satellite') {
      const base = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 20 }).addTo(map);
      const labels = L.tileLayer('https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}', { maxZoom: 20 }).addTo(map);
      baseTileLayerRef.current = base;
      labelsTileLayerRef.current = labels;
    } else if (mapStyle === 'street') {
      const base = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { maxZoom: 20 }).addTo(map);
      baseTileLayerRef.current = base;
      labelsTileLayerRef.current = null;
    } else {
      // Midnight Tactical Dark Navigation Tiles
      const base = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 20 }).addTo(map);
      baseTileLayerRef.current = base;
      labelsTileLayerRef.current = null;
    }
  }, [mapStyle]);

  // Render Realistic Kanpur POI Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !poiLayerGroupRef.current) return;
    poiLayerGroupRef.current.clearLayers();

    const kanpurPois = [
      { name: 'Naya Ganj Sarofa Chauraha', hindi: 'नया गंज सराफा चौराहा', lat: 26.4645, lng: 80.3530, type: 'chauraha' },
      { name: 'Phool Bagh Park', hindi: 'फूल बाग पार्क', lat: 26.4670, lng: 80.3550, type: 'park' },
      { name: 'GS Energy Station', hindi: 'जीएस एनर्जी', lat: 26.4795, lng: 80.3440, type: 'gas' },
      { name: 'Ghantaghar', hindi: 'घंटाघर', lat: 26.4570, lng: 80.3540, type: 'origin' },
      { name: 'Jaipuria Rd', hindi: 'जयपुरिया रोड', lat: 26.4530, lng: 80.3560, type: 'road' },
      { name: 'Government Inter College', hindi: 'गवर्नमेंट इंटर कॉलेज', lat: 26.4740, lng: 80.3340, type: 'school' },
      { name: 'Bada Chouraha', hindi: 'बड़ा चौराहा', lat: 26.4720, lng: 80.3475, type: 'metro' },
      { name: 'Mall Rd', hindi: 'मॉल रोड', lat: 26.4760, lng: 80.3320, type: 'road' }
    ];

    kanpurPois.forEach((poi) => {
      if (poi.type === 'origin') return;

      let badgeHtml = '';
      if (poi.type === 'chauraha') {
        badgeHtml = `
          <div class="text-slate-300/80 text-[10px] font-semibold tracking-tight text-center leading-tight -translate-x-1/2 -translate-y-1/2 cursor-default pointer-events-none drop-shadow-md">
            <div>${poi.name}</div>
            <div class="text-[8px] text-slate-400/80">${poi.hindi}</div>
          </div>
        `;
      } else if (poi.type === 'gas') {
        badgeHtml = `
          <div class="flex items-center gap-1 bg-slate-900/80 backdrop-blur-xs text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 text-[9px] font-bold -translate-x-1/2 -translate-y-1/2 cursor-default pointer-events-none">
            <span>⛽</span>
            <span>${poi.name}</span>
          </div>
        `;
      } else if (poi.type === 'road') {
        badgeHtml = `
          <div class="text-slate-400 text-[10px] font-semibold tracking-wider -translate-x-1/2 -translate-y-1/2 cursor-default pointer-events-none">
            ${poi.name}
          </div>
        `;
      } else {
        badgeHtml = `
          <div class="bg-slate-900/60 backdrop-blur-xs text-white/80 px-1.5 py-0.5 rounded text-[9px] font-semibold border border-white/10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap cursor-default pointer-events-none">
            ${poi.name}
          </div>
        `;
      }

      const poiIcon = L.divIcon({
        html: badgeHtml,
        className: 'poi-custom-marker pointer-events-none',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([poi.lat, poi.lng], { icon: poiIcon, interactive: false }).addTo(poiLayerGroupRef.current!);
    });
  }, []);

  // Update User Origin Marker (when not actively driving)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (userMarkerRef.current) {
      mapInstanceRef.current.removeLayer(userMarkerRef.current);
    }

    if (isNavigating) return; // In navigation mode, the animated vehicle takes over

    const originLat = userLocation.lat;
    const originLng = userLocation.lng;

    const userHtml = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
        <div class="absolute w-12 h-12 rounded-full bg-blue-500/25 animate-ping"></div>
        <div class="w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white ring-4 ring-blue-500/30">
          <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
        </div>
        <!-- Attached Street Name Pill -->
        <div class="absolute top-8 left-1/2 -translate-x-1/2 bg-[#1a73e8] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-lg whitespace-nowrap border border-white/30 pointer-events-none">
          St Catherines Way
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userHtml,
      className: 'custom-user-origin-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([originLat, originLng], { icon: userIcon, zIndexOffset: 800 }).addTo(mapInstanceRef.current);
    userMarkerRef.current = marker;
  }, [userLocation.lat, userLocation.lng, isNavigating]);

  // Update ALL Hospital Markers with FULL CLICKABILITY
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current) return;
    markersLayerGroupRef.current.clearLayers();

    const filteredHospitals = searchQuery
      ? hospitals.filter(
          (h) =>
            h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : hospitals;

    filteredHospitals.forEach((hosp) => {
      const isSelected = selectedHospital ? selectedHospital.id === hosp.id : hosp.id === currentTarget.id;

      let markerHtml = '';

      if (isSelected) {
        markerHtml = `
          <div class="cursor-pointer -translate-x-1/2 -translate-y-full transition-transform hover:scale-105 select-none filter drop-shadow-2xl">
            <div class="flex items-center gap-1.5 bg-[#1a1d21]/95 backdrop-blur-md border-2 border-emerald-400 text-white px-3 py-2 rounded-xl shadow-2xl min-w-[210px] mb-1">
              <div class="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-black shadow-md shrink-0">
                H
              </div>
              <div class="text-left truncate flex-1">
                <div class="text-[11px] font-black text-white leading-tight truncate">${hosp.name}</div>
                <div class="text-[9px] font-medium text-slate-300 truncate">${hosp.address || 'Kanpur Region'}</div>
                <div class="flex items-center gap-2 text-[9px] font-bold text-emerald-400 pt-0.5">
                  <span class="bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded">${hosp.travelTime || '15 min'} (${hosp.distance || '4.8 km'})</span>
                  <span class="bg-blue-500/20 text-blue-300 px-1 py-0.2 rounded">ICU: ${hosp.icuBeds}</span>
                </div>
              </div>
            </div>
            <div class="relative w-9 h-11 mx-auto -mt-1 flex items-center justify-center">
              <svg class="w-9 h-11 text-red-600 filter drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <div class="absolute top-2.5 w-3 h-3 rounded-full bg-white flex items-center justify-center">
                <div class="w-1.5 h-1.5 rounded-full bg-red-600"></div>
              </div>
            </div>
          </div>
        `;
      } else {
        markerHtml = `
          <div class="cursor-pointer group -translate-x-1/2 -translate-y-full transition-transform hover:scale-125">
            <div class="relative w-8 h-10 flex items-center justify-center">
              <svg class="w-8 h-10 text-red-600 filter drop-shadow-md group-hover:text-rose-500 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span class="absolute top-2 text-[10px] font-black text-white">H</span>
            </div>
            <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-950/95 text-white px-2 py-0.5 rounded-md text-[9px] font-bold whitespace-nowrap shadow-xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              ${hosp.name} (${hosp.distance || 'Near'})
            </div>
          </div>
        `;
      }

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-clickable-hospital-pin',
        iconSize: isSelected ? [220, 80] : [32, 40],
        iconAnchor: isSelected ? [110, 80] : [16, 40]
      });

      const marker = L.marker([hosp.lat, hosp.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1500 : 300,
        riseOnHover: true
      });

      marker.on('click', () => {
        playTactileClick();
        onSelectHospital(hosp);
      });

      markersLayerGroupRef.current?.addLayer(marker);
    });
  }, [hospitals, selectedHospital, searchQuery, currentTarget.id]);

  // Fetch & Render Google Navigation Routes with Similar ETA 🍃
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerGroupRef.current) return;
    routeLayerGroupRef.current.clearLayers();

    const target = selectedHospital || currentTarget;
    if (!target) return;

    let isMounted = true;

    fetchOsrmRoute(userLocation.lat, userLocation.lng, target.lat, target.lng).then((res) => {
      if (!isMounted || !mapInstanceRef.current || !routeLayerGroupRef.current || !res) return;

      setRoutesData(res);

      // 1. Alternative routes with "Similar ETA 🍃" Badge (Matching Screenshot)
      res.alternatives.forEach((altRoute, altIdx) => {
        L.polyline(altRoute.coordinates, {
          color: '#1a2332',
          weight: 9,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routeLayerGroupRef.current!);

        const altLine = L.polyline(altRoute.coordinates, {
          color: activeRouteIndex === altIdx + 1 ? '#4285f4' : '#5f6368',
          weight: 6,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routeLayerGroupRef.current!);

        altLine.on('click', () => {
          playTactileClick();
          setActiveRouteIndex(altIdx + 1);
        });

        // "Similar ETA 🍃" Badge from Google Maps Screenshot
        const midPoint = altRoute.coordinates[Math.floor(altRoute.coordinates.length * 0.45)];
        if (midPoint) {
          const badgeHtml = `
            <div class="cursor-pointer -translate-x-1/2 -translate-y-1/2 bg-[#1f2937]/90 backdrop-blur-md text-slate-200 border border-slate-600 shadow-2xl px-2.5 py-1 rounded-md text-[11px] font-bold flex flex-col items-center justify-center leading-tight hover:scale-105 transition-all select-none">
              <div class="flex items-center gap-1 font-bold">
                <span>Similar</span>
              </div>
              <div class="flex items-center gap-1 text-[10px] text-slate-300">
                <span>ETA</span>
                <span>🍃</span>
              </div>
            </div>
          `;

          const etaIcon = L.divIcon({
            html: badgeHtml,
            className: 'alt-similar-eta-badge',
            iconSize: [64, 32],
            iconAnchor: [32, 16]
          });

          const badgeMarker = L.marker(midPoint, { icon: etaIcon, zIndexOffset: 900 }).addTo(routeLayerGroupRef.current!);
          badgeMarker.on('click', () => {
            playTactileClick();
            setActiveRouteIndex(altIdx + 1);
          });
        }
      });

      // 2. Primary Route (Glowing Blue/White Navigation Line)
      const primary = res.primary;

      // Dark Border Stroke
      L.polyline(primary.coordinates, {
        color: '#0d47a1',
        weight: 10,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(routeLayerGroupRef.current!);

      // Solid Navigation Blue Line
      const primaryLine = L.polyline(primary.coordinates, {
        color: activeRouteIndex === 0 ? '#1a73e8' : '#70757a',
        weight: 7,
        opacity: 1.0,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(routeLayerGroupRef.current!);

      primaryLine.on('click', () => {
        playTactileClick();
        setActiveRouteIndex(0);
      });

      if (!isNavigating) {
        const bounds = L.latLngBounds([
          [userLocation.lat, userLocation.lng],
          [target.lat, target.lng]
        ]);
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [70, 70],
          maxZoom: 16
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [userLocation.lat, userLocation.lng, selectedHospital, activeRouteIndex, isNavigating]);

  // Live Navigation Animation Loop (Vehicle moving along polyline with live metrics)
  useEffect(() => {
    if (!isNavigating || !routesData || !mapInstanceRef.current) {
      if (navigationVehicleMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(navigationVehicleMarkerRef.current);
        navigationVehicleMarkerRef.current = null;
      }
      return;
    }

    const currentRoute =
      activeRouteIndex === 0
        ? routesData.primary
        : routesData.alternatives[activeRouteIndex - 1] || routesData.primary;

    const coords = currentRoute.coordinates;
    if (!coords || coords.length < 2) return;

    let progress = 0;
    const totalDistance = currentRoute.distanceKm;
    const totalDuration = currentRoute.durationMins;

    // Google Maps Navigation Beacon: Blue glowing disc with white center and "St Catherines Way" street label
    const updateVehicleMarkerHtml = (street: string) => `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
        <!-- Directional Beam -->
        <div class="absolute -top-6 w-12 h-14 bg-gradient-to-t from-blue-500/40 to-transparent clip-triangle rounded-t-full pointer-events-none"></div>
        <!-- Pulse ring -->
        <div class="absolute w-12 h-12 rounded-full bg-blue-500/30 animate-ping"></div>
        <!-- Blue Beacon Disk -->
        <div class="w-8 h-8 rounded-full bg-[#1a73e8] border-2 border-white shadow-2xl flex items-center justify-center ring-4 ring-blue-500/40">
          <div class="w-3.5 h-3.5 rounded-full bg-white"></div>
        </div>
        <!-- Street Name Pill (Matching Screenshot: St Catherines Way) -->
        <div class="absolute top-9 left-1/2 -translate-x-1/2 bg-[#1a73e8] text-white px-3 py-0.5 rounded-full text-[11px] font-bold shadow-2xl whitespace-nowrap border border-white/40 pointer-events-none">
          ${street}
        </div>
      </div>
    `;

    const initialIcon = L.divIcon({
      html: updateVehicleMarkerHtml('St Catherines Way'),
      className: 'nav-vehicle-beacon-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const startCoord = coords[0];
    const marker = L.marker(startCoord, { icon: initialIcon, zIndexOffset: 2000 }).addTo(mapInstanceRef.current);
    navigationVehicleMarkerRef.current = marker;

    // Center on navigation start with close 3D driving zoom
    mapInstanceRef.current.setView(startCoord, 16, { animate: true });
    setCurrentSpeedKmh(44);

    const interval = setInterval(() => {
      progress += 0.012; // Smooth movement
      if (progress >= 1) {
        progress = 1;
        clearInterval(interval);
        playConfirmChime();
        setTurnManeuver({
          dist: '0 m',
          text: `Arrived at ${currentTarget.name}`,
          arrow: 'straight'
        });
        setCurrentSpeedKmh('--');
        setCurrentDurationLeftMins(0);
        setCurrentDistanceLeftKm(0);
      } else {
        const indexFloat = progress * (coords.length - 1);
        const lowerIdx = Math.floor(indexFloat);
        const upperIdx = Math.min(lowerIdx + 1, coords.length - 1);
        const fraction = indexFloat - lowerIdx;

        const currentLat = coords[lowerIdx][0] + (coords[upperIdx][0] - coords[lowerIdx][0]) * fraction;
        const currentLng = coords[lowerIdx][1] + (coords[upperIdx][1] - coords[lowerIdx][1]) * fraction;

        marker.setLatLng([currentLat, currentLng]);
        mapInstanceRef.current?.panTo([currentLat, currentLng], { animate: true, duration: 0.4 });

        // Update live metrics
        const distLeft = Math.max(0, Number((totalDistance * (1 - progress)).toFixed(1)));
        const durationLeft = Math.max(1, Math.round(totalDuration * (1 - progress)));
        setCurrentDistanceLeftKm(distLeft);
        setCurrentDurationLeftMins(durationLeft);
        setNavProgress(Math.round(progress * 100));

        // Speed fluctuation simulation (38 - 56 km/h)
        const liveSpeed = 42 + Math.floor(Math.sin(progress * 20) * 8);
        setCurrentSpeedKmh(liveSpeed);

        // Turn instruction updates matching screenshot
        if (progress < 0.25) {
          const metersLeft = Math.max(20, Math.round(60 - progress * 150));
          setTurnManeuver({
            dist: `${metersLeft} m`,
            text: 'Turn right',
            arrow: 'right'
          });
          setCurrentStreetName('St Catherines Way');
        } else if (progress < 0.6) {
          const metersLeft = Math.max(40, Math.round(250 - (progress - 0.25) * 400));
          setTurnManeuver({
            dist: `${metersLeft} m`,
            text: 'Turn left onto Mall Rd',
            arrow: 'left'
          });
          setCurrentStreetName('Halsi Rd');
        } else if (progress < 0.85) {
          const metersLeft = Math.max(50, Math.round(400 - (progress - 0.6) * 600));
          setTurnManeuver({
            dist: `${metersLeft} m`,
            text: 'Continue straight on Mall Rd',
            arrow: 'straight'
          });
          setCurrentStreetName('Mall Rd');
        } else {
          setTurnManeuver({
            dist: '80 m',
            text: `Turn right into ${currentTarget.name}`,
            arrow: 'right'
          });
          setCurrentStreetName('Harsh Nagar / Swaroop Nagar');
        }

        // Update dynamic street name in beacon marker
        const updatedIcon = L.divIcon({
          html: updateVehicleMarkerHtml(
            progress < 0.25 ? 'St Catherines Way' : progress < 0.6 ? 'Halsi Rd' : 'Mall Rd'
          ),
          className: 'nav-vehicle-beacon-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
        marker.setIcon(updatedIcon);
      }
    }, 450);

    return () => {
      clearInterval(interval);
      if (navigationVehicleMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(navigationVehicleMarkerRef.current);
        navigationVehicleMarkerRef.current = null;
      }
    };
  }, [isNavigating, routesData, activeRouteIndex]);

  const handleZoomIn = () => {
    playTactileClick();
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    playTactileClick();
    mapInstanceRef.current?.zoomOut();
  };

  const handleRecenter = () => {
    playTactileClick();
    if (onLocateMe) onLocateMe();
    if (isNavigating && navigationVehicleMarkerRef.current) {
      mapInstanceRef.current?.setView(navigationVehicleMarkerRef.current.getLatLng(), 16, { animate: true });
    } else {
      mapInstanceRef.current?.setView([userLocation.lat, userLocation.lng], 15, { animate: true });
    }
  };

  return (
    <div
      className={`relative w-full overflow-hidden select-none transition-all duration-300 font-sans ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : 'h-full min-h-[560px] rounded-3xl'
      }`}
    >
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-[#16202c]" />

      {/* ========================================================================= */}
      {/* 1. TOP GOOGLE MAPS NAVIGATION CARD (Exact Match to Screenshot) */}
      {/* ========================================================================= */}
      {isNavigating ? (
        <div className="absolute top-4 inset-x-4 z-30 animate-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="max-w-md mx-auto bg-[#323639]/95 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl p-4 sm:p-5 flex items-center gap-4 text-white pointer-events-auto">
            
            {/* White Turn Arrow Icon */}
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              {turnManeuver.arrow === 'right' ? (
                <svg className="w-10 h-10 text-white stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 18V9a3 3 0 0 1 3-3h11M14 2l4 4-4 4"/>
                </svg>
              ) : turnManeuver.arrow === 'left' ? (
                <svg className="w-10 h-10 text-white stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 18V9a3 3 0 0 0-3-3H6M10 2L6 6l4 4"/>
                </svg>
              ) : (
                <svg className="w-10 h-10 text-white stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
              )}
            </div>

            {/* Maneuver Text (e.g. 60 m \n Turn right) */}
            <div className="text-left flex-1">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-none text-white font-sans">
                {turnManeuver.dist}
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-100 pt-1 leading-tight">
                {turnManeuver.text}
              </div>
            </div>

            {/* Voice Volume Button */}
            <button
              onClick={() => {
                playTactileClick();
                setIsVoiceMuted(!isVoiceMuted);
              }}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Mute / Unmute"
            >
              {isVoiceMuted ? <VolumeX className="w-5 h-5 text-slate-400" /> : <Volume2 className="w-5 h-5 text-white" />}
            </button>

          </div>
        </div>
      ) : (
        /* Top Floating Search & Filter Chips (Standard Mode) */
        <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex flex-col gap-2 pointer-events-none">
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="pointer-events-auto flex-1 max-w-md bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-slate-200/90 flex items-center px-4 py-2.5 gap-2.5 transition-all focus-within:ring-2 focus-within:ring-blue-500">
              <Search className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hospital or clinic along route..."
                className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="pointer-events-auto flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-white cursor-pointer transition-transform hover:scale-105">
                <div className="grid grid-cols-3 gap-0.5">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-slate-700 rounded-xs"></div>
                  ))}
                </div>
              </div>

              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-md hover:scale-105 transition-transform cursor-pointer">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-black">
                  K
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'hospitals', label: 'Hospitals', icon: Sparkles, active: true },
              { id: 'pharmacies', label: 'Pharmacies', icon: Plus },
              { id: 'gas', label: 'Gas', icon: Fuel },
              { id: 'ev', label: 'EV charging', icon: Zap },
              { id: 'hotels', label: 'Hotels', icon: Building }
            ].map((chip) => {
              const Icon = chip.icon;
              const isChipActive = activeFilter === chip.id || (!activeFilter && chip.id === 'hospitals');
              return (
                <button
                  key={chip.id}
                  onClick={() => {
                    playTactileClick();
                    setActiveFilter(chip.id);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer ${
                    isChipActive
                      ? 'bg-blue-600 text-white shadow-blue-500/30'
                      : 'bg-white/95 backdrop-blur-md text-slate-800 hover:bg-white border border-slate-200/90'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FLOATING RIGHT WIDGETS: COMPASS, SEARCH, ZOOM, FULLSCREEN */}
      {/* ========================================================================= */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3 pointer-events-auto">
        
        {/* Red & White Needle 3D Compass (Exact Match to Screenshot) */}
        <div
          onClick={() => {
            playTactileClick();
            setCompassHeading((prev) => (prev + 90) % 360);
          }}
          className="w-11 h-11 rounded-full bg-[#1e2329]/90 backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform"
          title="Compass (Tap to Rotate)"
        >
          <div
            className="w-6 h-6 relative flex items-center justify-center transition-transform duration-300"
            style={{ transform: `rotate(${compassHeading}deg)` }}
          >
            {/* North Red Pointer */}
            <div className="absolute top-0 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[10px] border-b-red-600"></div>
            {/* South White Pointer */}
            <div className="absolute bottom-0 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[10px] border-t-white"></div>
          </div>
        </div>

        {/* Search Round Button */}
        <div
          onClick={() => {
            playTactileClick();
            const q = prompt('Search destination on route:');
            if (q) setSearchQuery(q);
          }}
          className="w-11 h-11 rounded-full bg-[#1e2329]/90 backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center text-white cursor-pointer hover:scale-110 active:scale-95 transition-transform"
          title="Search on Route"
        >
          <Search className="w-5 h-5 text-white" />
        </div>

        {/* Recenter Crosshair */}
        <button
          onClick={handleRecenter}
          className="w-11 h-11 rounded-full bg-[#1e2329]/90 backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center text-blue-400 hover:text-blue-300 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
          title="Recenter GPS Position"
        >
          <Crosshair className="w-5 h-5" />
        </button>

        {/* Fullscreen Map */}
        <button
          onClick={() => {
            playTactileClick();
            setIsFullscreen(!isFullscreen);
          }}
          className="w-11 h-11 rounded-full bg-[#1e2329]/90 backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center text-slate-300 hover:text-white cursor-pointer hover:scale-110 transition-transform"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

      </div>

      {/* ========================================================================= */}
      {/* 3. SPEEDOMETER BADGE (Exact Match to Screenshot: Bottom-Left "-- km/h") */}
      {/* ========================================================================= */}
      {isNavigating && (
        <div className="absolute left-4 bottom-32 sm:bottom-36 z-20 pointer-events-none animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-full bg-black/85 backdrop-blur-md border border-white/20 shadow-2xl flex flex-col items-center justify-center text-white pointer-events-auto">
            <span className="text-base font-extrabold leading-none font-sans">
              {currentSpeedKmh}
            </span>
            <span className="text-[9px] font-bold text-slate-400 pt-0.5">
              km/h
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BOTTOM SHEET CARD (Exact Match to Screenshot: Alert + Arrival + Exit + Continue) */}
      {/* ========================================================================= */}
      {isNavigating ? (
        <div className="absolute bottom-0 inset-x-0 z-30 animate-in slide-in-from-bottom-6 duration-300">
          <div className="bg-[#0e1013]/98 backdrop-blur-xl border-t border-white/15 rounded-t-3xl shadow-2xl p-4 sm:p-5 text-white max-w-xl mx-auto space-y-4">
            
            {/* Top Row: Clock Icon + Hospital Warning / Information Text */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                <Clock className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-left flex-1 space-y-1">
                <div className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                  {currentTarget.name}
                  <span className="block text-xs font-semibold text-rose-300 pt-0.5">
                    Green Corridor Active &bull; Emergency Trauma 24x7 Ready
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-400">
                  Estimated arrival at <span className="text-slate-200 font-bold">{calculateEtaTime(currentDurationLeftMins)}</span> ({currentDurationLeftMins} min &bull; {currentDistanceLeftKm} km)
                </div>
              </div>
            </div>

            {/* Bottom Actions Row: ✕ Exit | ▲ Continue (Matching Screenshot Pill Style) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              
              {/* ✕ Exit Button (Dark pill with red X) */}
              <button
                onClick={() => {
                  playTactileClick();
                  if (onStopNavigation) onStopNavigation();
                }}
                className="py-3 px-5 rounded-full bg-[#1c1e22] hover:bg-[#25282e] border border-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-lg"
              >
                <span className="text-red-500 font-extrabold text-base">&times;</span>
                <span>Exit</span>
              </button>

              {/* ▲ Continue Button (Cyan/Teal highlighted pill) */}
              <button
                onClick={() => {
                  playConfirmChime();
                  handleRecenter();
                }}
                className="py-3 px-5 rounded-full bg-gradient-to-r from-[#4dd0e1] to-[#26a69a] hover:opacity-95 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-lg shadow-teal-500/20"
              >
                <span className="text-slate-950 font-black text-xs">▲</span>
                <span>Continue</span>
              </button>

            </div>

          </div>
        </div>
      ) : (
        /* Layer Switcher & Bottom Watermark (When in Standard Preview Mode) */
        <div className="absolute left-3.5 bottom-7 z-20 flex flex-col gap-2">
          <div className="relative">
            <button
              onClick={() => {
                playTactileClick();
                setIsLayerMenuOpen(!isLayerMenuOpen);
              }}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xl hover:scale-105 transition-all cursor-pointer group text-slate-800"
              title="Toggle Map Layers"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-300 relative shadow-inner">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=80&q=80"
                  alt="Layers"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              <span className="text-xs font-black text-slate-900">Layers</span>
            </button>

            {isLayerMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-44 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-2 z-30 space-y-1">
                <div className="text-[10px] font-black text-slate-400 uppercase px-2 py-1">Map Type</div>
                <button
                  onClick={() => {
                    setMapStyle('satellite');
                    setIsLayerMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-black flex items-center justify-between ${
                    mapStyle === 'satellite' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>Satellite (Hybrid)</span>
                  {mapStyle === 'satellite' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
                <button
                  onClick={() => {
                    setMapStyle('street');
                    setIsLayerMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-black flex items-center justify-between ${
                    mapStyle === 'street' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>Google Street Map</span>
                  {mapStyle === 'street' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
                <button
                  onClick={() => {
                    setMapStyle('dark');
                    setIsLayerMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-black flex items-center justify-between ${
                    mapStyle === 'dark' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>Night Tactical</span>
                  {mapStyle === 'dark' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Watermark Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-black/75 backdrop-blur-xs text-[9px] text-white/70 px-4 py-1 flex items-center justify-between z-10 select-none pointer-events-none">
        <div className="flex items-center gap-3">
          <span>Imagery ©2026 Airbus, Maxar Technologies</span>
          <span className="hidden md:inline">Map data ©2026 India</span>
        </div>
        <div className="flex items-center gap-3 font-semibold">
          <span className="border-b border-white/60">200 m</span>
          <span>Terms</span>
          <span>Privacy</span>
        </div>
      </div>
    </div>
  );
};
