import { AmbulanceUnit } from '../types/transfer';

export const INITIAL_AMBULANCE_UNIT: AmbulanceUnit = {
  id: 'amb-als-042',
  vehicleNumber: 'ALS-042 (UP-78-G-9942)',
  type: 'ALS (Advanced Life Support)',
  driver: 'Manoj Yadav',
  paramedic: 'Arjun Nair (Critical Care Paramedic)',
  emt: 'Priya Verma (EMT-Advanced)',
  baseStation: 'District Emergency Transit Hub, Kanpur',
  contactPhone: '+91 94150 99420',
  status: 'READY',
  equipmentStatus: {
    defibrillator: 'ONLINE',
    ventilator: 'ONLINE',
    oxygenLiters: 1800,
    telemedicineLink: 'CONNECTED (5G)',
  },
  currentLocationName: 'District Hospital Bay 1, Kanpur',
  speedKmH: 0,
  etaString: '02h 18m',
  distanceRemainingKm: 86.4,
  latitude: 26.4499,
  longitude: 80.3319,
  routeProgressPercent: 0,
};

export const ROUTE_WAYPOINTS = [
  { name: 'District Hospital, Kanpur', km: 0, timeOffset: '00:00', coords: [26.4499, 80.3319], description: 'Departure Origin point' },
  { name: 'Ganga Bridge / Jajmau Toll', km: 12, timeOffset: '00:15', coords: [26.4355, 80.3951], description: 'Green Corridor Traffic Cleared' },
  { name: 'Unnao Bypass (NH-27)', km: 38, timeOffset: '00:48', coords: [26.5458, 80.4983], description: 'Cruising at 85 km/h, Vitals Stable' },
  { name: 'Nawabganj Transit Check', km: 54, timeOffset: '01:14', coords: [26.6872, 80.6421], description: 'Tele-monitoring synced to SGPGI' },
  { name: 'Bani Toll Plaza', km: 70, timeOffset: '01:42', coords: [26.7583, 80.8123], description: 'Lucknow Outer Ring Corridor' },
  { name: 'Shaheed Path Junction', km: 82, timeOffset: '02:05', coords: [26.7892, 80.9324], description: 'Police Escort Active' },
  { name: 'SGPGI Lucknow (Cath Lab Bay 2)', km: 88, timeOffset: '02:18', coords: [26.7456, 80.9412], description: 'Direct Transfer to PCI Suite' },
];
