import React, { useEffect, useRef, useState } from 'react';
import { HospitalFacility } from '../../types';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import { fetchDrivingRoute, RouteData } from '../../lib/routingService';
import {
  MapPin,
  Hospital,
  Bed,
  PhoneCall,
  Navigation,
  ArrowLeft,
  Crosshair,
  Layers,
  Sparkles
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { playTactileClick } from '../../lib/audio';

interface HospitalDiscoveryMapViewProps {
  hospitals: HospitalFacility[];
  onSelectHospital: (hospitalId: string) => void;
  cityName: string;
  stateName: string;
  diseaseName: string;
  onBack: () => void;
}

export const HospitalDiscoveryMapView: React.FC<HospitalDiscoveryMapViewProps> = ({
  hospitals,
  onSelectHospital,
  cityName,
  stateName,
  diseaseName,
  onBack
}) => {
  const { citizenCoords, setCitizenCoords } = usePrathmikta();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeBgLayerRef = useRef<L.Polyline | null>(null);
  const routeFgLayerRef = useRef<L.Polyline | null>(null);

  const [activeHospitalId, setActiveHospitalId] = useState<string>(
    hospitals[0]?.id || ''
  );
  const [mapStyle, setMapStyle] = useState<'dark' | 'tactical'>('dark');
  const [previewRoute, setPreviewRoute] = useState<RouteData | null>(null);

  const selectedHospital = hospitals.find((h) => h.id === activeHospitalId) || hospitals[0];

  // Fetch route when selected hospital changes
  useEffect(() => {
    if (!selectedHospital) return;
    let isCancelled = false;

    async function loadPreview() {
      const data = await fetchDrivingRoute(
        citizenCoords,
        { lat: selectedHospital.lat, lng: selectedHospital.lng },
        selectedHospital.name
      );
      if (!isCancelled) {
        setPreviewRoute(data);
      }
    }

    loadPreview();

    return () => {
      isCancelled = true;
    };
  }, [selectedHospital?.id, citizenCoords.lat, citizenCoords.lng]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [citizenCoords.lat, citizenCoords.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // Apply tile layer
    const tileUrl =
      mapStyle === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    return () => {
      map.removeLayer(tileLayer);
    };
  }, [mapStyle]);

  // Render & Update User + Hospital Markers + Preview Route Polyline
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Clear old route polylines
    if (routeBgLayerRef.current) map.removeLayer(routeBgLayerRef.current);
    if (routeFgLayerRef.current) map.removeLayer(routeFgLayerRef.current);

    // User Location Pin
    if (!userMarkerRef.current) {
      const userIcon = L.divIcon({
        className: 'user-origin-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background-color: #0284c7; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; top: -6px;"></div>
            <div style="background-color: #0284c7; border: 2.5px solid #ffffff; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(2, 132, 199, 0.8); z-index: 10;">
              <div style="width: 10px; height: 10px; border-radius: 50%; background-color: #ffffff;"></div>
            </div>
            <div style="margin-top: 3px; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(2, 132, 199, 0.8); padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: 800; color: #38bdf8; white-space: nowrap;">
              YOU ARE HERE
            </div>
          </div>
        `,
        iconSize: [80, 50],
        iconAnchor: [40, 20]
      });

      userMarkerRef.current = L.marker([citizenCoords.lat, citizenCoords.lng], {
        icon: userIcon,
        zIndexOffset: 500,
        draggable: true
      }).addTo(map);

      userMarkerRef.current.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        setCitizenCoords({ lat: pos.lat, lng: pos.lng });
      });
    } else {
      userMarkerRef.current.setLatLng([citizenCoords.lat, citizenCoords.lng]);
    }

    // Clear old hospital markers
    Object.values(markersRef.current).forEach((marker) => map.removeLayer(marker));
    markersRef.current = {};

    const bounds = L.latLngBounds([[citizenCoords.lat, citizenCoords.lng]]);

    // Add each hospital pin
    hospitals.forEach((hosp) => {
      const isSelected = hosp.id === activeHospitalId;
      const freeBeds = hosp.totalFacilityBeds - hosp.occupiedFacilityBeds;

      const hospIcon = L.divIcon({
        className: `hospital-pin-${hosp.id}`,
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            ${
              isSelected
                ? `<div style="position: absolute; width: 50px; height: 50px; border-radius: 50%; background-color: #ef4444; opacity: 0.35; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite; top: -6px;"></div>`
                : ''
            }
            <div style="
              background: ${isSelected ? '#dc2626' : '#1e293b'};
              border: 2px solid ${isSelected ? '#ffffff' : '#475569'};
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              gap: 5px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.6);
              transform: ${isSelected ? 'scale(1.08)' : 'scale(1)'};
              transition: transform 0.2s ease;
            ">
              <span style="font-size: 14px;">🏥</span>
              <div style="display: flex; flex-direction: column; line-height: 1.1;">
                <span style="font-size: 10px; font-weight: 800; color: #ffffff; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${hosp.name.split(' ')[0]}
                </span>
                <span style="font-size: 8.5px; font-weight: 700; color: ${freeBeds > 5 ? '#34d399' : '#fbbf24'};">
                  ${freeBeds} Free Beds
                </span>
              </div>
            </div>
            <div style="
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 6px solid ${isSelected ? '#dc2626' : '#1e293b'};
              margin-top: -1px;
            "></div>
          </div>
        `,
        iconSize: [140, 48],
        iconAnchor: [70, 38]
      });

      const marker = L.marker([hosp.lat, hosp.lng], {
        icon: hospIcon,
        zIndexOffset: isSelected ? 900 : 400
      }).addTo(map);

      marker.on('click', () => {
        playTactileClick();
        setActiveHospitalId(hosp.id);
      });

      markersRef.current[hosp.id] = marker;
      bounds.extend([hosp.lat, hosp.lng]);
    });

    // Draw Google Maps road direction route to selected hospital
    if (previewRoute && previewRoute.coordinates.length > 0) {
      const bgLine = L.polyline(previewRoute.coordinates, {
        color: '#1e3a8a',
        weight: 9,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      const fgLine = L.polyline(previewRoute.coordinates, {
        color: '#2563eb',
        weight: 5,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      routeBgLayerRef.current = bgLine;
      routeFgLayerRef.current = fgLine;
    }

    if (hospitals.length > 0) {
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 14 });
    }
  }, [hospitals, activeHospitalId, citizenCoords, mapStyle, previewRoute]);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCitizenCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          if (leafletMapRef.current) {
            leafletMapRef.current.flyTo([pos.coords.latitude, pos.coords.longitude], 14);
          }
        },
        (err) => console.warn('GPS error', err)
      );
    }
  };

  const handleHospitalSelection = (hospId: string) => {
    playTactileClick();
    onSelectHospital(hospId);
  };

  return (
    <div
      id="hospital-discovery-map-view"
      className="w-full h-full relative flex flex-col bg-slate-950 text-slate-100 overflow-hidden"
    >
      {/* Top Floating Control & Filter Header */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-xl text-slate-100">
          <button
            onClick={() => {
              playTactileClick();
              onBack();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Back to Condition Selection"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800">
                📍 {cityName}, {stateName}
              </span>
              <span className="text-[10px] font-bold uppercase text-red-400 px-1.5 py-0.2 rounded bg-red-950 border border-red-800">
                🩺 {diseaseName}
              </span>
            </div>
            <p className="text-xs font-black text-white mt-0.5 flex items-center gap-1.5">
              <Hospital className="w-3.5 h-3.5 text-emerald-400" />
              <span>{hospitals.length} Specialized Hospital Pins Plotted on Map</span>
            </p>
          </div>
        </div>

        {/* Map Utility Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl">
          <button
            onClick={handleLocateMe}
            title="Locate My GPS"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMapStyle((prev) => (prev === 'dark' ? 'tactical' : 'dark'))}
            title="Toggle Map Style"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Fullscreen Leaflet Map */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-0" />

      {/* Floating Bottom Hospital Picker & 1-Tap Google Maps Direction Starter */}
      <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-auto max-w-4xl mx-auto w-full">
        {selectedHospital && (() => {
          const freeBeds =
            selectedHospital.totalFacilityBeds - selectedHospital.occupiedFacilityBeds;
          const distKm = previewRoute ? previewRoute.distanceKm : 3.2;
          const etaMins = previewRoute ? previewRoute.durationMinutes : 6;

          return (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* Hospital Main Details */}
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40">
                      {selectedHospital.traumaLevel}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Bed className="w-3 h-3 text-emerald-400" />
                      {freeBeds} Free Beds Available
                    </span>
                    {selectedHospital.cathLabActive && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Cath Lab 24x7
                      </span>
                    )}
                    {selectedHospital.strokeReady && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Stroke Unit
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Hospital className="w-5 h-5 text-red-500" />
                    <span>{selectedHospital.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{selectedHospital.address}</span>
                  </p>
                </div>

                {/* Distance & ETA Badge */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 justify-end">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      Google Maps Road Route
                    </div>
                    <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                      {distKm} km &bull; ~{etaMins} mins
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Instant 1-Tap Select & Dial Hotline */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-800">
                {/* Direct Dial Hotline */}
                <a
                  href={`tel:${selectedHospital.emergencyHotline.split('/')[0].trim()}`}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <span>Call ER: {selectedHospital.emergencyHotline}</span>
                </a>

                {/* Immediate Distance & Moving Route Trigger */}
                <button
                  id="btn-select-hospital-instant"
                  onClick={() => handleHospitalSelection(selectedHospital.id)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all cursor-pointer active:scale-[0.99]"
                >
                  <Navigation className="w-4 h-4 animate-pulse" />
                  <span>START GOOGLE MAPS NAVIGATION & TRIAGE &rarr;</span>
                </button>
              </div>

              {/* Hospital Pin Quick Selector Pills */}
              {hospitals.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5 no-scrollbar">
                  <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">
                    Switch Hospital:
                  </span>
                  {hospitals.map((hosp) => {
                    const isCur = hosp.id === activeHospitalId;
                    const free = hosp.totalFacilityBeds - hosp.occupiedFacilityBeds;
                    return (
                      <button
                        key={hosp.id}
                        onClick={() => {
                          playTactileClick();
                          setActiveHospitalId(hosp.id);
                          if (leafletMapRef.current) {
                            leafletMapRef.current.flyTo([hosp.lat, hosp.lng], 14);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                          isCur
                            ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-1 ring-white/20'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <Hospital className="w-3 h-3 text-cyan-400" />
                        <span>{hosp.name.split(' ')[0]}</span>
                        <span className="text-[9px] opacity-80">({free} Beds)</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};
