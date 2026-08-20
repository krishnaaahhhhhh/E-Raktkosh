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
  ChevronRight,
  Tv,
  Film,
  ExternalLink,
  RefreshCw,
  Sliders,
  CheckCircle2
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
    time: 4,
    label: 'In-Transit Telemetry',
    badge: 'Stage 2',
    icon: Activity,
    desc: 'Paramedic logs vital signs & trauma severity via mobile app.',
    color: 'from-blue-500 to-cyan-500',
    textColor: 'text-blue-600',
    bgLight: 'bg-blue-50 border-blue-200',
  },
  {
    time: 8,
    label: 'Instant Cloud Grid Sync',
    badge: 'Stage 3',
    icon: Zap,
    desc: 'Real-time multi-hospital telemetry synced in sub-seconds.',
    color: 'from-purple-500 to-indigo-500',
    textColor: 'text-purple-600',
    bgLight: 'bg-purple-50 border-purple-200',
  },
  {
    time: 12,
    label: 'Hospital ER Doctor Alert',
    badge: 'Stage 4',
    icon: Building2,
    desc: '2-minute pre-arrival alert with bed confirmation & vital trends.',
    color: 'from-emerald-500 to-teal-500',
    textColor: 'text-emerald-600',
    bgLight: 'bg-emerald-50 border-emerald-200',
  },
  {
    time: 15,
    label: 'Green Corridor Handover',
    badge: 'Stage 5',
    icon: ShieldCheck,
    desc: 'Trauma team awaits at the gate with stretcher — 0s lag!',
    color: 'from-red-500 to-rose-600',
    textColor: 'text-red-600',
    bgLight: 'bg-rose-50 border-rose-200',
  },
];

