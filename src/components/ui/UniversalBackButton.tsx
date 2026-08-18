import React, { useState } from 'react';
import { usePrathmikta } from '../../context/PrathmiktaContext';
import { ArrowLeft, Home, Compass, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const UniversalBackButton: React.FC = () => {
  const { mode, setMode } = usePrathmikta();
  const [isHovered, setIsHovered] = useState(false);

  // If user is already on the main landing page, no need to show the floating back button
  if (mode === 'landing') {
    return null;
  }

  // Get readable title of current module
  const getModeLabel = () => {
    switch (mode) {
      case 'command':
        return 'Master Command Grid (/command)';
      case 'patient':
      case 'citizen':
        return 'Citizen Emergency Portal (/patient)';
      case 'planned_admission':
        return 'Daycare & OPD Admissions (/planned-admission)';
      case 'hospital':
      case 'reception':
      case 'tv_command':
        return 'Hospital ER Command (/h)';
      case 'partner':
        return 'ABDM Partner Registration (/hb)';
      case 'coordinate':
      case 'regional_deoc':
        return 'Regional DEOC Coordinator (/coordinate)';
      case 'ambulance':
      case 'paramedic':
        return 'Ambulance Response Unit (/a)';
      case 'bloodbank':
        return 'Blood Bank Inventory Grid (/b)';
      case 'dual_split':
        return 'Live Real-Time Dual Split (/split)';
      default:
        return 'Back to Home';
    }
  };

  return (
    <div
      id="universal-floating-back-container"
      className="fixed bottom-5 left-5 z-50 flex items-center gap-2 select-none print:hidden pointer-events-auto"
    >
      <motion.button
        initial={{ scale: 0.8, opacity: 0, x: -20 }}
        animate={{ scale: 1, opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          try {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              setMode('landing');
            }
          } catch {
            setMode('landing');
          }
        }}
        title="Go back to previous screen or Home"
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/95 text-slate-800 hover:text-slate-900 border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md transition-all cursor-pointer group"
      >
        <div className="w-6 h-6 rounded-xl bg-slate-100 group-hover:bg-red-50 text-slate-700 group-hover:text-red-600 flex items-center justify-center transition-colors shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </div>

        <div className="flex flex-col text-left pr-1">
          <span className="text-[11px] font-bold text-slate-800 group-hover:text-red-600 leading-none flex items-center gap-1.5 transition-colors">
            <span>Back to Home</span>
          </span>
          <span className="text-[9px] font-medium text-slate-500 max-w-[150px] truncate leading-tight mt-0.5">
            {getModeLabel()}
          </span>
        </div>
      </motion.button>

      {/* Quick Direct Home Button if user wants to jump directly */}
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setMode('landing')}
        title="Jump directly to Home Portal"
        className="w-10 h-10 rounded-2xl bg-white/95 text-slate-600 hover:text-red-600 border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shrink-0 hover:bg-red-50"
      >
        <Home className="w-4 h-4" />
      </motion.button>
    </div>
  );
};
