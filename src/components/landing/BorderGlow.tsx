import React, { useRef, useState, useEffect } from 'react';

export interface BorderGlowProps {
  children: React.ReactNode;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
  id?: string;
}

export const BorderGlow: React.FC<BorderGlowProps> = ({
  children,
  edgeSensitivity = 30,
  glowColor = '40 80 80',
  backgroundColor = 'transparent',
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1,
  coneSpread = 25,
  animated = false,
  colors = ['#ef4444', '#f97316', '#dc2626'],
  className = '',
  onClick,
  style,
  id
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [angle, setAngle] = useState(0);

  // Handle continuous rotation animation if animated is true
  useEffect(() => {
    if (!animated) return;
    let animationFrameId: number;
    const updateAngle = () => {
      setAngle((prev) => (prev + 1.2) % 360);
      animationFrameId = requestAnimationFrame(updateAngle);
    };
    animationFrameId = requestAnimationFrame(updateAngle);
    return () => cancelAnimationFrame(animationFrameId);
  }, [animated]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Construct gradient from custom color array or fallback
  const colorStops = colors.length > 0 ? colors.join(', ') : '#ef4444, #f87171, #b91c1c';

  return (
    <div
      ref={containerRef}
      id={id}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative group cursor-pointer transition-all duration-300 ${className}`}
      style={{
        borderRadius: `${borderRadius}px`,
        padding: '2px', // 2px border width for glow reveal
        background: animated
          ? `conic-gradient(from ${angle}deg at 50% 50%, ${colorStops}, ${colors[0] || '#ef4444'})`
          : isHovered
          ? `radial-gradient(${glowRadius * 3}px circle at ${mousePos.x}% ${mousePos.y}%, ${colorStops}, rgba(239, 68, 68, 0.2) 70%, transparent 100%)`
          : `radial-gradient(${glowRadius * 2}px circle at 50% 0%, ${colorStops}, rgba(239, 68, 68, 0.15) 80%, transparent 100%)`,
        ...style
      }}
    >
      {/* 1. Ambient Outer Glow */}
      <div
        className="absolute -inset-1.5 transition-opacity duration-300 pointer-events-none"
        style={{
          borderRadius: `${borderRadius + 6}px`,
          opacity: isHovered ? 0.45 * glowIntensity : 0.15,
          background: `radial-gradient(${glowRadius * 4}px circle at ${mousePos.x}% ${mousePos.y}%, ${colorStops}, transparent 80%)`,
          filter: 'blur(12px)',
          zIndex: -1
        }}
      />

      {/* 2. Main Card Content Container (sitting neatly inside the glow border) */}
      <div
        className="relative w-full h-full z-10 transition-colors duration-200"
        style={{
          borderRadius: `${Math.max(borderRadius - 2, 4)}px`,
          backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : '#ffffff',
          overflow: 'hidden'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default BorderGlow;
