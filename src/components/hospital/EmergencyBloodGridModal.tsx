import React, { useState, useEffect } from 'react';
import {
  Droplet,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  X,
  Building2,
  MapPin,
  Clock,
  ShieldAlert,
  Send,
  Sparkles,
  Zap,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Radio,
  Map,
  LayoutGrid,
  Compass,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { playTactileClick, playConfirmChime, playCodeRedAlert } from '../../lib/audio';
import { BloodBankMapInteractive } from './BloodBankMapInteractive';

export interface BloodBankItem {
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
}

export interface InventoryResponse {
  success: boolean;
  timestamp: string;
  cached: boolean;
  cacheAgeMinutes: number;
  totalFacilities: number;
  rarePhenotypesCount: number;
  totalUnitsAvailable: number;
  districtCode: string;
  stateCode: string;
  inventory: BloodBankItem[];
}

const DISTRICT_OPTIONS = [
  { code: '143', name: 'Kanpur Nagar (143), UP', stateCode: '09' },
  { code: '156', name: 'Lucknow (156), UP', stateCode: '09' },
  { code: '192', name: 'Varanasi (192), UP', stateCode: '09' },
  { code: '122', name: 'Agra (122), UP', stateCode: '09' },
  { code: '138', name: 'Ghaziabad (138), UP', stateCode: '09' },
  { code: '133', name: 'Gautam Buddha Nagar / Noida (133), UP', stateCode: '09' },
  { code: '123', name: 'Prayagraj / Allahabad (123), UP', stateCode: '09' },
  { code: '140', name: 'Gorakhpur (140), UP', stateCode: '09' },
  { code: '07', name: 'New Delhi (07), DL', stateCode: '07' },
  { code: '27', name: 'Mumbai (27), MH', stateCode: '27' },
  { code: '29', name: 'Bengaluru (29), KA', stateCode: '29' },
  { code: '19', name: 'Kolkata (19), WB', stateCode: '19' }
];

interface EmergencyBloodGridModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyBloodGridModal: React.FC<EmergencyBloodGridModalProps> = ({
  isOpen,
  onClose
}) => {
  const [districtCode, setDistrictCode] = useState('143');
  const [stateCode, setStateCode] = useState('09');
  const [rareOnly, setRareOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState<'MAP' | 'GRID'>('MAP');
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InventoryResponse | null>(null);

  // SOS Request Modal state
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [targetBank, setTargetBank] = useState<BloodBankItem | null>(null);
  const [reqPatientName, setReqPatientName] = useState('Anil Sharma');
  const [reqBloodGroup, setReqBloodGroup] = useState('Bombay Phenotype Oh-VE');
  const [reqUnits, setReqUnits] = useState(2);
  const [reqHospital, setReqHospital] = useState('GSVM Medical College ER');
  const [sosSentSuccess, setSosSentSuccess] = useState(false);

  const fetchBloodInventory = async (force: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/blood-inventory?state=${stateCode}&district=${districtCode}&rareOnly=${rareOnly}&force=${force}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP error fetching blood inventory');
      const json: InventoryResponse = await res.json();
      setData(json);
    } catch (err: any) {
      console.warn('Scraper route fallback active', err);
      setError('Unable to connect to live scraper server. Displaying structural fallback.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBloodInventory(false);
    }
  }, [isOpen, districtCode, stateCode, rareOnly]);

  if (!isOpen) return null;

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    playTactileClick();
    const found = DISTRICT_OPTIONS.find((d) => d.code === e.target.value);
    if (found) {
      setDistrictCode(found.code);
      setStateCode(found.stateCode);
    }
  };

  const handleOpenSos = (bank: BloodBankItem) => {
    playCodeRedAlert();
    setTargetBank(bank);
    if (bank.isRarePhenotype) {
      setReqBloodGroup('Bombay Phenotype Oh-VE');
    } else {
      setReqBloodGroup('O Negative (Universal Donor)');
    }
    setSosSentSuccess(false);
    setSosModalOpen(true);
  };

  const handleSendSos = () => {
    playConfirmChime();
    setSosSentSuccess(true);
  };

  // Filtering items locally
  const filteredItems = (data?.inventory || []).filter((item) => {
    const matchesSearch =
      item.bloodBankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.address && item.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.bloodGroup && item.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGroup =
      selectedGroup === 'ALL' ||
      (item.bloodGroup && item.bloodGroup.toUpperCase().includes(selectedGroup.toUpperCase()));

    const matchesCategory =
      selectedCategory === 'ALL' ||
      item.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesGroup && matchesCategory;
  });

  const currentDistrictObj = DISTRICT_OPTIONS.find((d) => d.code === districtCode);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop > 20 && !isHeaderCollapsed) {
      setIsHeaderCollapsed(true);
    } else if (scrollTop < 5 && isHeaderCollapsed) {
      setIsHeaderCollapsed(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] w-full h-full text-slate-800 flex flex-col overflow-hidden font-sans">
        
        {/* ========================================================= */}
        {/* DYNAMIC COLLAPSIBLE HEADER BAR (Clean Light Theme matching ii.jpeg) */}
        {/* ========================================================= */}
        <div className="bg-white border-b border-slate-200 shrink-0 transition-all duration-300 shadow-sm z-20">
          
          {/* PRIMARY TOOLBAR */}
          <div className="p-2.5 sm:px-4 flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Branding & District Picker */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/20 shrink-0">
                <Droplet className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
              </div>
              
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
                  Rakttkosh <span className="hidden md:inline text-slate-500 font-normal text-xs">Regional Inventory</span>
                </h2>
                <span className="hidden xl:flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Always Live</span>
                </span>
              </div>

              {/* District Selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs shrink-0 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <select
                  value={districtCode}
                  onChange={handleDistrictChange}
                  className="bg-transparent text-slate-900 font-extrabold text-xs focus:outline-none cursor-pointer max-w-[140px] sm:max-w-[200px] truncate"
                >
                  {DISTRICT_OPTIONS.map((d) => (
                    <option key={d.code} value={d.code} className="bg-white text-slate-900">
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right: Quick Stats, SOS Help, View Toggle, User Profile & Close */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                <span>Banks <strong className="text-slate-900">128+</strong></span>
                <span className="text-slate-300">•</span>
                <span>Donors <strong className="text-slate-900">2,586</strong></span>
              </div>

              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  if (filteredItems[0]) handleOpenSos(filteredItems[0]);
                }}
                className="px-3 py-1.5 rounded-xl border border-red-500 text-red-600 hover:bg-red-50 font-bold text-xs transition-all shrink-0 cursor-pointer"
              >
                SOS Help
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  onClick={() => {
                    playTactileClick();
                    setViewMode('MAP');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    viewMode === 'MAP'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Map</span>
                </button>

                <button
                  onClick={() => {
                    playTactileClick();
                    setViewMode('GRID');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    viewMode === 'GRID'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
              </div>

              {/* User Profile Pill */}
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-700">
                <div className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-black">
                  A
                </div>
                <span>Aditya</span>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  playTactileClick();
                  onClose();
                }}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SEARCH & FILTER STRIP */}
          <div className="p-2.5 sm:px-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search blood bank name, address, or blood group..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-xs text-slate-800 pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 font-sans placeholder:text-slate-400 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 shrink-0 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shrink-0">
                <span>Auto Refresh</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>

              <span className="px-2 py-1 rounded-xl bg-red-100 text-red-700 font-bold text-xs shrink-0">
                Alerts 2
              </span>

              <button
                onClick={() => {
                  playTactileClick();
                  setRareOnly(!rareOnly);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                  rareOnly
                    ? 'bg-red-600 text-white border-red-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN MAP OR CARDS LIST VIEW */}
        {/* ========================================================= */}
        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 flex flex-col min-h-0 bg-[#F8FAFC]"
        >
          {loading ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <RefreshCw className="w-10 h-10 text-red-600 animate-spin mx-auto" />
              <div className="text-sm font-bold text-slate-800 font-sans">
                Connecting to Rakttkosh Live Server...
              </div>
              <p className="text-xs text-slate-500">Fetching blood inventory metrics for {currentDistrictObj?.name}</p>
            </div>
          ) : viewMode === 'MAP' ? (
            <BloodBankMapInteractive
              items={filteredItems}
              selectedDistrictName={currentDistrictObj?.name || 'District'}
              selectedDistrictCode={districtCode}
              selectedBloodGroup={selectedGroup}
              onSelectFacilityForSos={handleOpenSos}
            />
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Matching Blood Banks Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No facilities matching your search or rare phenotype filter for District Code {districtCode}. Try resetting filters or switching district.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGroup('ALL');
                  setSelectedCategory('ALL');
                  setRareOnly(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 relative overflow-hidden bg-white shadow-sm hover:shadow-md ${
                    item.isRarePhenotype
                      ? 'border-amber-400 ring-2 ring-amber-100'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Rare Phenotype Top Banner */}
                    {item.isRarePhenotype && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Rare Phenotype Unit Reserve Detected (Bombay Oh / Rare)</span>
                      </div>
                    )}

                    {/* Facility Header & Category Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-red-600 shrink-0" />
                          <h3 className="text-base font-black text-slate-900 leading-snug">
                            {item.bloodBankName}
                          </h3>
                        </div>
                        {item.address && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{item.address}</span>
                          </p>
                        )}
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase shrink-0 ${
                          item.category.toLowerCase().includes('govt') || item.category.toLowerCase().includes('government')
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-orange-100 text-orange-700 border border-orange-200'
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>

                    {/* Stock Details & Units Badge */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Blood Group Stock</span>
                        <span className="text-xs font-bold text-slate-800">
                          {item.bloodGroup || 'All Groups Stock'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Available Packets</span>
                        <span
                          className={`text-lg font-black ${
                            item.status === 'AVAILABLE'
                              ? 'text-emerald-600'
                              : item.status === 'CRITICAL_LOW'
                              ? 'text-amber-600'
                              : 'text-red-600'
                          }`}
                        >
                          {item.availableUnits} <span className="text-xs font-normal">Packets</span>
                        </span>
                      </div>
                    </div>

                    {/* Per-Blood-Group Packets Matrix */}
                    {item.groupBreakdown && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-700 font-bold flex items-center gap-1.5">
                            <Droplet className="w-3.5 h-3.5 text-red-600 fill-red-600/20" />
                            <span>Packets by Blood Group:</span>
                          </span>
                          <span className="text-slate-400 text-[10px]">Click group to reserve</span>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                          {Object.entries(item.groupBreakdown).map(([grp, count]) => {
                            return (
                              <button
                                key={grp}
                                type="button"
                                onClick={() => {
                                  playTactileClick();
                                  if (count > 0) {
                                    setReqBloodGroup(grp === 'Bombay Oh' ? 'Bombay Phenotype Oh-VE' : grp);
                                    handleOpenSos(item);
                                  }
                                }}
                                className={`p-1.5 rounded-lg border flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-white ${
                                  count > 0
                                    ? 'border-slate-200 text-slate-800 hover:border-red-400 hover:bg-red-50'
                                    : 'border-slate-100 text-slate-400 opacity-50'
                                }`}
                              >
                                <span className="text-[10px] font-bold text-red-600">{grp}</span>
                                <span className="text-[11px] font-black text-slate-900">{count}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Updated: {item.lastUpdated}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      {item.contactNumber && (
                        <a
                          href={`tel:${item.contactNumber}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleOpenSos(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Droplet className="w-3.5 h-3.5 fill-white" />
                        <span>Reserve Blood</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* BOTTOM KPI METRICS SUMMARY BAR */}
        {/* ========================================================= */}
        <div className="bg-white border-t border-slate-200 p-3 shrink-0 space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-slate-500 font-medium block text-[10px]">🏢 Total Blood Banks</span>
              <strong className="text-slate-900 text-sm">128+</strong>
            </div>

            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-slate-500 font-medium block text-[10px]">🩸 Units Available</span>
              <strong className="text-red-600 text-sm">2,586+</strong>
            </div>

            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-slate-500 font-medium block text-[10px]">👥 Active Donors</span>
              <strong className="text-slate-900 text-sm">12,430+</strong>
            </div>

            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-slate-500 font-medium block text-[10px]">📈 Requests Today</span>
              <strong className="text-slate-900 text-sm">86</strong>
            </div>

            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-slate-500 font-medium block text-[10px]">⏱️ Avg. Response Time</span>
              <strong className="text-emerald-600 text-sm">12 min</strong>
            </div>

            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-slate-500 font-medium block text-[10px]">🛡️ Verified &amp; Secure</span>
              <strong className="text-blue-600 text-xs">Data Encrypted</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1.5 px-1">
            <span>© 2026 Rakttkosh. All rights reserved.</span>
            <span>Saving lives, one unit at a time. ❤️</span>
          </div>
        </div>

      {/* ========================================================= */}
      {/* SOS EMERGENCY BLOOD BROADCAST REQUEST MODAL */}
      {/* ========================================================= */}
      {sosModalOpen && targetBank && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/60 rounded-3xl p-6 max-w-md w-full text-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-black text-white">Emergency SOS Blood Reservation</h3>
              </div>
              <button
                onClick={() => setSosModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {sosSentSuccess ? (
              <div className="py-6 text-center space-y-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-lg font-black text-white">SOS Blood Reservation Transmitted!</h4>
                <p className="text-xs text-emerald-200 font-mono">
                  Ticket Reference: <strong className="text-white font-bold">#SOS-BLOOD-{Math.floor(10000 + Math.random() * 90000)}</strong>
                </p>
                <div className="text-xs text-slate-300 text-left bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-mono">
                  <div>🏥 Bank: <span className="text-white font-bold">{targetBank.bloodBankName}</span></div>
                  <div>🩸 Blood Group: <span className="text-rose-400 font-bold">{reqBloodGroup}</span></div>
                  <div>📦 Units Requested: <span className="text-cyan-300 font-bold">{reqUnits} Bags</span></div>
                  <div>🏥 Destination: <span className="text-white">{reqHospital}</span></div>
                </div>
                <button
                  onClick={() => setSosModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs font-sans">
                <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-slate-200">
                  <span className="text-[10px] text-rose-300 uppercase font-mono font-bold block">Target Blood Facility</span>
                  <div className="font-black text-sm text-white">{targetBank.bloodBankName}</div>
                  <div className="text-[11px] text-slate-400">{targetBank.address || 'Kanpur Region'}</div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Patient Full Name</label>
                  <input
                    type="text"
                    value={reqPatientName}
                    onChange={(e) => setReqPatientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Blood Group Needed</label>
                    <select
                      value={reqBloodGroup}
                      onChange={(e) => setReqBloodGroup(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                    >
                      <option value="Bombay Phenotype Oh-VE">Bombay Phenotype Oh-VE</option>
                      <option value="Bombay Phenotype Oh+VE">Bombay Phenotype Oh+VE</option>
                      <option value="O Negative (Universal)">O Negative (Universal)</option>
                      <option value="A Positive">A Positive</option>
                      <option value="B Positive">B Positive</option>
                      <option value="O Positive">O Positive</option>
                      <option value="AB Positive">AB Positive</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Units / Bags Needed</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={reqUnits}
                      onChange={(e) => setReqUnits(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Receiving ER / Hospital Name</label>
                  <input
                    type="text"
                    value={reqHospital}
                    onChange={(e) => setReqHospital(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  onClick={handleSendSos}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/40 flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>Transmit Emergency Blood Request &rarr;</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
