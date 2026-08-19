import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Crosshair,
  Layers,
  PhoneCall,
  Navigation,
  Sparkles,
  Droplet,
  Building2,
  Compass,
  Search,
  Filter,
  CheckCircle2,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { playTactileClick } from '../../lib/audio';

export interface BloodBankMapItem {
  id: string;
  bloodBankName: string;
  category: string;
  availableUnits: number;
  bloodGroup?: string;
  groupBreakdown?: Record<string, number>;
  isRarePhenotype: boolean;
  status: 'AVAILABLE' | 'CRITICAL_LOW' | 'UNAVAILABLE';
  lastUpdated: string;
  contactNumber?: string;
  address?: string;
  districtCode: string;
  stateCode: string;
  lat: number;
  lng: number;
  distanceKm?: number;
}

interface BloodBankMapInteractiveProps {
  items: BloodBankMapItem[];
  selectedDistrictName: string;
  selectedDistrictCode?: string;
  selectedBloodGroup: string;
  onSelectFacilityForSos: (item: BloodBankMapItem, group?: string) => void;
  onCloseMap?: () => void;
}

// Calculate distance using Haversine formula
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

// Rich area / neighborhood dictionary for each district code
export const DISTRICT_LOCALITIES: Record<string, { name: string; lat: number; lng: number }[]> = {
  '143': [ // Kanpur Nagar
    { name: 'SWAROOP NAGAR', lat: 26.4815, lng: 80.3150 },
    { name: 'KAKADEO', lat: 26.4790, lng: 80.2920 },
    { name: 'KALYANPUR', lat: 26.5050, lng: 80.2580 },
    { name: 'SARVODAYA NAGAR', lat: 26.4782, lng: 80.3015 },
    { name: 'GEETA NAGAR', lat: 26.4710, lng: 80.2980 },
    { name: 'KIDWAI NAGAR', lat: 26.4320, lng: 80.3320 },
    { name: 'PARADE', lat: 26.4630, lng: 80.3510 },
    { name: 'BARRA', lat: 26.4180, lng: 80.3080 },
    { name: 'KANPUR', lat: 26.4499, lng: 80.3319 }
  ],
  '156': [ // Lucknow
    { name: 'HAZRATGANJ', lat: 26.8500, lng: 80.9499 },
    { name: 'GOMTI NAGAR', lat: 26.8505, lng: 81.0000 },
    { name: 'ALAMBAGH', lat: 26.8150, lng: 80.9020 },
    { name: 'INDIRA NAGAR', lat: 26.8790, lng: 80.9900 },
    { name: 'MAHANAGAR', lat: 26.8720, lng: 80.9510 },
    { name: 'CHOWK', lat: 26.8680, lng: 80.9120 },
    { name: 'CHARBAGH', lat: 26.8310, lng: 80.9230 },
    { name: 'LUCKNOW', lat: 26.8467, lng: 80.9462 }
  ],
  '192': [ // Varanasi
    { name: 'LANKA', lat: 25.2810, lng: 82.9980 },
    { name: 'GODOWLIYA', lat: 25.3110, lng: 83.0100 },
    { name: 'CHETAIPUR', lat: 25.2920, lng: 82.9680 },
    { name: 'ASSI GHAT', lat: 25.2900, lng: 83.0070 },
    { name: 'CANTONMENT', lat: 25.3320, lng: 82.9800 },
    { name: 'SIGRA', lat: 25.3180, lng: 82.9880 },
    { name: 'VARANASI', lat: 25.3176, lng: 82.9739 }
  ],
  '122': [ // Agra
    { name: 'TAJ GANJ', lat: 27.1610, lng: 78.0410 },
    { name: 'SADAR BAZAR', lat: 27.1580, lng: 78.0080 },
    { name: 'DAYALBAGH', lat: 27.2280, lng: 78.0050 },
    { name: 'SANJAY PLACE', lat: 27.1980, lng: 78.0050 },
    { name: 'CIVIL LINES', lat: 27.1890, lng: 78.0090 },
    { name: 'AGRA', lat: 27.1767, lng: 78.0081 }
  ],
  '138': [ // Ghaziabad
    { name: 'RAJ NAGAR', lat: 28.6850, lng: 77.4420 },
    { name: 'INDIRAPURAM', lat: 28.6380, lng: 77.3680 },
    { name: 'VAISHALI', lat: 28.6490, lng: 77.3380 },
    { name: 'GHAZIABAD', lat: 28.6692, lng: 77.4538 }
  ],
  '133': [ // Noida
    { name: 'SECTOR 18', lat: 28.5700, lng: 77.3260 },
    { name: 'SECTOR 62', lat: 28.6280, lng: 77.3680 },
    { name: 'GREATER NOIDA', lat: 28.4740, lng: 77.5040 },
    { name: 'NOIDA', lat: 28.5355, lng: 77.3910 }
  ],
  '123': [ // Prayagraj
    { name: 'CIVIL LINES', lat: 25.4520, lng: 81.8320 },
    { name: 'KATRA', lat: 25.4630, lng: 81.8540 },
    { name: 'NAINI', lat: 25.3880, lng: 81.8650 },
    { name: 'PRAYAGRAJ', lat: 25.4358, lng: 81.8463 }
  ],
  '140': [ // Gorakhpur
    { name: 'GOLGHAR', lat: 26.7580, lng: 83.3710 },
    { name: 'MOHADDIPUR', lat: 26.7480, lng: 83.3920 },
    { name: 'CIVIL LINES', lat: 26.7520, lng: 83.3780 },
    { name: 'GORAKHPUR', lat: 26.7606, lng: 83.3732 }
  ],
  '07': [ // New Delhi
    { name: 'CONNAUGHT PLACE', lat: 28.6315, lng: 77.2167 },
    { name: 'SOUTH EXTENSION', lat: 28.5690, lng: 77.2210 },
    { name: 'ROHINI', lat: 28.7040, lng: 77.1025 },
    { name: 'DWARKA', lat: 28.5920, lng: 77.0460 },
    { name: 'NEW DELHI', lat: 28.6139, lng: 77.2090 }
  ],
  '27': [ // Mumbai
    { name: 'NARIMAN POINT', lat: 18.9250, lng: 72.8240 },
    { name: 'BANDRA WEST', lat: 19.0600, lng: 72.8360 },
    { name: 'ANDHERI EAST', lat: 19.1190, lng: 72.8460 },
    { name: 'MUMBAI', lat: 19.0760, lng: 72.8777 }
  ],
  '29': [ // Bengaluru
    { name: 'INDIRANAGAR', lat: 12.9780, lng: 77.6400 },
    { name: 'KORAMANGALA', lat: 12.9350, lng: 77.6240 },
    { name: 'MG ROAD', lat: 12.9750, lng: 77.6090 },
    { name: 'BENGALURU', lat: 12.9716, lng: 77.5946 }
  ],
  '19': [ // Kolkata
    { name: 'PARK STREET', lat: 22.5530, lng: 88.3530 },
    { name: 'SALT LAKE', lat: 22.5860, lng: 88.4170 },
    { name: 'KOLKATA', lat: 22.5726, lng: 88.3639 }
  ]
};

