import React from 'react';

interface AnimatedHeartbeatLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  showBadge?: boolean;
  showWaveformStrip?: boolean;
}

export const AnimatedHeartbeatLogo: React.FC<AnimatedHeartbeatLogoProps> = ({
  size = 'md',
  showSubtitle = true,
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
      {/* 1. Real-time Hospital Radar / ECG Monitor Icon */}
      <div
        className={`relative ${iconSizeClass} bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10 overflow-hidden shrink-0 group-hover:border-emerald-500/50 transition-all`}
        title="Prathmikta Health Grid"
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

            {/* Wave Pattern Segment 2 */}
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

          {/* Sweeping Oscilloscope Beam Line */}
          <div className="absolute inset-y-0 w-6 bg-gradient-to-r from-transparent via-emerald-400/25 to-emerald-400/50 pointer-events-none animate-ecg-sweep mix-blend-screen" />
        </div>

        {/* Top-Right Heartbeat Live Status Dot */}
        <span className="absolute top-1 right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
        </span>
      </div>

      {/* 2. Brand Typography - Clean, Crisp & Minimalist */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
            Prathmikta
          </span>
        </div>
        
        {/* Clean Subtitle */}
        {showSubtitle && (
          <span className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
            Smart Emergency Grid
          </span>
        )}
      </div>
    </div>
  );
};
