import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity,
  Radio,
  Building2,
  Clock,
  ArrowRight,
  Upload,
  Layers,
  ChevronRight
} from 'lucide-react';
import { playTactileClick } from '../../lib/audio';

interface KeyMoment {
  time: number;
  label: string;
  badge: string;
  icon: typeof Activity;
  desc: string;
  color: string;
  textColor: string;
  bgLight: string;
}

const KEY_MOMENTS: KeyMoment[] = [
  {
    time: 0,
    label: 'Golden Hour Transit',
    badge: 'Stage 1',
    icon: Clock,
    desc: 'Ambulance dispatched with GPS tracking & zero-delay routing.',
    color: 'from-amber-500 to-red-500',
    textColor: 'text-amber-600',
    bgLight: 'bg-amber-50 border-amber-200',
  },
  {
    time: 6,
    label: 'In-Transit Telemetry',
    badge: 'Stage 2',
    icon: Activity,
    desc: 'Paramedic logs vital signs & trauma severity via mobile app.',
    color: 'from-blue-500 to-cyan-500',
    textColor: 'text-blue-600',
    bgLight: 'bg-blue-50 border-blue-200',
  },
  {
    time: 14,
    label: 'Instant Cloud Grid Sync',
    badge: 'Stage 3',
    icon: Zap,
    desc: 'Real-time multi-hospital telemetry synced in sub-seconds.',
    color: 'from-purple-500 to-indigo-500',
    textColor: 'text-purple-600',
    bgLight: 'bg-purple-50 border-purple-200',
  },
  {
    time: 20,
    label: 'Hospital ER Doctor Alert',
    badge: 'Stage 4',
    icon: Building2,
    desc: '2-minute pre-arrival alert with bed confirmation & vital trends.',
    color: 'from-emerald-500 to-teal-500',
    textColor: 'text-emerald-600',
    bgLight: 'bg-emerald-50 border-emerald-200',
  },
  {
    time: 25,
    label: 'Green Corridor Handover',
    badge: 'Stage 5',
    icon: ShieldCheck,
    desc: 'Trauma team awaits at the gate with stretcher — 0s lag!',
    color: 'from-red-500 to-rose-600',
    textColor: 'text-red-600',
    bgLight: 'bg-rose-50 border-rose-200',
  },
];

interface OurSolutionVideoSectionProps {
  onStartTriage?: () => void;
  onExploreHospitals?: () => void;
}

