import React, { useState } from 'react';
import { usePrathmikta } from '../context/PrathmiktaContext';
import {
  Activity,
  Menu,
  X,
  PhoneCall,
  Info,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { playTactileClick } from '../lib/audio';
import { AnimatedHeartbeatLogo } from './ui/AnimatedHeartbeatLogo';

export const HeaderNav: React.FC = () => {
  const { mode, setMode } = usePrathmikta();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<'home' | 'about' | 'services' | 'contact'>('home');

  const handleNavClick = (sectionId: string, navKey: 'home' | 'about' | 'services' | 'contact') => {
    playTactileClick();
    setActiveNav(navKey);
    setMobileMenuOpen(false);

    if (mode !== 'landing') {
      setMode('landing');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      id="main-app-navbar"
      className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 select-none text-slate-800 shadow-xs"
    >
      <div className="w-full px-2 sm:px-3 lg:px-4 py-2.5 flex items-center justify-between">
        {/* Left: Brand Identity & Animated Real-Time Heartbeat Logo (Flush to extreme left, zero gap) */}
        <div
          onClick={() => handleNavClick('landing-hero', 'home')}
          className="cursor-pointer group flex items-center pl-0"
          title="Prathmikta Emergency Grid"
        >
          <AnimatedHeartbeatLogo size="md" />
        </div>

        {/* Right: 4 Navigation Cards (Home, About, Services, Contact Us) flush to extreme right with zero gap */}
        <nav className="hidden md:flex items-center gap-2 sm:gap-3 text-sm font-semibold text-slate-600 pr-0">
          <button
            id="nav-link-home"
            onClick={() => handleNavClick('landing-hero', 'home')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer text-xs sm:text-sm font-bold tracking-tight ${
              activeNav === 'home'
                ? 'bg-red-50 text-red-600 border border-red-200 shadow-2xs'
                : 'text-slate-700 hover:text-red-600 hover:bg-slate-50'
            }`}
          >
            Home
          </button>

          <button
            id="nav-link-about"
            onClick={() => handleNavClick('why-prathmikta', 'about')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer text-xs sm:text-sm font-semibold tracking-tight ${
              activeNav === 'about'
                ? 'bg-red-50 text-red-600 border border-red-200 shadow-2xs'
                : 'text-slate-700 hover:text-red-600 hover:bg-slate-50'
            }`}
          >
            About
          </button>

          <button
            id="nav-link-services"
            onClick={() => handleNavClick('what-we-offer', 'services')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer text-xs sm:text-sm font-semibold tracking-tight ${
              activeNav === 'services'
                ? 'bg-red-50 text-red-600 border border-red-200 shadow-2xs'
                : 'text-slate-700 hover:text-red-600 hover:bg-slate-50'
            }`}
          >
            Services
          </button>

          <button
            id="nav-link-contact"
            onClick={() => handleNavClick('bottom-call-to-action', 'contact')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer text-xs sm:text-sm font-semibold tracking-tight ${
              activeNav === 'contact'
                ? 'bg-red-50 text-red-600 border border-red-200 shadow-2xs'
                : 'text-slate-700 hover:text-red-600 hover:bg-slate-50'
            }`}
          >
            Contact Us
          </button>
        </nav>

        {/* Mobile Hamburger Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-lg">
          <button
            onClick={() => handleNavClick('landing-hero', 'home')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-left transition-colors ${
              activeNav === 'home' ? 'bg-red-50 text-red-600' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-4 h-4 text-red-600" />
            <span>Home</span>
          </button>

          <button
            onClick={() => handleNavClick('why-prathmikta', 'about')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-left transition-colors ${
              activeNav === 'about' ? 'bg-red-50 text-red-600' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Info className="w-4 h-4 text-red-600" />
            <span>About</span>
          </button>

          <button
            onClick={() => handleNavClick('what-we-offer', 'services')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-left transition-colors ${
              activeNav === 'services' ? 'bg-red-50 text-red-600' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4 text-red-600" />
            <span>Services</span>
          </button>

          <button
            onClick={() => handleNavClick('bottom-call-to-action', 'contact')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-left transition-colors ${
              activeNav === 'contact' ? 'bg-red-50 text-red-600' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-red-600" />
            <span>Contact Us</span>
          </button>

          <div className="pt-2 border-t border-slate-100">
            <a
              href="tel:108"
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md shadow-red-500/20"
            >
              <PhoneCall className="w-4 h-4" />
              <span>National Ambulance 108 / 112</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};


