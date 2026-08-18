import React from 'react';

interface AnimatedHeartbeatLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  showWaveformStrip?: boolean;
}

export const AnimatedHeartbeatLogo: React.FC<AnimatedHeartbeatLogoProps> = ({
  size = 'md',
  showBadge = true,
  showWaveformStrip = true,
}) => {
  const containerHeightClass =
    size === 'sm' ? 'h-9' : size === 'lg' ? 'h-14' : 'h-11';
  
  const iconSizeClass =
    size === 'sm'
      ? 'w-9 h-9 rounded-xl'
      : size === 'lg'
      ? 'w-13 h-13 rounded-2xl'
      : 'w-11 h-11 rounded-2xl';

  return (
    <div className={`flex items-center gap-3 select-none ${containerHeightClass}`}>
      {/* 1. Real-time Continuous Hospital ECG Heartbeat Monitor Screen */}
      <div
        className={`relative ${iconSizeClass} bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10 overflow-hidden shrink-0 group-hover:border-emerald-500/50 transition-all`}
        title="Live Hospital ECG Pulse Rate Monitor (72 BPM Lead II)"
      >
        {/* Hospital Medical Monitor Grid Background */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:4px_4px]" />
        
        {/* Subtle CRT Scanline Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.04)_50%,rgba(0,0,0,0.3)_50%)] bg-[size:100%_2px] pointer-events-none" />

        {/* Live Phosphor Glow */}
        <div className="absolute inset-0 bg-emerald-500/5 rounded-full pointer-events-none animate-pulse" />

        {/* Continuous Oscilloscope ECG Stream Container */}
        <div className="relative w-full h-full flex items-center overflow-hidden">
          {/* Continuous Infinite Seamless Scrolling ECG Waveform */}
          <div className="flex w-[200%] h-full items-center animate-ecg-stream">
            {/* Wave Pattern Segment 1 */}
            <svg
              viewBox="0 0 100 40"
              className="w-1/2 h-full shrink-0 overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              {/* Static Faint Baseline */}
              <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="0.8" strokeDasharray="2 2" />
              
              {/* Crisp Hospital Lead-II ECG Wave: Baseline -> P Wave -> PR -> Q Dip -> Tall R Spike -> Deep S Dip -> ST -> T Wave -> Baseline */}
              <path
                d="M 0 20 L 12 20 C 15 17, 19 17, 22 20 L 28 20 L 31 23 L 36 3 L 41 36 L 44 20 L 52 20 C 56 14, 62 14, 66 20 L 100 20"
                stroke="#10b981"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_5px_#10b981]"
              />
            </svg>

            {/* Wave Pattern Segment 2 (Identical Clone for 100% Seamless Infinite Loop) */}
            <svg
              viewBox="0 0 100 40"
              className="w-1/2 h-full shrink-0 overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="0.8" strokeDasharray="2 2" />
              <path
                d="M 0 20 L 12 20 C 15 17, 19 17, 22 20 L 28 20 L 31 23 L 36 3 L 41 36 L 44 20 L 52 20 C 56 14, 62 14, 66 20 L 100 20"
                stroke="#10b981"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_5px_#10b981]"
              />
            </svg>
          </div>

          {/* Sweeping Oscilloscope Beam Line (Like Real Bedside Monitor Radar Line) */}
          <div className="absolute inset-y-0 w-6 bg-gradient-to-r from-transparent via-emerald-400/25 to-emerald-400/50 pointer-events-none animate-ecg-sweep mix-blend-screen" />
        </div>

        {/* Top-Right Heartbeat Live Status Dot with Pulse */}
        <span className="absolute top-1 right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
        </span>
      </div>

      {/* 2. Brand Typography & Continuous ECG Wave Strip Beside Logo Name */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
            Prathmikta
          </span>

          {showBadge && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-red-600 text-white tracking-wider shadow-sm shadow-red-500/20 leading-none shrink-0">
              Emergency
            </span>
          )}

          {/* Continuous Live Heartbeat Waveform Beside Logo Name (Hospital Bedside Monitor Style) */}
          {showWaveformStrip && (
            <div className="hidden sm:flex items-center h-6 w-20 sm:w-28 bg-slate-950/90 border border-slate-800 rounded-lg overflow-hidden relative shadow-inner px-0.5 ml-1">
              <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:3px_3px]" />
              
              {/* Continuous Waveform Stream */}
              <div className="flex w-[200%] h-full items-center animate-ecg-stream">
                <svg viewBox="0 0 100 24" className="w-1/2 h-full shrink-0 overflow-visible" fill="none" preserveAspectRatio="none">
                  <path
                    d="M 0 12 L 15 12 C 18 10, 20 10, 23 12 L 29 12 L 32 15 L 36 2 L 40 22 L 43 12 L 50 12 C 54 8, 58 8, 62 12 L 100 12"
                    stroke="#10b981"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_3px_#10b981]"
                  />
                </svg>
                <svg viewBox="0 0 100 24" className="w-1/2 h-full shrink-0 overflow-visible" fill="none" preserveAspectRatio="none">
                  <path
                    d="M 0 12 L 15 12 C 18 10, 20 10, 23 12 L 29 12 L 32 15 L 36 2 L 40 22 L 43 12 L 50 12 C 54 8, 58 8, 62 12 L 100 12"
                    stroke="#10b981"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_3px_#10b981]"
                  />
                </svg>
              </div>

              {/* Sweeping Beam */}
              <div className="absolute inset-y-0 w-4 bg-gradient-to-r from-transparent via-emerald-400/20 to-emerald-400/40 pointer-events-none animate-ecg-sweep" />
            </div>
          )}
        </div>
        
        {/* Sub-label with Live Hospital Pulse Tag */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline leading-none">
            Smart Emergency Grid
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-[10px] font-mono font-bold text-emerald-700 border border-emerald-200/80 leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>72 BPM LIVE</span>
          </span>
        </div>
      </div>
    </div>
  );
};