export default function OurSolutionVideoSection({
  onStartTriage,
  onExploreHospitals,
}: OurSolutionVideoSectionProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(31);
  const [activeMomentIndex, setActiveMomentIndex] = useState(0);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Synchronize current active moment based on currentTime
  useEffect(() => {
    let index = 0;
    for (let i = 0; i < KEY_MOMENTS.length; i++) {
      if (currentTime >= KEY_MOMENTS[i].time) {
        index = i;
      }
    }
    setActiveMomentIndex(index);
  }, [currentTime]);

  const togglePlay = () => {
    playTactileClick();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    playTactileClick();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (time: number) => {
    playTactileClick();
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 31);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const toggleFullscreen = () => {
    playTactileClick();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setIsPlaying(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      }, 200);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <section
      id="our-solution-video-section"
      className="relative overflow-hidden bg-white text-slate-900 py-14 sm:py-20 border-b border-slate-200/80 select-none"
    >
      {/* Background Subtle Warm Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-red-500/5 filter blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[500px] bg-blue-500/5 filter blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="w-full px-4 sm:px-8 lg:px-12 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Interactive Solution Film</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Our{' '}
            <span className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
              Solution.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Watch how Prathmikta transforms emergency response from blind hospital-hopping into a synchronized, live telemetry corridor that saves the Golden Hour.
          </p>
        </div>

        {/* Video Showcase Card */}
        <div
          ref={containerRef}
          className="relative w-full rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-2xl shadow-slate-200/80 group"
        >
          {/* Top Video Header Bar (Light macOS style) */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm" />
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-2 font-mono font-semibold text-slate-700">
                <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                <span>PRATHMIKTA_LIVE_SOLUTION_WALKTHROUGH.MP4</span>
              </div>
            </div>

            {/* Stage indicator badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 font-bold text-[11px]">
              <span className="text-slate-500 font-normal">Active Stage:</span>
              <span className="text-red-700 font-bold">{KEY_MOMENTS[activeMomentIndex].label}</span>
            </div>
          </div>

          {/* Main Video Viewport */}
          <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
            {videoSrc ? (
              <video
                ref={videoRef}
                src={videoSrc}
                playsInline
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleVideoEnded}
                className="w-full h-full object-contain"
                onClick={togglePlay}
              />
            ) : (
              /* Simulation Video Player Screen with High-Impact Stage Preview */
              <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-10 bg-gradient-to-br from-slate-950 via-[#0c1222] to-slate-950 text-white">
                {/* Visual Backdrop Graphic */}
                <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center overflow-hidden">
                  <div className="w-[600px] h-[600px] border border-red-500/30 rounded-full animate-spin [animation-duration:30s]" />
                  <div className="absolute w-[450px] h-[450px] border border-blue-500/30 rounded-full animate-spin [animation-duration:20s] [animation-direction:reverse]" />
                </div>

                {/* Top Badge in Viewport */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span>Live Telemetry Corridor</span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-slate-300 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>0 Door-to-Treatment Lag</span>
                  </div>
                </div>

                {/* Center Dynamic Story Card Based on Active Stage */}
                <div className="relative z-10 max-w-xl mx-auto text-center space-y-4 my-auto">
                  <div
                    className={`inline-flex p-4 rounded-3xl bg-gradient-to-br ${KEY_MOMENTS[activeMomentIndex].color} text-white shadow-xl shadow-red-500/20 transform hover:scale-105 transition-transform`}
                  >
                    {React.createElement(KEY_MOMENTS[activeMomentIndex].icon, {
                      className: 'w-8 h-8 sm:w-10 sm:h-10',
                    })}
                  </div>

                  <div className="space-y-2">
                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 text-xs font-bold font-mono">
                      {KEY_MOMENTS[activeMomentIndex].badge} • {formatTime(KEY_MOMENTS[activeMomentIndex].time)}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                      {KEY_MOMENTS[activeMomentIndex].label}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                      {KEY_MOMENTS[activeMomentIndex].desc}
                    </p>
                  </div>

                  {/* Quick Stage Steppers */}
                  <div className="flex items-center justify-center gap-1.5 pt-2">
                    {KEY_MOMENTS.map((km, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSeek(km.time)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          activeMomentIndex === idx
                            ? 'w-8 bg-red-500'
                            : 'w-2 bg-slate-700 hover:bg-slate-500'
                        }`}
                        title={km.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom Video Quick Action Bar */}
                <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">108 EMERGENCY SYNC</span>
                    <span>•</span>
                    <span>AIIMS &amp; TRAUMA GRID</span>
                  </div>

                  <label className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 transition-all">
                    <Upload className="w-3.5 h-3.5 text-red-400" />
                    <span>Upload Custom Clip</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Large Floating Play Button if Paused */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 backdrop-blur-sm transition-all hover:scale-110 cursor-pointer z-20 group-hover:opacity-100"
                aria-label="Play Solution Video"
              >
                <Play className="w-8 h-8 fill-white ml-1" />
              </button>
            )}
          </div>

          {/* Custom Controls Scrub Bar (Clean White / Slate Theme) */}
          <div className="p-4 sm:p-5 bg-white border-t border-slate-200 space-y-3">
            {/* Progress Bar with Timeline Markers */}
            <div className="relative">
              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />

              {/* Timeline Moment Markers */}
              <div className="absolute top-3 left-0 right-0 flex justify-between pointer-events-none px-1">
                {KEY_MOMENTS.map((km, idx) => {
                  const leftPercent = (km.time / duration) * 100;
                  return (
                    <div
                      key={idx}
                      style={{ left: `${leftPercent}%` }}
                      className="absolute -top-3 transform -translate-x-1/2 flex flex-col items-center"
                    >
                      <div
                        className={`w-2 h-2 rounded-full border border-white ${
                          activeMomentIndex === idx ? 'bg-red-600 scale-125' : 'bg-slate-400'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Control Buttons & Timestamp */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 cursor-pointer transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-800" />}
                </button>

                <button
                  onClick={() => handleSeek(0)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 cursor-pointer transition-colors"
                  title="Replay from start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={toggleMute}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 cursor-pointer transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <div className="font-mono text-xs text-slate-600">
                  <span className="text-slate-900 font-bold">{formatTime(currentTime)}</span> / {formatTime(duration)}
                </div>
              </div>

              {/* Right Side Options */}
              <div className="flex items-center gap-2">
                <select
                  value={playbackSpeed}
                  onChange={(e) => {
                    const spd = parseFloat(e.target.value);
                    setPlaybackSpeed(spd);
                    if (videoRef.current) videoRef.current.playbackRate = spd;
                  }}
                  className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 font-mono cursor-pointer focus:outline-none"
                >
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1.0x Normal</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                </select>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer transition-colors"
                  title="Toggle Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Stage Interactive Workflow Cards Below Video */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-red-600" />
              <span>5-Step Zero Delay Protocol Breakdown</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              Click any stage to jump timeline
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {KEY_MOMENTS.map((moment, idx) => {
              const isActive = activeMomentIndex === idx;
              const Icon = moment.icon;
              return (
                <div
                  key={idx}
                  onClick={() => handleSeek(moment.time)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isActive
                      ? 'bg-white border-red-500 shadow-xl shadow-red-500/10 ring-2 ring-red-500'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-red-600 text-white border-red-600'
                          : moment.bgLight + ' ' + moment.textColor
                      }`}
                    >
                      {moment.badge}
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-semibold">
                      {formatTime(moment.time)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-red-600' : 'text-slate-600'
                        }`}
                      />
                      <span>{moment.label}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                      {moment.desc}
                    </p>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] font-semibold border-t border-slate-100">
                    <span
                      className={
                        isActive ? 'text-red-600 font-bold' : 'text-slate-500'
                      }
                    >
                      {isActive ? '● Now Showing' : 'Jump to Scene'}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Bar Under Video Section (Light Theme) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-50 via-slate-50 to-blue-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg sm:text-xl font-black text-slate-900">
              Ready to experience zero-delay triage in action?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              Start live emergency simulation or inspect hospital floor bed counters.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                playTactileClick();
                onStartTriage?.();
              }}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer transition-all"
            >
              <span>Launch Emergency Triage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                playTactileClick();
                onExploreHospitals?.();
              }}
              className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-300 shadow-sm cursor-pointer transition-all"
            >
              Hospital Beds
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