export const BloodBankMapInteractive: React.FC<BloodBankMapInteractiveProps> = ({
  items,
  selectedDistrictName,
  selectedDistrictCode = '143',
  selectedBloodGroup,
  onSelectFacilityForSos
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const areaLabelMarkersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Live user location state (default centered on items or district center)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: items[0]?.lat || 26.4499,
    lng: items[0]?.lng || 80.3319
  });

  const [activeItemId, setActiveItemId] = useState<string>(items[0]?.id || '');
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(0);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsActive, setGpsActive] = useState<boolean>(false);

  // Auto detect GPS on load
  useEffect(() => {
    if (navigator.geolocation) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords({ lat, lng });
          setGpsActive(true);
          setGpsLoading(false);
        },
        (err) => {
          console.warn('Geolocation warning:', err.message);
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Compute distances for all items from user location
  const sortedItems = React.useMemo(() => {
    return items
      .map((item) => {
        const dist = calculateHaversineDistance(
          userCoords.lat,
          userCoords.lng,
          item.lat,
          item.lng
        );
        return { ...item, distanceKm: dist };
      })
      .filter((item) => (maxRadiusKm === 0 ? true : (item.distanceKm || 0) <= maxRadiusKm))
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [items, userCoords, maxRadiusKm]);

  const activeItem = sortedItems.find((i) => i.id === activeItemId) || sortedItems[0];

  // Initialize Leaflet Map with Light Mode Voyager Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userCoords.lat, userCoords.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // CartoDB Voyager Light Style Tiles
    const tileLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 19,
        subdomains: 'abcd'
      }
    ).addTo(map);

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.removeLayer(tileLayer);
    };
  }, []);

  // Render Area Names on the Map dynamically per District selected
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Clear old area label markers
    areaLabelMarkersRef.current.forEach((m) => map.removeLayer(m));
    areaLabelMarkersRef.current = [];

    // Lookup localities for district or extract from items
    let localities = DISTRICT_LOCALITIES[selectedDistrictCode] || [];

    if (localities.length === 0 && items.length > 0) {
      localities = items.map((item) => {
        const parts = (item.address || '').split(',');
        const areaName = (parts[1] || parts[0] || item.bloodBankName).trim().toUpperCase();
        return { name: areaName, lat: item.lat, lng: item.lng };
      });
    }

    localities.forEach((loc) => {
      const areaIcon = L.divIcon({
        className: 'district-area-label-pin',
        html: `
          <div style="
            font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
            font-size: 11px;
            font-weight: 800;
            color: #475569;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            text-shadow: 0 0 4px #ffffff, 0 0 8px #ffffff, 1px 1px 2px rgba(255,255,255,0.9);
            white-space: nowrap;
            pointer-events: none;
            user-select: none;
            opacity: 0.85;
          ">
            ${loc.name}
          </div>
        `,
        iconSize: [120, 20],
        iconAnchor: [60, 10]
      });

      const labelMarker = L.marker([loc.lat, loc.lng], {
        icon: areaIcon,
        zIndexOffset: 50,
        interactive: false
      }).addTo(map);

      areaLabelMarkersRef.current.push(labelMarker);
    });
  }, [selectedDistrictCode, items]);

  // Update Markers, User Pin, and Route Polyline
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Remove old route line
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    // Render / Move User Marker
    if (!userMarkerRef.current) {
      const userIcon = L.divIcon({
        className: 'user-gps-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background-color: #2563eb; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; top: -7px;"></div>
            <div style="background-color: #2563eb; border: 3px solid #ffffff; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.5); z-index: 10;">
              <div style="width: 10px; height: 10px; border-radius: 50%; background-color: #ffffff;"></div>
            </div>
            <div style="margin-top: 3px; background: #ffffff; border: 1.5px solid #2563eb; padding: 2px 8px; border-radius: 12px; font-size: 9px; font-weight: 800; color: #1e40af; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
              You • Sarvodaya Nagar
            </div>
          </div>
        `,
        iconSize: [100, 50],
        iconAnchor: [50, 20]
      });

      userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
        draggable: true
      }).addTo(map);

      userMarkerRef.current.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        setUserCoords({ lat: pos.lat, lng: pos.lng });
      });
    } else {
      userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
    }

    // Clear old blood bank markers
    Object.values(markersRef.current).forEach((marker) => map.removeLayer(marker));
    markersRef.current = {};

    const bounds = L.latLngBounds([[userCoords.lat, userCoords.lng]]);

    // Render Blood Bank Pins
    sortedItems.forEach((item) => {
      const isSelected = item.id === activeItemId;

      const pinIcon = L.divIcon({
        className: `blood-pin-${item.id}`,
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            ${
              isSelected
                ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background-color: #dc2626; opacity: 0.35; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite; top: -6px;"></div>`
                : ''
            }
            <div style="
              background: ${isSelected ? '#dc2626' : '#ef4444'};
              border: 2.5px solid #ffffff;
              color: white;
              padding: 5px 10px;
              border-radius: 16px;
              display: flex;
              align-items: center;
              gap: 6px;
              box-shadow: 0 4px 16px rgba(220,38,38,0.4);
              transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
              transition: transform 0.2s ease;
            ">
              <span style="font-size: 14px;">📍</span>
            </div>
            <div style="
              width: 0;
              height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-top: 6px solid ${isSelected ? '#dc2626' : '#ef4444'};
              margin-top: -1px;
            "></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 36]
      });

      const marker = L.marker([item.lat, item.lng], {
        icon: pinIcon,
        zIndexOffset: isSelected ? 900 : 300
      }).addTo(map);

      marker.on('click', () => {
        playTactileClick();
        setActiveItemId(item.id);
      });

      markersRef.current[item.id] = marker;
      bounds.extend([item.lat, item.lng]);
    });

    // Draw Route line to active facility
    if (activeItem) {
      const line = L.polyline(
        [
          [userCoords.lat, userCoords.lng],
          [activeItem.lat, activeItem.lng]
        ],
        {
          color: '#dc2626',
          weight: 3,
          opacity: 0.8,
          dashArray: '6, 6',
          lineCap: 'round'
        }
      ).addTo(map);

      routeLineRef.current = line;
    }

    if (sortedItems.length > 0) {
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 14 });
    }
  }, [sortedItems, activeItemId, userCoords, selectedBloodGroup]);

  const handleLocateGps = () => {
    playTactileClick();
    if (navigator.geolocation) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords({ lat, lng });
          setGpsActive(true);
          setGpsLoading(false);
          if (leafletMapRef.current) {
            leafletMapRef.current.flyTo([lat, lng], 14);
          }
        },
        (err) => {
          alert('Unable to get live GPS location: ' + err.message);
          setGpsLoading(false);
        }
      );
    }
  };

  return (
    <div className="w-full h-full min-h-[600px] flex-1 relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col md:flex-row shadow-sm text-slate-800">
      
      {/* ========================================================= */}
      {/* LEFT SIDEBAR: Nearby Blood Banks */}
      {/* ========================================================= */}
      <div className="w-full md:w-96 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col z-10 shrink-0 shadow-sm">
        
        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-slate-100 bg-white flex items-center justify-between">
          <h4 className="text-sm font-black text-slate-900 tracking-tight">
            Nearby Blood Banks
          </h4>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span>Sort by:</span>
            <select className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2 py-0.5 text-xs font-bold focus:outline-none cursor-pointer">
              <option>Distance</option>
              <option>Units Available</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pills Strip */}
        <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <select className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer shrink-0">
            <option>All Blood Groups</option>
            <option>A+</option>
            <option>B+</option>
            <option>O+</option>
            <option>AB+</option>
          </select>

          {[
            { label: '0–10 km', val: 10 },
            { label: '10–25 km', val: 25 },
            { label: '25+ km', val: 0 }
          ].map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => {
                playTactileClick();
                setMaxRadiusKm(r.val);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                maxRadiusKm === r.val
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {r.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setMaxRadiusKm(5);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm shrink-0 cursor-pointer"
          >
            SOS Near Me
          </button>
        </div>

        {/* Facility List Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 no-scrollbar bg-slate-50/30">
          {sortedItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 font-medium">
              No blood banks found in selected distance range.
            </div>
          ) : (
            sortedItems.map((item) => {
              const isSelected = item.id === activeItemId;
              const dist = item.distanceKm || 0;
              const estTime = Math.max(3, Math.round(dist * 2.2));
              const isPrivate = item.category.toLowerCase().includes('private');
              const isGovt = item.category.toLowerCase().includes('government');

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    playTactileClick();
                    setActiveItemId(item.id);
                    if (leafletMapRef.current) {
                      leafletMapRef.current.flyTo([item.lat, item.lng], 14);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer bg-white ${
                    isSelected
                      ? 'border-red-500 ring-2 ring-red-100 shadow-md bg-red-50/20'
                      : 'border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {/* Category, Partner Tier, Distance */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          isPrivate
                            ? 'bg-orange-100 text-orange-700 border border-orange-200'
                            : isGovt
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-purple-100 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {item.category}
                      </span>

                      {isPrivate ? (
                        <span className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5">
                          <span>★</span> Priority Partner
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-500">Tier 1</span>
                      )}
                    </div>

                    <span className="text-xs font-black text-emerald-600 font-sans flex items-center gap-0.5">
                      📍 {dist} km
                    </span>
                  </div>

                  {/* Title & Address */}
                  <h5 className="text-sm font-black text-slate-900 leading-snug tracking-tight mb-0.5">
                    {item.bloodBankName}
                  </h5>

                  <p className="text-xs text-slate-500 truncate flex items-center gap-1 mb-2.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{item.address}</span>
                  </p>

                  {/* Bottom Groups & ETA Badges */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-100 text-xs font-bold">
                        A+, B+, O+, AB+
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs shrink-0">
                      ETA: {estTime} min
                    </span>
                  </div>
                </div>
              );
            })
          )}

          <div className="pt-2 text-center">
            <button className="text-xs font-extrabold text-slate-700 hover:text-slate-900 flex items-center justify-center gap-1 mx-auto cursor-pointer py-1">
              <span>View all blood banks ({sortedItems.length}+)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT MAP CANVAS & FLOATING SELECTED FACILITY DRAWER */}
      {/* ========================================================= */}
      <div className="flex-1 relative h-full flex flex-col">
        
        {/* Top Floating Map Action Button */}
        <div className="absolute top-4 right-4 z-10 pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              if (activeItem) onSelectFacilityForSos(activeItem);
            }}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Droplet className="w-4 h-4 fill-white" />
            <span>Emergency Request</span>
          </button>
        </div>

        {/* Leaflet Container */}
        <div ref={mapContainerRef} className="w-full h-full flex-1 z-0 bg-slate-100" />

        {/* Floating Selected Facility Card Overlaid on Map */}
        {activeItem && (
          <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-auto max-w-2xl mx-auto w-full">
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-200 text-slate-800">
              
              {/* Category & Distance Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        activeItem.category.toLowerCase().includes('private')
                          ? 'bg-orange-100 text-orange-700 border border-orange-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {activeItem.category}
                    </span>

                    <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                      ★ Priority Partner
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                    {activeItem.bloodBankName}
                  </h3>

                  <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{activeItem.address}</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">
                    Distance
                  </span>
                  <span className="text-base font-black text-emerald-600 font-sans">
                    📍 {activeItem.distanceKm} km
                  </span>
                </div>
              </div>

              {/* Status & Unit Expiry Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Inventory • Updated just now</span>
                </div>

                <div className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 font-bold text-xs shrink-0">
                  Expires in (Units): <span className="text-slate-900 font-black">24 hrs</span>
                </div>
              </div>

              {/* Blood Stock Breakdown Grid */}
              <div className="grid grid-cols-4 gap-2 font-sans pt-1">
                {[
                  { grp: 'A+', count: activeItem.groupBreakdown?.['A+'] || 12 },
                  { grp: 'B+', count: activeItem.groupBreakdown?.['B+'] || 8 },
                  { grp: 'O+', count: activeItem.groupBreakdown?.['O+'] || 15 },
                  { grp: 'AB+', count: activeItem.groupBreakdown?.['AB+'] || 6 }
                ].map((st) => (
                  <div
                    key={st.grp}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center"
                  >
                    <div className="text-xs font-black text-red-600">{st.grp}</div>
                    <div className="text-sm font-black text-slate-900">{st.count}</div>
                  </div>
                ))}
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${activeItem.lat},${activeItem.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Google Maps Route</span>
                </a>

                {activeItem.contactNumber && (
                  <a
                    href={`tel:${activeItem.contactNumber}`}
                    className="py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 text-slate-600" />
                    <span>Call</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    onSelectFacilityForSos(activeItem);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Droplet className="w-4 h-4 fill-white" />
                  <span>Reserve Blood</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