// High-speed, smooth, reliable video sources (MP4 with cloud CDN caching)
const RELIABLE_VIDEO_SOURCES = [
  {
    title: 'Emergency Medical Transit & Corridor (HD)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1587745416684-475553dd599c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Hospital Trauma Emergency Response (HD)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    poster: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Paramedic Live Telemetry & Speed (HD)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    poster: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80'
  }
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
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Player Mode: 'direct' (HTML5 MP4) or 'embed' (YouTube)
  const [playerMode, setPlayerMode] = useState<'direct' | 'embed'>('direct');
  
  // Selected Video Source (default to smooth high-bandwidth CDN video)
  const [selectedSourceIdx, setSelectedSourceIdx] = useState(0);
  const [videoSrc, setVideoSrc] = useState<string>(RELIABLE_VIDEO_SOURCES[0].url);
  const [customEmbedUrl, setCustomEmbedUrl] = useState<string>('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1');
  
  // Playback States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15);
  const [isBuffering, setIsBuffering] = useState(false);
  const [activeMomentIndex, setActiveMomentIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [customUrlModal, setCustomUrlModal] = useState(false);
  const [inputUrl, setInputUrl] = useState('');

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

  // Handle Play/Pause
  const togglePlay = () => {
    playTactileClick();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsBuffering(true);
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
          setHasError(false);
        })
        .catch((err) => {
          console.warn('[Video Player] Play error:', err);
          setIsBuffering(false);
        });
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
    try {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      if (!isPlaying) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } catch (e) {
      console.warn('[Video Player] Seek error:', e);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    if (dur && !isNaN(dur) && isFinite(dur)) {
      setDuration(dur);
    }
    setIsBuffering(false);
    setHasError(false);
  };

  const handleVideoEnded = () => {
    // Loop smoothly
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleVideoError = () => {
    console.warn('[Video Player] Video source failed, trying next mirror');
    setHasError(true);
    setIsBuffering(false);
    // Switch to fallback source automatically
    const nextIdx = (selectedSourceIdx + 1) % RELIABLE_VIDEO_SOURCES.length;
    setSelectedSourceIdx(nextIdx);
    setVideoSrc(RELIABLE_VIDEO_SOURCES[nextIdx].url);
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
      setPlayerMode('direct');
      setIsPlaying(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      }, 300);
    }
  };

  const handleApplyCustomUrl = () => {
    if (!inputUrl.trim()) return;
    playTactileClick();
    if (inputUrl.includes('youtube.com') || inputUrl.includes('youtu.be')) {
      // Extract YouTube ID
      let videoId = '';
      if (inputUrl.includes('youtu.be/')) {
        videoId = inputUrl.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (inputUrl.includes('v=')) {
        videoId = inputUrl.split('v=')[1]?.split('&')[0] || '';
      } else if (inputUrl.includes('embed/')) {
        videoId = inputUrl.split('embed/')[1]?.split('?')[0] || '';
      }
      if (videoId) {
        setCustomEmbedUrl(`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1`);
        setPlayerMode('embed');
      }
    } else {
      setVideoSrc(inputUrl.trim());
      setPlayerMode('direct');
    }
    setCustomUrlModal(false);
    setInputUrl('');
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
            <span>Interactive Solution Film & Walkthrough</span>
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

          {/* Player Mode Switcher Tabs */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => {
                playTactileClick();
                setPlayerMode('direct');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                playerMode === 'direct'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>HD Video Stream</span>
            </button>
            <button
              onClick={() => {
                playTactileClick();
                setPlayerMode('embed');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                playerMode === 'embed'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Embedded YouTube Player</span>
            </button>
            <button
              onClick={() => {
                playTactileClick();
                setCustomUrlModal(true);
              }}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer flex items-center gap-1"
            >
              <Sliders className="w-3 h-3" />
              <span>Change Video</span>
            </button>
          </div>
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
                <span className="truncate max-w-[200px] sm:max-w-xs">
                  {playerMode === 'embed'
                    ? 'YOUTUBE_EMERGENCY_TRIAGE_EMBED'
                    : RELIABLE_VIDEO_SOURCES[selectedSourceIdx]?.title || 'PRATHMIKTA_SOLUTION_WALKTHROUGH.MP4'}
                </span>
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
            {playerMode === 'embed' ? (
              /* Embedded YouTube / Iframe Player (Fast, smooth, no stuttering) */
              <div className="w-full h-full relative">
                <iframe
                  src={customEmbedUrl}
                  title="Emergency Triage & Response Solution Video"
                  className="w-full h-full border-0 absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              /* High Performance Direct HTML5 Video Player */
              <div className="w-full h-full relative flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={videoSrc}
                  playsInline
                  preload="auto"
                  muted={isMuted}
                  poster={RELIABLE_VIDEO_SOURCES[selectedSourceIdx]?.poster}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onCanPlay={() => setIsBuffering(false)}
                  onWaiting={() => setIsBuffering(true)}
                  onPlaying={() => {
                    setIsPlaying(true);
                    setIsBuffering(false);
                  }}
                  onPause={() => setIsPlaying(false)}
                  onEnded={handleVideoEnded}
                  onError={handleVideoError}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={togglePlay}
                />

                {/* Subtle Overlay Vignette & Hospital Dispatch Brand Stamp */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 backdrop-blur-md border border-white/10 text-white text-xs font-mono pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="font-bold">LIVE CORRIDOR SYNC</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-emerald-400">0s LAG</span>
                </div>

                {/* Top Right Stage Badge in Viewport */}
                <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-xs font-mono pointer-events-none">
                  <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>{KEY_MOMENTS[activeMomentIndex].badge}</span>
                </div>

                {/* Loading / Buffering Spinner */}
                {isBuffering && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs z-20 pointer-events-none">
                    <RefreshCw className="w-10 h-10 text-red-500 animate-spin mb-2" />
                    <span className="text-white text-xs font-mono font-bold tracking-wider">
                      BUFFERING HD STREAM...
                    </span>
                  </div>
                )}

                {/* Large Floating Play Button if Paused */}
                {!isPlaying && !isBuffering && (
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 backdrop-blur-md transition-all hover:scale-110 cursor-pointer z-20"
                    aria-label="Play Solution Video"
                  >
                    <Play className="w-8 h-8 fill-white ml-1" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Custom Controls Scrub Bar for Direct Video (Clean White / Slate Theme) */}
          {playerMode === 'direct' && (
            <div className="p-4 sm:p-5 bg-white border-t border-slate-200 space-y-3">
              {/* Progress Bar with Timeline Markers */}
              <div className="relative">
                <input
                  type="range"
                  min={0}
                  max={duration || 15}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />

                {/* Timeline Moment Markers */}
                <div className="absolute top-3.5 left-0 right-0 flex justify-between pointer-events-none px-1">
                  {KEY_MOMENTS.map((km, idx) => {
                    const leftPercent = Math.min(100, Math.max(0, (km.time / (duration || 15)) * 100));
                    return (
                      <div
                        key={idx}
                        style={{ left: `${leftPercent}%` }}
                        className="absolute -top-3.5 transform -translate-x-1/2 flex flex-col items-center"
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs ${
                            activeMomentIndex === idx ? 'bg-red-600 scale-125 ring-2 ring-red-300' : 'bg-slate-400'
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

                {/* Right Side Options & Mirrors */}
                <div className="flex items-center gap-2">
                  {/* Select Video Clip */}
                  <select
                    value={selectedSourceIdx}
                    onChange={(e) => {
                      const idx = parseInt(e.target.value);
                      setSelectedSourceIdx(idx);
                      setVideoSrc(RELIABLE_VIDEO_SOURCES[idx].url);
                      setIsPlaying(true);
                      setTimeout(() => {
                        if (videoRef.current) {
                          videoRef.current.play().catch(() => {});
                        }
                      }, 200);
                    }}
                    className="hidden md:inline-block bg-slate-100 text-slate-700 text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 cursor-pointer focus:outline-none"
                  >
                    {RELIABLE_VIDEO_SOURCES.map((src, i) => (
                      <option key={i} value={i}>
                        {src.title}
                      </option>
                    ))}
                  </select>

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
          )}
        </div>

        {/* 5-Stage Interactive Workflow Cards Below Video */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-red-600" />
              <span>5-Step Zero Delay Protocol Breakdown</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              Click any stage to seek timeline
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
                      {isActive ? '● Active Scene' : 'Seek Scene'}
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

      {/* Modal: Custom Video URL or Upload */}
      {customUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-600" />
                <span>Change Solution Video</span>
              </h3>
              <button
                onClick={() => setCustomUrlModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Paste a YouTube video link or direct MP4 video URL, or upload a local clip to play in the solution section.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Video URL (YouTube or MP4)</label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://.../video.mp4"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleApplyCustomUrl}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer transition-all shadow-md"
              >
                Apply Video
              </button>
              <label className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-all border border-slate-300 text-center flex items-center justify-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    handleFileUpload(e);
                    setCustomUrlModal(false);
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
