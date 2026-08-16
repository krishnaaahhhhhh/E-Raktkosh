import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Activity,
  HeartPulse,
  Volume2,
  VolumeX,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  AlertTriangle,
  Zap,
  Info
} from 'lucide-react';
import { playQrsBeep, playTactileClick } from '../../lib/audio';

export type EcgRhythmType =
  | 'Normal Sinus'
  | 'ST-Elevation STEMI'
  | 'Atrial Fibrillation'
  | 'Ventricular Tachycardia';

export type LeadType = 'Lead II' | 'Lead I' | 'Lead III' | 'V1' | 'V5' | 'aVF';

interface EcgWaveformMonitorProps {
  rhythm?: EcgRhythmType;
  onRhythmChange?: (rhythm: EcgRhythmType) => void;
  heartRate?: number;
  onHeartRateChange?: (hr: number) => void;
  spo2?: number;
  lead?: LeadType;
  showControls?: boolean;
  compact?: boolean;
}

export const EcgWaveformMonitor: React.FC<EcgWaveformMonitorProps> = ({
  rhythm = 'ST-Elevation STEMI',
  onRhythmChange,
  heartRate = 108,
  onHeartRateChange,
  spo2 = 94,
  lead = 'Lead II',
  showControls = true,
  compact = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // User controls
  const [selectedLead, setSelectedLead] = useState<LeadType>(lead);
  const [jitterLevel, setJitterLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [isAudioBeepEnabled, setIsAudioBeepEnabled] = useState<boolean>(false);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [gain, setGain] = useState<number>(1.0); // 0.5x, 1.0x, 1.5x, 2.0x
  const [sweepSpeed, setSweepSpeed] = useState<number>(25); // 25mm/s vs 50mm/s
  const [lastBeepTime, setLastBeepTime] = useState<number>(0);
  const [heartbeatActive, setHeartbeatActive] = useState<boolean>(false);

  // References for animation state
  const animationFrameId = useRef<number | null>(null);
  const sweepXRef = useRef<number>(0);
  const waveformBufferRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  const cycleTimeRef = useRef<number>(0);
  const beatIntervalRef = useRef<number>(60 / Math.max(40, heartRate));
  const irregularFactorRef = useRef<number>(1.0);
  const lastRPeakRef = useRef<boolean>(false);

  // Synchronize internal lead if prop changes
  useEffect(() => {
    setSelectedLead(lead);
  }, [lead]);

  // Compute clinical diagnostic readings based on rhythm
  const getClinicalMetrics = () => {
    switch (rhythm) {
      case 'ST-Elevation STEMI':
        return {
          prInterval: '162 ms',
          qrsDuration: '92 ms',
          qtc: '458 ms (Prolonged)',
          stElevation: '+3.8 mm (ST-Elevated)',
          stVariant: 'Anterior/Inferior STEMI (Pathognomonic)',
          urgency: 'CODE RED CATH LAB STAT'
        };
      case 'Atrial Fibrillation':
        return {
          prInterval: 'Unmeasurable (F-waves)',
          qrsDuration: '88 ms',
          qtc: '430 ms',
          stElevation: 'Isoelectric (0.2 mm)',
          stVariant: 'Rapid Ventricular Response (RVR)',
          urgency: 'CARDIOVERSION / RATE CONTROL'
        };
      case 'Ventricular Tachycardia':
        return {
          prInterval: 'Dissociated / Absent',
          qrsDuration: '168 ms (Wide QRS)',
          qtc: '510 ms (Severe)',
          stElevation: 'Secondary T-wave Discordance',
          stVariant: 'Monomorphic VT (High Risk Arrest)',
          urgency: 'DEFIBRILLATOR / STAT AMIODARONE'
        };
      case 'Normal Sinus':
      default:
        return {
          prInterval: '144 ms',
          qrsDuration: '82 ms',
          qtc: '398 ms (Normal)',
          stElevation: '0.0 mm (Isoelectric)',
          stVariant: 'Normal Sinus Rhythm (NSR)',
          urgency: 'HEMODYNAMICALLY STABLE'
        };
    }
  };

  const clinicalMetrics = getClinicalMetrics();

  // Mathematical ECG point calculation based on cycle progress [0..1] and rhythm
  const calculateEcgVoltage = useCallback(
    (progress: number, timeSec: number): { voltage: number; isRPeak: boolean } => {
      // Jitter & Artifact Configuration
      let noiseScale = 0.035; // base micro-tremor
      let wanderScale = 0.05; // baseline respiration drift

      if (jitterLevel === 'low') {
        noiseScale = 0.015;
        wanderScale = 0.02;
      } else if (jitterLevel === 'high') {
        noiseScale = 0.085;
        wanderScale = 0.12;
      }

      // Respiratory wander + high-frequency muscle artifact jitter
      const baselineWander = Math.sin(timeSec * 1.2) * wanderScale;
      const emgJitter = (Math.random() - 0.5) * noiseScale * 2;
      const electricalHum = Math.sin(timeSec * 314.159) * (noiseScale * 0.2); // 50Hz hum harmonic

      let baseVoltage = 0;
      let isRPeak = false;

      if (rhythm === 'Normal Sinus') {
        // P-wave (0.10 - 0.20)
        if (progress >= 0.10 && progress < 0.20) {
          const pProgress = (progress - 0.10) / 0.10;
          baseVoltage = Math.sin(pProgress * Math.PI) * 0.18;
        }
        // PR segment (0.20 - 0.28) isoelectric 0
        else if (progress >= 0.20 && progress < 0.28) {
          baseVoltage = 0;
        }
        // Q-wave (0.28 - 0.32)
        else if (progress >= 0.28 && progress < 0.32) {
          const qProgress = (progress - 0.28) / 0.04;
          baseVoltage = -Math.sin(qProgress * Math.PI) * 0.18;
        }
        // R-wave spike (0.32 - 0.38)
        else if (progress >= 0.32 && progress < 0.38) {
          const rProgress = (progress - 0.32) / 0.06;
          baseVoltage = Math.sin(rProgress * Math.PI) * 1.55;
          if (rProgress > 0.35 && rProgress < 0.65) isRPeak = true;
        }
        // S-wave (0.38 - 0.44)
        else if (progress >= 0.38 && progress < 0.44) {
          const sProgress = (progress - 0.38) / 0.06;
          baseVoltage = -Math.sin(sProgress * Math.PI) * 0.38;
        }
        // ST segment (0.44 - 0.54)
        else if (progress >= 0.44 && progress < 0.54) {
          baseVoltage = 0;
        }
        // T-wave (0.54 - 0.74)
        else if (progress >= 0.54 && progress < 0.74) {
          const tProgress = (progress - 0.54) / 0.20;
          baseVoltage = Math.sin(tProgress * Math.PI) * 0.38;
        }
        // TP baseline (0.74 - 1.0)
        else {
          baseVoltage = 0;
        }
      } else if (rhythm === 'ST-Elevation STEMI') {
        // P-wave (0.10 - 0.20)
        if (progress >= 0.10 && progress < 0.20) {
          const pProgress = (progress - 0.10) / 0.10;
          baseVoltage = Math.sin(pProgress * Math.PI) * 0.15;
        }
        // Q-wave (0.26 - 0.31)
        else if (progress >= 0.26 && progress < 0.31) {
          const qProgress = (progress - 0.26) / 0.05;
          baseVoltage = -Math.sin(qProgress * Math.PI) * 0.25;
        }
        // R-wave spike (0.31 - 0.37)
        else if (progress >= 0.31 && progress < 0.37) {
          const rProgress = (progress - 0.31) / 0.06;
          baseVoltage = Math.sin(rProgress * Math.PI) * 1.65;
          if (rProgress > 0.35 && rProgress < 0.65) isRPeak = true;
        }
        // S-wave & ST-Elevation tombstone plateau (0.37 - 0.72)
        else if (progress >= 0.37 && progress < 0.72) {
          const stProgress = (progress - 0.37) / 0.35;
          // Severe ST elevation with hyperacute merged T-wave
          const elevation = 0.58; // 5.8mm equivalent elevation
          const tPeak = Math.sin(stProgress * Math.PI) * 0.65;
          baseVoltage = elevation + tPeak;
        }
        // Baseline return (0.72 - 1.0)
        else {
          baseVoltage = 0;
        }
      } else if (rhythm === 'Atrial Fibrillation') {
        // Fine fibrillatory continuous f-waves across baseline
        const fWave =
          Math.sin(timeSec * 38) * 0.09 +
          Math.sin(timeSec * 74) * 0.06 +
          (Math.random() - 0.5) * 0.08;

        // Q-wave
        if (progress >= 0.28 && progress < 0.32) {
          const qProgress = (progress - 0.28) / 0.04;
          baseVoltage = -Math.sin(qProgress * Math.PI) * 0.16 + fWave;
        }
        // Sharp rapid R-wave spike (0.32 - 0.38)
        else if (progress >= 0.32 && progress < 0.38) {
          const rProgress = (progress - 0.32) / 0.06;
          baseVoltage = Math.sin(rProgress * Math.PI) * 1.45 + fWave;
          if (rProgress > 0.35 && rProgress < 0.65) isRPeak = true;
        }
        // S-wave (0.38 - 0.44)
        else if (progress >= 0.38 && progress < 0.44) {
          const sProgress = (progress - 0.38) / 0.06;
          baseVoltage = -Math.sin(sProgress * Math.PI) * 0.32 + fWave;
        }
        // Variable baseline with chaotic f-waves
        else {
          baseVoltage = fWave;
        }
      } else if (rhythm === 'Ventricular Tachycardia') {
        // Wide bizarre monomorphic complexes (VT sinusoidal waveform)
        const vtProgress = progress * Math.PI * 2;
        // Wide slurred QRS complex with secondary ST-T discordance
        baseVoltage = Math.sin(vtProgress) * 1.35 + Math.sin(vtProgress * 2) * 0.35;
        if (progress > 0.2 && progress < 0.35) {
          isRPeak = true;
        }
      }

      // Modify amplitude slightly by Lead selection
      let leadMultiplier = 1.0;
      if (selectedLead === 'V1') leadMultiplier = 0.85;
      else if (selectedLead === 'V5') leadMultiplier = 1.25;
      else if (selectedLead === 'Lead III') leadMultiplier = 0.9;
      else if (selectedLead === 'aVF') leadMultiplier = 1.05;

      const finalVoltage = (baseVoltage * leadMultiplier + baselineWander + emgJitter + electricalHum) * gain;
      return { voltage: finalVoltage, isRPeak };
    },
    [rhythm, selectedLead, jitterLevel, gain]
  );

  // ResizeObserver for sharp responsive canvas rendering
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight || 190;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Initialize/reset buffer
    if (waveformBufferRef.current.length !== width) {
      waveformBufferRef.current = new Array(width).fill(height / 2);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    resizeObserver.observe(container);
    handleResize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResize]);

  // Main Canvas Render & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isRunning = true;

    const render = (currentTime: number) => {
      if (!isRunning) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const centerY = height / 2;

      // Delta time calculation
      const dt = Math.min(0.1, (currentTime - lastTimeRef.current) / 1000);
      lastTimeRef.current = currentTime;

      if (!isFrozen && width > 0) {
        // Calculate cycle rate
        const currentHr = Math.max(40, Math.min(220, heartRate));
        const baseInterval = 60 / currentHr;

        // If AFib, apply random interval jitter to RR spacing
        if (rhythm === 'Atrial Fibrillation') {
          beatIntervalRef.current = baseInterval * irregularFactorRef.current;
        } else {
          beatIntervalRef.current = baseInterval;
        }

        cycleTimeRef.current += dt;
        if (cycleTimeRef.current >= beatIntervalRef.current) {
          cycleTimeRef.current = 0;
          if (rhythm === 'Atrial Fibrillation') {
            // Randomize next interval between 0.7x and 1.35x for realistic irregular ventricular rate
            irregularFactorRef.current = 0.7 + Math.random() * 0.65;
          }
        }

        const progress = Math.min(0.999, cycleTimeRef.current / beatIntervalRef.current);
        const { voltage, isRPeak } = calculateEcgVoltage(progress, currentTime / 1000);

        // Heartbeat pulse flash and audio chime
        if (isRPeak && !lastRPeakRef.current) {
          setHeartbeatActive(true);
          setTimeout(() => setHeartbeatActive(false), 120);

          if (isAudioBeepEnabled && currentTime - lastBeepTime > 300) {
            playQrsBeep(spo2);
            setLastBeepTime(currentTime);
          }
        }
        lastRPeakRef.current = isRPeak;

        // Pixel movement rate: calibrated by sweepSpeed (25mm/s ≈ 100px/s, 50mm/s ≈ 200px/s)
        const pixelsPerSecond = (sweepSpeed / 25) * 110;
        const sweepAdvance = pixelsPerSecond * dt;

        // Map voltage (mV) to canvas Y (standard calibration: 1mV = 45px vertical deflection at 1.0x gain)
        const verticalScale = 45;
        const targetY = centerY - voltage * verticalScale;

        // Advance sweep cursor
        const prevSweepX = sweepXRef.current;
        sweepXRef.current = (sweepXRef.current + sweepAdvance) % width;

        // Interpolate points between previous X and current X
        const startX = Math.floor(prevSweepX);
        const endX = Math.floor(sweepXRef.current);

        if (endX >= startX) {
          for (let x = startX; x <= endX; x++) {
            if (x < waveformBufferRef.current.length) {
              waveformBufferRef.current[x] = targetY;
            }
          }
        } else {
          // Wrapped around left boundary
          for (let x = startX; x < waveformBufferRef.current.length; x++) {
            waveformBufferRef.current[x] = targetY;
          }
          for (let x = 0; x <= endX; x++) {
            if (x < waveformBufferRef.current.length) {
              waveformBufferRef.current[x] = targetY;
            }
          }
        }
      }

      // ================= DRAWING PASS =================
      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Dark CRT Monitor Background
      ctx.fillStyle = '#030907';
      ctx.fillRect(0, 0, width, height);

      // 2. Medical Oscilloscope Grid (Major 25px squares, Minor 5px subdivisions)
      const majorGridSize = 25;
      const minorGridSize = 5;

      // Minor grid dots / fine lines
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.06)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += minorGridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += minorGridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Major grid lines (1mm / 5mm standard ECG calibration)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.18)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += majorGridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += majorGridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Center isoelectric baseline guide
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.28)';
      ctx.setLineDash([4, 4]);
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. 1mV Calibration Pulse Marker (Top-Left 0..20px)
      ctx.beginPath();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      const calX = 8;
      const calY = centerY;
      ctx.moveTo(calX, calY);
      ctx.lineTo(calX + 4, calY);
      ctx.lineTo(calX + 4, calY - 45 * gain); // 1mV step up
      ctx.lineTo(calX + 16, calY - 45 * gain);
      ctx.lineTo(calX + 16, calY);
      ctx.lineTo(calX + 20, calY);
      ctx.stroke();

      // Calibration label
      ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.font = '8px monospace';
      ctx.fillText('1mV', calX + 5, calY - 45 * gain - 3);

      // 4. Draw continuous ECG Waveform Trace with Phosphor Glow
      const curX = sweepXRef.current;
      const eraseGap = 20; // blanking beam width in front of cursor

      // Color scheme according to rhythm severity
      let traceColor = '#10b981'; // Green standard
      let glowColor = 'rgba(16, 185, 129, 0.8)';
      if (rhythm === 'ST-Elevation STEMI') {
        traceColor = '#ef4444'; // Red for STEMI
        glowColor = 'rgba(239, 68, 68, 0.9)';
      } else if (rhythm === 'Ventricular Tachycardia') {
        traceColor = '#f59e0b'; // Amber for VT
        glowColor = 'rgba(245, 158, 11, 0.9)';
      } else if (rhythm === 'Atrial Fibrillation') {
        traceColor = '#06b6d4'; // Cyan for AFib
        glowColor = 'rgba(6, 182, 212, 0.9)';
      }

      ctx.save();
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = traceColor;
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Segment 1: From right of cursor + gap to end of screen
      const seg1Start = Math.min(width, curX + eraseGap);
      if (seg1Start < width) {
        ctx.beginPath();
        let started = false;
        for (let x = Math.floor(seg1Start); x < width; x++) {
          const y = waveformBufferRef.current[x] || centerY;
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Segment 2: From 0 to cursor X
      if (curX > 0) {
        ctx.beginPath();
        let started = false;
        for (let x = 0; x <= Math.min(width, curX); x++) {
          const y = waveformBufferRef.current[x] || centerY;
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      ctx.restore();

      // 5. Medical Sweep Cursor Head (Glowing Erasing Dot/Bar)
      if (!isFrozen) {
        const cursorY = waveformBufferRef.current[Math.floor(curX)] || centerY;

        // Bright sweeping pulse dot
        ctx.save();
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(curX, cursorY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Vertical faint scanline beam
        const gradient = ctx.createLinearGradient(curX, 0, curX, height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(curX - 1, 0, 2, height);
        ctx.restore();
      }

      // 6. Freeze Watermark if paused
      if (isFrozen) {
        ctx.save();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('⏸ STRIP FROZEN FOR CALIPER INSPECTION', 12, height - 12);
        ctx.restore();
      }

      ctx.restore();

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [
    isFrozen,
    heartRate,
    rhythm,
    calculateEcgVoltage,
    sweepSpeed,
    gain,
    isAudioBeepEnabled,
    spo2,
    lastBeepTime
  ]);

  return (
    <div
      id="ecg-waveform-monitor-container"
      className="w-full flex flex-col rounded-2xl bg-[#020705] border-2 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)] overflow-hidden font-sans text-slate-100"
    >
      {/* Telemetry Header Bar */}
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-[#03150e] via-[#052016] to-[#03150e] border-b border-emerald-500/30 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-3 h-3 rounded-full transition-all duration-100 ${
              heartbeatActive
                ? 'bg-red-500 scale-125 shadow-[0_0_12px_#ef4444]'
                : 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
            }`}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs font-black font-mono tracking-wider text-emerald-400 uppercase flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>{selectedLead}</span>
            </span>
            <span className="text-[11px] font-bold text-slate-300">
              {sweepSpeed}mm/s &bull; {gain}x &bull; 0.05-150Hz
            </span>
          </div>

          <span
            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border font-mono ${
              rhythm === 'ST-Elevation STEMI'
                ? 'bg-red-950/80 text-red-300 border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse'
                : rhythm === 'Ventricular Tachycardia'
                ? 'bg-amber-950/80 text-amber-300 border-amber-500/60 animate-pulse'
                : rhythm === 'Atrial Fibrillation'
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
            }`}
          >
            {rhythm}
          </span>
        </div>

        {/* Live Cardiac Numerical Readouts */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1 bg-black/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
            <HeartPulse
              className={`w-3.5 h-3.5 ${
                heartbeatActive ? 'text-red-400 scale-125' : 'text-red-500'
              } transition-transform`}
            />
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">HR:</span>
            <span className="text-sm font-black font-mono text-white tracking-tight">
              {heartRate}
            </span>
            <span className="text-[9px] font-mono text-emerald-400">BPM</span>
          </div>

          <div className="flex items-baseline gap-1 bg-black/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">SpO2:</span>
            <span className="text-sm font-black font-mono text-cyan-300">{spo2}%</span>
          </div>

          {/* Audio Beep Toggle */}
          <button
            onClick={() => {
              playTactileClick();
              setIsAudioBeepEnabled(!isAudioBeepEnabled);
            }}
            title={isAudioBeepEnabled ? 'Mute QRS Sound' : 'Enable QRS Beep'}
            className={`p-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
              isAudioBeepEnabled
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {isAudioBeepEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-white animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Freeze Button */}
          <button
            onClick={() => {
              playTactileClick();
              setIsFrozen(!isFrozen);
            }}
            title={isFrozen ? 'Resume Live Telemetry' : 'Freeze Strip for Inspection'}
            className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              isFrozen
                ? 'bg-red-600 text-white border-red-400 shadow-md animate-pulse'
                : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            {isFrozen ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            <span>{isFrozen ? 'Resume' : 'Freeze'}</span>
          </button>
        </div>
      </div>

      {/* Main Oscilloscope Waveform Canvas */}
      <div
        ref={containerRef}
        className="relative w-full h-44 sm:h-52 bg-[#020705] cursor-crosshair select-none"
      >
        <canvas ref={canvasRef} className="block w-full h-full" />

        {/* Real-Time Clinical HUD Watermark Overlay */}
        <div className="absolute top-2 left-3 pointer-events-none space-y-0.5 text-[10px] font-mono text-emerald-400/80 drop-shadow">
          <div>SPEED: {sweepSpeed} mm/s | GAIN: {gain * 10} mm/mV</div>
          <div className="text-slate-300">
            JITTER: <b className="text-emerald-300 uppercase">{jitterLevel}</b> (Transit Artifact Active)
          </div>
        </div>

        <div className="absolute top-2 right-3 pointer-events-none text-right space-y-0.5 text-[10px] font-mono drop-shadow">
          <div className="text-slate-300">
            PR: <span className="font-bold text-white">{clinicalMetrics.prInterval}</span> | QRS:{' '}
            <span className="font-bold text-white">{clinicalMetrics.qrsDuration}</span>
          </div>
          <div className="text-slate-300">
            QTc: <span className="font-bold text-white">{clinicalMetrics.qtc}</span> | ST:{' '}
            <span
              className={`font-black ${
                rhythm === 'ST-Elevation STEMI' ? 'text-red-400' : 'text-emerald-300'
              }`}
            >
              {clinicalMetrics.stElevation}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Adjustments Tray */}
      {showControls && (
        <div className="p-3 bg-[#03110b] border-t border-emerald-500/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {/* Rhythm Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
              <HeartPulse className="w-3 h-3 text-red-400" />
              <span>Cardiac Rhythm Pattern</span>
            </label>
            <select
              value={rhythm}
              onChange={(e) => {
                const next = e.target.value as EcgRhythmType;
                playTactileClick();
                if (onRhythmChange) onRhythmChange(next);
              }}
              className="w-full bg-slate-950 border border-emerald-500/40 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-400"
            >
              <option value="ST-Elevation STEMI">🚨 ST-Elevation STEMI (Code STEMI)</option>
              <option value="Normal Sinus">Normal Sinus Rhythm (NSR)</option>
              <option value="Atrial Fibrillation">Atrial Fibrillation with RVR</option>
              <option value="Ventricular Tachycardia">🚨 Ventricular Tachycardia (VT)</option>
            </select>
          </div>

          {/* Lead Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>12-Lead Diagnostic Channel</span>
            </label>
            <div className="grid grid-cols-5 gap-1">
              {(['Lead II', 'Lead I', 'Lead III', 'V1', 'V5'] as LeadType[]).map((ld) => (
                <button
                  key={ld}
                  onClick={() => {
                    playTactileClick();
                    setSelectedLead(ld);
                  }}
                  className={`py-1 rounded text-[10px] font-bold font-mono transition-colors cursor-pointer text-center ${
                    selectedLead === ld
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {ld.replace('Lead ', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Jitter & Transit Motion Artifact Level */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Transit Motion Jitter</span>
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['low', 'medium', 'high'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    playTactileClick();
                    setJitterLevel(lvl);
                  }}
                  className={`py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                    jitterLevel === lvl
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl === 'low' ? 'Static' : lvl === 'medium' ? 'Transit' : 'Rough'}
                </button>
              ))}
            </div>
          </div>

          {/* Sweep Speed & Voltage Gain Adjustments */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
              <span>Gain / Calibration</span>
              <span className="text-emerald-400 font-mono font-black">{gain}x Gain</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  playTactileClick();
                  setGain((g) => (g === 0.5 ? 1.0 : g === 1.0 ? 1.5 : g === 1.5 ? 2.0 : 0.5));
                }}
                className="flex-1 py-1 px-2 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-[10px] font-mono font-bold text-center cursor-pointer"
              >
                Gain: {gain}x
              </button>

              <button
                onClick={() => {
                  playTactileClick();
                  setSweepSpeed((s) => (s === 25 ? 50 : 25));
                }}
                className="flex-1 py-1 px-2 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-[10px] font-mono font-bold text-center cursor-pointer"
              >
                Speed: {sweepSpeed}mm/s
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
